import { motion } from "framer-motion";
import { Star, Shield, Cpu, Thermometer, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingSection } from "@/components/PricingComponents";
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
    features: ["1 vCore @ 5.8GHz", "4GB DDR5 RAM", "60GB NVMe SSD", "5Gbps Network"],
    os: "Linux",
  },
  {
    name: "VDS GAME 2",
    description: "Serveurs Moyens",
    price: "41,99€",
    features: ["2 vCores @ 5.8GHz", "8GB DDR5 RAM", "120GB NVMe SSD", "5Gbps Network"],
    os: "Linux",
  },
  {
    name: "VDS GAME 3",
    description: "Grands Serveurs",
    price: "53,99€",
    features: ["3 vCores @ 5.8GHz", "12GB DDR5 RAM", "180GB NVMe SSD", "5Gbps Network"],
    os: "Win/Linux",
    popular: true,
  },
  {
    name: "VDS GAME 4",
    description: "Performance Enterprise",
    price: "67,19€",
    features: ["4 vCores @ 5.8GHz", "16GB DDR5 RAM", "240GB NVMe SSD", "5Gbps Network"],
    os: "Win/Linux",
  },
  {
    name: "VDS GAME 5",
    description: "Ultra Performance",
    price: "89,99€",
    features: ["6 vCores @ 5.8GHz", "24GB DDR5 RAM", "360GB NVMe SSD", "5Gbps Network"],
    os: "Win/Linux",
  },
  {
    name: "VDS GAME 6",
    description: "Maximum Power",
    price: "119,99€",
    features: ["8 vCores @ 5.8GHz", "32GB DDR5 RAM", "500GB NVMe SSD", "5Gbps Network"],
    os: "Win/Linux",
    bestValue: true,
  },
];

const VDSPage = () => {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${vdsHeroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 glass px-6 py-3 rounded-full border border-primary/30 mb-6"
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">4.8/5</span> - 500+ avis
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
              <br />
              <span className="text-foreground">Ryzen 7950X VDS</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              Jusqu'à <span className="text-primary font-bold">5.8GHz</span> avec refroidissement liquide. 
              Performance high-tickrate garantie.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-8"
            >
              {features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-2 px-4 py-2 glass rounded-full border border-border/50">
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
                Voir les Plans ↓
              </Button>
              <Button variant="glass" size="xl">
                Consultation Gratuite
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DDoS Protection Banner */}
      <section className="py-12 relative overflow-hidden border-y border-border/30">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-background to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-primary text-sm uppercase tracking-widest mb-3">
              <Shield className="w-5 h-5" />
              <span>Protection Cosmic DDoS</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              <span className="gradient-text">6 Tbps</span>
              <span className="text-foreground"> Anycast Shielding</span>
            </h2>
            <p className="text-muted-foreground text-sm">
              Protection enterprise-grade sans compromis sur la vitesse.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="container mx-auto px-4">
          <PricingSection
            title="Serveurs Dédiés Virtuels"
            subtitle="VDS haute performance parfaits pour serveurs de jeux ou charges CPU intensives"
            plans={vdsPlans}
            columns={3}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default VDSPage;
