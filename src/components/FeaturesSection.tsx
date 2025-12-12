import { motion } from "framer-motion";
import { 
  Zap, 
  Rocket, 
  Gamepad2, 
  Settings, 
  Shield, 
  Globe,
  Clock,
  HeadphonesIcon
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Performances Sans Lag",
    description: "CPUs haute fréquence et réseau ultra-rapide pour une latence minimale, même en multijoueur intensif.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Rocket,
    title: "Déploiement Instantané",
    description: "En ligne en moins de 60 secondes. Configuration automatique et prêt à jouer immédiatement.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Gamepad2,
    title: "50+ Jeux Supportés",
    description: "Survival, FPS, sandbox, MMO... Compatibilité mods et plugins intégrée pour tous vos jeux.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Settings,
    title: "Contrôle Total",
    description: "Panel intuitif avec accès complet aux configs, sauvegardes et gestion de fichiers. Zéro code requis.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Shield,
    title: "Protection DDoS Avancée",
    description: "Protection enterprise-grade qui filtre le trafic gaming. Votre communauté reste en ligne 24/7.",
    gradient: "from-red-500 to-rose-500",
  },
  {
    icon: Globe,
    title: "Couverture Mondiale",
    description: "Datacenters stratégiques pour un ping optimal partout dans le monde.",
    gradient: "from-indigo-500 to-violet-500",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[150px]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Pourquoi </span>
            <span className="gradient-text">Mystral</span>
            <span className="text-foreground"> ?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            L'hébergement de serveurs de jeux simplifié, avec des performances professionnelles.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative h-full p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 card-hover">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="flex items-center gap-4 p-6 rounded-xl glass border border-border/50">
            <div className="p-3 rounded-lg bg-primary/20">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Installation en 60 secondes</div>
              <div className="text-sm text-muted-foreground">Votre serveur est prêt instantanément</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 rounded-xl glass border border-border/50">
            <div className="p-3 rounded-lg bg-accent/20">
              <HeadphonesIcon className="w-6 h-6 text-accent" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Support Français 24/7</div>
              <div className="text-sm text-muted-foreground">Une équipe d'experts à votre écoute</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
