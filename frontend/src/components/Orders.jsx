import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import OrderModal from '../components/OrderModal';
import ReceiveOrderModal from '../components/ReceiveOrderModal';
import { ShoppingCart, Clock, CheckCircle2, AlertTriangle, Plus, ChevronRight, Check } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('Todas');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [orderToReceive, setOrderToReceive] = useState(null);
  const [notification, setNotification] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/purchases/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error al cargar órdenes', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApproveOrder = async (orderId) => {
    try {
      await api.patch(`/purchases/orders/${orderId}/status`, { estado: 'Aprobada' });
      setNotification('Orden aprobada. Lista para recepción del proveedor.');
      setTimeout(() => setNotification(''), 4000);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al aprobar la orden');
    }
  };

  const tabs = ['Todas', 'Pendiente', 'Aprobada', 'Completada'];

  const filteredOrders = filter === 'Todas' ? orders : orders.filter((o) => o.estado === filter);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Aprobada':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completada':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-medinv-800 tracking-wider uppercase block">ABASTECIMIENTO</span>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Órdenes de compra</h1>
          <p className="text-xs text-gray-500 mt-1">Planifica, aprueba y monitorea las compras clínicas hasta su recepción.</p>
        </div>
        <button
          onClick={() => setIsNewOrderOpen(true)}
          className="bg-medinv-800 hover:bg-medinv-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nueva orden
        </button>
      </div>

      {/* 4 Métricas de Órdenes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Órdenes totales</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">{orders.length}</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Registros en sistema
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
            <span className="text-3xl font-extrabold text-gray-900">
              {orders.filter(o => o.estado === 'Pendiente').length}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Requieren revisión
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Aprobadas</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">
              {orders.filter(o => o.estado === 'Aprobada').length}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Pendientes de entrega
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Completadas</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Check className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">
              {orders.filter(o => o.estado === 'Completada').length}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Ingresadas a bodega
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
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
        {filteredOrders.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
            No hay órdenes registradas con este estado.
          </div>
        ) : (
          filteredOrders.map((o) => (
            <div key={o._id} className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 flex flex-col justify-between hover:border-gray-300 transition">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-mono text-gray-400 block">{o.codigoOrden}</span>
                    <h3 className="text-base font-bold text-gray-900 mt-0.5">{o.proveedor?.nombre || 'Proveedor'}</h3>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(o.estado)}`}>
                    {o.estado}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 my-4 space-y-1">
                  {o.items?.map((it, idx) => (
                    <span key={idx} className="text-xs font-semibold text-gray-800 block">
                      • {it.producto?.nombre} · {it.cantidadSolicitada} unidades
                    </span>
                  ))}
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Solicitante: {o.solicitante?.nombre || 'Administración'} · {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-base font-extrabold text-gray-900">
                  {o.costoTotalEstimado ? `$ ${o.costoTotalEstimado.toLocaleString()}` : 'A cotizar'}
                </span>

                <div className="flex items-center gap-2">
                  {o.estado === 'Pendiente' && (
                    <button
                      onClick={() => handleApproveOrder(o._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      Aprobar
                    </button>
                  )}

                  {o.estado === 'Aprobada' && (
                    <button
                      onClick={() => setOrderToReceive(o)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      Recibir Pedido <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {o.estado === 'Completada' && (
                    <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Ingresado
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modales */}
      <OrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onOrderCreated={() => {
          setNotification('¡Orden de compra emitida correctamente!');
          setTimeout(() => setNotification(''), 4000);
          fetchOrders();
        }}
      />

      <ReceiveOrderModal
        isOpen={Boolean(orderToReceive)}
        order={orderToReceive}
        onClose={() => setOrderToReceive(null)}
        onOrderReceived={() => {
          setNotification('Recepción completada. Stock y nuevos lotes cargados al inventario.');
          setTimeout(() => setNotification(''), 4000);
          fetchOrders();
        }}
      />
    </div>
  );
}