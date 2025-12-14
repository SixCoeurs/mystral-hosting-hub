import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Server, 
  Gamepad2, 
  Building2, 
  ChevronRight, 
  ChevronLeft,
  Check,
  CreditCard,
  Shield,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  Clock,
  User,
  Mail,
  MapPin,
  Phone,
  Building,
  FileText,
  LogIn,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StripePaymentForm } from "@/components/StripePaymentForm";

type ServiceType = "vps" | "vds" | "enterprise" | "game";
type Step = 1 | 2 | 3 | 4 | 5;

interface GameOption {
  id: string;
  name: string;
  icon: string;
}

const games: GameOption[] = [
  { id: "minecraft", name: "Minecraft", icon: "" },
  { id: "rust", name: "Rust", icon: "" },
  { id: "ark", name: "ARK", icon: "" },
  { id: "fivem", name: "FiveM", icon: "" },
  { id: "palworld", name: "Palworld", icon: "" },
  { id: "enshrouded", name: "Enshrouded", icon: "" },
  { id: "gmod", name: "Garry's Mod", icon: "" },
  { id: "dayz", name: "DayZ", icon: "" },
];

const locations = [
  { id: "geneva", name: "Genève" },
];

const osOptions = {
  linux: [
    { id: "ubuntu-22", name: "Ubuntu 22.04 LTS" },
    { id: "ubuntu-20", name: "Ubuntu 20.04 LTS" },
    { id: "debian-12", name: "Debian 12" },
    { id: "debian-11", name: "Debian 11" },
    { id: "centos-9", name: "CentOS Stream 9" },
    { id: "rocky-9", name: "Rocky Linux 9" },
    { id: "almalinux-9", name: "AlmaLinux 9" },
  ],
  windows: [
    { id: "win-2022", name: "Windows Server 2022" },
    { id: "win-2019", name: "Windows Server 2019" },
    { id: "win-2016", name: "Windows Server 2016" },
  ],
};

const billingPeriods = [
  { id: "monthly", name: "Mensuel", discount: 0 },
  { id: "quarterly", name: "Trimestriel", discount: 5 },
  { id: "semiannual", name: "Semestriel", discount: 10 },
  { id: "annual", name: "Annuel", discount: 15 },
];

const vpsPlans = [
  // Starter Plans
  { id: "nano", name: "Nano", cpu: 1, ram: 0.5, storage: 5, bandwidth: "100Mbps", price: 0.99 },
  { id: "starter-1", name: "Starter 1", cpu: 1, ram: 1, storage: 20, bandwidth: "1Gbps", price: 2.49 },
  { id: "starter-2", name: "Starter 2", cpu: 1, ram: 2, storage: 30, bandwidth: "1Gbps", price: 3.99 },
  { id: "starter-3", name: "Starter 3", cpu: 2, ram: 3, storage: 40, bandwidth: "1Gbps", price: 4.99 },
  // Professional Plans
  { id: "essential", name: "Essential", cpu: 2, ram: 4, storage: 60, bandwidth: "5Gbps", price: 5.99 },
  { id: "advanced", name: "Advanced", cpu: 4, ram: 8, storage: 120, bandwidth: "5Gbps", price: 9.99 },
  { id: "business", name: "Business", cpu: 6, ram: 12, storage: 180, bandwidth: "5Gbps", price: 15.99 },
  { id: "growth", name: "Growth", cpu: 8, ram: 16, storage: 240, bandwidth: "5Gbps", price: 20.99 },
  // Enterprise Plans
  { id: "enterprise", name: "Enterprise", cpu: 10, ram: 20, storage: 300, bandwidth: "5Gbps", price: 23.99 },
  { id: "performance", name: "Performance", cpu: 12, ram: 24, storage: 300, bandwidth: "5Gbps", price: 25.99 },
];

const vdsPlans = [
  { id: "vds-starter", name: "VDS Starter", cpu: 4, ram: 16, storage: 200, bandwidth: "Illimité", price: 49.99 },
  { id: "vds-pro", name: "VDS Pro", cpu: 8, ram: 32, storage: 400, bandwidth: "Illimité", price: 99.99 },
  { id: "vds-business", name: "VDS Business", cpu: 12, ram: 64, storage: 800, bandwidth: "Illimité", price: 199.99 },
  { id: "vds-enterprise", name: "VDS Enterprise", cpu: 16, ram: 128, storage: 1600, bandwidth: "Illimité", price: 399.99 },
];

