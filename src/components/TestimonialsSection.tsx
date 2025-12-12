import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Thomas Martin",
    role: "Admin Serveur Rust",
    content: "Le meilleur hébergeur que j'ai utilisé ! Support ultra réactif et performances au top. Notre serveur n'a jamais eu de problème de lag.",
    rating: 5,
    date: "Mars 2024",
  },
  {
    name: "Marie Dubois",
    role: "Communauté Minecraft",
    content: "Mystral a sauvé notre serveur FiveM ! Migration gratuite et l'équipe nous a tout configuré. Je recommande à 100%.",
    rating: 5,
    date: "Février 2024",
  },
  {
    name: "Lucas Bernard",
    role: "Streameur",
    content: "Prix imbattables et qualité professionnelle. Le panel de contrôle est super intuitif, même pour un débutant.",
    rating: 5,
    date: "Janvier 2024",
  },
  {
    name: "Sophie Laurent",
    role: "Clan Gaming",
    content: "On est passé de GPortal à Mystral et c'est le jour et la nuit. Protection DDoS qui fonctionne vraiment, notre communauté est ravie.",
    rating: 5,
    date: "Décembre 2023",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface-dark to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 glass px-6 py-3 rounded-full border border-primary/30 mb-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Noté <span className="text-foreground font-semibold">Excellent</span>
            </span>
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Rejoignez </span>
            <span className="gradient-text">15,000+</span>
            <span className="text-foreground"> Gamers</span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="gradient-border">
                <div className="relative bg-card rounded-xl p-6 h-full">
                  {/* Quote icon */}
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
                  
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{testimonial.date}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
