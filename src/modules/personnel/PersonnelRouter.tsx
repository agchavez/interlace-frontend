import { Navigate, Route, Routes } from "react-router-dom";
import { PersonnelListPage } from "./pages/PersonnelListPage";
import { PersonnelDetailPage } from "./pages/PersonnelDetailPage";
import { PersonnelCreatePage } from "./pages/PersonnelCreatePage";
import { PersonnelDashboardPage } from "./pages/PersonnelDashboardPage";
import { CertificationsPage } from "./pages/CertificationsPage";
import { CertificationCreatePage } from "./pages/CertificationCreatePage";
import { CertificationDetailPage } from "./pages/CertificationDetailPage";
import { PerformanceTrackingPage } from "./pages/PerformanceTrackingPage";
import { PerformanceCreatePage } from "./pages/PerformanceCreatePage";
import { MyProfilePage } from "./pages/MyProfilePage";
import { PersonnelManagementPage } from "./pages/PersonnelManagementPage";
import { PersonnelProfilePage } from "./pages/PersonnelProfilePage";

function PersonnelRouter() {
  return (
    <Routes>
      {/* Mi Perfil - Perfil del usuario autenticado */}
      <Route element={<MyProfilePage />} path="/my-profile" />

      {/* Dashboard de personal */}
      <Route element={<PersonnelDashboardPage />} path="/dashboard" />

      {/* Gestión de personal activo (tabs) */}
      <Route element={<PersonnelManagementPage />} path="/management" />

      {/* Lista de personal */}
      <Route element={<PersonnelListPage />} path="/" />

      {/* Crear nuevo personal */}
      <Route element={<PersonnelCreatePage />} path="/create" />

      {/* Detalle de personal */}
      <Route element={<PersonnelDetailPage />} path="/detail/:id" />

      {/* Perfil de personal (nueva página interactiva) */}
      <Route element={<PersonnelProfilePage />} path="/profile/:id" />

      {/* Certificaciones */}
      <Route element={<CertificationsPage />} path="/certifications" />
      <Route element={<CertificationCreatePage />} path="/certifications/create" />
      <Route element={<CertificationDetailPage />} path="/certifications/:id" />

      {/* Seguimiento de desempeño */}
      <Route element={<PerformanceTrackingPage />} path="/performance" />
      <Route element={<PerformanceCreatePage />} path="/performance/create" />

      {/* Redirigir rutas no encontradas */}
      <Route path="*" element={<Navigate to="/personnel" />} />
    </Routes>
  );
}

export default PersonnelRouter;
