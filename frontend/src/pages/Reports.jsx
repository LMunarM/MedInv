import React, { useState } from 'react';
import { Download, TrendingUp, RefreshCw, AlertTriangle, ShoppingBag } from 'lucide-react';
import api from '../api/axios';

export default function Reports() {
  const [period, setPeriod] = useState('6 meses');

  const handleDownload = async () => {
    try {
      const res = await api.get('/reports/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Reporte_Inventario_MedInv.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-medinv-800 tracking-wider uppercase block">ANALÍTICA OPERACIONAL</span>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Reportes & KPIs</h1>
          <p className="text-xs text-gray-500 mt-1">Visualiza tendencias de servicio, rotación y eficiencia de inventario.</p>
        </div>
        <button
          onClick={handleDownload}
          className="bg-medinv-800 hover:bg-medinv-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Descargar reporte
        </button>
      </div>

      {/* 4 Métricas Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Nivel de servicio</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">96.8%</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              +2.4% vs. periodo anterior
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Rotación inventario</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">8.2×</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Objetivo anual: 8.0×
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Merma por vencimiento</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">0.7%</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              -0.3% este trimestre
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Ahorro por compras</span>
            <div className="p-2 bg-pink-50 text-medinv-800 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">$18.4M</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-pink-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-medinv-800"></span>
              Negociación consolidada
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Gráfico de Barras: Disponibilidad */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Disponibilidad de inventario</h3>
              <p className="text-xs text-gray-400">Porcentaje mensual de referencias disponibles</p>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
              {['3 meses', '6 meses', '1 año'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    period === p ? 'bg-white shadow-xs text-gray-900 font-semibold' : 'text-gray-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <div className="flex items-end justify-between h-48 gap-2 px-2">
              {[45, 60, 52, 65, 68, 62, 75, 70, 82, 79, 94].map((val, idx) => (
                <div key={idx} className="w-full flex flex-col items-center gap-2">
                  <div
                    style={{ height: `${val}%` }}
                    className="w-full max-w-[42px] bg-[#F1DEE2] rounded-t-lg hover:bg-medinv-300 transition-all cursor-pointer"
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-mono uppercase mt-3 pt-3 border-t border-gray-100">
              <span>ABR 2025</span>
              <span>MAR 2026</span>
            </div>
          </div>
        </div>

        {/* Gráfico Donut: Composición ABC */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Composición ABC</h3>
            <p className="text-xs text-gray-400">Participación por valor</p>
          </div>

          <div className="flex flex-col items-center justify-center my-6">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Gráfico SVG Donut con los colores de Figma */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#6B1728" strokeWidth="4.2" strokeDasharray="68 32" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#D97706" strokeWidth="4.2" strokeDasharray="22 78" strokeDashoffset="-68" />
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#2563EB" strokeWidth="4.2" strokeDasharray="10 90" strokeDashoffset="-90" />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-gray-900 block leading-tight">1,428</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Referencias</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center">
            <div>
              <span className="inline-block w-2 h-2 rounded-full bg-medinv-800 mb-1"></span>
              <p className="text-xs font-bold text-gray-900">68%</p>
              <p className="text-[10px] text-gray-400">Clase A</p>
            </div>
            <div>
              <span className="inline-block w-2 h-2 rounded-full bg-amber-600 mb-1"></span>
              <p className="text-xs font-bold text-gray-900">22%</p>
              <p className="text-[10px] text-gray-400">Clase B</p>
            </div>
            <div>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mb-1"></span>
              <p className="text-xs font-bold text-gray-900">10%</p>
              <p className="text-[10px] text-gray-400">Clase C</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}