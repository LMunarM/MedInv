import mongoose from 'mongoose';

const movementSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      enum: ['ENTRADA', 'SALIDA', 'AJUSTE'],
    },
    motivo: {
      type: String,
      required: [true, 'El motivo es obligatorio'],
      enum: [
        'Compra',
        'Donación',
        'Dispensación Paciente',
        'Merma o Deterioro',
        'Vencimiento',
        'Corrección Inventario',
      ],
    },
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    lote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: [1, 'La cantidad del movimiento debe ser al menos 1'],
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    observaciones: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Movement', movementSchema);