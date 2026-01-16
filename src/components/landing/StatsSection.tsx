import { motion } from "framer-motion";
import { TrendingUp, Users, Eye, Clock } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "+200%",
    label: "Aumento Médio de Receita",
    description: "Postando variações em múltiplas contas"
  },
  {
    icon: Eye,
    value: "+150%",
    label: "Expansão de Alcance",
    description: "Cada variação atinge novos públicos"
  },
  {
    icon: Clock,
    value: "10x",
    label: "Economia de Tempo",
    description: "Comparado à edição manual"
  },
  {
    icon: Users,
    value: "50K+",
    label: "Criadores Ativos",
    description: "Escalando conteúdo diariamente"
  }
];

export function StatsSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 gradient-primary opacity-5" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por que usar o <span className="gradient-text">VariaGen</span>?
          </h2>
          <p className="text-lg text-muted-foreground">
            Maximize seu alcance de conteúdo e potencial de receita
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="glass rounded-xl p-6 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
              <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
              <div className="font-semibold mb-1">{stat.label}</div>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 glass rounded-xl p-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">"</div>
            <div>
              <p className="text-lg mb-4">
                Fui de R$ 2.000/mês com 1 conta para R$ 6.500/mês com 5 contas usando as variações do VariaGen -
                um <span className="font-bold text-success">aumento de 225%</span> em apenas 3 meses.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary" />
                <div>
                  <div className="font-semibold">Criador de Conteúdo</div>
                  <div className="text-sm text-muted-foreground">Usuário Verificado</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
