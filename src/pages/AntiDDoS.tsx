import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Zap, 
  Globe, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Network,
  Timer,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

import pletxLogo from "@/assets/partners/pletx.png";

const protectionFeatures = [
  {
    icon: Shield,
    title: "Protection Layer 3/4/7",
    description: "Filtrage intelligent multi-couches contre les attaques volumétriques, protocoles et applicatives."
  },
  {
    icon: Zap,
    title: "Mitigation instantanée",
    description: "Temps de réponse ultra-rapide grâce à l'infrastructure edge distribuée de PletX."
  },
  {
    icon: Globe,
    title: "Réseau Anycast Global",
    description: "Points de présence mondiaux pour absorber les attaques au plus près de leur source."
  },
  {
    icon: Activity,
    title: "Monitoring 24/7",
    description: "Surveillance continue du trafic avec détection automatique des menaces."
  }
];

const stats = [
  { value: "10+", label: "Tbps de capacité", icon: Network },
  { value: "<1ms", label: "Temps de mitigation", icon: Timer },
  { value: "99.99%", label: "Disponibilité", icon: Activity },
];

const protectedAttacks = [
  "UDP Flood",
  "SYN Flood", 
  "HTTP Flood",
  "DNS Amplification",
  "NTP Amplification",
  "Slowloris",
  "Zero-Day Attacks",
];

export default function AntiDDoS() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20">
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
              <span className="text-sm font-medium text-primary">Protection incluse sur tous nos services</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
              Vos serveurs sont
              <span className="block gradient-text">protégés</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Chez Mystral, nous avons choisi <strong className="text-foreground">PletX</strong> comme partenaire 
              pour la protection anti-DDoS de notre infrastructure. Une protection de niveau entreprise, 
              incluse gratuitement avec tous nos services.
            </p>
            
            {/* PletX Partner Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-4 glass-dark rounded-2xl px-8 py-4 border border-border/50 mb-10"
            >
              <span className="text-muted-foreground text-sm">Propulsé par</span>
              <img src={pletxLogo} alt="PletX" className="h-8 object-contain" />
            </motion.div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://pletx.net" target="_blank" rel="noopener noreferrer">
                <Button variant="glass" size="lg" className="gap-2 text-lg px-8 py-6">
                  En savoir plus sur PletX
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </a>
              <Link to="/games">
                <Button variant="glow" size="lg" className="gap-2 text-lg px-8 py-6">
                  Voir nos offres
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="grid grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* What's Included Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ce qui est <span className="gradient-text">inclus</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tous nos serveurs bénéficient automatiquement de la protection PletX
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {protectionFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="glass-dark rounded-2xl p-6 h-full border border-border/50 hover:border-primary/30 transition-all duration-500">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
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
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-display font-bold mb-6">
                Attaques <span className="gradient-text">bloquées</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                La technologie PletX identifie et neutralise automatiquement toutes les formes 
                d'attaques DDoS connues pour garantir la disponibilité de vos serveurs.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {protectedAttacks.map((attack, index) => (
                  <motion.div
                    key={attack}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-foreground">{attack}</span>
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
              <div className="glass-dark rounded-3xl p-8 border border-border/50 text-center">
                <img src={pletxLogo} alt="PletX" className="h-16 object-contain mx-auto mb-6" />
                <p className="text-muted-foreground mb-6">
                  PletX est notre partenaire de confiance pour la protection anti-DDoS. 
                  Leur expertise et leur infrastructure nous permettent de garantir 
                  une protection optimale à tous nos clients.
                </p>
                <a href="https://pletx.net" target="_blank" rel="noopener noreferrer">
                  <Button variant="glass" className="gap-2">
                    Visiter pletx.net
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-dark rounded-3xl p-12 md:p-16 text-center max-w-3xl mx-auto border border-border/50"
          >
            <Shield className="w-14 h-14 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Protection incluse, sans frais
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Tous nos serveurs de jeux, VPS et VDS bénéficient automatiquement 
              de la protection anti-DDoS PletX. Aucune configuration requise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/games">
                <Button variant="glow" size="lg" className="gap-2">
                  Découvrir nos offres
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="glass" size="lg">
                  Nous contacter
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