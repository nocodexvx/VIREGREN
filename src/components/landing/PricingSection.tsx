import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PaymentModal } from "@/components/payment/PaymentModal";

const plans = [
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 29, yearly: 290 },
    description: "Para criadores de conteúdo dedicados",
    features: [
      "Vídeos ilimitados",
      "100 variações por vídeo",
      "Arquivo máx. 500MB",
      "Todos os efeitos visuais",
      "Aceleração GPU",
      "Processamento em lote",
      "Suporte prioritário",
      "Presets personalizados"
    ],
    cta: "Assinar Pro",
    popular: true
  },
  {
    id: "business",
    name: "Business",
    price: { monthly: 99, yearly: 990 },
    description: "Para times e agências",
    features: [
      "Tudo do plano Pro",
      "500 variações por vídeo",
      "Arquivo máx. 2GB",
      "Acesso à API",
      "Integração Google Drive",
      "Fila preferencial",
      "Suporte dedicado",
      "Colaboração em equipe",
      "Exportação White-label"
    ],
    cta: "Assinar Business",
    popular: false
  }
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ id: string, price: string } | null>(null);

  const handleSubscribe = (plan: typeof plans[0]) => {
    const price = isYearly ? plan.price.yearly : plan.price.monthly;
    const planId = `${plan.id}_${isYearly ? 'yearly' : 'monthly'}`;

    setSelectedPlan({
      id: planId,
      price: price.toString()
    });
  };

  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Preços Simples e <span className="gradient-text">Transparentes</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Escolha o plano ideal para escalar seu conteúdo. Cancele quando quiser.
          </p>

          <div className="flex items-center justify-center gap-4">
            <span className={!isYearly ? "text-foreground" : "text-muted-foreground"}>Mensal</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={isYearly ? "text-foreground" : "text-muted-foreground"}>
              Anual <span className="text-success text-sm">(Economize ~17%)</span>
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className={`glass rounded-xl p-6 relative ${plan.popular ? "border-primary glow-primary" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-white text-sm font-medium">
                  Mais Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl font-bold">
                    R$ {isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-muted-foreground mb-1">/{isYearly ? 'ano' : 'mês'}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${plan.popular ? "gradient-primary" : ""}`}
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan)}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <PaymentModal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          plan={selectedPlan.id}
          price={selectedPlan.price}
        />
      )}
    </section>
  );
}
