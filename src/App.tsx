import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
import NotFound from "./pages/NotFound";
import Exercicios from "./pages/Exercicios";
import Periodizacoes from "./pages/Periodizacoes";
import TiposMicrociclos from "./pages/TiposMicrociclos";
import Treinos from "./pages/Treinos";
import Correcoes from "./pages/Correcoes";
import Alongamentos from "./pages/Alongamentos";
import AuthCallback from "./pages/AuthCallback";
import Index from "./pages/Index";
import { useGaPageview } from "./analytics/useGaPageview";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();
   useGaPageview(); 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing page - always accessible */}
      <Route path="/" element={<Index />} />
      
      {/* Auth routes - redirect to dashboard if already authenticated */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/auth"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route
        path="/forgot-password"
        element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alunos"
        element={
          <ProtectedRoute>
            <Alunos />
          </ProtectedRoute>
        }
      />

      <Route
        path="/exercicios"
        element={
          <ProtectedRoute>
            <Exercicios />
          </ProtectedRoute>
        }
      />

      <Route path="/treinos" element={<ProtectedRoute><Treinos /></ProtectedRoute>} />
      <Route path="/auth/callback" element={<ProtectedRoute><AuthCallback /></ProtectedRoute>} />

      <Route path="/correcoes" element={<ProtectedRoute><Correcoes /></ProtectedRoute>} />

      <Route path="/alongamentos" element={<ProtectedRoute><Alongamentos/></ProtectedRoute>} />

      <Route
        path="/periodizacoes"
        element={
          <ProtectedRoute>
            <Periodizacoes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tipos-microciclos"
        element={
          <ProtectedRoute>
            <TiposMicrociclos />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sessoes"
        element={
          <ProtectedRoute>
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Página de Sessões</h1>
              <p className="text-muted-foreground">Em desenvolvimento</p>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute>
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Configurações</h1>
              <p className="text-muted-foreground">Em desenvolvimento</p>
            </div>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
