import { GamePageTemplate } from "./GamePageTemplate";
import fivemImg from "@/assets/games/fivem.jpg";

const plans = [
  { name: "RP Starter", slots: "32", ram: "8 GB", cpu: "4 vCores", storage: "50 GB", price: "14,99€" },
  { name: "RP Pro", slots: "64", ram: "16 GB", cpu: "6 vCores", storage: "100 GB", price: "29,99€", popular: true },
  { name: "RP Ultimate", slots: "256", ram: "32 GB", cpu: "8 vCores", storage: "200 GB", price: "59,99€" },
];

const FiveMPage = () => {
  return (
    <GamePageTemplate
      name="FiveM"
      description="Créez votre serveur roleplay GTA V ultime. Framework ESX/QBCore pré-configurés, ressources illimitées."
      heroImage={fivemImg}
      accentColor="#F49B0B"
      features={["ESX/QBCore", "OneSync", "Ressources illimitées", "Base de données"]}
      plans={plans}
    />
  );
};

export default FiveMPage;
