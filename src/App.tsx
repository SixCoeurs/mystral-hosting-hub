// Mystral Hosting App
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import VPSPage from "./pages/VPS";
import VDSPage from "./pages/VDS";
import EnterprisePage from "./pages/Enterprise";
import GamesPage from "./pages/Games";
import MinecraftPage from "./pages/games/Minecraft";
import RustPage from "./pages/games/Rust";
import ArkPage from "./pages/games/Ark";
import FiveMPage from "./pages/games/FiveM";
import PalworldPage from "./pages/games/Palworld";
import EnshroudedPage from "./pages/games/Enshrouded";
import GmodPage from "./pages/games/Gmod";
import DayZPage from "./pages/games/DayZ";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import ServiceDetail from "./pages/ServiceDetail";
import Checkout from "./pages/Checkout";
import PaymentCallback from "./pages/PaymentCallback";
import Contact from "./pages/Contact";
import AntiDDoS from "./pages/AntiDDoS";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/vps" element={<VPSPage />} />
            <Route path="/vds" element={<VDSPage />} />
            <Route path="/entreprise" element={<EnterprisePage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/minecraft" element={<MinecraftPage />} />
            <Route path="/games/rust" element={<RustPage />} />
            <Route path="/games/ark" element={<ArkPage />} />
            <Route path="/games/fivem" element={<FiveMPage />} />
            <Route path="/games/palworld" element={<PalworldPage />} />
            <Route path="/games/enshrouded" element={<EnshroudedPage />} />
            <Route path="/games/gmod" element={<GmodPage />} />
            <Route path="/games/dayz" element={<DayZPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/anti-ddos" element={<AntiDDoS />} />
            <Route path="/account" element={<Account />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
