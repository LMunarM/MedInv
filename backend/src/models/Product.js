import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El código del producto es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: [
        'Medicamentos',
        'Material de Curación',
        'Insumos Quirúrgicos',
        'Equipos y Dispositivos',
        'Reactivos y Laboratorio',
        'Higiene y Desinfección',
        'Otro',
      ],
      default: 'Medicamentos',
    },
    unidadMedida: {
      type: String,
      required: [true, 'La unidad de medida es obligatoria'],
      enum: [
        'Caja',
        'Frasco',
        'Ampolla',
        'Tableta',
        'Blíster',
        'Unidad',
        'Paquete',
        'Bolsa',
        'Tubo',
        'Litro',
        'Mililitro',
      ],
      default: 'Unidad',
    },
    cantidadDisponible: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'La cantidad disponible no puede ser negativa'],
    },
    stockMinimo: {
      type: Number,
      required: [true, 'El stock mínimo es obligatorio'],
      default: 10,
      min: [0, 'El stock mínimo no puede ser negativo'],
    },
    ubicacion: {
      estante: { type: String, trim: true, default: 'General' },
      fila: { type: String, trim: true, default: '1' },
      columna: { type: String, trim: true, default: 'A' },
      area: {
        type: String,
        trim: true,
        enum: ['Almacén Central', 'Farmacia', 'Refrigeración', 'Urgencias', 'Quirófano'],
        default: 'Almacén Central',
      },
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas rápidas por texto y código
productSchema.index({ nombre: 'text', codigo: 'text', descripcion: 'text' });

export default mongoose.model('Product', productSchema);