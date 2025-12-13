import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, UserPlus, ChevronRight, LogIn, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
  { label: "Anti-DDoS", href: "/anti-ddos" },
  { label: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileGamesOpen, setMobileGamesOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

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
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="glow" size="default">
                  Mon Espace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="glass" size="sm" className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Créer un compte
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="glow" size="default" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Connexion
                  </Button>
                </Link>
              </>
            )}
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
            className="lg:hidden glass-dark border-t border-border/50 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.isGameDropdown ? (
                    <>
                      <button
                        onClick={() => setMobileGamesOpen(!mobileGamesOpen)}
                        className="flex items-center justify-between w-full py-3 text-lg text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>{link.label}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileGamesOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {mobileGamesOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 pb-2 space-y-1 border-l-2 border-primary/30 ml-2">
                              {gameItems.map((game) => (
                                <Link
                                  key={game.label}
                                  to={game.href}
                                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-primary/10 transition-colors"
                                  onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setMobileGamesOpen(false);
                                  }}
                                >
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{game.label}</p>
                                    <p className="text-xs text-muted-foreground">À partir de {game.price}/mois</p>
                                  </div>
                                  {game.popular && (
                                    <span className="text-[10px] font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                      Populaire
                                    </span>
                                  )}
                                </Link>
                              ))}
                              <Link
                                to="/games"
                                className="flex items-center gap-2 py-2.5 px-3 text-sm text-primary hover:text-primary/80 transition-colors"
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setMobileGamesOpen(false);
                                }}
                              >
                                <span>Voir tous les jeux</span>
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : isExternal(link.href) ? (
                    <a
                      href={link.href}
                      className="block py-3 text-lg text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="block py-3 text-lg text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="pt-6 mt-4 border-t border-border/30 space-y-3">
                {isAuthenticated ? (
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="glow" className="w-full">
                      Mon Espace
                    </Button>
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="glass" className="w-full gap-2 text-sm">
                        <UserPlus className="w-4 h-4" />
                        Inscription
                      </Button>
                    </Link>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="glow" className="w-full gap-2 text-sm">
                        <LogIn className="w-4 h-4" />
                        Connexion
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
