import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Server, ChevronDown, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";

// Import game images
import minecraftImg from "@/assets/games/minecraft.jpg";
import rustImg from "@/assets/games/rust.jpg";
import arkImg from "@/assets/games/ark.jpg";
import fivemImg from "@/assets/games/fivem.jpg";
import palworldImg from "@/assets/games/palworld.jpg";
import enshroudedImg from "@/assets/games/enshrouded.jpg";
import theisleImg from "@/assets/games/theisle.jpg";
import dayzImg from "@/assets/games/dayz.jpg";

const gameItems = [
  { label: "Minecraft", href: "/games/minecraft", image: minecraftImg, price: "2,99€" },
  { label: "Rust", href: "/games/rust", image: rustImg, price: "9,99€" },
  { label: "ARK", href: "/games/ark", image: arkImg, price: "12,99€" },
  { label: "FiveM", href: "/games/fivem", image: fivemImg, price: "14,99€" },
  { label: "Palworld", href: "/games/palworld", image: palworldImg, price: "9,99€" },
  { label: "Enshrouded", href: "/games/enshrouded", image: enshroudedImg, price: "9,99€" },
  { label: "The Isle", href: "/games/theisle", image: theisleImg, price: "7,99€" },
  { label: "DayZ", href: "/games/dayz", image: dayzImg, price: "9,99€" },
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
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3">
              <div className="relative">
                <Server className="w-10 h-10 text-primary" />
                <div className="absolute inset-0 blur-lg bg-primary/50 group-hover:bg-primary/70 transition-all duration-300" />
              </div>
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
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-4 glass rounded-xl border border-border/50 overflow-hidden p-4"
                        style={{ width: "600px" }}
                      >
                        <div className="grid grid-cols-4 gap-3">
                          {gameItems.map((game) => (
                            <Link
                              key={game.label}
                              to={game.href}
                              className="group relative rounded-lg overflow-hidden aspect-[4/3] bg-background/50"
                            >
                              <img 
                                src={game.image} 
                                alt={game.label}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-2">
                                <p className="text-xs font-medium text-foreground truncate">{game.label}</p>
                                <p className="text-xs text-primary">{game.price}/mois</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-border/30">
                          <Link 
                            to="/#games" 
                            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
                          >
                            Voir tous les jeux
                            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
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
