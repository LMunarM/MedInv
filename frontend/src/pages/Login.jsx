import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Panel Izquierdo: Institucional Guinda */}
      <div className="md:w-1/2 bg-medinv-800 text-white p-10 md:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Marca superior */}
        <div className="flex items-center space-x-3 z-10">
          <div className="bg-white text-medinv-800 p-1.5 rounded-lg flex items-center justify-center font-bold">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">MedInv</span>
        </div>

        {/* Contenido Central */}
        <div className="my-16 z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-medinv-900/50 border border-medinv-700/60 px-3.5 py-1.5 rounded-full text-xs font-medium text-pink-100 mb-6">
            <span className="w-2 h-2 rounded-full bg-pink-400"></span>
            PLATAFORMA CLÍNICA SEGURA
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Inventario clínico, <br />
            siempre bajo control.
          </h1>
          <p className="text-pink-100/80 text-base leading-relaxed mb-10">
            Trazabilidad integral, alertas preventivas y abastecimiento inteligente para una atención segura y continua.
          </p>

          {/* Tarjetas KPI de la imagen */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-medinv-900/40 border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold">98.4%</div>
              <div className="text-xs text-pink-200/70 mt-1">Disponibilidad</div>
            </div>
            <div className="bg-medinv-900/40 border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold">1,428</div>
              <div className="text-xs text-pink-200/70 mt-1">Insumos activos</div>
            </div>
            <div className="bg-medinv-900/40 border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-xs text-pink-200/70 mt-1">Trazabilidad</div>
            </div>
          </div>
        </div>

        {/* Footer institucional */}
        <div className="flex justify-between items-center text-xs text-pink-200/60 z-10">
          <span>MedInv Enterprise v2.4</span>
          <span>Hospital Central - Colombia</span>
        </div>

        {/* Círculo decorativo de fondo */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-medinv-700/30 rounded-full blur-2xl"></div>
      </div>

      {/* Panel Derecho: Formulario de Login */}
      <div className="md:w-1/2 bg-white flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="text-xs font-semibold tracking-wider text-medinv-800 uppercase mb-2">
            Acceso Institucional
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Bienvenido de nuevo
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Ingresa tus credenciales para acceder al SGIC.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Correo institucional
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@medinv.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medinv-700 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medinv-700 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-medinv-800 focus:ring-medinv-700" />
                <span>Mantener sesión</span>
              </label>
              <a href="#" className="font-semibold text-medinv-800 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-medinv-800 hover:bg-medinv-900 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
            >
              <span>{loading ? 'Validando...' : 'Ingresar al sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Tarjeta inferior de seguridad */}
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200/80 rounded-2xl flex items-start gap-3 text-xs text-gray-500">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-700 block font-medium">Conexión segura y auditada</strong>
              Este acceso registra autenticación institucional y actividad conforme a las políticas de seguridad.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}