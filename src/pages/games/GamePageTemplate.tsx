import { motion } from "framer-motion";
import { Shield, Zap, Clock, Server, Users, HardDrive, Cpu, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface GamePlan {
  name: string;
  slots: string;
  ram: string;
  cpu: string;
  storage: string;
  price: string;
  popular?: boolean;
}

interface GamePageProps {
  name: string;
  description: string;
  heroImage?: string;
  heroVideo?: string;
  accentColor: string;
  features: string[];
  plans: GamePlan[];
}

export const GamePageTemplate = ({
  name,
  description,
  heroImage,
  heroVideo,
  accentColor,
  features,
  plans,
}: GamePageProps) => {
  const [customRam, setCustomRam] = useState([8]);
  const [customSlots, setCustomSlots] = useState([32]);

  const calculateCustomPrice = () => {
    const basePrice = 2.99;
    const ramPrice = customRam[0] * 0.5;
    const slotsPrice = customSlots[0] * 0.05;
    return (basePrice + ramPrice + slotsPrice).toFixed(2);
  };

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          {heroVideo ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={heroVideo} type="video/mp4" />
            </video>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${accentColor}20 0%, hsl(var(--background)) 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-background/60" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full border border-primary/30 mb-6"
            >
              <Server className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground font-medium">Serveur de Jeux</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              <span className="text-foreground">SERVEUR </span>
              <span className="gradient-text text-glow">{name.toUpperCase()}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 px-4 py-2 glass rounded-full border border-border/50">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pre-configured Plans */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Offres <span className="gradient-text">Prédéfinies</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Choisissez une configuration optimisée pour {name}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl border-2 ${
                  plan.popular 
                    ? "border-primary shadow-glow" 
                    : "border-border/50 hover:border-primary/50"
                } bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 overflow-hidden`}
              >
                {plan.popular && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 px-6 py-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-b-lg">
                    Most Popular
                  </div>
                )}

                {/* Header */}
                <div className="p-8 pt-10 text-center border-b border-border/30">
                  <h3 className="font-display text-2xl font-bold uppercase tracking-wide mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">Configuration optimisée</p>
                  
                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-5xl font-display font-bold gradient-text">{plan.price}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">/mois</p>
                </div>

                {/* Specs */}
                <div className="p-8 space-y-4 border-b border-border/30">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">CPU</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{plan.cpu}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <Gauge className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">RAM</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{plan.ram}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Storage</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{plan.storage} NVMe</span>
                  </div>
                  
                  {/* Unlimited Players Badge */}
                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <span className="text-primary font-bold">∞</span>
                    <span className="text-sm font-bold text-primary uppercase tracking-wide">{plan.slots} Joueurs</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="p-8 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Protection DDoS incluse</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Zap className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Installation en 60 secondes</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Support 24/7</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Server className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Panel de contrôle complet</span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="p-8 pt-0">
                  <Button 
                    variant={plan.popular ? "glow" : "outline"} 
                    size="lg"
                    className="w-full gap-2 text-base font-bold uppercase tracking-wide"
                  >
                    <Zap className="w-4 h-4" />
                    Déployer le serveur
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Configuration */}
      <section className="py-24 relative bg-primary/5 border-y border-border/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Configuration <span className="gradient-text">Personnalisée</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Créez votre serveur sur mesure avec exactement ce dont vous avez besoin
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border/30 bg-card p-8"
            >
              {/* RAM Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium">Mémoire RAM</label>
                  <span className="text-lg font-bold text-primary">{customRam[0]} GB</span>
                </div>
                <Slider
                  value={customRam}
                  onValueChange={setCustomRam}
                  min={2}
                  max={64}
                  step={2}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>2 GB</span>
                  <span>64 GB</span>
                </div>
              </div>

              {/* Slots Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium">Nombre de joueurs</label>
                  <span className="text-lg font-bold text-primary">{customSlots[0]} slots</span>
                </div>
                <Slider
                  value={customSlots}
                  onValueChange={setCustomSlots}
                  min={10}
                  max={500}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>10 slots</span>
                  <span>500 slots</span>
                </div>
              </div>

              {/* Summary */}
              <div className="border-t border-border/30 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Prix estimé</p>
                    <p className="text-4xl font-bold text-primary">
                      {calculateCustomPrice()}€<span className="text-sm text-muted-foreground">/mois</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Inclus</p>
                    <p className="text-sm">Protection DDoS + Support 24/7</p>
                  </div>
                </div>
                <Button variant="glow" size="lg" className="w-full">
                  Configurer mon serveur
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-6 rounded-2xl border border-border/30 bg-card"
            >
              <Zap className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Installation Instantanée</h3>
              <p className="text-sm text-muted-foreground">Votre serveur est prêt en moins de 60 secondes</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center p-6 rounded-2xl border border-border/30 bg-card"
            >
              <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Protection DDoS</h3>
              <p className="text-sm text-muted-foreground">Protection avancée contre toutes les attaques</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-6 rounded-2xl border border-border/30 bg-card"
            >
              <Clock className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Uptime 99.9%</h3>
              <p className="text-sm text-muted-foreground">Garantie de disponibilité maximale</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center p-6 rounded-2xl border border-border/30 bg-card"
            >
              <Server className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Panel de Contrôle</h3>
              <p className="text-sm text-muted-foreground">Interface intuitive pour gérer votre serveur</p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};
