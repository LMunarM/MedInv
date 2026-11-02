import Movement from '../models/Movement.js';
import Product from '../models/Product.js';
import Batch from '../models/Batch.js';
import ExcelJS from 'exceljs';

// @desc    Métricas globales y KPIs para el Dashboard
// @route   GET /api/reports/dashboard
export const getDashboardKPIs = async (req, res) => {
  try {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    const totalProductos = await Product.countDocuments({ activo: true });

    const productosBajoStock = await Product.countDocuments({
      activo: true,
      $expr: { $lte: ['$cantidadDisponible', '$stockMinimo'] },
    });

    const lotesVencidos = await Batch.countDocuments({
      cantidadActual: { $gt: 0 },
      fechaVencimiento: { $lt: today },
    });

    const lotesPorVencer = await Batch.countDocuments({
      cantidadActual: { $gt: 0 },
      fechaVencimiento: { $gte: today, $lte: next30Days },
    });

    const valorizacion = await Batch.aggregate([
      { $match: { cantidadActual: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          totalValorInventario: {
            $sum: { $multiply: ['$cantidadActual', '$costoUnitario'] },
          },
          totalUnidadesFisicas: { $sum: '$cantidadActual' },
        },
      },
    ]);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const movimientosMes = await Movement.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: '$tipo',
          totalMovimientos: { $sum: 1 },
          unidadesMovidas: { $sum: '$cantidad' },
        },
      },
    ]);

    res.json({
      kpis: {
        totalProductos,
        productosBajoStock,
        lotesVencidos,
        lotesPorVencer,
        valorTotalInventario: valorizacion[0]?.totalValorInventario || 0,
        unidadesFisicasEnStock: valorizacion[0]?.totalUnidadesFisicas || 0,
      },
      actividadMes: movimientosMes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Historial cronológico con filtros
// @route   GET /api/reports/history
export const getMovementHistory = async (req, res) => {
  try {
    const { tipo, motivo, productoId, startDate, endDate, page = 1, limit = 25 } = req.query;

    const filter = {};

    if (tipo) filter.tipo = tipo;
    if (motivo) filter.motivo = motivo;
    if (productoId) filter.producto = productoId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const count = await Movement.countDocuments(filter);
    const history = await Movement.find(filter)
      .populate('producto', 'codigo nombre categoria unidadMedida')
      .populate('lote', 'numeroLote fechaVencimiento')
      .populate('usuario', 'nombre rol email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      totalRegistros: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      movimientos: history,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reporte de consumo / salidas agrupado por categoría
// @route   GET /api/reports/consumption-by-category
export const getConsumptionByCategory = async (req, res) => {
  try {
    const consumption = await Movement.aggregate([
      { $match: { tipo: 'SALIDA' } },
      {
        $lookup: {
          from: 'products',
          localField: 'producto',
          foreignField: '_id',
          as: 'productoDetalle',
        },
      },
      { $unwind: '$productoDetalle' },
      {
        $group: {
          _id: '$productoDetalle.categoria',
          totalUnidadesDispensadas: { $sum: '$cantidad' },
          operacionesRealizadas: { $sum: 1 },
        },
      },
      { $sort: { totalUnidadesDispensadas: -1 } },
    ]);

    res.json(consumption);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reporte de mermas y pérdidas
// @route   GET /api/reports/losses
export const getLossesReport = async (req, res) => {
  try {
    const losses = await Movement.find({
      motivo: { $in: ['Merma o Deterioro', 'Vencimiento'] },
    })
      .populate('producto', 'codigo nombre categoria unidadMedida')
      .populate('lote', 'numeroLote costoUnitario')
      .populate('usuario', 'nombre rol')
      .sort({ createdAt: -1 });

    const totalUnidadesPerdidas = losses.reduce((acc, m) => acc + m.cantidad, 0);

    res.json({
      totalUnidadesPerdidas,
      totalIncidentes: losses.length,
      registros: losses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Exportar inventario general y lotes a archivo Excel
// @route   GET /api/reports/export/excel
export const exportInventoryToExcel = async (req, res) => {
  try {
    const products = await Product.find({ activo: true }).sort({ nombre: 1 });
    const batches = await Batch.find({ cantidadActual: { $gt: 0 } }).populate('producto');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MedInv - Gestión Hospitalaria';
    workbook.created = new Date();

    const sheetProducts = workbook.addWorksheet('Existencias Generales');
    sheetProducts.columns = [
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Nombre del Producto', key: 'nombre', width: 30 },
      { header: 'Categoría', key: 'categoria', width: 22 },
      { header: 'Unidad', key: 'unidad', width: 12 },
      { header: 'Stock Actual', key: 'stock', width: 14 },
      { header: 'Stock Mínimo', key: 'minimo', width: 14 },
      { header: 'Ubicación / Área', key: 'ubicacion', width: 25 },
    ];

    products.forEach((p) => {
      sheetProducts.addRow({
        codigo: p.codigo,
        nombre: p.nombre,
        categoria: p.categoria,
        unidad: p.unidadMedida,
        stock: p.cantidadDisponible,
        minimo: p.stockMinimo,
        ubicacion: `${p.ubicacion?.area || ''} (Est: ${p.ubicacion?.estante || ''})`,
      });
    });

    const sheetBatches = workbook.addWorksheet('Lotes y Caducidades');
    sheetBatches.columns = [
      { header: 'Producto', key: 'producto', width: 25 },
      { header: 'Número de Lote', key: 'lote', width: 18 },
      { header: 'Fecha de Vencimiento', key: 'vencimiento', width: 22 },
      { header: 'Cantidad Disponible', key: 'cantidad', width: 20 },
      { header: 'Costo Unitario ($)', key: 'costo', width: 18 },
      { header: 'Estado', key: 'estado', width: 15 },
    ];

    batches.forEach((b) => {
      sheetBatches.addRow({
        producto: b.producto?.nombre || 'N/A',
        lote: b.numeroLote,
        vencimiento: b.fechaVencimiento ? new Date(b.fechaVencimiento).toLocaleDateString() : '',
        cantidad: b.cantidadActual,
        costo: b.costoUnitario,
        estado: b.estado,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Inventario_MedInv.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};