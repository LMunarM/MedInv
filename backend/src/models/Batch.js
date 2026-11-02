import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'El producto es obligatorio'],
    },
    numeroLote: {
      type: String,
      required: [true, 'El número de lote es obligatorio'],
      trim: true,
      uppercase: true,
    },
    fechaVencimiento: {
      type: Date,
      required: [true, 'La fecha de vencimiento es obligatoria'],
    },
    cantidadInicial: {
      type: Number,
      required: true,
      min: [1, 'La cantidad inicial debe ser mayor a 0'],
    },
    cantidadActual: {
      type: Number,
      required: true,
      min: [0, 'La cantidad actual no puede ser negativa'],
    },
    proveedor: {
      type: String,
      trim: true,
      default: 'Proveedor General',
    },
    costoUnitario: {
      type: Number,
      min: [0, 'El costo no puede ser negativo'],
      default: 0,
    },
    estado: {
      type: String,
      enum: ['Disponible', 'Agotado', 'Vencido', 'Cuarentena'],
      default: 'Disponible',
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para evitar registrar dos veces el mismo lote del mismo producto
batchSchema.index({ producto: 1, numeroLote: 1 }, { unique: true });

export default mongoose.model('Batch', batchSchema);