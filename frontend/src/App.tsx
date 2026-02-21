import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import ProtectedLayout from "./components/ProtectedLayout";
import LoginPage from "./pages/LoginPage";
import CallbackPage from "./pages/CallbackPage";
import FlagsPage from "./pages/FlagsPage";
import RankingPage from "./pages/RankingPage";
import HistoryPage from "./pages/HistoryPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 10_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* étoiles scintillantes */}
        <div className="twinkle-1" aria-hidden="true" />
        <div className="twinkle-2" aria-hidden="true" />
        <div className="twinkle-3" aria-hidden="true" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/callback" element={<CallbackPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/flags" element={<FlagsPage />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

