import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  // Se estiver autenticado, renderiza o conteúdo da rota filha (Outlet)
  // Caso contrário, redireciona para a página de login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};