// Game plans by game type
const gamePlans: Record<string, { id: string; name: string; slots: number; ram: number; cpu: number; storage: number; price: number; popular?: boolean }[]> = {
  minecraft: [
    { id: "vanilla", name: "Vanilla", slots: 10, ram: 2, cpu: 2, storage: 10, price: 2.99 },
    { id: "modded", name: "Modded", slots: 20, ram: 4, cpu: 3, storage: 25, price: 5.99, popular: true },
    { id: "network", name: "Network", slots: 100, ram: 8, cpu: 4, storage: 50, price: 12.99 },
  ],
  rust: [
    { id: "starter", name: "Starter", slots: 50, ram: 8, cpu: 4, storage: 50, price: 9.99 },
    { id: "community", name: "Community", slots: 150, ram: 16, cpu: 6, storage: 100, price: 19.99, popular: true },
    { id: "official", name: "Official", slots: 500, ram: 32, cpu: 8, storage: 200, price: 39.99 },
  ],
  ark: [
    { id: "solo-duo", name: "Solo/Duo", slots: 10, ram: 8, cpu: 4, storage: 50, price: 12.99 },
    { id: "tribe", name: "Tribe", slots: 30, ram: 16, cpu: 6, storage: 100, price: 24.99, popular: true },
    { id: "cluster", name: "Cluster", slots: 70, ram: 32, cpu: 8, storage: 200, price: 44.99 },
  ],
  fivem: [
    { id: "rp-starter", name: "RP Starter", slots: 32, ram: 8, cpu: 4, storage: 50, price: 14.99 },
    { id: "rp-pro", name: "RP Pro", slots: 64, ram: 16, cpu: 6, storage: 100, price: 29.99, popular: true },
    { id: "rp-ultimate", name: "RP Ultimate", slots: 256, ram: 32, cpu: 8, storage: 200, price: 59.99 },
  ],
  palworld: [
    { id: "coop", name: "Coop", slots: 4, ram: 8, cpu: 4, storage: 30, price: 9.99 },
    { id: "friends", name: "Friends", slots: 16, ram: 16, cpu: 6, storage: 50, price: 19.99, popular: true },
    { id: "community", name: "Community", slots: 32, ram: 32, cpu: 8, storage: 100, price: 34.99 },
  ],
  enshrouded: [
    { id: "duo", name: "Duo", slots: 4, ram: 8, cpu: 4, storage: 30, price: 9.99 },
    { id: "squad", name: "Squad", slots: 8, ram: 16, cpu: 6, storage: 50, price: 17.99, popular: true },
    { id: "clan", name: "Clan", slots: 16, ram: 24, cpu: 8, storage: 80, price: 27.99 },
  ],
  gmod: [
    { id: "sandbox", name: "Sandbox", slots: 16, ram: 4, cpu: 2, storage: 20, price: 5.99 },
    { id: "community", name: "Community", slots: 32, ram: 8, cpu: 4, storage: 40, price: 9.99, popular: true },
    { id: "ultimate", name: "Ultimate", slots: 64, ram: 16, cpu: 6, storage: 80, price: 17.99 },
  ],
  dayz: [
    { id: "survivor", name: "Survivor", slots: 20, ram: 8, cpu: 4, storage: 50, price: 9.99 },
    { id: "community", name: "Community", slots: 40, ram: 16, cpu: 6, storage: 100, price: 17.99, popular: true },
    { id: "official", name: "Official", slots: 60, ram: 24, cpu: 8, storage: 150, price: 27.99 },
  ],
};

