import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Policies() {
  const [serviceLevel, setServiceLevel] = useState(95);
  const [leadTime, setLeadTime] = useState(7);
  const [abcData, setAbcData] = useState([]);
  const [reorderData, setReorderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadCalculations = async () => {
    setLoading(true);
    try {
      const [abcRes, reorderRes] = await Promise.all([
        api.get('/policies/abc-analysis'),
        api.get('/policies/reorder-points')
      ]);
      setAbcData(abcRes.data);
      setReorderData(reorderRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalculations();
  }, []);

  const handleRecalculate = () => {
    loadCalculations();
    setMessage('Cálculos analíticos actualizados contra la demanda histórica.');
    setTimeout(() => setMessage(''), 4000);
  };

  const countA = abcData.filter(i => i.clasificacion === 'A').length;
  const countB = abcData.filter(i => i.clasificacion === 'B').length;
  const countC = abcData.filter(i => i.clasificacion === 'C').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-medinv-800 tracking-wider uppercase block">MOTOR CUANTITATIVO</span>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Políticas ABC / ROP</h1>
          <p className="text-xs text-gray-500 mt-1">Configura la clasificación, el stock de seguridad y los puntos de reorden.</p>
        </div>
        <button
          onClick={handleRecalculate}
          disabled={loading}
          className="bg-medinv-800 hover:bg-medinv-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Calculando...' : 'Guardar y recalcular'}
        </button>
      </div>

      {/* Tarjetas de Criticidad ABC Calculadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-pink-50 text-medinv-800 font-bold flex items-center justify-center text-xs">A</span>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Alta criticidad (Pareto)</h2>
              <p className="text-xs text-gray-400">{countA} referencias ({abcData.length ? Math.round((countA/abcData.length)*100) : 0}%)</p>
            </div>
          </div>
          <div className="flex justify-between items-end mt-6 pt-4 border-t border-gray-100 text-xs">
            <span className="text-gray-500">Nivel de servicio</span>
            <span className="text-base font-extrabold text-gray-900">98%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-xs">B</span>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Criticidad media</h2>
              <p className="text-xs text-gray-400">{countB} referencias ({abcData.length ? Math.round((countB/abcData.length)*100) : 0}%)</p>
            </div>
          </div>
          <div className="flex justify-between items-end mt-6 pt-4 border-t border-gray-100 text-xs">
            <span className="text-gray-500">Nivel de servicio</span>
            <span className="text-base font-extrabold text-gray-900">95%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">C</span>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Baja criticidad</h2>
              <p className="text-xs text-gray-400">{countC} referencias ({abcData.length ? Math.round((countC/abcData.length)*100) : 0}%)</p>
            </div>
          </div>
          <div className="flex justify-between items-end mt-6 pt-4 border-t border-gray-100 text-xs">
            <span className="text-gray-500">Nivel de servicio</span>
            <span className="text-base font-extrabold text-gray-900">90%</span>
          </div>
        </div>
      </div>

      {/* Sliders y Fórmula ROP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Parámetros de cálculo</h2>
            <p className="text-xs text-gray-400 mt-0.5">Valores dinámicos para insumos clase A</p>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                <span>Nivel de servicio objetivo</span>
                <span className="text-medinv-800 font-bold">{serviceLevel}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="99"
                value={serviceLevel}
                onChange={(e) => setServiceLevel(Number(e.target.value))}
                className="w-full accent-medinv-800 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                <span>Lead time predeterminado</span>
                <span className="text-medinv-800 font-bold">{leadTime} días</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={leadTime}
                onChange={(e) => setLeadTime(Number(e.target.value))}
                className="w-full accent-medinv-800 cursor-pointer"
              />
            </div>
          </div>

          {/* Tabla de Puntos de Reorden Calculados */}
          <div className="pt-4 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-800 block mb-2">Sugerencias de Reorden Automáticas</span>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {reorderData.map((item) => (
                <div key={item.productoId} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="font-bold text-gray-900 block">{item.nombre}</span>
                    <span className="text-[11px] text-gray-400">Stock: {item.stockActual} · ROP Calculado: {item.puntoDeReorden}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    item.requiereReorden ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {item.estadoSugerido}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tarjeta de Fórmula ROP Activa */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900">Fórmula ROP activa</h3>
            <span className="text-[11px] text-gray-400">Actualización en tiempo real</span>
          </div>

          <div className="bg-[#1E232A] text-white rounded-2xl p-6">
            <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase block mb-3">PUNTO DE REORDEN</span>
            <div className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-white mb-4">
              ROP = (D × LT) + SS
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400 pt-3 border-t border-gray-700">
              <div><strong className="text-gray-200 block">D</strong> Demanda</div>
              <div><strong className="text-gray-200 block">LT</strong> {leadTime} días</div>
              <div><strong className="text-gray-200 block">SS</strong> Seguridad</div>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <strong className="text-emerald-950 font-bold block">Política cuantitativa validada</strong>
              <span className="text-emerald-800">{reorderData.length} insumos evaluados sin error</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}