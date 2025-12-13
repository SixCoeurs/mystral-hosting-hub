import { GamePageTemplate } from "./GamePageTemplate";
import gmodHero from "@/assets/games/heroes/gmod-hero.jpg";

const plans = [
  { name: "Sandbox", slots: "16", ram: "4 GB", cpu: "2 vCores", storage: "20 GB", price: "5,99€" },
  { name: "Community", slots: "32", ram: "8 GB", cpu: "4 vCores", storage: "40 GB", price: "9,99€", popular: true },
  { name: "Ultimate", slots: "64", ram: "16 GB", cpu: "6 vCores", storage: "80 GB", price: "17,99€" },
];

const GmodPage = () => {
  return (
    <GamePageTemplate
      name="Garry's Mod"
      gameId="gmod"
      description="Créez, jouez et partagez sans limites. Sandbox ultime avec des milliers d'addons, gamemodes TTT, DarkRP, PropHunt et bien plus."
      heroImage={gmodHero}
      accentColor="#F79E1B"
      features={["Workshop Steam", "DarkRP", "TTT", "PropHunt"]}
      plans={plans}
    />
  );
};

export default GmodPage;
