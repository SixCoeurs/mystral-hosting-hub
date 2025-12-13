import { GamePageTemplate } from "./GamePageTemplate";
import rustHero from "@/assets/games/heroes/rust-hero.jpg";

const plans = [
  { name: "Starter", vcores: "4", ram: "8 GB", cpu: "4 vCores", storage: "50 GB", price: "9,99€" },
  { name: "Community", vcores: "6", ram: "16 GB", cpu: "6 vCores", storage: "100 GB", price: "19,99€", popular: true },
  { name: "Official", vcores: "8", ram: "32 GB", cpu: "8 vCores", storage: "200 GB", price: "39,99€" },
];

const RustPage = () => {
  return (
    <GamePageTemplate
      name="Rust"
      gameId="rust"
      description="Serveurs Rust haute performance avec protection DDoS renforcée. Oxide/uMod pré-installé, wipes automatiques configurables."
      heroImage={rustHero}
      accentColor="#CE422B"
      features={["Oxide/uMod", "Wipes auto", "Anti-cheat", "Maps custom"]}
      plans={plans}
    />
  );
};

export default RustPage;
