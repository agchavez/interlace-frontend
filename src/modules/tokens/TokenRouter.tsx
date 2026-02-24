/**
 * Router para el módulo de Tokens
 */
import { Route, Routes, Navigate } from 'react-router-dom';
import { TokenListPage } from './pages/TokenListPage';
import { TokenCreatePage } from './pages/TokenCreatePage';
import { TokenDetailPage } from './pages/TokenDetailPage';
import { PendingApprovalPage } from './pages/PendingApprovalPage';
import { ValidateTokenPage } from './pages/ValidateTokenPage';
import { CompleteDeliveryPage } from './pages/CompleteDeliveryPage';
import { ExternalPersonListPage } from './pages/ExternalPersonListPage';
import { MaterialListPage } from './pages/MaterialListPage';

function TokenRouter() {
  return (
    <Routes>
      <Route path="/" element={<TokenListPage />} />
      <Route path="/create" element={<TokenCreatePage />} />
      <Route path="/detail/:id" element={<TokenDetailPage />} />
      <Route path="/:id/complete-delivery" element={<CompleteDeliveryPage />} />
      <Route path="/pending" element={<PendingApprovalPage />} />
      <Route path="/validate" element={<ValidateTokenPage />} />
      <Route path="/external-persons" element={<ExternalPersonListPage />} />
      <Route path="/materials" element={<MaterialListPage />} />
      <Route path="*" element={<Navigate to="/tokens" />} />
    </Routes>
  );
}

export default TokenRouter;
