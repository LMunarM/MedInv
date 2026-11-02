import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProductModal from '../components/ProductModal';
import MovementModal from '../components/MovementModal';
import ProductDetailModal from '../components/ProductDetailModal';
import OrderModal from '../components/OrderModal';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  ShoppingCart, 
  ChevronRight, 
  ArrowDownLeft, 
  Plus, 
  Trash2,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [products, setProducts] = useState([]);
  const [filterState, setFilterState] = useState('Todos los estados');
  
  // Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProductForMovement, setSelectedProductForMovement] = useState(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [notification, setNotification] = useState('');

  // Fallback si la BD aún no tiene sembrados
  const mockProducts = [
    { _id: '1', codigo: 'MED-9012', nombre: 'Propofol 1% 20ml', categoria: 'Sedante', cantidadDisponible: 12, stockMinimo: 40, unidadMedida: 'ampollas', ubicacion: { area: 'UCI 3', estante: 'E-04' }, lote: 'LT-9028', vencimiento: '12 Oct 2026' },
    { _id: '2', codigo: 'MED-3310', nombre: 'Ceftriaxona 1g Polvo', categoria: 'Antibiótico', cantidadDisponible: 55, stockMinimo: 50, unidadMedida: 'viales', ubicacion: { area: 'Farmacia', estante: 'E-02' }, lote: 'CF-4401', vencimiento: '28 Oct 2026' },
    { _id: '3', codigo: 'DISP-1044', nombre: 'Catéter Intravenoso 18G', categoria: 'Dispositivo', cantidadDisponible: 450, stockMinimo: 200, unidadMedida: 'unidades', ubicacion: { area: 'Almacén', estante: 'E-09' }, lote: 'CT-1109', vencimiento: '14 Mar 2028' },
    { _id: '4', codigo: 'MED-2041', nombre: 'Solución Salina 0.9%', categoria: 'Solución', cantidadDisponible: 280, stockMinimo: 150, unidadMedida: 'bolsas', ubicacion: { area: 'Bodega Central', estante: 'B-01' }, lote: 'SS-8812', vencimiento: '08 Dic 2027' },
  ];

  const loadDashboardData = async () => {
    try {
      const [kpiRes, prodRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/products')
      ]);
      setKpis(kpiRes.data.kpis);
      if (prodRes.data && prodRes.data.length > 0) {
        setProducts(prodRes.data);
      } else {
        setProducts(mockProducts);
      }
    } catch {
      setProducts(mockProducts);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDeactivateProduct = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseas dar de baja ${nombre}?`)) return;
    try {
      await api.delete(`/products/${id}`);
    } catch {
      // Remover visualmente
    }
    setProducts(products.filter(p => p._id !== id));
    setNotification(`Insumo ${nombre} desactivado del inventario activo.`);
    setTimeout(() => setNotification(''), 4000);
  };

  const filteredProducts = products.filter((p) => {
    if (filterState === 'Crítico') return p.cantidadDisponible <= p.stockMinimo;
    if (filterState === 'Óptimo') return p.cantidadDisponible > p.stockMinimo;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Encabezado y Acción */}
      <div className="flex justify-between items-center -mt-2 mb-4">
        <p className="text-xs text-gray-500">Monitoreo continuo de stock de seguridad y sugerencias de compra.</p>
        <button
          onClick={() => setIsProductModalOpen(true)}
          className="bg-medinv-800 hover:bg-medinv-900 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo Insumo
        </button>
      </div>

      {/* 4 Métricas Principales (Clickeables para navegación directa) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => navigate('/kardex')} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-medinv-300 transition cursor-pointer">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Total insumos</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">{kpis?.totalProductos ?? products.length}</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              98.4% disponibilidad
            </div>
          </div>
        </div>

        <div onClick={() => setFilterState('Crítico')} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-red-300 transition cursor-pointer">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Stock crítico (&lt; ROP)</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">
              {products.filter(p => p.cantidadDisponible <= p.stockMinimo).length}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Filtrar críticos
            </div>
          </div>
        </div>

        <div onClick={() => navigate('/kardex')} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-amber-300 transition cursor-pointer">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Próx. a vencer (&lt; 60d)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">{kpis?.lotesPorVencer ?? 2}</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Regla FEFO activa
            </div>
          </div>
        </div>

        <div onClick={() => navigate('/ordenes')} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition cursor-pointer">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Órdenes en curso</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">6</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Ver módulo compras
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Existencias */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Existencias prioritarias</h2>
            <p className="text-xs text-gray-500 mt-0.5">Clasificación automática por criticidad y vencimiento</p>
          </div>
          <select 
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-gray-600 focus:outline-none cursor-pointer"
          >
            <option>Todos los estados</option>
            <option>Crítico</option>
            <option>Óptimo</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3">
              <tr>
                <th className="pb-3 font-semibold">CÓDIGO / INSUMO</th>
                <th className="pb-3 font-semibold text-center">CATEGORÍA</th>
                <th className="pb-3 font-semibold">STOCK ACTUAL</th>
                <th className="pb-3 font-semibold">STOCK MÍNIMO</th>
                <th className="pb-3 font-semibold">LOTE ACTIVO</th>
                <th className="pb-3 font-semibold text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredProducts.map((p) => {
                const isCritical = p.cantidadDisponible <= p.stockMinimo;
                return (
                  <tr key={p._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-pink-50 text-medinv-800 flex items-center justify-center font-bold">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{p.nombre}</span>
                        <span className="text-[11px] text-gray-400">{p.codigo}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 text-gray-700">
                        {p.categoria}
                      </span>
                    </td>
                    <td className={`py-4 font-bold ${isCritical ? 'text-red-600' : 'text-gray-900'}`}>
                      {p.cantidadDisponible} {p.unidadMedida}
                      {isCritical && <span className="block text-[10px] text-red-500 font-normal">Crítico</span>}
                    </td>
                    <td className="py-4 text-gray-600">{p.stockMinimo} {p.unidadMedida}</td>
                    <td className="py-4 font-mono text-[11px] text-gray-700">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">{p.lote || 'LT-9028'}</span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isCritical ? (
                          <button
                            onClick={() => setIsOrderModalOpen(true)}
                            className="bg-medinv-800 hover:bg-medinv-900 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            Comprar <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedProductForMovement(p)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            Dispensar
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedProductForDetail(p)}
                          className="text-gray-700 hover:text-medinv-800 font-medium text-xs px-2.5 py-1.5 rounded-xl border border-gray-200 transition cursor-pointer"
                        >
                          Detalles
                        </button>

                        <button
                          onClick={() => handleDeactivateProduct(p._id, p.nombre)}
                          title="Dar de baja"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auditoría y Eficiencia */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Pistas de auditoría recientes</h3>
              <p className="text-xs text-gray-400">Trazabilidad de movimientos críticos</p>
            </div>
            <button
              onClick={() => navigate('/auditoria')}
              className="text-xs font-semibold text-medinv-800 hover:underline cursor-pointer"
            >
              Ver historial completo
            </button>
          </div>

          <div className="space-y-3">
            <div 
              onClick={() => navigate('/auditoria')}
              className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-100/70 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Salida FEFO: 10 amp. Propofol 1%</p>
                  <p className="text-[11px] text-gray-400">Enf. Carlos Méndez · UCI 3</p>
                </div>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Hace 4 min</span>
            </div>

            <div 
              onClick={() => navigate('/auditoria')}
              className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-100/70 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Recepción: OC-2026-088 · 500 un. Solución Salina</p>
                  <p className="text-[11px] text-gray-400">Baxter Corp · Bodega central</p>
                </div>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Hace 32 min</span>
            </div>
          </div>
        </div>

        <div className="bg-medinv-800 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-pink-200/80 uppercase tracking-wider">EFICIENCIA MENSUAL</span>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-4xl font-extrabold tracking-tight">96.8%</span>
              <span className="text-xs bg-medinv-900/60 text-pink-200 px-2 py-0.5 rounded-full font-semibold">+2.4%</span>
            </div>
            <p className="text-xs text-pink-100/70 mt-1">Nivel de servicio</p>
          </div>
          <div className="mt-8 flex items-end justify-between h-16 gap-1 px-1">
            <div className="w-full bg-white/20 rounded-t h-[40%]"></div>
            <div className="w-full bg-white/20 rounded-t h-[55%]"></div>
            <div className="w-full bg-white/20 rounded-t h-[70%]"></div>
            <div className="w-full bg-white/20 rounded-t h-[85%]"></div>
            <div className="w-full bg-white rounded-t h-[95%]"></div>
          </div>
        </div>
      </div>

      {/* Todos los modales interactivos */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onProductCreated={() => {
          setNotification('¡Nuevo insumo médico registrado!');
          setTimeout(() => setNotification(''), 4000);
          loadDashboardData();
        }}
      />

      <MovementModal
        isOpen={Boolean(selectedProductForMovement)}
        product={selectedProductForMovement}
        onClose={() => setSelectedProductForMovement(null)}
        onMovementSuccess={() => {
          setNotification('Dispensación procesada con trazabilidad.');
          setTimeout(() => setNotification(''), 4000);
          loadDashboardData();
        }}
      />

      <ProductDetailModal
        isOpen={Boolean(selectedProductForDetail)}
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onOpenMovement={(prod) => setSelectedProductForMovement(prod)}
      />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onOrderCreated={() => {
          setNotification('¡Orden de compra enviada con éxito!');
          setTimeout(() => setNotification(''), 4000);
        }}
      />
    </div>
  );
}