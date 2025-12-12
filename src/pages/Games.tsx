import { motion } from "framer-motion";
import { Gamepad2, Users, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

import minecraftImg from "@/assets/games/minecraft.jpg";
import rustImg from "@/assets/games/rust.jpg";
import arkImg from "@/assets/games/ark.jpg";
import fivemImg from "@/assets/games/fivem.jpg";
import palworldImg from "@/assets/games/palworld.jpg";
import enshroudedImg from "@/assets/games/enshrouded.jpg";
import theisleImg from "@/assets/games/theisle.jpg";
import dayzImg from "@/assets/games/dayz.jpg";

const games = [
  { 
    name: "Minecraft", 
    slug: "minecraft",
    image: minecraftImg, 
    price: "2,99€", 
    description: "Le jeu sandbox le plus populaire au monde",
    players: "Illimité",
    popular: true 
  },
  { 
    name: "Rust", 
    slug: "rust",
    image: rustImg, 
    price: "9,99€", 
    description: "Survie hardcore et PvP intense",
    players: "Jusqu'à 500",
    popular: true 
  },
  { 
    name: "ARK: Survival Evolved", 
    slug: "ark",
    image: arkImg, 
    price: "12,99€", 
    description: "Dinosaures et survie préhistorique",
    players: "Jusqu'à 100",
    popular: false 
  },
  { 
    name: "FiveM", 
    slug: "fivem",
    image: fivemImg, 
    price: "14,99€", 
    description: "GTA V roleplay et multijoueur custom",
    players: "Jusqu'à 1024",
    popular: true 
  },
  { 
    name: "Palworld", 
    slug: "palworld",
    image: palworldImg, 
    price: "9,99€", 
    description: "Pokémon meets survie et crafting",
    players: "Jusqu'à 32",
    popular: false 
  },
  { 
    name: "Enshrouded", 
    slug: "enshrouded",
    image: enshroudedImg, 
    price: "9,99€", 
    description: "Action RPG et survie coopérative",
    players: "Jusqu'à 16",
    popular: false 
  },
  { 
    name: "The Isle", 
    slug: "theisle",
    image: theisleImg, 
    price: "7,99€", 
    description: "Incarnez des dinosaures réalistes",
    players: "Jusqu'à 200",
    popular: false 
  },
  { 
    name: "DayZ", 
    slug: "dayz",
    image: dayzImg, 
    price: "9,99€", 
    description: "Survie zombie post-apocalyptique",
    players: "Jusqu'à 60",
    popular: false 
  },
];

const GamesPage = () => {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/20 via-background to-background" />
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="container mx-auto px-4 relative z-10 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full border border-primary/30 mb-6"
            >
              <Gamepad2 className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground font-medium">Serveurs de Jeux</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              <span className="text-foreground">TOUS NOS </span>
              <span className="gradient-text text-glow">SERVEURS DE JEUX</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Déployez votre serveur en quelques clics. Performance maximale, protection DDoS incluse.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-8 border-y border-border/30 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Installation instantanée</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Protection DDoS incluse</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Support 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link 
                  to={`/games/${game.slug}`}
                  className="group block relative rounded-2xl overflow-hidden border border-border/30 bg-card hover:border-primary/50 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img 
                      src={game.image} 
                      alt={game.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    
                    {game.popular && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-bold rounded-full">
                        Populaire
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{game.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{game.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">À partir de</p>
                        <p className="text-xl font-bold text-primary">{game.price}<span className="text-sm text-muted-foreground">/mois</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Joueurs</p>
                        <p className="text-sm font-medium">{game.players}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default GamesPage;
