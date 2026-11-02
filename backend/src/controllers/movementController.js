import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Batch from '../models/Batch.js';
import Movement from '../models/Movement.js';

// @desc    Registrar una ENTRADA de inventario (nuevo lote)
// @route   POST /api/movements/entry
export const registerEntry = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      productoId,
      numeroLote,
      fechaVencimiento,
      cantidad,
      costoUnitario = 0,
      proveedor = 'Proveedor General',
      motivo = 'Compra',
      observaciones,
    } = req.body;

    const product = await Product.findById(productoId).session(session);
    if (!product || !product.activo) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar si el lote ya existe para ese producto
    let batch = await Batch.findOne({ producto: productoId, numeroLote }).session(session);

    if (batch) {
      batch.cantidadActual += Number(cantidad);
      batch.cantidadInicial += Number(cantidad);
      if (batch.estado === 'Agotado' && batch.cantidadActual > 0) {
        batch.estado = 'Disponible';
      }
      await batch.save({ session });
    } else {
      batch = await Batch.create(
        [
          {
            producto: productoId,
            numeroLote,
            fechaVencimiento,
            cantidadInicial: cantidad,
            cantidadActual: cantidad,
            costoUnitario,
            proveedor,
            estado: 'Disponible',
          },
        ],
        { session }
      );
      batch = batch[0];
    }

    // Actualización automática del stock global del producto
    product.cantidadDisponible += Number(cantidad);
    await product.save({ session });

    // Registro de trazabilidad
    const movement = await Movement.create(
      [
        {
          tipo: 'ENTRADA',
          motivo,
          producto: productoId,
          lote: batch._id,
          cantidad: Number(cantidad),
          usuario: req.user._id,
          observaciones,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Entrada registrada y stock actualizado con éxito',
      movement: movement[0],
      producto: {
        id: product._id,
        nombre: product.nombre,
        nuevaCantidadTotal: product.cantidadDisponible,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// @desc    Registrar una SALIDA de inventario (dispensación o merma)
// @route   POST /api/movements/exit
export const registerExit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      productoId,
      loteId,
      cantidad,
      motivo = 'Dispensación Paciente',
      observaciones,
    } = req.body;

    const product = await Product.findById(productoId).session(session);
    if (!product || !product.activo) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const batch = await Batch.findById(loteId).session(session);
    if (!batch || batch.producto.toString() !== productoId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Lote no válido para el producto seleccionado' });
    }

    if (batch.cantidadActual < Number(cantidad)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Existencias insuficientes en este lote. Disponibles: ${batch.cantidadActual}`,
      });
    }

    // Descontar del lote
    batch.cantidadActual -= Number(cantidad);
    if (batch.cantidadActual === 0) {
      batch.estado = 'Agotado';
    }
    await batch.save({ session });

    // Actualización automática del stock global del producto
    product.cantidadDisponible -= Number(cantidad);
    await product.save({ session });

    // Registro de auditoría del movimiento
    const movement = await Movement.create(
      [
        {
          tipo: 'SALIDA',
          motivo,
          producto: productoId,
          lote: batch._id,
          cantidad: Number(cantidad),
          usuario: req.user._id,
          observaciones,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Salida registrada y stock actualizado con éxito',
      movement: movement[0],
      producto: {
        id: product._id,
        nombre: product.nombre,
        nuevaCantidadTotal: product.cantidadDisponible,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener lotes activos ordenados por FEFO (First Expired, First Out)
// @route   GET /api/movements/batches/:productId
export const getBatchesByProduct = async (req, res) => {
  try {
    const batches = await Batch.find({
      producto: req.params.productId,
      cantidadActual: { $gt: 0 },
    }).sort({ fechaVencimiento: 1 }); // Próximos a vencer primero

    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Consultar historial general de movimientos
// @route   GET /api/movements
export const getMovements = async (req, res) => {
  try {
    const movements = await Movement.find({})
      .populate('producto', 'codigo nombre unidadMedida')
      .populate('lote', 'numeroLote fechaVencimiento')
      .populate('usuario', 'nombre rol')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};