import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import InstallPrompt from '@/components/InstallPrompt';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Proyectos from '@/pages/Proyectos';
import ProjectDetail from '@/pages/ProjectDetail';
import Almacen from '@/pages/Almacen';
import Compras from '@/pages/Compras';
import Facturas from '@/pages/Facturas';
import Trabajadores from '@/pages/Trabajadores';
import GastosOperativos from '@/pages/GastosOperativos';
import Nominas from '@/pages/Nominas';
import Prestamos from '@/pages/Prestamos';
import Inversionistas from '@/pages/Inversionistas';
import ReporteGastos from '@/pages/ReporteGastos';
import Usuarios from '@/pages/Usuarios';
import Configuracion from '@/pages/Configuracion';

export default function App() {
  return (
    <AuthProvider>
      <InstallPrompt />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/proyectos/:id" element={<ProjectDetail />} />
        <Route path="/almacen" element={<Almacen />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/facturas" element={<Facturas />} />
        <Route path="/trabajadores" element={<Trabajadores />} />
        <Route path="/gastos" element={<GastosOperativos />} />
        <Route path="/nominas" element={<Nominas />} />
        <Route path="/prestamos" element={<Prestamos />} />
        <Route path="/inversionistas" element={<Inversionistas />} />
        <Route path="/reporte" element={<ReporteGastos />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
