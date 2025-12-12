import { motion } from "framer-motion";
import { Star, Check, Shield, Zap, Clock, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import vpsHeroBg from "@/assets/vps-hero-bg.jpg";

const features = [
  { icon: Zap, label: "NVMe Gen 4" },
  { icon: Shield, label: "Protection DDoS" },
  { icon: Check, label: "99.9% Uptime" },
  { icon: Clock, label: "Support 24/7" },
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

const PlanCard = ({ plan, index }: { plan: typeof starterPlans[0] & { popular?: boolean; bestValue?: boolean }; index: number }) => (
  <motion.div
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
);

const VPSPage = () => {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${vpsHeroBg})`,
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
                <span className="text-foreground font-semibold">4.9/5</span> - 500+ avis vérifiés
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
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              VPS haute performance pour un gaming parfait.{" "}
              <span className="text-primary">Zéro lag</span>, {" "}
              <span className="text-accent">protection DDoS</span>, et{" "}
              <span className="text-primary">support français 24/7</span>.
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
            >
              <Button variant="hero" size="xl">
                Voir les offres VPS →
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="container mx-auto px-4">
          {/* Starter Plans */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-2">
              <span className="text-foreground">Plans </span>
              <span className="gradient-text">Starter</span>
            </h2>
            <p className="text-muted-foreground text-center mb-8">Parfait pour les tests, bots & petits projets</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {starterPlans.map((plan, index) => (
                <PlanCard key={plan.name} plan={plan} index={index} />
              ))}
            </div>
          </motion.div>

          {/* Professional Plans */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-2">
              <span className="text-foreground">Plans </span>
              <span className="gradient-text">Professional</span>
            </h2>
            <p className="text-muted-foreground text-center mb-8">Pour les entreprises & applications en croissance</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {professionalPlans.map((plan, index) => (
                <PlanCard key={plan.name} plan={plan} index={index} />
              ))}
            </div>
          </motion.div>

          {/* Enterprise Plans */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-2">
              <span className="text-foreground">Plans </span>
              <span className="gradient-text">Enterprise</span>
            </h2>
            <p className="text-muted-foreground text-center mb-8">Puissance maximale pour applications exigeantes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {enterprisePlans.map((plan, index) => (
                <PlanCard key={plan.name} plan={plan} index={index} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default VPSPage;
