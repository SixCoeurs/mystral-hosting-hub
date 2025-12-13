import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Plan {
  name: string;
  description: string;
  price: string;
  features: string[];
  os?: string;
  popular?: boolean;
  bestValue?: boolean;
}

interface PricingGridProps {
  plans: Plan[];
  columns?: 2 | 3 | 4;
  serviceType?: "vps" | "vds" | "enterprise";
}

export const PricingCard = ({ 
  plan, 
  index,
  serviceType = "vps"
}: { 
  plan: Plan; 
  index: number;
  serviceType?: "vps" | "vds" | "enterprise";
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.05 }}
    className="relative group h-full"
  >
    {(plan.popular || plan.bestValue) && (
      <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold z-10 ${
        plan.popular ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
      }`}>
        {plan.popular ? "POPULAIRE" : "MEILLEUR RAPPORT"}
      </div>
    )}
    
    <div className={`h-full flex flex-col p-6 rounded-2xl border transition-all duration-500 hover:-translate-y-2 ${
      plan.popular || plan.bestValue 
        ? "bg-gradient-to-b from-primary/10 to-card border-primary/50 shadow-glow" 
        : "bg-card border-border/50 hover:border-primary/30 hover:shadow-glow-sm"
    }`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-display text-xl font-bold text-foreground mb-1">{plan.name}</h3>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </div>
      
      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold gradient-text">{plan.price}</span>
          <span className="text-muted-foreground text-sm">/mois</span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6 flex-grow">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* OS Badge + CTA */}
      <div className="mt-auto space-y-4">
        {plan.os && (
          <div className="flex justify-center">
            <span className="text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              {plan.os}
            </span>
          </div>
        )}
        
        <Link to={`/checkout?type=${serviceType}&plan=${encodeURIComponent(plan.name.toLowerCase())}`}>
          <Button 
            variant={plan.popular || plan.bestValue ? "glow" : "outline"} 
            className="w-full"
            size="lg"
          >
            Commander
          </Button>
        </Link>
      </div>
    </div>
  </motion.div>
);

export const PricingGrid = ({ plans, columns = 4, serviceType = "vps" }: PricingGridProps) => {
  const gridCols = {
    2: "lg:grid-cols-2 max-w-3xl",
    3: "lg:grid-cols-3 max-w-5xl",
    4: "lg:grid-cols-4",
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols[columns]} gap-6 mx-auto`}>
      {plans.map((plan, index) => (
        <PricingCard key={plan.name} plan={plan} index={index} serviceType={serviceType} />
      ))}
    </div>
  );
};

interface PricingSectionProps {
  title: string;
  subtitle: string;
  plans: Plan[];
  columns?: 2 | 3 | 4;
  serviceType?: "vps" | "vds" | "enterprise";
}

export const PricingSection = ({ title, subtitle, plans, columns = 4, serviceType = "vps" }: PricingSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mb-20"
  >
    <div className="text-center mb-12">
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
        <span className="text-foreground">{title.split(" ")[0]} </span>
        <span className="gradient-text">{title.split(" ").slice(1).join(" ")}</span>
      </h2>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
    <PricingGrid plans={plans} columns={columns} serviceType={serviceType} />
  </motion.div>
);
