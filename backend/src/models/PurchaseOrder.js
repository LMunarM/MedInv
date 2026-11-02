import mongoose from 'mongoose';

const purchaseOrderItemSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  cantidadSolicitada: {
    type: Number,
    required: true,
    min: [1, 'La cantidad solicitada debe ser mayor a 0'],
  },
  precioEstimadoUnitario: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    codigoOrden: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    proveedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'El proveedor es obligatorio'],
    },
    solicitante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [purchaseOrderItemSchema],
    costoTotalEstimado: {
      type: Number,
      default: 0,
    },
    estado: {
      type: String,
      enum: ['Pendiente', 'Aprobada', 'Rechazada', 'Completada'],
      default: 'Pendiente',
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

export default mongoose.model('PurchaseOrder', purchaseOrderSchema);