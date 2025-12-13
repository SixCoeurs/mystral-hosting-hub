import { motion } from "framer-motion";
import { Server, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  services: [
    { label: "Serveurs de Jeux", href: "/games" },
    { label: "VPS", href: "/vps" },
    { label: "VDS", href: "/vds" },
    { label: "Entreprise", href: "/entreprise" },
  ],
  games: [
    { label: "Minecraft", href: "/games/minecraft" },
    { label: "Rust", href: "/games/rust" },
    { label: "ARK", href: "/games/ark" },
    { label: "FiveM", href: "/games/fivem" },
    { label: "Palworld", href: "/games/palworld" },
  ],
  support: [
    { label: "Contact", href: "/contact" },
    { label: "Protection Anti-DDoS", href: "/anti-ddos" },
    { label: "Status des serveurs", href: "#" },
  ],
  legal: [
    { label: "Mentions légales", href: "#" },
    { label: "CGV", href: "#" },
    { label: "Politique de confidentialité", href: "#" },
  ],
};

export const Footer = () => {
  return (
    <footer className="relative border-t border-border/50 bg-surface-darker">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.a 
              href="#" 
              className="flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <Server className="w-10 h-10 text-primary" />
                <div className="absolute inset-0 blur-lg bg-primary/50" />
              </div>
              <span className="font-display text-2xl font-bold tracking-wider">
                <span className="gradient-text">MYSTRAL</span>
              </span>
            </motion.a>
            <p className="text-muted-foreground mb-6 max-w-sm">
              L'hébergement de serveurs de jeux nouvelle génération. 
              Performances, protection et support premium pour votre communauté.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span>contact@mystral.fr</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Paris, France</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Games */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Jeux Populaires</h4>
            <ul className="space-y-3">
              {footerLinks.games.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('#') ? (
                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Mystral. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            {footerLinks.legal.map((link) => (
              <a 
                key={link.label}
                href={link.href} 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
