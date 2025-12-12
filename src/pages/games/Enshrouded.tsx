import { GamePageTemplate } from "./GamePageTemplate";
import enshroudedImg from "@/assets/games/enshrouded.jpg";

const plans = [
  { name: "Duo", slots: "4", ram: "8 GB", cpu: "4 vCores", storage: "30 GB", price: "9,99€" },
  { name: "Squad", slots: "8", ram: "16 GB", cpu: "6 vCores", storage: "50 GB", price: "17,99€", popular: true },
  { name: "Clan", slots: "16", ram: "24 GB", cpu: "8 vCores", storage: "80 GB", price: "27,99€" },
];

const EnshroudedPage = () => {
  return (
    <GamePageTemplate
      name="Enshrouded"
      description="Explorez le monde mystérieux d'Enshrouded avec votre équipe. Serveurs dédiés avec sauvegardes automatiques."
      heroImage={enshroudedImg}
      accentColor="#8B5CF6"
      features={["Coop fluide", "Backups auto", "Mises à jour", "Panel simple"]}
      plans={plans}
    />
  );
};

export default EnshroudedPage;
