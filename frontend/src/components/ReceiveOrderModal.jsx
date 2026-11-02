import React, { useState } from 'react';
import api from '../api/axios';
import { X, CheckCircle2 } from 'lucide-react';

export default function ReceiveOrderModal({ isOpen, onClose, order, onOrderReceived }) {
  const [lotes, setLotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const handleInputChange = (productId, field, value) => {
    setLotes(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const itemsRecibidos = order.items.map(item => {
        const prodId = item.producto._id || item.producto;
        const loteInfo = lotes[prodId] || {};
        return {
          productoId: prodId,
          numeroLote: loteInfo.numeroLote || `LT-${Date.now().toString().slice(-4)}`,
          fechaVencimiento: loteInfo.fechaVencimiento || new Date(Date.now() + 365*24*60*60*1000).toISOString(),
          cantidadRecibida: Number(item.cantidadSolicitada),
          costoUnitario: Number(loteInfo.costoUnitario || 15000)
        };
      });

      await api.post(`/purchases/orders/${order._id}/receive`, { itemsRecibidos });
      onOrderReceived();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la recepción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recepción de Mercancía</h2>
            <p className="text-xs text-gray-500 mt-0.5">{order.codigoOrden} · Proveedor: {order.proveedor?.nombre || 'General'}</p>
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
          <p className="text-gray-600 text-[11px]">
            Ingresa el número de lote y caducidad impresos en los empaques para ingresar los productos al inventario clínico:
          </p>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {order.items.map((it) => {
              const prodId = it.producto._id || it.producto;
              return (
                <div key={prodId} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <span className="font-bold text-gray-900 block">{it.producto?.nombre} (Cant: {it.cantidadSolicitada})</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">N° de Lote</label>
                      <input
                        type="text"
                        required
                        placeholder="LT-2026-X"
                        onChange={(e) => handleInputChange(prodId, 'numeroLote', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Fecha Caducidad</label>
                      <input
                        type="date"
                        required
                        onChange={(e) => handleInputChange(prodId, 'fechaVencimiento', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
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
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Ingresando...' : 'Confirmar Ingreso a Bodega'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}