import { GamePageTemplate } from "./GamePageTemplate";
import palworldHero from "@/assets/games/heroes/palworld-hero.jpg";

const plans = [
  { name: "Coop", slots: "4", ram: "8 GB", cpu: "4 vCores", storage: "30 GB", price: "9,99€" },
  { name: "Friends", slots: "16", ram: "16 GB", cpu: "6 vCores", storage: "50 GB", price: "19,99€", popular: true },
  { name: "Community", slots: "32", ram: "32 GB", cpu: "8 vCores", storage: "100 GB", price: "34,99€" },
];

const PalworldPage = () => {
  return (
    <GamePageTemplate
      name="Palworld"
      gameId="palworld"
      description="Hébergez votre aventure Palworld avec vos amis. Serveurs optimisés pour des performances stables et un gameplay fluide."
      heroImage={palworldHero}
      accentColor="#4ECDC4"
      features={["Mises à jour auto", "Saves cloud", "Configs custom", "Mods supportés"]}
      plans={plans}
    />
  );
};

export default PalworldPage;
