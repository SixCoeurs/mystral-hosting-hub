import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Phone, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";

const gameItems = [
  { label: "Minecraft", href: "/games/minecraft", price: "2,99€", popular: true },
  { label: "Rust", href: "/games/rust", price: "9,99€", popular: true },
  { label: "ARK", href: "/games/ark", price: "12,99€", popular: false },
  { label: "FiveM", href: "/games/fivem", price: "14,99€", popular: true },
  { label: "Palworld", href: "/games/palworld", price: "9,99€", popular: false },
  { label: "Enshrouded", href: "/games/enshrouded", price: "9,99€", popular: false },
  { label: "Garry's Mod", href: "/games/gmod", price: "5,99€", popular: false },
  { label: "DayZ", href: "/games/dayz", price: "9,99€", popular: false },
];

const navLinks = [
  { 
    label: "Serveurs de Jeux", 
    href: "/#games",
    hasDropdown: true,
    isGameDropdown: true,
  },
  { label: "VPS", href: "/vps" },
  { label: "VDS", href: "/vds" },
  { label: "Entreprise", href: "/entreprise" },
  { label: "Contact", href: "/#contact" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isExternal = (href: string) => href.startsWith("/#") || href.startsWith("#");

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "glass-dark border-b border-border/50" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div whileHover={{ scale: 1.02 }}>
              <span className="font-display text-2xl font-bold tracking-wider">
                <span className="gradient-text">MYSTRAL</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {isExternal(link.href) ? (
                  <a
                    href={link.href}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm font-medium"
                  >
                    {link.label}
                    {link.hasDropdown && <ChevronDown className="w-4 h-4" />}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm font-medium"
                  >
                    {link.label}
                    {link.hasDropdown && <ChevronDown className="w-4 h-4" />}
                  </Link>
                )}
                
                {link.hasDropdown && link.isGameDropdown && (
                  <AnimatePresence>
                    {activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-3 bg-background/95 backdrop-blur-xl rounded-xl border border-border/50 overflow-hidden shadow-2xl shadow-primary/10"
                        style={{ width: "280px" }}
                      >
                        <div className="p-2">
                          <div className="px-3 py-2 mb-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Serveurs disponibles</p>
                          </div>
                          {gameItems.map((game) => (
                            <Link
                              key={game.label}
                              to={game.href}
                              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-colors group"
                            >
                              <div>
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                  {game.label}
                                </p>
                                <p className="text-xs text-muted-foreground">À partir de {game.price}/mois</p>
                              </div>
                              {game.popular && (
                                <span className="text-[10px] font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                  Populaire
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-border/30 p-2">
                          <Link 
                            to="/games" 
                            className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-colors text-sm text-muted-foreground hover:text-primary"
                          >
                            <span>Voir tous les jeux</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="glass" size="sm" className="gap-2">
              <Phone className="w-4 h-4" />
              +33 1 23 45 67 89
            </Button>
            <Button variant="glow" size="default">
              Connexion
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-foreground"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-dark border-t border-border/50"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                isExternal(link.href) ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block py-3 text-lg text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="block py-3 text-lg text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              ))}
              <div className="pt-4 space-y-3">
                <Button variant="glow" className="w-full">
                  Connexion
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
