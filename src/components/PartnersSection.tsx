import { motion } from "framer-motion";
import dellLogo from "@/assets/partners/dell.png";
import intelLogo from "@/assets/partners/intel.png";
import mikrotikLogo from "@/assets/partners/mikrotik.svg";
import skhynixLogo from "@/assets/partners/skhynix.svg";

const partners = [
  { name: "Dell", logo: dellLogo },
  { name: "Intel", logo: intelLogo },
  { name: "MikroTik", logo: mikrotikLogo },
  { name: "SK hynix", logo: skhynixLogo },
];

export const PartnersSection = () => {
  return (
    <section className="py-12 relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 border-y border-primary/20">
      <div className="container mx-auto px-4">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground text-sm uppercase tracking-widest mb-10"
        >
          Nos Partenaires
        </motion.p>

        {/* Static logos grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-12 md:gap-20 lg:gap-28"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center justify-center group"
            >
              <img 
                src={partner.logo} 
                alt={`${partner.name} logo`}
                className="h-12 md:h-14 lg:h-16 w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
