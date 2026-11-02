import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre o razón social del proveedor es obligatorio'],
      trim: true,
    },
    identificacionFiscal: {
      type: String,
      required: [true, 'El NIT o identificación fiscal es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    contacto: {
      nombrePersona: { type: String, trim: true, default: '' },
      telefono: { type: String, trim: true, default: '' },
      email: { type: String, trim: true, lowercase: true, default: '' },
    },
    direccion: {
      type: String,
      trim: true,
      default: '',
    },
    categoriasSuministradas: [
      {
        type: String,
        enum: [
          'Medicamentos',
          'Material de Curación',
          'Insumos Quirúrgicos',
          'Equipos y Dispositivos',
          'Reactivos y Laboratorio',
          'Higiene y Desinfección',
          'Otro',
        ],
      },
    ],
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Supplier', supplierSchema);