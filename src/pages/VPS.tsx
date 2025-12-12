import { motion } from "framer-motion";
import { Star, Shield, Zap, Clock, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingSection } from "@/components/PricingComponents";
import vpsHeroBg from "@/assets/vps-hero-bg.jpg";

const features = [
  { icon: Zap, label: "NVMe Gen 4" },
  { icon: Shield, label: "Protection DDoS" },
  { icon: Clock, label: "99.9% Uptime" },
  { icon: Server, label: "Setup Instantané" },
];

const starterPlans = [
  {
    name: "Nano",
    description: "Tests & Bots",
    price: "0,99€",
    features: ["1 vCPU Core", "512MB RAM", "5GB NVMe SSD", "100Mbps Network"],
    os: "Linux",
  },
  {
    name: "Starter 1",
    description: "Applications légères",
    price: "2,49€",
    features: ["1 vCPU Core", "1GB RAM", "20GB NVMe SSD", "1Gbps Network"],
    os: "Linux",
  },
  {
    name: "Starter 2",
    description: "Petits sites",
    price: "3,99€",
    features: ["1 vCPU Core", "2GB RAM", "30GB NVMe SSD", "1Gbps Network"],
    os: "Win/Linux",
  },
  {
    name: "Starter 3",
    description: "Production Ready",
    price: "4,99€",
    features: ["2 vCPU Cores", "3GB RAM", "40GB NVMe SSD", "1Gbps Network"],
    os: "Win/Linux",
  },
];

const professionalPlans = [
  {
    name: "Essential",
    description: "Petits projets",
    price: "5,99€",
    features: ["2 vCPU Cores", "4GB RAM", "60GB NVMe SSD", "5Gbps Network"],
    os: "Win/Linux",
  },
  {
    name: "Advanced",
    description: "Apps & Sites",
    price: "9,99€",
    features: ["4 vCPU Cores", "8GB RAM", "120GB NVMe SSD", "5Gbps Network"],
    os: "Win/Linux",
  },
  {
    name: "Business",
    description: "Charge croissante",
    price: "15,99€",
    features: ["6 vCPU Cores", "12GB RAM", "180GB NVMe SSD", "5Gbps Network"],
    os: "Win/Linux",
    popular: true,
  },
  {
    name: "Growth",
    description: "Haut trafic",
    price: "20,99€",
    features: ["8 vCPU Cores", "16GB RAM", "240GB NVMe SSD", "5Gbps Network"],
    os: "Win/Linux",
  },
];

const enterprisePlans = [
  {
    name: "Enterprise",
    description: "Apps Enterprise",
    price: "23,99€",
    features: ["10 vCPU Cores", "20GB RAM", "300GB NVMe SSD", "5Gbps Network"],
    os: "Win/Linux",
  },
  {
    name: "Performance",
    description: "Max Performance",
    price: "25,99€",
    features: ["12 vCPU Cores", "24GB RAM", "300GB NVMe SSD", "5Gbps Network"],
    os: "Win/Linux",
    bestValue: true,
  },
];

const VPSPage = () => {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${vpsHeroBg})`,
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
                <span className="text-foreground font-semibold">4.9/5</span> - 500+ avis
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              <span className="text-foreground">HÉBERGEMENT </span>
              <span className="gradient-text text-glow">VPS FRANCE</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              VPS haute performance. <span className="text-primary">Zéro lag</span>, {" "}
              <span className="text-accent">protection DDoS</span>, et{" "}
              <span className="text-primary">support français 24/7</span>.
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
            >
              <Button variant="hero" size="xl">
                Voir les offres VPS ↓
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="container mx-auto px-4">
          <PricingSection
            title="Plans Starter"
            subtitle="Parfait pour les tests, bots & petits projets"
            plans={starterPlans}
            columns={4}
          />
          
          <PricingSection
            title="Plans Professional"
            subtitle="Pour les entreprises & applications en croissance"
            plans={professionalPlans}
            columns={4}
          />
          
          <PricingSection
            title="Plans Enterprise"
            subtitle="Puissance maximale pour applications exigeantes"
            plans={enterprisePlans}
            columns={2}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default VPSPage;
