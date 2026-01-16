import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Privacy() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-24 text-gray-300">
                <h1 className="text-4xl font-bold text-white mb-8">Política de Privacidade</h1>
                <div className="prose prose-invert max-w-none">
                    <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                    <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Coleta de Dados</h2>
                    <p>Coletamos apenas as informações necessárias para operar o serviço: nome, email e dados de uso da plataforma. Não armazenamos dados de cartão de crédito, pois o processamento é feito por terceiros.</p>

                    <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Uso das Informações</h2>
                    <p>Usamos seus dados para fornecer o serviço, processar pagamentos, enviar notificações importantes e melhorar a plataforma. Não vendemos seus dados para terceiros.</p>

                    <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Seus Vídeos</h2>
                    <p>Os vídeos enviados e gerados são armazenados de forma segura e são acessíveis apenas por você. Mantemos os arquivos por tempo limitado conforme a política do seu plano para gerenciar o armazenamento.</p>

                    <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Segurança</h2>
                    <p>Implementamos medidas de segurança robustas para proteger seus dados contra acesso não autorizado.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