const addons = [
  { id: "ddos", name: "Protection Anti-DDoS", description: "Protection avancée jusqu'à 1Tbps contre les attaques DDoS", price: 9.99, icon: Shield },
];

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [step, setStep] = useState<Step>(1);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  
  // Configuration
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("geneva");
  const [osType, setOsType] = useState<"linux" | "windows">("linux");
  const [selectedOs, setSelectedOs] = useState<string>("ubuntu-22");
  const [serverName, setServerName] = useState<string>("");
  const [billingPeriod, setBillingPeriod] = useState<string>("monthly");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  // Game-specific
  const [gameSlots, setGameSlots] = useState<number>(10);
  const [gameRam, setGameRam] = useState<number>(4);
  const [isCustomConfig, setIsCustomConfig] = useState<boolean>(false);
  
  // VPS/VDS plans visibility
  const [showAllPlans, setShowAllPlans] = useState<boolean>(false);
  
  // Customer info
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
  });
  
  // Initialize from URL params
  useEffect(() => {
    const type = searchParams.get("type") as ServiceType | null;
    const game = searchParams.get("game");
    const plan = searchParams.get("plan");
    const ram = searchParams.get("ram");
    const slots = searchParams.get("slots");
    const urlLocation = searchParams.get("location");
    const urlOs = searchParams.get("os");
    const urlOsType = searchParams.get("osType");
    const urlName = searchParams.get("name");
    const urlBilling = searchParams.get("billing");
    const urlAddons = searchParams.get("addons");
    const urlStep = searchParams.get("step");
    const urlCustomConfig = searchParams.get("customConfig");
    
    // Customer info from URL
    const urlFirstName = searchParams.get("firstName");
    const urlLastName = searchParams.get("lastName");
    const urlEmail = searchParams.get("email");
    const urlPhone = searchParams.get("phone");
    const urlCompany = searchParams.get("company");
    const urlAddress = searchParams.get("address");
    const urlCity = searchParams.get("city");
    const urlPostalCode = searchParams.get("postalCode");
    const urlCountry = searchParams.get("country");
    
    if (type) {
      setServiceType(type);
      if (type === "game" && game) {
        setSelectedGame(game);
        if (urlCustomConfig === 'true' && ram && slots) {
          // Custom config from URL
          setIsCustomConfig(true);
          setGameRam(parseInt(ram));
          setGameSlots(parseInt(slots));
        } else if (ram && slots) {
          // Custom config from game page
          setIsCustomConfig(true);
          setGameRam(parseInt(ram));
          setGameSlots(parseInt(slots));
        } else if (plan) {
          // Predefined plan from game page
          const gameSpecificPlans = gamePlans[game] || [];
          const matchedPlan = gameSpecificPlans.find(p => 
            p.name.toLowerCase() === plan.toLowerCase() || 
            p.id === plan.toLowerCase().replace(/[^a-z0-9]/g, '-')
          );
          if (matchedPlan) {
            setSelectedPlan(matchedPlan.id);
            setGameRam(matchedPlan.ram);
            setGameSlots(matchedPlan.slots);
          }
        }
      } else if (type !== "game" && plan) {
        // Match plan by id or name for VPS/VDS
        const plans = type === "vps" ? vpsPlans : vdsPlans;
        const matchedPlan = plans.find(p => 
          p.id === plan.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 
          p.name.toLowerCase() === plan.toLowerCase() ||
          p.id === plan
        );
        if (matchedPlan) {
          setSelectedPlan(matchedPlan.id);
        }
      }
      
      // Restore other config from URL
      if (urlLocation) setSelectedLocation(urlLocation);
      if (urlOs) setSelectedOs(urlOs);
      if (urlOsType === "linux" || urlOsType === "windows") setOsType(urlOsType);
      if (urlName) setServerName(urlName);
      if (urlBilling) setBillingPeriod(urlBilling);
      if (urlAddons) setSelectedAddons(urlAddons.split(','));
      
      // Restore customer info from URL
      if (urlFirstName || urlLastName || urlEmail || urlAddress) {
        setCustomerInfo(prev => ({
          ...prev,
          firstName: urlFirstName || prev.firstName,
          lastName: urlLastName || prev.lastName,
          email: urlEmail || prev.email,
          phone: urlPhone || prev.phone,
          company: urlCompany || prev.company,
          address: urlAddress || prev.address,
          city: urlCity || prev.city,
          postalCode: urlPostalCode || prev.postalCode,
          country: urlCountry || prev.country,
        }));
      }
      
      // Set step based on URL or default based on type
      if (urlStep) {
        const stepNum = parseInt(urlStep);
        if (stepNum >= 1 && stepNum <= 5) {
          setStep(stepNum as Step);
        }
      } else if (type !== "game" || game) {
        setStep(2);
      }
    }
  }, [searchParams]);
  
  const getGamePlans = () => {
    if (selectedGame && gamePlans[selectedGame]) {
      return gamePlans[selectedGame];
    }
    return [];
  };
  
  const getPlans = () => {
    if (serviceType === "vps") return vpsPlans;
    if (serviceType === "vds" || serviceType === "enterprise") return vdsPlans;
    return [];
  };
  
  const calculateGamePrice = () => {
    if (!isCustomConfig && selectedPlan) {
      const plans = getGamePlans();
      const plan = plans.find(p => p.id === selectedPlan);
      if (plan) return plan.price.toFixed(2);
    }
    // Custom config pricing - vCore based
    const basePrice = 4.99;
    const ramPrice = gameRam * 0.75;
    const vcorePrice = gameSlots * 2.5;
    return (basePrice + ramPrice + vcorePrice).toFixed(2);
  };
  
  const calculateTotal = () => {
    let total = 0;
    
    if (serviceType === "game") {
      total = parseFloat(calculateGamePrice());
    } else {
      const plan = getPlans().find(p => p.id === selectedPlan);
      if (plan) total = plan.price;
    }
    
    // Add addons
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) total += addon.price;
    });
    
    // Apply billing discount
    const period = billingPeriods.find(p => p.id === billingPeriod);
    if (period && period.discount > 0) {
      total = total * (1 - period.discount / 100);
    }
    
    return total.toFixed(2);
  };
  
  const getBillingMultiplier = () => {
    switch (billingPeriod) {
      case "quarterly": return 3;
      case "semiannual": return 6;
      case "annual": return 12;
      default: return 1;
    }
  };
  
  const canProceed = () => {
    switch (step) {
      case 1:
        return serviceType !== null && (serviceType !== "game" || selectedGame !== "");
      case 2:
        if (serviceType === "game") {
          return serverName.trim() !== "" && gameSlots >= 2 && gameRam >= 2;
        }
        return selectedPlan !== "" && serverName.trim() !== "";
      case 3:
        return selectedLocation !== "" && (serviceType === "game" || selectedOs !== "");
      case 4:
        return customerInfo.firstName && customerInfo.lastName && customerInfo.email && 
               customerInfo.address && customerInfo.city && customerInfo.postalCode;
      default:
        return true;
    }
  };
  
  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };
  
  const steps = [
    { number: 1, title: "Service", icon: Server },
    { number: 2, title: "Configuration", icon: Cpu },
    { number: 3, title: "Options", icon: Shield },
    { number: 4, title: "Informations", icon: User },
    { number: 5, title: "Paiement", icon: CreditCard },
  ];
  
  const renderStep1 = () => (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold mb-2">Choisissez votre service</h2>
        <p className="text-muted-foreground">Sélectionnez le type de service que vous souhaitez commander</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { type: "vps" as ServiceType, icon: Server, title: "VPS", desc: "Serveur privé virtuel" },
          { type: "vds" as ServiceType, icon: HardDrive, title: "VDS", desc: "Serveur dédié virtuel" },
          { type: "enterprise" as ServiceType, icon: Building2, title: "Enterprise", desc: "Infrastructure dédiée" },
          { type: "game" as ServiceType, icon: Gamepad2, title: "Serveur de jeu", desc: "Hébergement gaming" },
        ].map(({ type, icon: Icon, title, desc }) => (
          <button
            key={type}
            onClick={() => setServiceType(type)}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              serviceType === type
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 bg-card"
            }`}
          >
            <Icon className={`w-8 h-8 mb-4 ${serviceType === type ? "text-primary" : "text-muted-foreground"}`} />
            <h3 className="font-display font-bold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </button>
        ))}
      </div>
      
      {serviceType === "game" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="font-display text-xl font-bold">Sélectionnez votre jeu</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {games.map(game => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedGame === game.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 bg-card"
                }`}
              >
                <Gamepad2 className={`w-6 h-6 mx-auto mb-2 ${selectedGame === game.id ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-medium">{game.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold mb-2">Configuration</h2>
        <p className="text-muted-foreground">Configurez les spécifications de votre serveur</p>
      </div>
      
      {serviceType === "game" ? (
        <div className="space-y-8">
          {/* Server Name */}
          <div className="space-y-2">
            <Label htmlFor="serverName">Nom du serveur</Label>
            <Input
              id="serverName"
              placeholder="Mon serveur de jeu"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          {/* Config Type Toggle */}
          {getGamePlans().length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3">
                <Label className="text-lg">Type de configuration</Label>
                <div className="flex rounded-xl border-2 border-border overflow-hidden max-w-md">
                  <button 
                    onClick={() => {
                      setIsCustomConfig(false);
                    }}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
                      !isCustomConfig 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-card hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    Offres prédéfinies
                  </button>
                  <button 
                    onClick={() => {
                      setIsCustomConfig(true);
                      setSelectedPlan("");
                    }}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
                      isCustomConfig 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-card hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    Configuration sur mesure
                  </button>
                </div>
              </div>
              
              {!isCustomConfig && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getGamePlans().map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        setGameRam(plan.ram);
                        setGameSlots(plan.slots);
                      }}
                      className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                        selectedPlan === plan.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 bg-card"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                          POPULAIRE
                        </div>
                      )}
                      <h3 className="font-display font-bold text-lg mb-4">{plan.name}</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                        <li className="flex items-center gap-2">
                          <Cpu className="w-4 h-4" />
                          {plan.cpu} vCPU
                        </li>
                        <li className="flex items-center gap-2">
                          <MemoryStick className="w-4 h-4" />
                          {plan.ram} Go RAM
                        </li>
                        <li className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4" />
                          {plan.storage} Go NVMe
                        </li>
                        <li className="flex items-center gap-2">
                          <Cpu className="w-4 h-4" />
                          {plan.cpu} vCores • Joueurs illimités
                        </li>
                      </ul>
                      <div className="font-display text-2xl font-bold gradient-text">
                        {plan.price}€<span className="text-sm text-muted-foreground">/mois</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Custom Configuration */}
          {isCustomConfig && (
            <div className="space-y-6 p-6 rounded-xl border-2 border-border bg-card/50 max-w-2xl">
              <h4 className="font-display font-bold text-lg flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                Configuration personnalisée
              </h4>
              
              {/* RAM Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    <MemoryStick className="w-4 h-4 text-muted-foreground" />
                    Mémoire RAM
                  </Label>
                  <div className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/30">
                    <span className="font-display text-xl font-bold text-primary">{gameRam} Go</span>
                  </div>
                </div>
                <Slider
                  value={[gameRam]}
                  onValueChange={(value) => setGameRam(value[0])}
                  min={2}
                  max={32}
                  step={2}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2 Go</span>
                  <span>8 Go</span>
                  <span>16 Go</span>
                  <span>24 Go</span>
                  <span>32 Go</span>
                </div>
              </div>
              
              {/* VCores Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    Nombre de vCores
                  </Label>
                  <div className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/30">
                    <span className="font-display text-xl font-bold text-primary">{gameSlots} vCores</span>
                  </div>
                </div>
                <Slider
                  value={[gameSlots]}
                  onValueChange={(value) => setGameSlots(value[0])}
                  min={2}
                  max={16}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2</span>
                  <span>4</span>
                  <span>8</span>
                  <span>12</span>
                  <span>16</span>
                </div>
                <p className="text-xs text-muted-foreground">Joueurs illimités inclus</p>
              </div>
              
              {/* Summary */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Résumé de la configuration</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                    <MemoryStick className="w-4 h-4 text-primary" />
                    <span className="font-medium">{gameRam} Go RAM</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                    <Cpu className="w-4 h-4 text-primary" />
                    <span className="font-medium">{gameSlots} vCores</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Price Preview */}
          <div className="p-6 rounded-xl bg-primary/10 border border-primary/30 max-w-xl">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Prix estimé</span>
              <span className="font-display text-3xl font-bold gradient-text">{calculateGamePrice()}€<span className="text-sm text-muted-foreground">/mois</span></span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Server Name */}
          <div className="space-y-2">
            <Label htmlFor="serverName">Nom du serveur</Label>
            <Input
              id="serverName"
              placeholder="Mon serveur"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">Ce nom sera utilisé pour identifier votre serveur</p>
          </div>
          
          {/* Plan Selection */}
          <div className="space-y-4">
            <Label>Choisissez votre offre</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(showAllPlans ? getPlans() : getPlans().slice(0, 4)).map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedPlan === plan.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                >
                  <h3 className="font-display font-bold text-lg mb-4">{plan.name}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      {plan.cpu} vCPU
                    </li>
                    <li className="flex items-center gap-2">
                      <MemoryStick className="w-4 h-4" />
                      {plan.ram} Go RAM
                    </li>
                    <li className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      {plan.storage} Go NVMe
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {plan.bandwidth}
                    </li>
                  </ul>
                  <div className="font-display text-2xl font-bold gradient-text">
                    {plan.price}€<span className="text-sm text-muted-foreground">/mois</span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Show more/less button */}
            {getPlans().length > 4 && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllPlans(!showAllPlans)}
                  className="px-8"
                >
                  {showAllPlans ? "Voir moins" : `Voir plus (${getPlans().length - 4} offres)`}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold mb-2">Options & Localisation</h2>
        <p className="text-muted-foreground">Personnalisez votre serveur avec des options supplémentaires</p>
      </div>
      
      {/* Location */}
      <div className="space-y-4">
        <Label>Localisation du serveur</Label>
        <RadioGroup value={selectedLocation} onValueChange={setSelectedLocation} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {locations.map(location => (
            <Label
              key={location.id}
              htmlFor={location.id}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedLocation === location.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 bg-card"
              }`}
            >
              <RadioGroupItem value={location.id} id={location.id} className="sr-only" />
              <Globe className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm">{location.name}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>
      
      {/* OS Selection (not for game servers) */}
      {serviceType !== "game" && (
        <div className="space-y-4">
          <Label>Système d'exploitation</Label>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => { setOsType("linux"); setSelectedOs("ubuntu-22"); }}
              className={`px-6 py-3 rounded-lg border-2 transition-all ${
                osType === "linux" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              }`}
            >
              Linux
            </button>
            <button
              disabled
              className="px-6 py-3 rounded-lg border-2 transition-all border-border bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50"
              title="Bientôt disponible"
            >
              Windows
              <span className="ml-2 text-xs">(Bientôt)</span>
            </button>
          </div>
          
          <Select value={selectedOs} onValueChange={setSelectedOs}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Sélectionnez une distribution" />
            </SelectTrigger>
            <SelectContent>
              {osOptions[osType].map(os => (
                <SelectItem key={os.id} value={os.id}>{os.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Billing Period */}
      <div className="space-y-4">
        <Label>Période de facturation</Label>
        <RadioGroup value={billingPeriod} onValueChange={setBillingPeriod} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {billingPeriods.map(period => (
            <Label
              key={period.id}
              htmlFor={`period-${period.id}`}
              className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                billingPeriod === period.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 bg-card"
              }`}
            >
              <RadioGroupItem value={period.id} id={`period-${period.id}`} className="sr-only" />
              <span className="font-medium">{period.name}</span>
              {period.discount > 0 && (
                <span className="text-xs text-primary">-{period.discount}% de réduction</span>
              )}
            </Label>
          ))}
        </RadioGroup>
      </div>
      
      {/* Addons */}
      <div className="space-y-4">
        <Label>Options supplémentaires</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {addons.map(addon => {
            const Icon = addon.icon;
            return (
              <button
                key={addon.id}
                onClick={() => handleAddonToggle(addon.id)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  selectedAddons.includes(addon.id)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 bg-card"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon className={`w-6 h-6 ${selectedAddons.includes(addon.id) ? "text-primary" : "text-muted-foreground"}`} />
                  <Checkbox checked={selectedAddons.includes(addon.id)} />
                </div>
                <h4 className="font-medium mb-1">{addon.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">{addon.description}</p>
                <span className="font-display font-bold text-primary">+{addon.price}€/mois</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
  
  const renderStep4 = () => (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold mb-2">Vos informations</h2>
        <p className="text-muted-foreground">Ces informations seront utilisées pour la facturation</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="firstName"
              placeholder="Jean"
              value={customerInfo.firstName}
              onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="lastName"
              placeholder="Dupont"
              value={customerInfo.lastName}
              onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="jean@exemple.fr"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              placeholder="+33 6 12 34 56 78"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="company">Entreprise (optionnel)</Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="company"
              placeholder="Ma Société SAS"
              value={customerInfo.company}
              onChange={(e) => setCustomerInfo({...customerInfo, company: e.target.value})}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Adresse *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="address"
              placeholder="123 Rue de la République"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city">Ville *</Label>
          <Input
            id="city"
            placeholder="Paris"
            value={customerInfo.city}
            onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="postalCode">Code postal *</Label>
          <Input
            id="postalCode"
            placeholder="75001"
            value={customerInfo.postalCode}
            onChange={(e) => setCustomerInfo({...customerInfo, postalCode: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <Select value={customerInfo.country} onValueChange={(value) => setCustomerInfo({...customerInfo, country: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="France">🇫🇷 France</SelectItem>
              <SelectItem value="Belgique">🇧🇪 Belgique</SelectItem>
              <SelectItem value="Suisse">🇨🇭 Suisse</SelectItem>
              <SelectItem value="Luxembourg">🇱🇺 Luxembourg</SelectItem>
              <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
  
  const renderStep5 = () => {
    const selectedPlanData = getPlans().find(p => p.id === selectedPlan);
    const selectedGameData = games.find(g => g.id === selectedGame);
    const selectedLocationData = locations.find(l => l.id === selectedLocation);
    const selectedOsData = [...osOptions.linux, ...osOptions.windows].find(o => o.id === selectedOs);
    const selectedBillingData = billingPeriods.find(p => p.id === billingPeriod);
    
    // Build return URL with ALL current config params
    const buildConfigUrl = () => {
      const params = new URLSearchParams();
      if (serviceType) params.set('type', serviceType);
      if (selectedGame) params.set('game', selectedGame);
      if (selectedPlan) params.set('plan', selectedPlan);
      if (selectedLocation) params.set('location', selectedLocation);
      if (selectedOs) params.set('os', selectedOs);
      if (serverName) params.set('name', serverName);
      if (billingPeriod) params.set('billing', billingPeriod);
      if (osType) params.set('osType', osType);
      if (selectedAddons.length > 0) params.set('addons', selectedAddons.join(','));
      if (isCustomConfig) {
        params.set('customConfig', 'true');
        params.set('ram', gameRam.toString());
        params.set('slots', gameSlots.toString());
      }
      // Add customer info
      if (customerInfo.firstName) params.set('firstName', customerInfo.firstName);
      if (customerInfo.lastName) params.set('lastName', customerInfo.lastName);
      if (customerInfo.email) params.set('email', customerInfo.email);
      if (customerInfo.phone) params.set('phone', customerInfo.phone);
      if (customerInfo.company) params.set('company', customerInfo.company);
      if (customerInfo.address) params.set('address', customerInfo.address);
      if (customerInfo.city) params.set('city', customerInfo.city);
      if (customerInfo.postalCode) params.set('postalCode', customerInfo.postalCode);
      if (customerInfo.country && customerInfo.country !== 'France') params.set('country', customerInfo.country);
      params.set('step', '5');
      return `${location.pathname}?${params.toString()}`;
    };
    
    const currentUrl = buildConfigUrl();
    const loginUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`;
    const registerUrl = `/register?redirect=${encodeURIComponent(currentUrl)}`;
    
    // Show auth required overlay if not logged in
    if (!authLoading && !isAuthenticated) {
      return (
        <div className="space-y-8 relative">
          <div>
            <h2 className="font-display text-2xl font-bold mb-2">Récapitulatif & Paiement</h2>
            <p className="text-muted-foreground">Vérifiez votre commande avant de procéder au paiement</p>
          </div>
          
          {/* Blurred background preview */}
          <div className="blur-sm pointer-events-none opacity-50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-xl bg-card border border-border h-64" />
                <div className="p-6 rounded-xl bg-card border border-border h-40" />
              </div>
              <div className="lg:col-span-1">
                <div className="p-6 rounded-xl bg-gradient-to-b from-primary/10 to-card border border-primary/30 h-80" />
              </div>
            </div>
          </div>
          
          {/* Auth required overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-2xl bg-card border border-border shadow-2xl max-w-md w-full mx-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Connexion requise</h3>
              <p className="text-muted-foreground mb-6">
                Pour finaliser votre commande, veuillez vous connecter ou créer un compte.
              </p>
              
              <div className="space-y-3">
                <Button asChild variant="glow" className="w-full" size="lg">
                  <Link to={loginUrl}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </Link>
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">ou</span>
                  </div>
                </div>
                
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link to={registerUrl}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer un compte
                  </Link>
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4">
                Votre panier sera conservé après la connexion
              </p>
            </motion.div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">Récapitulatif & Paiement</h2>
          <p className="text-muted-foreground">Vérifiez votre commande avant de procéder au paiement</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Details */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Détails de la commande
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Type de service</span>
                  <span className="font-medium">
                    {serviceType === "game" ? `Serveur ${selectedGameData?.name}` : 
                     serviceType === "vps" ? "VPS" : 
                     serviceType === "vds" ? "VDS" : "Enterprise"}
                  </span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Nom du serveur</span>
                  <span className="font-medium">{serverName}</span>
                </div>
                
                {serviceType === "game" ? (
                  <>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">RAM</span>
                      <span className="font-medium">{gameRam} Go</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">vCores</span>
                      <span className="font-medium">{gameSlots} vCores • Joueurs illimités</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Offre</span>
                      <span className="font-medium">{selectedPlanData?.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Configuration</span>
                      <span className="font-medium">
                        {selectedPlanData?.cpu} vCPU • {selectedPlanData?.ram} Go RAM • {selectedPlanData?.storage} Go
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Système</span>
                      <span className="font-medium">{selectedOsData?.name}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Localisation</span>
                  <span className="font-medium">{selectedLocationData?.name}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Facturation</span>
                  <span className="font-medium">{selectedBillingData?.name}</span>
                </div>
                
                {selectedAddons.length > 0 && (
                  <div className="py-2 border-b border-border/50">
                    <span className="text-muted-foreground block mb-2">Options</span>
                    <ul className="space-y-1">
                      {selectedAddons.map(addonId => {
                        const addon = addons.find(a => a.id === addonId);
                        return (
                          <li key={addonId} className="flex justify-between text-sm">
                            <span>{addon?.name}</span>
                            <span className="text-primary">+{addon?.price}€/mois</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Customer Info Summary */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Informations client
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Nom</span>
                  <span className="font-medium">{customerInfo.firstName} {customerInfo.lastName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Email</span>
                  <span className="font-medium">{customerInfo.email}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block">Adresse</span>
                  <span className="font-medium">
                    {customerInfo.address}, {customerInfo.postalCode} {customerInfo.city}, {customerInfo.country}
                  </span>
                </div>
                {customerInfo.company && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground block">Entreprise</span>
                    <span className="font-medium">{customerInfo.company}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Payment Card */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-xl bg-gradient-to-b from-primary/10 to-card border border-primary/30 sticky top-24">
              <h3 className="font-display font-bold text-lg mb-6">Total de la commande</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{calculateTotal()}€/mois</span>
                </div>
                {selectedBillingData && selectedBillingData.discount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Réduction ({selectedBillingData.discount}%)</span>
                    <span>Appliquée</span>
                  </div>
                )}
                <div className="border-t border-border/50 pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium">À payer maintenant</span>
                    <span className="font-display text-2xl font-bold gradient-text">
                      {(parseFloat(calculateTotal()) * getBillingMultiplier()).toFixed(2)}€
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Puis {(parseFloat(calculateTotal()) * getBillingMultiplier()).toFixed(2)}€/{billingPeriod === "monthly" ? "mois" : billingPeriod === "quarterly" ? "trimestre" : billingPeriod === "semiannual" ? "semestre" : "an"}
                  </p>
                </div>
              </div>
              
              {/* Stripe Payment Form */}
              <div className="space-y-4">
                <StripePaymentForm
                  amount={parseFloat(calculateTotal()) * getBillingMultiplier()}
                  billingCycle={billingPeriod}
                  onSuccess={(paymentIntentId, orderUuid) => {
                    console.log('Payment success:', paymentIntentId, orderUuid);
                    navigate('/dashboard?payment=success');
                  }}
                  onError={(error) => {
                    console.error('Payment error:', error);
                  }}
                />

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" size="lg" disabled>
                  PayPal (bientôt disponible)
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-6">
                <Shield className="w-3 h-3 inline mr-1" />
                Paiement sécurisé • Satisfait ou remboursé 7 jours
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Progress Steps */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-between">
              {steps.map((s, index) => {
                const Icon = s.icon;
                const isActive = step === s.number;
                const isCompleted = step > s.number;
                
                return (
                  <div key={s.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-glow"
                            : isCompleted
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                        {s.title}
                      </span>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={`w-16 md:w-24 h-0.5 mx-2 transition-all ${
                        step > s.number ? "bg-primary" : "bg-border"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Step Content */}
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 max-w-4xl mx-auto">
              <Button
                variant="outline"
                onClick={() => setStep((step - 1) as Step)}
                disabled={step === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              
              {step < 5 && (
                <Button
                  variant="glow"
                  onClick={() => setStep((step + 1) as Step)}
                  disabled={!canProceed()}
                >
                  Continuer
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}