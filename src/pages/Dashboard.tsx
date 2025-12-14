import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Server,
  CreditCard,
  Settings,
  HelpCircle,
  Plus,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  LogOut,
  Pencil,
  Check,
  X,
  ChevronDown,
  Power,
  RotateCcw,
  RefreshCw,
  Terminal,
  Shield,
  HardDrive,
  Globe,
  Key,
  Trash2,
  Copy,
  FileText,
  Download,
  Upload,
  Cpu,
  MemoryStick,
  Network,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useAuth } from '@/contexts/AuthContext';
import { api, Service } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchServices = async () => {
      if (!isAuthenticated) return;
      
      try {
        const result = await api.getServices();
        if (result.success) {
          setServices(result.services);
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const startEditing = (service: Service, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingServiceId(service.id);
    setEditingName(service.label || service.hostname || `Service #${service.id}`);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingServiceId(null);
    setEditingName('');
  };

  const saveServiceName = (serviceId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setServices(prev => 
      prev.map(s => s.id === serviceId ? { ...s, label: editingName } : s)
    );
    setEditingServiceId(null);
    setEditingName('');
    // TODO: Call API to persist the name change
    // api.updateServiceLabel(serviceId, editingName);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'suspended':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'pending':
      case 'provisioning':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Actif',
      suspended: 'Suspendu',
      pending: 'En attente',
      provisioning: 'Provisionnement',
      terminated: 'Résilié',
      cancelled: 'Annulé',
    };
    return labels[status] || status;
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  Bonjour, {user?.first_name} 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                  Bienvenue sur votre espace client Mystral
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/account">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Mon compte
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { icon: Server, label: 'Nouveau Service', href: '/checkout', color: 'from-violet-500 to-purple-600' },
              { icon: CreditCard, label: 'Facturation', href: '/account#billing', color: 'from-blue-500 to-cyan-600' },
              { icon: HelpCircle, label: 'Support', href: '/support', color: 'from-green-500 to-emerald-600' },
              { icon: Settings, label: 'Paramètres', href: '/account', color: 'from-orange-500 to-amber-600' },
            ].map((action, index) => (
              <Link key={action.label} to={action.href}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="relative bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all group cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {action.label}
                  </p>
                </motion.div>
              </Link>
            ))}
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-foreground">
                Mes Services
              </h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="btn-glow">
                    <Plus className="h-4 w-4 mr-2" />
                    Commander
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem asChild>
                    <Link to="/vps" className="cursor-pointer">VPS</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/vds" className="cursor-pointer">VDS</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/enterprise" className="cursor-pointer">Entreprise</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isLoading ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-muted-foreground mt-4">Chargement...</p>
              </div>
            ) : services.length === 0 ? (
              /* Empty state */
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Server className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  Aucun service actif
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Vous n'avez pas encore de service. Commandez votre premier serveur et commencez votre aventure avec Mystral !
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/vps">
                    <Button className="btn-glow">
                      <Plus className="h-4 w-4 mr-2" />
                      Commander un VPS
                    </Button>
                  </Link>
                  <Link to="/games">
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir les serveurs de jeux
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Services list */
              <div className="space-y-4">
                {services.map((service) => (
                  <motion.div
                    key={service.id}
                    whileHover={{ scale: 1.005 }}
                    onClick={() => navigate(`/service/${service.id}`)}
                    className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Server className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          {editingServiceId === service.id ? (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="h-8 w-48"
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => saveServiceName(service.id, e)}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={cancelEditing}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group/name">
                              <h3 className="font-semibold text-foreground">
                                {service.label || service.hostname || `Service #${service.id}`}
                              </h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover/name:opacity-100 transition-opacity"
                                onClick={(e) => startEditing(service, e)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {service.product_name} • {service.location_name}
                          </p>
                          {service.primary_ip && (
                            <p className="text-sm font-mono text-muted-foreground mt-1">
                              {service.primary_ip}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(service.status)}
                          <span className="text-sm font-medium">
                            {getStatusLabel(service.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {service.billing_amount.toFixed(2)}€
                            <span className="text-sm text-muted-foreground font-normal">
                              /{service.billing_cycle === 'monthly' ? 'mois' : service.billing_cycle === 'quarterly' ? 'trim.' : service.billing_cycle === 'biannual' ? 'sem.' : 'an'}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Prochain renouvellement: {new Date(service.next_due_date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Gérer
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64 bg-card border-border" onClick={(e) => e.stopPropagation()}>
                            {/* Power Controls */}
                            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                              Contrôle serveur
                            </DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                toast.success("Serveur démarré");
                              }}
                            >
                              <Power className="h-4 w-4 mr-2 text-green-500" />
                              Démarrer
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                toast.success("Serveur arrêté");
                              }}
                            >
                              <Power className="h-4 w-4 mr-2 text-destructive" />
                              Arrêter
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                toast.success("Redémarrage en cours...");
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-2 text-orange-500" />
                              Redémarrer
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                toast.success("Réinstallation lancée");
                              }}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Réinstaller l'OS
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Access */}
                            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                              Accès
                            </DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(service.primary_ip || '');
                                toast.success("IP copiée dans le presse-papier");
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copier l'IP
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                toast.info("Console VNC en cours d'ouverture...");
                              }}
                            >
                              <Terminal className="h-4 w-4 mr-2" />
                              Console VNC
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                toast.info("Affichage des identifiants...");
                              }}
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Voir les identifiants
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Configuration */}
                            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                              Configuration
                            </DropdownMenuLabel>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="cursor-pointer">
                                <Cpu className="h-4 w-4 mr-2" />
                                Ressources
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="bg-card border-border">
                                <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info("Upgrade CPU")}>
                                  <Cpu className="h-4 w-4 mr-2" />
                                  Upgrade CPU
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info("Upgrade RAM")}>
                                  <MemoryStick className="h-4 w-4 mr-2" />
                                  Upgrade RAM
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info("Upgrade Stockage")}>
                                  <HardDrive className="h-4 w-4 mr-2" />
                                  Upgrade Stockage
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info("Upgrade Bande passante")}>
                                  <Network className="h-4 w-4 mr-2" />
                                  Upgrade Bande passante
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                toast.info("Configuration réseau...");
                              }}
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              Paramètres réseau
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                toast.info("Configuration firewall...");
                              }}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Firewall
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => startEditing(service, {} as React.MouseEvent)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Renommer le service
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Backup & Snapshots */}
                            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                              Sauvegardes
                            </DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                toast.success("Snapshot créé");
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Créer un snapshot
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                toast.info("Liste des snapshots...");
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Restaurer un snapshot
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                toast.info("Téléchargement de la sauvegarde...");
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Télécharger backup
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Billing */}
                            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                              Facturation
                            </DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => navigate(`/service/${service.id}`)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                toast.info("Affichage des factures...");
                              }}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Factures
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Danger Zone */}
                            <DropdownMenuItem 
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => {
                                toast.error("Demande de résiliation envoyée");
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Résilier le service
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
