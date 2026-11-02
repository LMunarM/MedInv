import React, { useState } from 'react';
import { ShoppingCart, Clock, CheckCircle2, AlertTriangle, Plus, ChevronRight } from 'lucide-react';

export default function Orders() {
  const [filter, setFilter] = useState('Todas');

  const orders = [
    {
      id: 'OC-2026-088',
      proveedor: 'Baxter Corp.',
      estado: 'En tránsito',
      insumo: 'Solución Salina · 500 un.',
      entrega: 'Hoy, 14:30',
      total: '$ 8.420.000',
    },
    {
      id: 'OC-2026-091',
      proveedor: 'Vitalis S.A.',
      estado: 'Por aprobar',
      insumo: 'Propofol 1% · 120 amp.',
      entrega: '22 Oct 2026',
      total: '$ 3.180.000',
    },
    {
      id: 'OC-2026-087',
      proveedor: 'Tecnoquímicas',
      estado: 'Confirmada',
      insumo: 'Ceftriaxona 1g · 300 viales',
      entrega: '24 Oct 2026',
      total: '$ 5.760.000',
    },
    {
      id: 'OC-2026-083',
      proveedor: 'Cardio Medical',
      estado: 'Borrador',
      insumo: 'Catéter IV 18G · 1.000 un.',
      entrega: '28 Oct 2026',
      total: '$ 2.980.000',
    },
  ];

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'En tránsito':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Por aprobar':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Confirmada':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-pink-50 text-medinv-800 border-pink-200';
    }
  };

  const tabs = ['Todas', 'Por aprobar', 'En tránsito', 'Confirmada', 'Borrador'];

  const filteredOrders = filter === 'Todas' ? orders : orders.filter((o) => o.estado === filter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-medinv-800 tracking-wider uppercase block">ABASTECIMIENTO</span>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Órdenes de compra</h1>
          <p className="text-xs text-gray-500 mt-1">Planifica, aprueba y monitorea las compras clínicas hasta su recepción.</p>
        </div>
        <button className="bg-medinv-800 hover:bg-medinv-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva orden
        </button>
      </div>

      {/* 4 Métricas de Órdenes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Órdenes activas</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">6</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              $ 42.8M comprometidos
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Por aprobar</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">2</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Requieren tu revisión
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Arribos hoy</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">2</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Recepción programada
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Con retraso</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">1</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Proveedor notificado
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Filtro */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === tab
                ? 'bg-medinv-800 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid de Tarjetas de Órdenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((o) => (
          <div key={o.id} className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 flex flex-col justify-between hover:border-gray-300 transition">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-mono text-gray-400 block">{o.id}</span>
                  <h3 className="text-base font-bold text-gray-900 mt-0.5">{o.proveedor}</h3>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(o.estado)}`}>
                  {o.estado}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 my-4">
                <span className="text-xs font-semibold text-gray-800 block">{o.insumo}</span>
                <span className="text-[11px] text-gray-500 mt-0.5 block">Entrega estimada: {o.entrega}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-base font-extrabold text-gray-900">{o.total}</span>
              <button className="text-gray-700 hover:text-medinv-800 font-semibold text-xs px-3 py-1.5 rounded-xl border border-gray-200 transition inline-flex items-center gap-1">
                Ver orden <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}