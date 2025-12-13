import { GamePageTemplate } from "./GamePageTemplate";
import minecraftHero from "@/assets/games/heroes/minecraft-hero.jpg";

const plans = [
  { name: "Vanilla", vcores: "2", ram: "2 GB", cpu: "2 vCores", storage: "10 GB", price: "2,99€" },
  { name: "Modded", vcores: "3", ram: "4 GB", cpu: "3 vCores", storage: "25 GB", price: "5,99€", popular: true },
  { name: "Network", vcores: "4", ram: "8 GB", cpu: "4 vCores", storage: "50 GB", price: "12,99€" },
];

const MinecraftPage = () => {
  return (
    <GamePageTemplate
      name="Minecraft"
      gameId="minecraft"
      description="Hébergez votre serveur Minecraft avec des performances optimales. Vanilla, Spigot, Paper, Forge, Fabric - tous les modloaders supportés."
      heroImage={minecraftHero}
      accentColor="#5D8C3E"
      features={["Tous Modloaders", "Plugins illimités", "Backups auto", "Panel Pterodactyl"]}
      plans={plans}
    />
  );
};

export default MinecraftPage;
