// Mystral Hosting App
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VPSPage from "./pages/VPS";
import VDSPage from "./pages/VDS";
import EnterprisePage from "./pages/Enterprise";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/vps" element={<VPSPage />} />
        <Route path="/vds" element={<VDSPage />} />
        <Route path="/entreprise" element={<EnterprisePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
