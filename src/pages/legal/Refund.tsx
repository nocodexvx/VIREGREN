import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Refund() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-24 text-gray-300">
                <h1 className="text-4xl font-bold text-white mb-8">Política de Reembolso</h1>
                <div className="prose prose-invert max-w-none">
                    <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                    <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Garantia de Satisfação</h2>
                    <p>Queremos que você esteja satisfeito com o VariaGen. Se você não estiver feliz com o serviço, entre em contato conosco.</p>

                    <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Reembolsos</h2>
                    <p>Oferecemos reembolso integral dentro de 7 dias após a primeira compra, caso você não tenha utilizado o serviço de forma excessiva (geração de mais de 20 variações), conforme o Código de Defesa do Consumidor para compras digitais.</p>

                    <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Como Solicitar</h2>
                    <p>Para solicitar um reembolso, envie um email para suporte@variagen.com.br com o email da sua conta e o motivo da solicitação.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
