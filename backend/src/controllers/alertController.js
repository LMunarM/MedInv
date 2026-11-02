import Product from '../models/Product.js';
import Batch from '../models/Batch.js';

// @desc    Obtener todas las alertas consolidadas (Bajo stock, por vencer y vencidos)
// @route   GET /api/alerts
export const getAlertsSummary = async (req, res) => {
  try {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    // 1. Alertas de stock crítico o bajo
    const lowStockProducts = await Product.find({
      activo: true,
      $expr: { $lte: ['$cantidadDisponible', '$stockMinimo'] },
    }).sort({ cantidadDisponible: 1 });

    // 2. Alertas de lotes ya vencidos con existencias remanentes
    const expiredBatches = await Batch.find({
      cantidadActual: { $gt: 0 },
      fechaVencimiento: { $lt: today },
    })
      .populate('producto', 'codigo nombre unidadMedida ubicacion')
      .sort({ fechaVencimiento: 1 });

    // 3. Alertas de lotes próximos a vencer (en los siguientes 30 días)
    const expiringSoonBatches = await Batch.find({
      cantidadActual: { $gt: 0 },
      fechaVencimiento: { $gte: today, $lte: next30Days },
    })
      .populate('producto', 'codigo nombre unidadMedida ubicacion')
      .sort({ fechaVencimiento: 1 });

    res.json({
      resumen: {
        totalBajoStock: lowStockProducts.length,
        totalPorVencer: expiringSoonBatches.length,
        totalVencidos: expiredBatches.length,
        requiereAtencionInmediata:
          lowStockProducts.length > 0 ||
          expiringSoonBatches.length > 0 ||
          expiredBatches.length > 0,
      },
      alertas: {
        bajoStock: lowStockProducts.map((p) => ({
          productoId: p._id,
          codigo: p.codigo,
          nombre: p.nombre,
          categoria: p.categoria,
          disponible: p.cantidadDisponible,
          minimo: p.stockMinimo,
          deficit: p.stockMinimo - p.cantidadDisponible,
          ubicacion: p.ubicacion,
        })),
        porVencer: expiringSoonBatches.map((b) => ({
          loteId: b._id,
          producto: b.producto?.nombre,
          codigo: b.producto?.codigo,
          numeroLote: b.numeroLote,
          cantidadActual: b.cantidadActual,
          fechaVencimiento: b.fechaVencimiento,
          diasRestantes: Math.ceil((new Date(b.fechaVencimiento) - today) / (1000 * 60 * 60 * 24)),
          ubicacion: b.producto?.ubicacion,
        })),
        vencidos: expiredBatches.map((b) => ({
          loteId: b._id,
          producto: b.producto?.nombre,
          codigo: b.producto?.codigo,
          numeroLote: b.numeroLote,
          cantidadAfectada: b.cantidadActual,
          fechaVencimiento: b.fechaVencimiento,
          ubicacion: b.producto?.ubicacion,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};