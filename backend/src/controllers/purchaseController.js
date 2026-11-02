import mongoose from 'mongoose';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Batch from '../models/Batch.js';
import Movement from '../models/Movement.js';
import Product from '../models/Product.js';

// --- PROVEEDORES ---

// @desc    Obtener lista de proveedores activos
// @route   GET /api/purchases/suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ activo: true }).sort({ nombre: 1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear nuevo proveedor
// @route   POST /api/purchases/suppliers
export const createSupplier = async (req, res) => {
  try {
    const { nombre, identificacionFiscal, contacto, direccion, categoriasSuministradas } = req.body;

    const exists = await Supplier.findOne({ identificacionFiscal });
    if (exists) {
      return res.status(400).json({ message: 'Ya existe un proveedor con esa identificación fiscal' });
    }

    const supplier = await Supplier.create({
      nombre,
      identificacionFiscal,
      contacto,
      direccion,
      categoriasSuministradas,
    });

    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar datos de un proveedor
// @route   PUT /api/purchases/suppliers/:id
export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- ÓRDENES DE COMPRA ---

// @desc    Listar todas las órdenes de compra con filtros
// @route   GET /api/purchases/orders
export const getPurchaseOrders = async (req, res) => {
  try {
    const { estado } = req.query;
    const query = estado ? { estado } : {};

    const orders = await PurchaseOrder.find(query)
      .populate('proveedor', 'nombre identificacionFiscal contacto')
      .populate('solicitante', 'nombre email rol')
      .populate('items.producto', 'codigo nombre unidadMedida')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear una nueva orden de compra
// @route   POST /api/purchases/orders
export const createPurchaseOrder = async (req, res) => {
  try {
    const { proveedor, items, observaciones } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'La orden debe contener al menos un producto' });
    }

    const codigoOrden = `OC-${Date.now().toString().slice(-6)}`;

    const costoTotalEstimado = items.reduce(
      (acc, item) => acc + (item.cantidadSolicitada * (item.precioEstimadoUnitario || 0)),
      0
    );

    const newOrder = await PurchaseOrder.create({
      codigoOrden,
      proveedor,
      solicitante: req.user._id,
      items,
      costoTotalEstimado,
      observaciones,
    });

    const populatedOrder = await PurchaseOrder.findById(newOrder._id)
      .populate('proveedor', 'nombre')
      .populate('items.producto', 'codigo nombre');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cambiar el estado de una orden (Aprobar, Rechazar, Completar)
// @route   PATCH /api/purchases/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { estado } = req.body;
    const allowedStatus = ['Pendiente', 'Aprobada', 'Rechazada', 'Completada'];

    if (!allowedStatus.includes(estado)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Orden de compra no encontrada' });
    }

    order.estado = estado;
    await order.save();

    res.json({ message: `Orden actualizada a estado ${estado}`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Registrar la recepción de una orden de compra e ingresar productos al inventario
// @route   POST /api/purchases/orders/:id/receive
export const receivePurchaseOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { itemsRecibidos } = req.body;

    const order = await PurchaseOrder.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Orden de compra no encontrada' });
    }

    if (order.estado === 'Completada') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Esta orden de compra ya fue recibida y completada previamente' });
    }

    for (const item of itemsRecibidos) {
      const [batch] = await Batch.create(
        [
          {
            producto: item.productoId,
            numeroLote: item.numeroLote,
            fechaVencimiento: item.fechaVencimiento,
            cantidadInicial: item.cantidadRecibida,
            cantidadActual: item.cantidadRecibida,
            costoUnitario: item.costoUnitario || 0,
            proveedor: order.proveedor.toString(),
            estado: 'Disponible',
          },
        ],
        { session }
      );

      const product = await Product.findById(item.productoId).session(session);
      if (product) {
        product.cantidadDisponible += Number(item.cantidadRecibida);
        await product.save({ session });
      }

      await Movement.create(
        [
          {
            tipo: 'ENTRADA',
            motivo: 'Compra',
            producto: item.productoId,
            lote: batch._id,
            cantidad: Number(item.cantidadRecibida),
            usuario: req.user._id,
            observaciones: `Recepción de Orden ${order.codigoOrden}`,
          },
        ],
        { session }
      );
    }

    order.estado = 'Completada';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Recepción completada. Lotes ingresados y stock actualizado automáticamente.' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};