import { motion } from "framer-motion";
import { Shield, Server, Cloud, Lock, Headphones, Building2, Database, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingSection } from "@/components/PricingComponents";
import enterpriseHeroBg from "@/assets/enterprise-hero-bg.jpg";

const features = [
  { icon: Shield, label: "SLA 99.99%" },
  { icon: Lock, label: "ISO 27001" },
  { icon: Cloud, label: "Cloud Privé" },
  { icon: Headphones, label: "Support Dédié" },
];

const benefits = [
  {
    icon: Building2,
    title: "Infrastructure Dédiée",
    description: "Ressources exclusives, pas de mutualisation. Performances garanties pour vos applications critiques.",
  },
  {
    icon: Shield,
    title: "Sécurité Renforcée",
    description: "Pare-feu avancé, chiffrement bout-en-bout, audits de sécurité réguliers et conformité RGPD.",
  },
  {
    icon: Database,
    title: "Haute Disponibilité",
    description: "Redondance multi-sites, failover automatique et sauvegardes géo-répliquées.",
  },
  {
    icon: Globe,
    title: "Réseau Premium",
    description: "Backbone 10Gbps avec peering direct aux IX européens pour une latence minimale.",
  },
];

const enterprisePlans = [
  {
    name: "Business",
    description: "PME & Startups",
    price: "199€",
    features: [
      "8 vCPU Dédiés",
      "32GB RAM DDR5",
      "500GB NVMe RAID",
      "10Gbps Network",
      "Support 8h-20h",
      "SLA 99.9%",
    ],
    os: "Win/Linux",
  },
  {
    name: "Enterprise",
    description: "Moyennes Entreprises",
    price: "399€",
    features: [
      "16 vCPU Dédiés",
      "64GB RAM DDR5",
      "1TB NVMe RAID",
      "10Gbps Network",
      "Support 24/7",
      "SLA 99.95%",
    ],
    os: "Win/Linux",
    popular: true,
  },
  {
    name: "Corporate",
    description: "Grandes Entreprises",
    price: "799€",
    features: [
      "32 vCPU Dédiés",
      "128GB RAM DDR5",
      "2TB NVMe RAID",
      "10Gbps Network",
      "Account Manager",
      "SLA 99.99%",
    ],
    os: "Win/Linux",
    bestValue: true,
  },
];

const dedicatedPlans = [
  {
    name: "Dedicated S",
    description: "Serveur Physique",
    price: "299€",
    features: [
      "Intel Xeon E-2388G",
      "64GB RAM ECC",
      "2x 1TB NVMe",
      "10Gbps Network",
      "IPMI / KVM",
      "Support 24/7",
    ],
    os: "Win/Linux",
  },
  {
    name: "Dedicated M",
    description: "Performance",
    price: "499€",
    features: [
      "AMD EPYC 7443P",
      "128GB RAM ECC",
      "4x 2TB NVMe",
      "10Gbps Network",
      "IPMI / KVM",
      "Support Premium",
    ],
    os: "Win/Linux",
    popular: true,
  },
  {
    name: "Dedicated L",
    description: "Haute Performance",
    price: "899€",
    features: [
      "AMD EPYC 9454P",
      "256GB RAM ECC",
      "8x 2TB NVMe",
      "25Gbps Network",
      "IPMI / KVM",
      "Account Manager",
    ],
    os: "Win/Linux",
  },
];

const EnterprisePage = () => {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${enterpriseHeroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full border border-primary/30 mb-6"
            >
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground font-medium">Solutions Enterprise</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-primary text-sm uppercase tracking-widest mb-4"
            >
              Solutions Enterprise
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              <span className="text-foreground">Infrastructure </span>
              <span className="gradient-text text-glow">Cloud</span>
              <br />
              <span className="text-foreground">pour votre </span>
              <span className="gradient-text text-glow">Entreprise</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              Hébergement haute disponibilité, sécurisé et conforme RGPD. 
              Support dédié 24/7 et SLA garanti jusqu'à <span className="text-primary font-bold">99.99%</span>.
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
                Voir les Solutions ↓
              </Button>
              <Button variant="glass" size="xl">
                Demander un Devis
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              <span className="text-foreground">Pourquoi choisir </span>
              <span className="gradient-text">Mystral Enterprise</span>
              <span className="text-foreground"> ?</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative bg-surface-dark">
        <div className="container mx-auto px-4">
          <PricingSection
            title="Cloud Enterprise"
            subtitle="Infrastructure cloud haute disponibilité pour vos applications critiques"
            plans={enterprisePlans}
            columns={3}
          />
          
          <PricingSection
            title="Serveurs Dédiés"
            subtitle="Matériel physique dédié pour une performance maximale"
            plans={dedicatedPlans}
            columns={3}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-background to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              <span className="text-foreground">Besoin d'une solution </span>
              <span className="gradient-text">sur mesure</span>
              <span className="text-foreground"> ?</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Notre équipe d'experts vous accompagne dans la conception de votre infrastructure. 
              Contactez-nous pour un devis personnalisé.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl">
                Contacter un Expert
              </Button>
              <Button variant="glass" size="xl">
                Télécharger la Brochure
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default EnterprisePage;
