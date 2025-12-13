import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Zap, 
  Globe, 
  Server, 
  Activity, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  Network,
  Timer,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Shield,
    title: "Protection Layer 3/4/7",
    description: "Filtrage intelligent multi-couches contre les attaques volumétriques, protocoles et applicatives."
  },
  {
    icon: Zap,
    title: "Mitigation < 1ms",
    description: "Temps de réponse ultra-rapide grâce à notre infrastructure edge distribuée mondialement."
  },
  {
    icon: Globe,
    title: "Réseau Anycast Global",
    description: "Plus de 50 points de présence dans le monde pour absorber les attaques au plus près de leur source."
  },
  {
    icon: Activity,
    title: "Monitoring 24/7",
    description: "Surveillance continue du trafic avec alertes en temps réel et rapports détaillés."
  },
  {
    icon: Lock,
    title: "Zero False Positive",
    description: "Algorithmes d'apprentissage automatique pour distinguer le trafic légitime des attaques."
  },
  {
    icon: Layers,
    title: "Capacité 10+ Tbps",
    description: "Infrastructure capable d'absorber les plus grandes attaques DDoS jamais enregistrées."
  }
];

const attackTypes = [
  { name: "UDP Flood", protected: true },
  { name: "SYN Flood", protected: true },
  { name: "HTTP Flood", protected: true },
  { name: "DNS Amplification", protected: true },
  { name: "NTP Amplification", protected: true },
  { name: "SSDP Reflection", protected: true },
  { name: "Slowloris", protected: true },
  { name: "RUDY", protected: true },
  { name: "Zero-Day Attacks", protected: true },
];

const stats = [
  { value: "10+", label: "Tbps de capacité", icon: Network },
  { value: "<1ms", label: "Temps de mitigation", icon: Timer },
  { value: "99.99%", label: "Disponibilité garantie", icon: Activity },
  { value: "24/7", label: "Support expert", icon: Eye },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "0",
    description: "Protection de base incluse avec tous nos services",
    features: [
      "Protection L3/L4 incluse",
      "Mitigation jusqu'à 1 Tbps",
      "Filtrage automatique",
      "Dashboard basique"
    ],
    included: true
  },
  {
    name: "Pro",
    price: "29.99",
    description: "Pour les projets nécessitant une protection renforcée",
    features: [
      "Tout Starter +",
      "Protection L7 avancée",
      "Mitigation jusqu'à 5 Tbps",
      "Règles personnalisées",
      "Alertes en temps réel",
      "Support prioritaire"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "Sur mesure",
    description: "Solution personnalisée pour les grandes infrastructures",
    features: [
      "Tout Pro +",
      "Capacité illimitée",
      "SLA personnalisé",
      "Équipe dédiée",
      "Intégration API",
      "Audit de sécurité"
    ]
  }
];

export default function AntiDDoS() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
          
          {/* Animated Shield */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Shield className="w-[600px] h-[600px]" />
            </motion.div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Protection Anti-DDoS de nouvelle génération</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
              Protégez votre
              <span className="block gradient-text">infrastructure</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Notre solution anti-DDoS absorbe et filtre les attaques avant qu'elles n'atteignent vos serveurs. 
              Plus de 10 Tbps de capacité pour une protection sans compromis.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact">
                <Button variant="glow" size="lg" className="gap-2 text-lg px-8 py-6">
                  Demander un devis
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="glass" size="lg" className="gap-2 text-lg px-8 py-6">
                  Découvrir les fonctionnalités
                </Button>
              </a>
            </div>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="relative group"
              >
                <div className="glass-dark rounded-2xl p-6 text-center border border-border/50 hover:border-primary/30 transition-all duration-300">
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Une protection <span className="gradient-text">complète</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Technologies de pointe pour une défense multicouche contre toutes les formes d'attaques DDoS
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="glass-dark rounded-2xl p-8 h-full border border-border/50 hover:border-primary/30 transition-all duration-500 hover:bg-primary/5">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Attack Types Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Tous types d'attaques <span className="gradient-text">bloquées</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Notre système de protection identifie et neutralise automatiquement toutes les formes 
                d'attaques DDoS connues, ainsi que les nouvelles menaces grâce à l'apprentissage automatique.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attackTypes.map((attack, index) => (
                  <motion.div
                    key={attack.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground font-medium">{attack.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-dark rounded-3xl p-8 border border-border/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">$</span>
                    <span className="text-foreground">mystral-ddos status</span>
                  </div>
                  <div className="pl-6 space-y-2 text-muted-foreground">
                    <p><span className="text-green-500">✓</span> Protection Layer 3/4: <span className="text-green-400">Active</span></p>
                    <p><span className="text-green-500">✓</span> Protection Layer 7: <span className="text-green-400">Active</span></p>
                    <p><span className="text-green-500">✓</span> Anycast Network: <span className="text-green-400">50 PoPs</span></p>
                    <p><span className="text-green-500">✓</span> Current Capacity: <span className="text-primary">10.2 Tbps</span></p>
                    <p><span className="text-green-500">✓</span> Attacks Mitigated Today: <span className="text-yellow-400">1,247</span></p>
                    <p><span className="text-green-500">✓</span> Uptime: <span className="text-green-400">99.998%</span></p>
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <span className="text-muted-foreground">$</span>
                    <span className="text-foreground">_</span>
                    <span className="w-2 h-5 bg-primary animate-pulse" />
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Plans de <span className="gradient-text">protection</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une protection anti-DDoS de base est incluse gratuitement avec tous nos services
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative group ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                      Recommandé
                    </span>
                  </div>
                )}
                
                <div className={`glass-dark rounded-2xl p-8 h-full border transition-all duration-500 ${
                  plan.popular 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'border-border/50 hover:border-primary/30'
                }`}>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                  
                  <div className="mb-8">
                    {plan.included ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold gradient-text">Inclus</span>
                      </div>
                    ) : plan.price === "Sur mesure" ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{plan.price}</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{plan.price}€</span>
                        <span className="text-muted-foreground">/mois</span>
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/contact">
                    <Button 
                      variant={plan.popular ? "glow" : "glass"} 
                      className="w-full"
                    >
                      {plan.included ? "Déjà inclus" : plan.price === "Sur mesure" ? "Nous contacter" : "Choisir ce plan"}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-dark rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto border border-border/50"
          >
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Prêt à sécuriser votre infrastructure ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Nos experts sont disponibles pour analyser vos besoins et vous proposer 
              la solution de protection la plus adaptée.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact">
                <Button variant="glow" size="lg" className="gap-2">
                  Parler à un expert
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/vps">
                <Button variant="glass" size="lg">
                  Voir nos offres VPS
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}