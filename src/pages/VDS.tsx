import { motion } from "framer-motion";
import { Star, Check, Shield, Cpu, Thermometer, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import vdsHeroBg from "@/assets/vds-hero-bg.jpg";

const features = [
  { icon: Cpu, label: "Ryzen 7950X" },
  { icon: Thermometer, label: "Water-Cooled" },
  { icon: Gauge, label: "5.8GHz" },
  { icon: Shield, label: "6Tbps DDoS" },
];

const vdsPlans = [
  {
    name: "VDS GAME 1",
    description: "Petits Serveurs",
    price: "29,99€",
    features: [
      "1 vCore @ 5.8GHz",
      "4GB DDR5 RAM",
      "60GB NVMe SSD",
      "5Gbps Upload/Download",
    ],
    os: "Linux",
  },
  {
    name: "VDS GAME 2",
    description: "Serveurs Moyens",
    price: "41,99€",
    features: [
      "2 vCores @ 5.8GHz",
      "8GB DDR5 RAM",
      "120GB NVMe SSD",
      "5Gbps Upload/Download",
    ],
    os: "Linux",
  },
  {
    name: "VDS GAME 3",
    description: "Grands Serveurs",
    price: "53,99€",
    features: [
      "3 vCores @ 5.8GHz",
      "12GB DDR5 RAM",
      "180GB NVMe SSD",
      "5Gbps Upload/Download",
    ],
    os: "Win/Linux",
    popular: true,
  },
  {
    name: "VDS GAME 4",
    description: "Performance Enterprise",
    price: "67,19€",
    features: [
      "4 vCores @ 5.8GHz",
      "16GB DDR5 RAM",
      "240GB NVMe SSD",
      "5Gbps Upload/Download",
    ],
    os: "Win/Linux",
  },
  {
    name: "VDS GAME 5",
    description: "Ultra Performance",
    price: "89,99€",
    features: [
      "6 vCores @ 5.8GHz",
      "24GB DDR5 RAM",
      "360GB NVMe SSD",
      "5Gbps Upload/Download",
    ],
    os: "Win/Linux",
  },
  {
    name: "VDS GAME 6",
    description: "Maximum Power",
    price: "119,99€",
    features: [
      "8 vCores @ 5.8GHz",
      "32GB DDR5 RAM",
      "500GB NVMe SSD",
      "5Gbps Upload/Download",
    ],
    os: "Win/Linux",
    bestValue: true,
  },
];

const VDSPage = () => {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${vdsHeroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 glass px-6 py-3 rounded-full border border-primary/30 mb-8"
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">4.8/5</span> - 500+ avis vérifiés
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-primary text-sm uppercase tracking-widest mb-4"
            >
              Vitesse Inégalée, Conçu pour le Gaming
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              <span className="gradient-text text-glow">Water-Cooled</span>
              <span className="text-foreground"> Ryzen 7950X</span>
              <br />
              <span className="text-foreground">Serveurs Dédiés Virtuels</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              Atteignez jusqu'à <span className="text-primary font-bold">5.8GHz</span> avec un refroidissement de précision. 
              Conçu pour des performances high-tickrate et une exécution serveur parfaite sous charge extrême.
            </motion.p>

            {/* Features badges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-10"
            >
              {features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-border/50">
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{feature.label}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="hero" size="xl">
                Voir les Plans Performance →
              </Button>
              <Button variant="glass" size="xl">
                Consultation Gratuite
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DDoS Protection Banner */}
      <section className="py-16 relative overflow-hidden border-y border-border/30">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-background to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-primary text-sm uppercase tracking-widest mb-4"
            >
              <Shield className="w-5 h-5" />
              <span>Protection Cosmic DDoS</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl md:text-4xl font-bold mb-4"
            >
              <span className="gradient-text">6 Tbps</span>
              <span className="text-foreground"> Anycast Shielding</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground"
            >
              Chaque serveur est protégé par une mitigation enterprise-grade sans compromis sur la vitesse. 
              Restez en ligne avec des filtres avancés et des insights en temps réel sur chaque menace.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Serveurs Dédiés </span>
              <span className="gradient-text">Virtuels</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              VDS haute performance parfaits pour serveurs de jeux ou charges CPU intensives
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vdsPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary rounded-full text-xs font-bold text-primary-foreground z-10">
                    POPULAIRE
                  </div>
                )}
                {plan.bestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent rounded-full text-xs font-bold text-accent-foreground z-10">
                    MEILLEUR RAPPORT
                  </div>
                )}
                <div className={`h-full p-6 rounded-2xl border transition-all duration-500 ${
                  plan.popular || plan.bestValue 
                    ? "bg-card border-primary/50 shadow-glow" 
                    : "bg-card border-border/50 hover:border-primary/30"
                }`}>
                  <div className="mb-4">
                    <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  
                  <div className="mb-6">
                    <span className="font-display text-3xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-secondary">{plan.os}</span>
                  </div>

                  <Button 
                    variant={plan.popular || plan.bestValue ? "glow" : "outline"} 
                    className="w-full"
                  >
                    Commander
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default VDSPage;
