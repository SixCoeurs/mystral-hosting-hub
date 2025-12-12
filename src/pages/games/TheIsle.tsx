import { GamePageTemplate } from "./GamePageTemplate";
import theisleHero from "@/assets/games/heroes/theisle-hero.jpg";

const plans = [
  { name: "Pack", slots: "50", ram: "8 GB", cpu: "4 vCores", storage: "30 GB", price: "7,99€" },
  { name: "Herd", slots: "100", ram: "16 GB", cpu: "6 vCores", storage: "50 GB", price: "14,99€", popular: true },
  { name: "Ecosystem", slots: "200", ram: "24 GB", cpu: "8 vCores", storage: "80 GB", price: "24,99€" },
];

const TheIslePage = () => {
  return (
    <GamePageTemplate
      name="The Isle"
      description="Incarnez des dinosaures sur votre serveur dédié. Legacy et Evrima supportés, configurations de spawn personnalisables."
      heroImage={theisleHero}
      accentColor="#2D5016"
      features={["Legacy & Evrima", "Rules custom", "Spawns configs", "Whitelist"]}
      plans={plans}
    />
  );
};

export default TheIslePage;
