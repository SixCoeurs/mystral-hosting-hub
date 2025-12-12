import { motion } from "framer-motion";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { Button } from "./ui/button";

// Import game images
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
    price: "0,50€",
    image: minecraftImg,
    color: "from-green-500/30 to-emerald-600/30",
    popular: true,
  },
  {
    name: "Rust",
    price: "7,40€",
    image: rustImg,
    color: "from-orange-500/30 to-red-600/30",
    popular: true,
  },
  {
    name: "ARK: Survival",
    price: "7,60€",
    image: arkImg,
    color: "from-blue-500/30 to-cyan-600/30",
  },
  {
    name: "FiveM",
    price: "4,99€",
    image: fivemImg,
    color: "from-orange-500/30 to-amber-600/30",
  },
  {
    name: "Palworld",
    price: "6,00€",
    image: palworldImg,
    color: "from-green-500/30 to-lime-600/30",
    popular: true,
  },
  {
    name: "Enshrouded",
    price: "3,50€",
    image: enshroudedImg,
    color: "from-cyan-500/30 to-blue-600/30",
  },
  {
    name: "The Isle",
    price: "4,80€",
    image: theisleImg,
    color: "from-emerald-500/30 to-teal-600/30",
  },
  {
    name: "DayZ",
    price: "5,99€",
    image: dayzImg,
    color: "from-gray-500/30 to-slate-600/30",
  },
];

export const GamesSection = () => {
  return (
    <section id="games" className="py-24 relative">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-primary text-sm uppercase tracking-widest mb-4">
            <Gamepad2 className="w-5 h-5" />
            <span>Hébergement de Serveurs de Jeux</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Jeux </span>
            <span className="gradient-text">Supportés</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choisissez parmi nos offres d'hébergement avec installation instantanée
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl h-full">
                {/* Background image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${game.image})` }}
                />
                
                {/* Overlay gradient */}
                <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent`} />
                
                {/* Content */}
                <div className="relative p-6 pt-32 h-full flex flex-col justify-end">
                  {/* Popular badge */}
                  {game.popular && (
                    <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      Populaire
                    </div>
                  )}

                  {/* Game info */}
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">
                    {game.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    À partir de <span className="text-primary font-semibold">{game.price}</span>/mois
                  </p>

                  {/* CTA */}
                  <Button 
                    variant="glow" 
                    size="sm"
                    className="w-full group/btn justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    Déployer
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button variant="glow" size="lg" className="gap-2">
            Voir tous les jeux
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
