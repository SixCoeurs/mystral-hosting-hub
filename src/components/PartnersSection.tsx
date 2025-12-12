import { motion } from "framer-motion";

const partners = [
  { name: "Fusion Gaming", logo: "🎮" },
  { name: "Hive Gaming", logo: "🐝" },
  { name: "Mesa Ark", logo: "🦖" },
  { name: "Best Rust", logo: "⚔️" },
  { name: "EGL Gaming", logo: "🏆" },
  { name: "2Stoned", logo: "🪨" },
  { name: "INX Gaming", logo: "💫" },
  { name: "PlayFinger", logo: "👆" },
];

export const PartnersSection = () => {
  return (
    <section className="py-16 relative overflow-hidden border-y border-border/30">
      <div className="container mx-auto px-4 mb-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground text-sm uppercase tracking-widest"
        >
          Ils nous font confiance
        </motion.p>
      </div>

      {/* Marquee container */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        {/* Scrolling partners */}
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-16 items-center"
            animate={{ x: [0, "-50%"] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex items-center gap-3 text-muted-foreground/60 hover:text-foreground transition-colors duration-300 whitespace-nowrap group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{partner.logo}</span>
                <span className="text-lg font-medium">{partner.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
