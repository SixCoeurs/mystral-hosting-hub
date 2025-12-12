import { motion } from "framer-motion";
import dellLogo from "@/assets/partners/dell.png";
import intelLogo from "@/assets/partners/intel.png";
import mikrotikLogo from "@/assets/partners/mikrotik.svg";
import skhynixLogo from "@/assets/partners/skhynix.svg";
import infomaniakLogo from "@/assets/partners/infomaniak.png";
import ciscoLogo from "@/assets/partners/cisco.png";

const partners = [
  { name: "Dell", logo: dellLogo },
  { name: "Intel", logo: intelLogo },
  { name: "Cisco", logo: ciscoLogo },
  { name: "MikroTik", logo: mikrotikLogo },
  { name: "Infomaniak", logo: infomaniakLogo },
  { name: "SK hynix", logo: skhynixLogo },
];

export const PartnersSection = () => {
  return (
    <section className="py-12 relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 border-y border-primary/20">
      <div className="container mx-auto px-4 mb-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
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
        
        {/* Scrolling partners - right to left */}
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-20 md:gap-32 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...partners, ...partners, ...partners, ...partners].map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex items-center justify-center shrink-0 group"
              >
                <img 
                  src={partner.logo} 
                  alt={`${partner.name} logo`}
                  className="h-10 md:h-12 max-w-[120px] md:max-w-[150px] w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
