import React from 'react';
import { X, Package, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ProductDetailModal({ isOpen, onClose, product, onOpenMovement }) {
  if (!isOpen || !product) return null;

  const isLowStock = product.cantidadDisponible <= product.stockMinimo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-start pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-50 text-medinv-800 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">{product.nombre}</h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{product.codigo} · {product.categoria}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-4 text-xs">
          {isLowStock ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span><strong>Atención:</strong> Nivel por debajo del stock mínimo ({product.stockMinimo} {product.unidadMedida}).</span>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Nivel de existencias óptimo y dentro de la política de seguridad.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Stock Actual</span>
              <span className="text-lg font-extrabold text-gray-900">{product.cantidadDisponible} {product.unidadMedida}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Punto Reorden (Min)</span>
              <span className="text-lg font-extrabold text-gray-900">{product.stockMinimo} {product.unidadMedida}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Ubicación Bodega</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-medinv-800" /> {product.ubicacion?.area || 'Farmacia Central'} ({product.ubicacion?.estante || 'E-01'})
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Rotación Sugerida</span>
              <span className="font-semibold text-gray-800">FEFO (First Expired, First Out)</span>
            </div>
          </div>

          <div>
            <span className="font-bold text-gray-700 block mb-1">Descripción Clínica</span>
            <p className="text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              {product.descripcion || 'Insumo farmacéutico registrado para dispensación en servicios hospitalarios y salas quirúrgicas.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenMovement(product);
            }}
            className="px-4 py-2 bg-medinv-800 hover:bg-medinv-900 text-white rounded-xl font-semibold shadow-xs transition"
          >
            Dispensar / Ajustar
          </button>
        </div>
      </div>
    </div>
  );
}