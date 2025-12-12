import { motion } from "framer-motion";
import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "./ui/button";

export const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-background to-accent/10" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[150px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            Prêt à commencer ?
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-foreground">Lancez votre serveur </span>
            <span className="gradient-text text-glow">maintenant</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Rejoignez plus de 15,000 serveurs actifs et offrez à votre communauté l'expérience gaming qu'elle mérite.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" className="gap-2 min-w-[220px]">
              Voir les Offres
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="xl" className="min-w-[220px]">
              Contacter le Support
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Installation instantanée
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Support 24/7
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Remboursement 48h
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
