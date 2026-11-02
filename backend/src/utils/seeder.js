import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Batch from '../models/Batch.js';
import Movement from '../models/Movement.js';
import { initialUsers, initialProducts } from './seedData.js';

dotenv.config();

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Conectado para Seeding...');

    // Limpiar colecciones
    await User.deleteMany();
    await Product.deleteMany();
    await Batch.deleteMany();
    await Movement.deleteMany();
    console.log('Colecciones limpiadas (Usuarios, Productos, Lotes, Movimientos).');

    // 1. Crear usuarios
    const createdUsers = [];
    for (const userData of initialUsers) {
      const u = await User.create(userData);
      createdUsers.push(u);
    }
    const adminUser = createdUsers.find((u) => u.rol === 'administrador');

    // 2. Crear productos
    const createdProducts = await Product.insertMany(initialProducts);

    // Helpers de fechas
    const today = new Date();
    const addDays = (days) => {
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      return d;
    };

    // 3. Definir lotes vinculados a productos reales
    // Usamos códigos para localizar el _id correspondiente
    const pParacetamol = createdProducts.find((p) => p.codigo === 'MED-001');
    const pAmoxicilina = createdProducts.find((p) => p.codigo === 'MED-002');
    const pJeringas = createdProducts.find((p) => p.codigo === 'INS-001');
    const pGasas = createdProducts.find((p) => p.codigo === 'INS-002');
    const pInsulina = createdProducts.find((p) => p.codigo === 'VAC-001');

    const batchesToCreate = [
      // Paracetamol: 2 lotes (uno vence en 15 días [crítico], otro en 1 año)
      {
        producto: pParacetamol._id,
        numeroLote: 'PARA-2026-A',
        fechaVencimiento: addDays(15), // Próximo a vencer
        cantidadInicial: 50,
        cantidadActual: 50,
        costoUnitario: 0.15,
        proveedor: 'Laboratorios Farmavita',
        estado: 'Disponible',
      },
      {
        producto: pParacetamol._id,
        numeroLote: 'PARA-2027-B',
        fechaVencimiento: addDays(365), // Vigente
        cantidadInicial: 200,
        cantidadActual: 200,
        costoUnitario: 0.15,
        proveedor: 'Laboratorios Farmavita',
        estado: 'Disponible',
      },

      // Amoxicilina: Stock bajo (solo 15 unidades, mínimo configurado es 50)
      {
        producto: pAmoxicilina._id,
        numeroLote: 'AMOX-2026-X',
        fechaVencimiento: addDays(180),
        cantidadInicial: 15,
        cantidadActual: 15,
        costoUnitario: 1.2,
        proveedor: 'Distribuidora Médica Andina',
        estado: 'Disponible',
      },

      // Jeringas: Lote con stock holgado
      {
        producto: pJeringas._id,
        numeroLote: 'JER-9910',
        fechaVencimiento: addDays(500),
        cantidadInicial: 500,
        cantidadActual: 500,
        costoUnitario: 0.25,
        proveedor: 'Insumos Hospitalarios S.A.',
        estado: 'Disponible',
      },

      // Gasas: Lote vencido hace 10 días (para prueba de alerta de caducidad)
      {
        producto: pGasas._id,
        numeroLote: 'GAS-CADUCADA',
        fechaVencimiento: addDays(-10), // Ya venció
        cantidadInicial: 40,
        cantidadActual: 40,
        costoUnitario: 0.5,
        proveedor: 'Textiles Médicos del Norte',
        estado: 'Vencido',
      },

      // Insulina: Stock muy bajo (5 unidades, mínimo es 20) y vence en 20 días
      {
        producto: pInsulina._id,
        numeroLote: 'INS-CRIT-01',
        fechaVencimiento: addDays(20), // Próximo a vencer y bajo stock
        cantidadInicial: 5,
        cantidadActual: 5,
        costoUnitario: 12.5,
        proveedor: 'Biomédica Central',
        estado: 'Disponible',
      },
    ];

    const createdBatches = await Batch.insertMany(batchesToCreate);

    // 4. Actualizar cantidadDisponible en cada Producto según la suma de sus lotes disponibles
    for (const prod of createdProducts) {
      const prodBatches = createdBatches.filter(
        (b) => b.producto.toString() === prod._id.toString() && b.estado === 'Disponible'
      );
      const totalStock = prodBatches.reduce((acc, b) => acc + b.cantidadActual, 0);

      prod.cantidadDisponible = totalStock;
      await prod.save();
    }

    // 5. Crear registros de trazabilidad (Movimientos iniciales de entrada)
    const initialMovements = createdBatches.map((batch) => ({
      tipo: 'ENTRADA',
      motivo: 'Compra',
      producto: batch.producto,
      lote: batch._id,
      cantidad: batch.cantidadInicial,
      usuario: adminUser._id,
      observaciones: 'Ingreso inicial por seed de inventario',
    }));

    await Movement.insertMany(initialMovements);

    console.log('¡Base de datos sembrada con éxito con usuarios, productos, lotes y movimientos iniciales!');
    process.exit(0);
  } catch (error) {
    console.error(`Error al ejecutar el seeder: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany();
    await Product.deleteMany();
    await Batch.deleteMany();
    await Movement.deleteMany();
    console.log('Todos los datos eliminados.');
    process.exit(0);
  } catch (error) {
    console.error(`Error al destruir datos: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}