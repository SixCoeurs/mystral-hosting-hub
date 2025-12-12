import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Combien de temps prend l'installation du serveur ?",
    answer: "Votre serveur est déployé instantanément après le paiement. Vous recevez vos identifiants de connexion en quelques secondes et pouvez commencer à jouer immédiatement.",
  },
  {
    question: "Puis-je changer la taille de mon serveur ?",
    answer: "Oui, vous pouvez augmenter ou réduire les ressources de votre serveur à tout moment sans perdre vos données ni votre progression.",
  },
  {
    question: "Mon serveur est-il protégé contre les attaques DDoS ?",
    answer: "Tous nos serveurs bénéficient d'une protection DDoS de plus de 6Tbps avec Cosmic Guard pour garder vos jeux en ligne 24/7, même en cas d'attaque.",
  },
  {
    question: "Proposez-vous des sauvegardes automatiques ?",
    answer: "Oui, nous effectuons des sauvegardes automatiques régulières. Vous pouvez restaurer votre serveur en un clic depuis votre panel de contrôle.",
  },
  {
    question: "Puis-je installer des mods et maps personnalisés ?",
    answer: "Absolument ! Installez des mods, plugins et maps via notre installateur en un clic ou par accès SFTP pour un contrôle total.",
  },
  {
    question: "Le support est-il disponible 24/7 ?",
    answer: "Oui, notre équipe de support basée en France est disponible 24h/24, 7j/7 via Discord ou ticket pour une aide rapide et experte.",
  },
  {
    question: "Puis-je transférer mon serveur depuis un autre hébergeur ?",
    answer: "Nous offrons des migrations gratuites ! Partagez-nous vos fichiers serveur et nous nous occupons du transfert de A à Z.",
  },
  {
    question: "Quelle est votre politique de remboursement ?",
    answer: "Nous offrons une période de remboursement de 48h. Si vous n'êtes pas satisfait, contactez-nous et nous vous rembourserons sans question.",
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 relative">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Questions </span>
            <span className="gradient-text">Fréquentes</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur nos services d'hébergement
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full text-left p-6 rounded-xl border transition-all duration-300 ${
                  openIndex === index
                    ? "bg-card border-primary/50"
                    : "bg-card/50 border-border/50 hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-foreground text-lg">
                    {faq.question}
                  </span>
                  <div className={`p-2 rounded-full transition-all duration-300 ${
                    openIndex === index ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}>
                    {openIndex === index ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </div>
                </div>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? "auto" : 0,
                    opacity: openIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="pt-4 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
