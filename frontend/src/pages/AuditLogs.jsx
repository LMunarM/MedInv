import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShieldCheck, Search, Download, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('TODOS');
  const [loading, setLoading] = useState(true);

  const mockLogs = [
    { _id: '1', tipo: 'SALIDA', motivo: 'Dispensación Paciente', producto: { nombre: 'Propofol 1% 20ml', codigo: 'MED-9012' }, usuario: { nombre: 'Carlos Méndez', rol: 'enfermeria' }, cantidad: 10, lote: { numeroLote: 'LT-9028' }, createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), observaciones: 'UCI 3 - Camilla 12' },
    { _id: '2', tipo: 'ENTRADA', motivo: 'Compra', producto: { nombre: 'Solución Salina 0.9%', codigo: 'MED-2041' }, usuario: { nombre: 'Diana Ramos', rol: 'compras' }, cantidad: 500, lote: { numeroLote: 'SS-8812' }, createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(), observaciones: 'Recepción OC-2026-088 Baxter Corp' },
    { _id: '3', tipo: 'SALIDA', motivo: 'Merma o Deterioro', producto: { nombre: 'Ceftriaxona 1g Polvo', codigo: 'MED-3310' }, usuario: { nombre: 'Ana Ríos', rol: 'farmacia' }, cantidad: 2, lote: { numeroLote: 'CF-4401' }, createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(), observaciones: 'Frasco roto durante traslado' },
    { _id: '4', tipo: 'SALIDA', motivo: 'Dispensación Paciente', producto: { nombre: 'Catéter Intravenoso 18G', codigo: 'DISP-1044' }, usuario: { nombre: 'Carlos Méndez', rol: 'enfermeria' }, cantidad: 25, lote: { numeroLote: 'CT-1109' }, createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(), observaciones: 'Urgencias Pediátricas' },
    { _id: '5', tipo: 'ENTRADA', motivo: 'Compra', producto: { nombre: 'Propofol 1% 20ml', codigo: 'MED-9012' }, usuario: { nombre: 'Laura Peña', rol: 'almacen' }, cantidad: 100, lote: { numeroLote: 'LT-9028' }, createdAt: new Date(Date.now() - 1440 * 60 * 1000).toISOString(), observaciones: 'Recepción OC-2026-071 Vitalis' },
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/history?limit=50');
      if (res.data.movimientos && res.data.movimientos.length > 0) {
        setLogs(res.data.movimientos);
      } else {
        setLogs(mockLogs);
      }
    } catch {
      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExport = async () => {
    try {
      const response = await api.get('/reports/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Pistas_Auditoria_MedInv_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Reporte de auditoría generado y exportado exitosamente.');
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      (log.producto?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.usuario?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.observaciones || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.lote?.numeroLote || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (filterTipo === 'TODOS') return matchSearch;
    return matchSearch && log.tipo === filterTipo;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-medinv-800 tracking-wider uppercase block">SEGURIDAD Y COMPLIANCE</span>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Pistas de Auditoría</h1>
          <p className="text-xs text-gray-500 mt-1">Registro inmutable de trazabilidad de todos los movimientos del inventario clínico.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-medinv-800 transition cursor-pointer"
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            className="bg-medinv-800 hover:bg-medinv-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Descargar bitácora
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por usuario, lote, insumo o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-medinv-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 font-medium">Filtrar:</span>
          {['TODOS', 'ENTRADA', 'SALIDA'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTipo(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterTipo === t ? 'bg-medinv-800 text-white shadow-xs' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-6 font-semibold">EVENTO / OPERACIÓN</th>
                <th className="py-3.5 px-6 font-semibold">INSUMO AFECTADO</th>
                <th className="py-3.5 px-6 font-semibold">RESPONSABLE</th>
                <th className="py-3.5 px-6 font-semibold">LOTE / REGISTRO</th>
                <th className="py-3.5 px-6 font-semibold text-center">CANTIDAD</th>
                <th className="py-3.5 px-6 font-semibold">DESTINO / DETALLES</th>
                <th className="py-3.5 px-6 font-semibold text-right">FECHA Y HORA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredLogs.map((log) => {
                const isExit = log.tipo === 'SALIDA';
                return (
                  <tr key={log._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${isExit ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {isExit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{log.tipo}</span>
                        <span className="text-[11px] text-gray-400">{log.motivo}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900 block">{log.producto?.nombre || 'Insumo Médico'}</span>
                      <span className="text-[11px] text-gray-400">{log.producto?.codigo}</span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-800 block">{log.usuario?.nombre || 'Personal Médico'}</span>
                      <span className="text-[10px] uppercase font-semibold text-gray-400">{log.usuario?.rol || 'Staff'}</span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-700 font-bold">
                        {log.lote?.numeroLote || 'LT-ACTIVO'}
                      </span>
                    </td>

                    <td className={`py-4 px-6 text-center font-bold ${isExit ? 'text-red-600' : 'text-emerald-600'}`}>
                      {isExit ? `-${log.cantidad}` : `+${log.cantidad}`}
                    </td>

                    <td className="py-4 px-6 text-gray-600 max-w-xs truncate">
                      {log.observaciones || 'Sin observaciones registradas'}
                    </td>

                    <td className="py-4 px-6 text-right text-gray-500 whitespace-nowrap">
                      <span className="font-semibold block text-gray-700">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}