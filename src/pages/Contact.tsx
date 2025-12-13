import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Clock, 
  Shield, 
  Headphones,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { z } from "zod";

const contactSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(50, "50 caractères max"),
  lastName: z.string().trim().min(1, "Nom requis").max(50, "50 caractères max"),
  email: z.string().trim().email("Email invalide").max(255, "255 caractères max"),
  subject: z.string().min(1, "Sujet requis"),
  orderNumber: z.string().max(50, "50 caractères max").optional(),
  message: z.string().trim().min(10, "Minimum 10 caractères").max(2000, "2000 caractères max"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const subjects = [
  { value: "sales", label: "Question commerciale" },
  { value: "support", label: "Support technique" },
  { value: "billing", label: "Facturation" },
  { value: "partnership", label: "Partenariat" },
  { value: "other", label: "Autre" },
];

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    orderNumber: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = contactSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.issues.forEach(err => {
        const field = err.path[0] as keyof ContactFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call - replace with actual backend integration
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        orderNumber: "",
        message: "",
      });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: Clock,
      title: "Réponse rapide",
      description: "Nous répondons sous 24h en moyenne",
    },
    {
      icon: Shield,
      title: "Support sécurisé",
      description: "Vos données sont protégées et confidentielles",
    },
    {
      icon: Headphones,
      title: "Équipe dédiée",
      description: "Des experts à votre écoute 7j/7",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full border border-primary/30 mb-6">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Contactez-nous</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Une question ? <span className="gradient-text">Parlons-en</span>
              </h1>
              
              <p className="text-lg text-muted-foreground">
                Notre équipe est disponible pour répondre à toutes vos questions concernant nos services d'hébergement.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                <div className="rounded-2xl border border-border bg-card p-8">
                  <h2 className="font-display text-2xl font-bold mb-2">Envoyez-nous un message</h2>
                  <p className="text-muted-foreground mb-8">
                    Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                  </p>

                  {submitStatus === "success" ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="font-display text-xl font-bold mb-2">Message envoyé !</h3>
                      <p className="text-muted-foreground mb-6">
                        Nous avons bien reçu votre message et vous répondrons sous 24h.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setSubmitStatus("idle")}
                      >
                        Envoyer un autre message
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom *</Label>
                          <Input
                            id="firstName"
                            placeholder="Jean"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            className={errors.firstName ? "border-destructive" : ""}
                          />
                          {errors.firstName && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.firstName}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Nom *</Label>
                          <Input
                            id="lastName"
                            placeholder="Dupont"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className={errors.lastName ? "border-destructive" : ""}
                          />
                          {errors.lastName && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="jean.dupont@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Subject & Order Number */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Sujet *</Label>
                          <Select 
                            value={formData.subject} 
                            onValueChange={(value) => handleInputChange("subject", value)}
                          >
                            <SelectTrigger className={errors.subject ? "border-destructive" : ""}>
                              <SelectValue placeholder="Sélectionnez un sujet" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map(subject => (
                                <SelectItem key={subject.value} value={subject.value}>
                                  {subject.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.subject && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.subject}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="orderNumber">N° de commande (optionnel)</Label>
                          <Input
                            id="orderNumber"
                            placeholder="MYS-XXXXX"
                            value={formData.orderNumber}
                            onChange={(e) => handleInputChange("orderNumber", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          placeholder="Décrivez votre demande en détail..."
                          rows={6}
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          className={errors.message ? "border-destructive" : ""}
                        />
                        <div className="flex justify-between items-center">
                          {errors.message ? (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.message}
                            </p>
                          ) : (
                            <span />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formData.message.length}/2000
                          </span>
                        </div>
                      </div>

                      {submitStatus === "error" && (
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Une erreur est survenue. Veuillez réessayer.
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        variant="glow" 
                        size="lg" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </motion.div>

              {/* Contact Info Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                {/* Contact Details */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display font-bold text-lg mb-6">Informations de contact</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Email</p>
                        <a 
                          href="mailto:contact@mystral.ch" 
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          contact@mystral.ch
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Téléphone</p>
                        <a 
                          href="tel:+41223456789" 
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          +41 22 345 67 89
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Adresse</p>
                        <p className="text-sm text-muted-foreground">
                          Rue du Rhône 42<br />
                          1204 Genève, Suisse
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Horaires</p>
                        <p className="text-sm text-muted-foreground">
                          Support: 24/7<br />
                          Commercial: Lun-Ven 9h-18h
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Help */}
                <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/10 to-card p-6">
                  <h3 className="font-display font-bold text-lg mb-3">Besoin d'aide urgente ?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Si votre serveur est en panne ou si vous rencontrez un problème critique, notre support technique est disponible 24/7.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="mailto:support@mystral.ch">
                      <Headphones className="w-4 h-4 mr-2" />
                      Support urgent
                    </a>
                  </Button>
                </div>

                {/* Client Space */}
                <div className="rounded-2xl border border-border bg-card/50 p-6">
                  <h3 className="font-display font-bold text-lg mb-3">Espace client</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Accédez à votre espace client pour gérer vos services, ouvrir des tickets et consulter vos factures.
                  </p>
                  <Button variant="secondary" className="w-full" asChild>
                    <a href="/login">
                      Se connecter
                    </a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}