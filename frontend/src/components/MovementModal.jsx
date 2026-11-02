import React, { useState } from 'react';
import api from '../api/axios';
import { X, ArrowDownLeft } from 'lucide-react';

export default function MovementModal({ isOpen, onClose, product, onMovementSuccess }) {
  const [tipo, setTipo] = useState('SALIDA');
  const [motivo, setMotivo] = useState('Dispensación Paciente');
  const [cantidad, setCantidad] = useState(1);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tipo === 'SALIDA') {
        await api.post('/movements/exit', {
          productoId: product._id || product.id,
          cantidad: Number(cantidad),
          motivo,
          observaciones,
        });
      }
      onMovementSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Registrar Movimiento</h2>
            <p className="text-xs text-gray-500 mt-0.5">{product.nombre} (Disponibles: {product.cantidadDisponible || 0})</p>
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
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Tipo de Movimiento</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setTipo('SALIDA'); setMotivo('Dispensación Paciente'); }}
                className={`py-2 px-3 rounded-xl font-semibold border flex items-center justify-center gap-1.5 transition ${
                  tipo === 'SALIDA' && motivo === 'Dispensación Paciente'
                    ? 'bg-red-50 border-red-300 text-red-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" /> Salida / Dispensación
              </button>
              <button
                type="button"
                onClick={() => { setTipo('SALIDA'); setMotivo('Merma o Deterioro'); }}
                className={`py-2 px-3 rounded-xl font-semibold border flex items-center justify-center gap-1.5 transition ${
                  motivo === 'Merma o Deterioro' 
                    ? 'bg-amber-50 border-amber-300 text-amber-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                Baja / Merma
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Motivo Específico</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medinv-700"
            >
              <option>Dispensación Paciente</option>
              <option>Merma o Deterioro</option>
              <option>Vencimiento</option>
              <option>Corrección Inventario</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Cantidad de Unidades</label>
            <input
              type="number"
              min="1"
              max={product.cantidadDisponible || 9999}
              required
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medinv-700 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Destino / Observaciones Clínicas</label>
            <textarea
              rows="2"
              placeholder="Ej. Solicitado por Carlos Méndez para UCI 3"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medinv-700"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
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
              {loading ? 'Aplicando...' : 'Confirmar Operación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}