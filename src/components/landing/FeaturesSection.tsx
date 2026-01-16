import { motion } from "framer-motion";
import {
  Palette,
  Volume2,
  Cpu,
  Shield,
  Download,
  Layers,
  TrendingUp,
  Clock
} from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Efeitos Visuais",
    description: "Ajuste brilho, contraste, saturação e matiz com sliders precisos para variações randomizadas."
  },
  {
    icon: Volume2,
    title: "Áudio e Timing",
    description: "Controle níveis de zoom, cortes de frames e ajuste de volume para criar versões verdadeiramente únicas."
  },
  {
    icon: Cpu,
    title: "Aceleração por GPU",
    description: "Aproveite sua placa de vídeo para processamento ultrarrápido com múltiplos workers."
  },
  {
    icon: Shield,
    title: "Anti-Detecção",
    description: "Randomização automática de metadados, pixel shifting e modificação de hash para burlar algoritmos."
  },
  {
    icon: Download,
    title: "Download em Lote",
    description: "Baixe todas as variações como arquivos individuais ou em um único arquivo ZIP."
  },
  {
    icon: Layers,
    title: "Múltiplos Formatos",
    description: "Suporte para formatos de entrada MP4, MOV, AVI, MKV e WebM."
  },
  {
    icon: TrendingUp,
    title: "Escale seu Conteúdo",
    description: "Poste em múltiplas contas e plataformas sem ser sinalizado por conteúdo duplicado."
  },
  {
    icon: Clock,
    title: "Economize Tempo",
    description: "Gere 100 variações em minutos em vez de horas de edição manual."
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que Você Precisa para{" "}
            <span className="gradient-text">Escalar seu Conteúdo</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Recursos poderosos projetados para ajudar criadores a maximizar seu alcance em todas as plataformas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="glass rounded-xl p-6 hover:border-primary/50 transition-colors group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:glow-primary transition-all">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
