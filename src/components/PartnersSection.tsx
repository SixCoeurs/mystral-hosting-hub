import { motion } from "framer-motion";

const partners = [
  { 
    name: "Dell", 
    logo: (
      <svg viewBox="0 0 100 30" className="h-8 w-auto fill-current">
        <text x="0" y="24" fontFamily="Arial Black, sans-serif" fontSize="28" fontWeight="bold">DELL</text>
      </svg>
    )
  },
  { 
    name: "Intel", 
    logo: (
      <svg viewBox="0 0 100 40" className="h-8 w-auto fill-current">
        <text x="0" y="30" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="bold">intel</text>
      </svg>
    )
  },
  { 
    name: "MikroTik", 
    logo: (
      <svg viewBox="0 0 120 30" className="h-8 w-auto fill-current">
        <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold">MikroTik</text>
      </svg>
    )
  },
  { 
    name: "Infomaniak", 
    logo: (
      <svg viewBox="0 0 140 30" className="h-8 w-auto fill-current">
        <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold">infomaniak</text>
      </svg>
    )
  },
  { 
    name: "SK hynix", 
    logo: (
      <svg viewBox="0 0 120 30" className="h-8 w-auto fill-current">
        <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold">SK hynix</text>
      </svg>
    )
  },
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
          Nos Partenaires
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
            className="flex gap-20 items-center"
            animate={{ x: [0, "-50%"] }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex items-center text-muted-foreground/50 hover:text-foreground transition-colors duration-300 whitespace-nowrap group"
              >
                <div className="group-hover:scale-110 transition-transform duration-300 opacity-60 group-hover:opacity-100">
                  {partner.logo}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
