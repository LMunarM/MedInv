import Product from '../models/Product.js';
import Movement from '../models/Movement.js';
import Batch from '../models/Batch.js';

// @desc    Calcular Clasificación ABC de inventario (Pareto 80/15/5)
// @route   GET /api/policies/abc-analysis
export const getABCAnalysis = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const salidas = await Movement.aggregate([
      {
        $match: {
          tipo: 'SALIDA',
          motivo: 'Dispensación Paciente',
          createdAt: { $gte: ninetyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$producto',
          totalConsumido: { $sum: '$cantidad' },
        },
      },
    ]);

    const products = await Product.find({ activo: true });
    const batches = await Batch.find({});

    const itemsCalculados = products.map((prod) => {
      const consumo = salidas.find((s) => s._id.toString() === prod._id.toString())?.totalConsumido || 0;
      const prodBatches = batches.filter((b) => b.producto.toString() === prod._id.toString());
      const costoPromedio = prodBatches.length > 0
        ? prodBatches.reduce((acc, b) => acc + (b.costoUnitario || 0), 0) / prodBatches.length
        : 1;

      const valorConsumo = consumo * costoPromedio;

      return {
        productoId: prod._id,
        codigo: prod.codigo,
        nombre: prod.nombre,
        categoria: prod.categoria,
        consumoUnidades: consumo,
        costoPromedioUnitario: Number(costoPromedio.toFixed(2)),
        valorConsumoTotal: Number(valorConsumo.toFixed(2)),
      };
    });

    itemsCalculados.sort((a, b) => b.valorConsumoTotal - a.valorConsumoTotal);

    const sumaValorGlobal = itemsCalculados.reduce((acc, item) => acc + item.valorConsumoTotal, 0) || 1;

    let acumulado = 0;
    const resultadoABC = itemsCalculados.map((item) => {
      acumulado += item.valorConsumoTotal;
      const porcentajeAcumulado = (acumulado / sumaValorGlobal) * 100;

      let clasificacion = 'C';
      if (porcentajeAcumulado <= 80) {
        clasificacion = 'A';
      } else if (porcentajeAcumulado <= 95) {
        clasificacion = 'B';
      }

      return {
        ...item,
        porcentajeAcumulado: Number(porcentajeAcumulado.toFixed(2)),
        clasificacion,
      };
    });

    res.json(resultadoABC);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Calcular Punto de Reorden y Stock de Seguridad
// @route   GET /api/policies/reorder-points
export const getReorderPoints = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salidas = await Movement.aggregate([
      {
        $match: {
          tipo: 'SALIDA',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$producto',
          totalSalidas: { $sum: '$cantidad' },
        },
      },
    ]);

    const products = await Product.find({ activo: true });

    const analisisReorden = products.map((prod) => {
      const consumoTotal30d = salidas.find((s) => s._id.toString() === prod._id.toString())?.totalSalidas || 0;
      const demandaDiariaPromedio = consumoTotal30d / 30;
      const leadTimeDias = 5; 
      const stockSeguridadSugerido = Math.ceil(demandaDiariaPromedio * 3);
      const puntoDeReorden = Math.ceil((demandaDiariaPromedio * leadTimeDias) + stockSeguridadSugerido);
      const requiereReorden = prod.cantidadDisponible <= puntoDeReorden;

      return {
        productoId: prod._id,
        codigo: prod.codigo,
        nombre: prod.nombre,
        stockActual: prod.cantidadDisponible,
        stockMinimoConfigurado: prod.stockMinimo,
        demandaDiariaPromedio: Number(demandaDiariaPromedio.toFixed(2)),
        stockSeguridadSugerido,
        puntoDeReorden,
        requiereReorden,
        estadoSugerido: requiereReorden ? 'Generar Orden de Compra' : 'Nivel Óptimo',
      };
    });

    res.json(analisisReorden);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};