import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como o VariaGen torna os vídeos únicos?",
    answer: "O VariaGen aplica múltiplas modificações em cada variação: pixel shifting (deslocamentos invisíveis de ±2px), randomização de metadados (timestamps, info do dispositivo) e ajustes visuais (brilho, contraste, saturação, matiz, zoom). Essas mudanças são imperceptíveis para espectadores humanos, mas fazem cada vídeo parecer único para os algoritmos das plataformas."
  },
  {
    question: "Meus vídeos serão sinalizados como duplicatas?",
    answer: "Não. As funcionalidades de anti-detecção do VariaGen garantem que cada variação seja genuinamente única do ponto de vista técnico. Nós modificamos os hashes dos arquivos, metadados e aplicamos mudanças visuais sutis que burlam a detecção de conteúdo duplicado no Instagram, TikTok, YouTube e Facebook."
  },
  {
    question: "Quantas variações posso criar?",
    answer: "O número depende do seu plano. Usuários Pro podem criar até 100 variações por vídeo, e usuários Business até 500. Você também pode processar múltiplos vídeos em lote nos planos pagos."
  },
  {
    question: "Quais formatos de vídeo são suportados?",
    answer: "O VariaGen suporta todos os principais formatos de vídeo, incluindo MP4, MOV, AVI, MKV e WebM. A saída é sempre em formato MP4 para máxima compatibilidade com todas as plataformas."
  },
  {
    question: "Preciso de um computador potente?",
    answer: "Embora a aceleração por GPU possa aumentar significativamente a velocidade de processamento, o VariaGen funciona em qualquer computador moderno. Para melhores resultados com muitas variações, recomendamos uma placa de vídeo dedicada (NVIDIA RTX ou equivalente AMD)."
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim! Você pode cancelar sua assinatura a qualquer momento, sem perguntas. Você continuará tendo acesso aos recursos do seu plano até o final do período de cobrança."
  },
  {
    question: "Existe um teste grátis?",
    answer: "Nós oferecemos planos acessíveis com garantia de satisfação. Comece assinando o plano Pro para desbloquear todo o potencial da ferramenta."
  },
  {
    question: "Quão rápido é o processamento?",
    answer: "A velocidade de processamento depende do seu hardware e configurações. Com aceleração por GPU e 4-6 workers, você pode gerar 100 variações de um vídeo de 1 minuto em menos de 5 minutos em um sistema moderno."
  }
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas <span className="gradient-text">Frequentes</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Tudo o que você precisa saber sobre o VariaGen
          </p>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto glass rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
