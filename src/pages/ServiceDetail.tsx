import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Activity,
  Power,
  RotateCcw,
  Square,
  Terminal,
  Settings,
  ArrowLeft,
  Copy,
  ExternalLink,
  Shield,
  Clock,
  Zap,
  Thermometer,
  Globe,
  Check,
  ChevronDown,
  Key,
  Trash2,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Pencil,
  CreditCard,
  AlertTriangle,
  Lock,
  Unlock,
  Image,
  Database,
  Wifi,
  WifiOff,
  Monitor,
  History,
  Bell,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock data - À remplacer par les données de ton API
const mockService = {
  id: 'srv_12345',
  label: 'Production Server',
  hostname: 'prod-server-01',
  product_name: 'VDS GAME 3',
  status: 'active',
  primary_ip: '185.234.72.156',
  ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
  location_name: 'Paris, FR',
  location_flag: '🇫🇷',
  billing_amount: 53.99,
  billing_cycle: 'monthly',
  next_due_date: '2025-01-13',
  created_at: '2024-06-15',
  specs: {
    cpu: {
      model: 'AMD Ryzen 9 7950X',
      cores: 3,
      threads: 6,
      frequency: '5.8 GHz',
    },
    ram: {
      total: 12,
      type: 'DDR5',
      speed: '5200 MHz',
    },
    storage: {
      total: 180,
      type: 'NVMe SSD',
      iops: '500K IOPS',
    },
    network: {
      speed: '5 Gbps',
      ddos_protection: '6 Tbps',
    },
  },
  os: {
    name: 'Ubuntu',
    version: '22.04 LTS',
    arch: 'x86_64',
  },
};

// Mock usage data pour les graphiques
const generateMockData = () => {
  const data = [];
  for (let i = 23; i >= 0; i--) {
    const hour = new Date();
    hour.setHours(hour.getHours() - i);
    data.push({
      time: hour.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      cpu: Math.floor(Math.random() * 40) + 20,
      ram: Math.floor(Math.random() * 30) + 45,
      network_in: Math.floor(Math.random() * 500) + 100,
      network_out: Math.floor(Math.random() * 300) + 50,
      disk: Math.floor(Math.random() * 10) + 35,
    });
  }
  return data;
};

const usageData = generateMockData();

// Composant carte de stat
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  color = 'primary',
  progress 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  subValue?: string;
  color?: string;
  progress?: number;
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className="bg-card border border-border rounded-xl p-5 relative overflow-hidden group"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center`}>
        <Icon className={`h-5 w-5 text-${color}`} />
      </div>
    </div>
    {progress !== undefined && (
      <div className="mt-4">
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r from-primary to-accent rounded-full`}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{progress}% utilisé</p>
      </div>
    )}
  </motion.div>
);

