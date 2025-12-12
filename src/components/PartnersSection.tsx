import { motion } from "framer-motion";
import dellLogo from "@/assets/partners/dell.png";
import intelLogo from "@/assets/partners/intel.png";
import mikrotikLogo from "@/assets/partners/mikrotik.svg";
import skhynixLogo from "@/assets/partners/skhynix.svg";
import infomaniakLogo from "@/assets/partners/infomaniak.png";
import ciscoLogo from "@/assets/partners/cisco.png";
import amdLogo from "@/assets/partners/amd.png";
import pletxLogo from "@/assets/partners/pletx.png";

const partners = [
  { name: "Dell", logo: dellLogo },
  { name: "Intel", logo: intelLogo },
  { name: "AMD", logo: amdLogo },
  { name: "Cisco", logo: ciscoLogo },
  { name: "MikroTik", logo: mikrotikLogo },
  { name: "Infomaniak", logo: infomaniakLogo },
  { name: "SK hynix", logo: skhynixLogo },
  { name: "PletX", logo: pletxLogo },
];

export const PartnersSection = () => {
  // Match the section's gradient background color for seamless fade
  const fadeColor = "hsl(270 50% 8%)"; // Dark purple matching primary/10 on dark bg
  
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
        {/* Fade edges - matching section gradient background */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-40 z-10 pointer-events-none" 
          style={{ background: `linear-gradient(to right, ${fadeColor}, transparent)` }} 
        />
        <div 
          className="absolute right-0 top-0 bottom-0 w-40 z-10 pointer-events-none" 
          style={{ background: `linear-gradient(to left, ${fadeColor}, transparent)` }} 
        />
        
        {/* Scrolling partners - seamless infinite loop */}
        <div className="flex overflow-hidden">
          <div className="flex gap-20 md:gap-32 items-center animate-marquee">
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex items-center justify-center shrink-0 group"
              >
                <img 
                  src={partner.logo} 
                  alt={`${partner.name} logo`}
                  className="h-14 md:h-20 max-w-[160px] md:max-w-[200px] w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-20 md:gap-32 items-center animate-marquee" aria-hidden="true">
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={`${partner.name}-duplicate-${index}`}
                className="flex items-center justify-center shrink-0 group"
              >
                <img 
                  src={partner.logo} 
                  alt={`${partner.name} logo`}
                  className="h-14 md:h-20 max-w-[160px] md:max-w-[200px] w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
