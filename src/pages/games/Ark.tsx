import { GamePageTemplate } from "./GamePageTemplate";
import arkImg from "@/assets/games/ark.jpg";

const plans = [
  { name: "Solo/Duo", slots: "10", ram: "8 GB", cpu: "4 vCores", storage: "50 GB", price: "12,99€" },
  { name: "Tribe", slots: "30", ram: "16 GB", cpu: "6 vCores", storage: "100 GB", price: "24,99€", popular: true },
  { name: "Cluster", slots: "70", ram: "32 GB", cpu: "8 vCores", storage: "200 GB", price: "44,99€" },
];

const ArkPage = () => {
  return (
    <GamePageTemplate
      name="ARK: Survival Evolved"
      description="Domptez des dinosaures sur votre propre serveur ARK. Support complet des mods Steam Workshop et clusters multi-maps."
      heroImage={arkImg}
      accentColor="#FF6B00"
      features={["Mods Workshop", "Clusters", "ARK: SA Ready", "Configs avancées"]}
      plans={plans}
    />
  );
};

export default ArkPage;
