import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Rocket } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/30 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Pronto para Escalar seu{" "}
            <span className="gradient-text">Império de Conteúdo</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Junte-se a milhares de criadores que já estão usando o VariaGen para maximizar seu alcance
            e renda em todas as plataformas.
          </p>
          <Button size="lg" className="gradient-primary text-lg h-14 px-8 glow-primary" asChild>
            <Link to="/register">
              <Rocket className="w-5 h-5 mr-2" />
              Começar a Criar Variações
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Satisfação garantida • Cancelamento a qualquer momento
          </p>
        </motion.div>
      </div>
    </section>
  );
}
