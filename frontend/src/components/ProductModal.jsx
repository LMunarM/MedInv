import React, { useState } from 'react';
import api from '../api/axios';
import { X, Package } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, onProductCreated }) {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: 'Medicamentos',
    descripcion: '',
    unidadMedida: 'ampolla',
    stockMinimo: 10,
    area: 'Farmacia Central',
    estante: 'E-01',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        codigo: formData.codigo,
        nombre: formData.nombre,
        categoria: formData.categoria,
        descripcion: formData.descripcion,
        unidadMedida: formData.unidadMedida,
        stockMinimo: Number(formData.stockMinimo),
        ubicacion: {
          area: formData.area,
          estante: formData.estante,
        },
      };
      await api.post('/products', payload);
      onProductCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-50 text-medinv-800 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Registrar Nuevo Insumo</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-3 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Código Único</label>
              <input
                type="text"
                required
                placeholder="MED-1020"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medinv-700 uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medinv-700"
              >
                <option>Medicamentos</option>
                <option>Material de Curación</option>
                <option>Insumos Quirúrgicos</option>
                <option>Equipos y Dispositivos</option>
                <option>Reactivos y Laboratorio</option>
                <option>Higiene y Desinfección</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Nombre Comercial / Genérico</label>
            <input
              type="text"
              required
              placeholder="Ej. Ampicilina 500mg Polvo"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medinv-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Unidad de Medida</label>
              <input
                type="text"
                required
                placeholder="vial, ampolla, caja"
                value={formData.unidadMedida}
                onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medinv-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Stock Mínimo Alerta</label>
              <input
                type="number"
                min="1"
                required
                value={formData.stockMinimo}
                onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medinv-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Área o Bodega</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medinv-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Estante / Casilla</label>
              <input
                type="text"
                value={formData.estante}
                onChange={(e) => setFormData({ ...formData, estante: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medinv-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-medinv-800 hover:bg-medinv-900 text-white rounded-xl font-semibold shadow-xs transition"
            >
              {loading ? 'Guardando...' : 'Guardar Insumo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}