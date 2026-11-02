import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, ShoppingCart, Plus, Trash2 } from 'lucide-react';

export default function OrderModal({ isOpen, onClose, onOrderCreated }) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ producto: '', cantidadSolicitada: 10, precioEstimadoUnitario: 0 });
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [supRes, prodRes] = await Promise.all([
            api.get('/purchases/suppliers'),
            api.get('/products')
          ]);
          setSuppliers(supRes.data);
          setProducts(prodRes.data);
          if (supRes.data.length > 0) setSelectedSupplier(supRes.data[0]._id);
          if (prodRes.data.length > 0) setCurrentItem(prev => ({ ...prev, producto: prodRes.data[0]._id }));
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!currentItem.producto) return;
    const prodObj = products.find(p => p._id === currentItem.producto);
    setItems([...items, { ...currentItem, nombre: prodObj?.nombre, codigo: prodObj?.codigo }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Debes agregar al menos un insumo a la orden');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/purchases/orders', {
        proveedor: selectedSupplier,
        items: items.map(i => ({
          producto: i.producto,
          cantidadSolicitada: Number(i.cantidadSolicitada),
          precioEstimadoUnitario: Number(i.precioEstimadoUnitario)
        })),
        observaciones
      });
      onOrderCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al emitir orden de compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-50 text-medinv-800 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Nueva Orden de Compra</h2>
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
            <label className="block font-semibold text-gray-700 mb-1">Proveedor Autorizado</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medinv-700"
            >
              {suppliers.map(s => (
                <option key={s._id} value={s._id}>{s.nombre} ({s.identificacionFiscal})</option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-gray-50/70 border border-gray-200/80 rounded-xl space-y-3">
            <span className="font-bold text-gray-700 block">Agregar Ítems a la Solicitud</span>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <select
                  value={currentItem.producto}
                  onChange={(e) => setCurrentItem({ ...currentItem, producto: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg"
                >
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.nombre} ({p.codigo})</option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min="1"
                  placeholder="Cantidad"
                  value={currentItem.cantidadSolicitada}
                  onChange={(e) => setCurrentItem({ ...currentItem, cantidadSolicitada: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg"
                />
              </div>
              <div className="col-span-3">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-1.5 bg-medinv-800 text-white font-semibold rounded-lg hover:bg-medinv-900 transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
            </div>

            {items.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-200 text-gray-700">
                    <span><strong>{it.nombre}</strong> — {it.cantidadSolicitada} unidades</span>
                    <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Observaciones</label>
            <textarea
              rows="2"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Instrucciones de entrega para almacén..."
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
              {loading ? 'Generando...' : 'Emitir Orden de Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}