// Composant pour les specs
const SpecRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
    <span className="text-muted-foreground text-sm">{label}</span>
    <span className="font-medium text-foreground text-sm">{value}</span>
  </div>
);

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);
  const [powerLoading, setPowerLoading] = useState<string | null>(null);
  
  // Dialogs state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [reinstallDialogOpen, setReinstallDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);

  // TODO: Remplacer par un appel API réel
  const service = mockService;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copié dans le presse-papiers`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePowerAction = async (action: string) => {
    setPowerLoading(action);
    // TODO: Appeler ton API pour l'action power
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(`Le serveur a été ${action === 'start' ? 'démarré' : action === 'stop' ? 'arrêté' : 'redémarré'}`);
    setPowerLoading(null);
  };

  const handleRename = () => {
    if (newServiceName.trim()) {
      toast.success(`Service renommé en "${newServiceName}"`);
      setRenameDialogOpen(false);
      setNewServiceName('');
    }
  };

  const handleReinstall = () => {
    toast.success('Réinstallation du système en cours...');
    setReinstallDialogOpen(false);
  };

  const handleCancel = () => {
    toast.error('Demande de résiliation envoyée');
    setCancelDialogOpen(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au dashboard
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                  <Server className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-display font-bold text-foreground">
                      {service.label}
                    </h1>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                      Actif
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {service.product_name} • {service.location_flag} {service.location_name}
                  </p>
                </div>
              </div>
              
              {/* Power controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePowerAction('restart')}
                  disabled={powerLoading !== null}
                >
                  {powerLoading === 'restart' ? (
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Redémarrer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePowerAction('stop')}
                  disabled={powerLoading !== null}
                  className="text-orange-500 hover:text-orange-400 border-orange-500/30 hover:border-orange-500/50"
                >
                  {powerLoading === 'stop' ? (
                    <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full" />
                  ) : (
                    <Square className="h-4 w-4 mr-2" />
                  )}
                  Arrêter
                </Button>
                <Button variant="outline" size="sm">
                  <Terminal className="h-4 w-4 mr-2" />
                  Console
                </Button>
                
                {/* Menu Paramètres complet */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 bg-card border-border">
                    {/* Power & Control */}
                    <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                      Contrôle du serveur
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => handlePowerAction('start')}
                    >
                      <Power className="h-4 w-4 mr-2 text-green-500" />
                      Démarrer le serveur
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => handlePowerAction('stop')}
                    >
                      <Square className="h-4 w-4 mr-2 text-orange-500" />
                      Arrêter le serveur
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => handlePowerAction('restart')}
                    >
                      <RotateCcw className="h-4 w-4 mr-2 text-blue-500" />
                      Redémarrer
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => setReinstallDialogOpen(true)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2 text-purple-500" />
                      Réinstaller l'OS
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Access */}
                    <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                      Accès & Sécurité
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => copyToClipboard(service.primary_ip, 'IP')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copier l'adresse IP
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => toast.info('Ouverture de la console VNC...')}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      Console VNC
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => setCredentialsDialogOpen(true)}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Voir les identifiants
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => toast.info('Gestion des clés SSH...')}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Clés SSH
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => toast.info('Configuration du firewall...')}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Règles Firewall
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Configuration */}
                    <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                      Configuration
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => {
                        setNewServiceName(service.label);
                        setRenameDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Renommer le service
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="cursor-pointer">
                        <Cpu className="h-4 w-4 mr-2" />
                        Upgrade ressources
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="bg-card border-border w-56">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info('Upgrade CPU disponible')}>
                          <Cpu className="h-4 w-4 mr-2" />
                          Ajouter des vCores
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info('Upgrade RAM disponible')}>
                          <MemoryStick className="h-4 w-4 mr-2" />
                          Ajouter de la RAM
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info('Upgrade stockage disponible')}>
                          <HardDrive className="h-4 w-4 mr-2" />
                          Ajouter du stockage
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info('Upgrade bande passante')}>
                          <Network className="h-4 w-4 mr-2" />
                          Upgrade bande passante
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="cursor-pointer">
                        <Globe className="h-4 w-4 mr-2" />
                        Réseau
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="bg-card border-border w-56">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info('Configuration IPv4...')}>
                          <Wifi className="h-4 w-4 mr-2" />
                          Configurer IPv4
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info('Configuration IPv6...')}>
                          <Wifi className="h-4 w-4 mr-2" />
                          Configurer IPv6
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info('Configuration rDNS...')}>
                          <Globe className="h-4 w-4 mr-2" />
                          Reverse DNS (PTR)
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info('IP additionnelles...')}>
                          <Network className="h-4 w-4 mr-2" />
                          Ajouter des IPs
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => toast.info('Personnalisation du hostname...')}
                    >
                      <Server className="h-4 w-4 mr-2" />
                      Changer le hostname
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Backups & Snapshots */}
                    <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                      Sauvegardes
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => toast.success('Snapshot créé avec succès')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Créer un snapshot
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => toast.info('Liste des snapshots...')}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Restaurer un snapshot
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => toast.info('Gestion des backups automatiques...')}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Backups automatiques
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => toast.info('Création d\'une image ISO...')}
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Créer une image ISO
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Monitoring & Notifications */}
                    <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                      Monitoring
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => toast.info('Logs système...')}
                    >
                      <History className="h-4 w-4 mr-2" />
                      Logs système
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => toast.info('Configuration des alertes...')}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Configurer les alertes
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => toast.info('Notifications email...')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Notifications email
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Billing */}
                    <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                      Facturation
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => toast.info('Affichage des factures...')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Voir les factures
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => toast.info('Changement de cycle de facturation...')}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Modifier la facturation
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Danger Zone */}
                    <DropdownMenuLabel className="text-xs text-destructive uppercase tracking-wider">
                      Zone danger
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Résilier le service
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>

          {/* Dialogs */}
          {/* Rename Dialog */}
          <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Renommer le service</DialogTitle>
                <DialogDescription>
                  Donnez un nom personnalisé à votre service pour le retrouver plus facilement.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="serviceName">Nouveau nom</Label>
                <Input
                  id="serviceName"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Ex: Serveur production"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleRename}>
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reinstall Dialog */}
          <Dialog open={reinstallDialogOpen} onOpenChange={setReinstallDialogOpen}>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Réinstaller le système
                </DialogTitle>
                <DialogDescription>
                  Cette action va effacer toutes les données sur le serveur et réinstaller le système d'exploitation. Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <p className="text-sm text-orange-500 font-medium">
                  ⚠️ Toutes vos données seront perdues. Assurez-vous d'avoir effectué une sauvegarde.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReinstallDialogOpen(false)}>
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleReinstall}>
                  Réinstaller
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Cancel Service Dialog */}
          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Résilier le service
                </DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir résilier ce service ? Cette action prendra effet à la fin de votre période de facturation actuelle.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive font-medium">
                  Le service sera désactivé le {new Date(service.next_due_date).toLocaleDateString('fr-FR')}.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                  Conserver mon service
                </Button>
                <Button variant="destructive" onClick={handleCancel}>
                  Confirmer la résiliation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Credentials Dialog */}
          <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Identifiants du serveur
                </DialogTitle>
                <DialogDescription>
                  Conservez ces informations en lieu sûr.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Adresse IP</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono">{service.primary_ip}</code>
                      <button onClick={() => copyToClipboard(service.primary_ip, 'IP')} className="p-1 hover:bg-background rounded">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Utilisateur</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono">root</code>
                      <button onClick={() => copyToClipboard('root', 'Utilisateur')} className="p-1 hover:bg-background rounded">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mot de passe</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono">••••••••••••</code>
                      <button onClick={() => copyToClipboard('xK9#mP2$vL5@nQ8', 'Mot de passe')} className="p-1 hover:bg-background rounded">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Port SSH</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono">22</code>
                      <button onClick={() => copyToClipboard('22', 'Port')} className="p-1 hover:bg-background rounded">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  💡 Conseil : Changez votre mot de passe après la première connexion et configurez l'authentification par clé SSH.
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCredentialsDialogOpen(false)}>
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Stats rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <StatCard
              icon={Cpu}
              label="CPU"
              value="32%"
              subValue={`${service.specs.cpu.cores} vCores @ ${service.specs.cpu.frequency}`}
              progress={32}
            />
            <StatCard
              icon={MemoryStick}
              label="RAM"
              value="67%"
              subValue={`8.04 / ${service.specs.ram.total} GB`}
              progress={67}
            />
            <StatCard
              icon={HardDrive}
              label="Stockage"
              value="42%"
              subValue={`75.6 / ${service.specs.storage.total} GB`}
              progress={42}
            />
            <StatCard
              icon={Network}
              label="Réseau"
              value="1.2 Gbps"
              subValue={`/ ${service.specs.network.speed}`}
            />
          </motion.div>

          {/* Graphiques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          >
            {/* CPU & RAM Chart */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">CPU & RAM (24h)</h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-primary rounded-full" />
                    CPU
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-accent rounded-full" />
                    RAM
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={usageData}>
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" fill="url(#cpuGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="ram" stroke="hsl(var(--accent))" fill="url(#ramGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Network Chart */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Trafic Réseau (24h)</h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-green-500 rounded-full" />
                    Entrant
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-blue-500 rounded-full" />
                    Sortant
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} unit=" MB/s" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="network_in" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="network_out" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Détails et infos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Informations réseau */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Réseau</h3>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">IPv4</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">
                      {service.primary_ip}
                    </code>
                    <button
                      onClick={() => copyToClipboard(service.primary_ip, 'IPv4')}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      {copied === 'IPv4' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">IPv6</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-foreground bg-muted px-2 py-1 rounded truncate max-w-[140px]">
                      {service.ipv6}
                    </code>
                    <button
                      onClick={() => copyToClipboard(service.ipv6, 'IPv6')}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      {copied === 'IPv6' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <SpecRow label="Bande passante" value={service.specs.network.speed} />
                <SpecRow label="Protection DDoS" value={service.specs.network.ddos_protection} />
              </div>
            </div>

            {/* Spécifications hardware */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Hardware</h3>
              </div>
              <div className="space-y-1">
                <SpecRow label="Processeur" value={service.specs.cpu.model} />
                <SpecRow label="vCores" value={`${service.specs.cpu.cores} @ ${service.specs.cpu.frequency}`} />
                <SpecRow label="RAM" value={`${service.specs.ram.total} GB ${service.specs.ram.type}`} />
                <SpecRow label="Stockage" value={`${service.specs.storage.total} GB ${service.specs.storage.type}`} />
                <SpecRow label="Performance" value={service.specs.storage.iops} />
              </div>
            </div>

            {/* Système et facturation */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Système</h3>
              </div>
              <div className="space-y-1">
                <SpecRow label="OS" value={`${service.os.name} ${service.os.version}`} />
                <SpecRow label="Architecture" value={service.os.arch} />
                <SpecRow label="Hostname" value={service.hostname} />
                <SpecRow label="Créé le" value={new Date(service.created_at).toLocaleDateString('fr-FR')} />
                <div className="pt-4 mt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Facturation</span>
                    <span className="font-bold text-foreground">
                      {service.billing_amount.toFixed(2)}€<span className="text-sm font-normal text-muted-foreground">/mois</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Prochain renouvellement: {new Date(service.next_due_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-card border border-border rounded-xl p-6"
          >
            <h3 className="font-semibold text-foreground mb-4">Actions rapides</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Terminal, label: 'Console SSH', desc: 'Accès terminal' },
                { icon: HardDrive, label: 'Backups', desc: 'Gérer les sauvegardes' },
                { icon: Shield, label: 'Firewall', desc: 'Règles de sécurité' },
                { icon: Activity, label: 'Monitoring', desc: 'Alertes & logs' },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex items-center gap-3 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
