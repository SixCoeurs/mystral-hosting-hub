import { GamePageTemplate } from "./GamePageTemplate";
import dayzHero from "@/assets/games/heroes/dayz-hero.jpg";

const plans = [
  { name: "Survivor", vcores: "4", ram: "8 GB", cpu: "4 vCores", storage: "50 GB", price: "9,99€" },
  { name: "Community", vcores: "6", ram: "16 GB", cpu: "6 vCores", storage: "100 GB", price: "17,99€", popular: true },
  { name: "Official", vcores: "8", ram: "24 GB", cpu: "8 vCores", storage: "150 GB", price: "27,99€" },
];

const DayZPage = () => {
  return (
    <GamePageTemplate
      name="DayZ"
      gameId="dayz"
      description="Survivez dans un monde post-apocalyptique sur votre serveur DayZ. Mods Steam Workshop, économie, traders - tout est possible."
      heroImage={dayzHero}
      accentColor="#4A5D23"
      features={["Mods Workshop", "Traders", "Économie", "Maps custom"]}
      plans={plans}
    />
  );
};

export default DayZPage;
