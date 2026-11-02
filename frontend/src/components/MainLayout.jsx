import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, 
  Activity, 
  FileText, 
  Sliders, 
  ShoppingCart, 
  Bell, 
  ShieldCheck, 
  BarChart3, 
  Search, 
  LogOut,
  X
} from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Tablero General', path: '/', icon: Activity },
    { name: 'Kardex & Lotes', path: '/kardex', icon: FileText },
    { name: 'Políticas ABC / ROP', path: '/politicas', icon: Sliders },
    { name: 'Órdenes de Compra', path: '/ordenes', icon: ShoppingCart },
    { name: 'Alertas', path: '/alertas', icon: Bell, badge: 4 },
    { name: 'Pistas de Auditoría', path: '/auditoria', icon: ShieldCheck },
    { name: 'Reportes & KPIs', path: '/reportes', icon: BarChart3 },
  ];

  const getInitials = (name) => {
    if (!name) return 'DR';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate('/kardex');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden text-gray-800">
      {/* Sidebar Izquierdo */}
      <aside className="w-64 bg-white border-r border-gray-200/80 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-medinv-800 text-white p-1.5 rounded-lg flex items-center justify-center">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-medinv-800 block leading-tight">MedInv</span>
                <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">SGIC CLÍNICO</span>
              </div>
            </div>

            <div className="mt-5 bg-medinv-50/60 border border-medinv-100/80 rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-medinv-800 tracking-wider uppercase block">MEDINV ENTERPRISE</span>
              <span className="text-xs text-gray-500">Versión 2.4 · Producción</span>
            </div>
          </div>

          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-medinv-50 text-medinv-800 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-medinv-800 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-medinv-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(user?.nombre)}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-gray-900 truncate leading-tight">{user?.nombre || 'Diana Ramos'}</p>
              <p className="text-[11px] text-gray-500 capitalize">{user?.rol || 'Jefe de Compras'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            title="Cerrar sesión"
            className="p-1.5 text-gray-400 hover:text-medinv-800 hover:bg-medinv-50 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Área Central */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200/80 px-8 flex items-center justify-between shrink-0 relative">
          <div>
            <span className="text-xs text-gray-500 font-medium">Hosp. Central / <span className="text-medinv-800 font-semibold">Compras & Administración</span></span>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Tablero Clínico MedInv</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchSubmit}
                placeholder="Buscar insumo o código (Enter)..."
                className="w-full pl-9 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-medinv-700 focus:bg-white transition"
              />
              <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[10px] text-gray-400 font-semibold">↵</span>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="p-2 text-gray-500 hover:text-medinv-800 hover:bg-gray-50 rounded-xl border border-gray-200 transition relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-medinv-800 rounded-full animate-pulse"></span>
              </button>

              {/* Menú de Notificaciones */}
              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-bold text-gray-900">Alertas Clínicas Activas</span>
                    <button onClick={() => setShowAlertsDropdown(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="p-2.5 bg-red-50 rounded-xl border border-red-100 text-red-800">
                      <strong>Propofol 1% 20ml:</strong> Stock crítico (12 ampollas restantes).
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-800">
                      <strong>Ceftriaxona 1g:</strong> Lote CF-4401 vence en 24 días.
                    </div>
                    <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-blue-800">
                      <strong>Baxter Corp:</strong> 2 arribos programados para hoy.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}