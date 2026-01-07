import { Navigate, Route, Routes } from "react-router-dom";
import { PersonnelListPage } from "./pages/PersonnelListPage";
import { PersonnelDetailPage } from "./pages/PersonnelDetailPage";
import { PersonnelCreatePage } from "./pages/PersonnelCreatePage";
import { PersonnelEditPage } from "./pages/PersonnelEditPage";
import { PersonnelDashboardPage } from "./pages/PersonnelDashboardPage";
import { CertificationsPage } from "./pages/CertificationsPage";
import { CertificationCreatePage } from "./pages/CertificationCreatePage";
import { CertificationDetailPage } from "./pages/CertificationDetailPage";
import { PerformanceTrackingPage } from "./pages/PerformanceTrackingPage";
import { PerformanceEvaluationCreatePage } from "./pages/PerformanceEvaluationCreatePage";
import { MyProfilePage } from "./pages/MyProfilePage";
import { MyProfileEditPage } from "./pages/MyProfileEditPage";
import { PersonnelManagementPage } from "./pages/PersonnelManagementPage";

function PersonnelRouter() {
  return (
    <Routes>
      {/* Mi Perfil - Perfil del usuario autenticado */}
      <Route element={<MyProfilePage />} path="/my-profile" />

      {/* Editar Mi Perfil */}
      <Route element={<MyProfileEditPage />} path="/my-profile/edit" />

      {/* Dashboard de personal */}
      <Route element={<PersonnelDashboardPage />} path="/dashboard" />

      {/* Gestión de personal activo (tabs) */}
      <Route element={<PersonnelManagementPage />} path="/management" />

      {/* Lista de personal */}
      <Route element={<PersonnelListPage />} path="/" />

      {/* Crear nuevo personal */}
      <Route element={<PersonnelCreatePage />} path="/create" />

      {/* Editar personal */}
      <Route element={<PersonnelEditPage />} path="/edit/:id" />

      {/* Detalle de personal */}
      <Route element={<PersonnelDetailPage />} path="/detail/:id" />

      {/* Certificaciones */}
      <Route element={<CertificationsPage />} path="/certifications" />
      <Route element={<CertificationCreatePage />} path="/certifications/create" />
      <Route element={<CertificationDetailPage />} path="/certifications/:id" />

      {/* Seguimiento de desempeño */}
      <Route element={<PerformanceTrackingPage />} path="/performance" />
      <Route element={<PerformanceEvaluationCreatePage />} path="/performance/create" />

      {/* Redirigir rutas no encontradas */}
      <Route path="*" element={<Navigate to="/personnel" />} />
    </Routes>
  );
}

export default PersonnelRouter;
