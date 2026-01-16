import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Terms() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-24 text-gray-300">
                <h1 className="text-4xl font-bold text-white mb-8">Termos de Uso</h1>
                <div className="prose prose-invert max-w-none">
                    <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                    <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Aceitação dos Termos</h2>
                    <p>Ao acessar e usar o VariaGen, você concorda em cumprir estes termos de serviço. O serviço é destinado a uso profissional e pessoal para edição e variação de vídeos.</p>

                    <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Uso do Serviço</h2>
                    <p>Você é responsável por todo o conteúdo que envia e gera através do sistema. É proibido usar o serviço para gerar conteúdo ilegal, odioso ou que viole direitos autorais de terceiros.</p>

                    <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Planos e Pagamentos</h2>
                    <p>O acesso aos recursos premium requer uma assinatura ativa. Os pagamentos são processados via PIX e são renovados automaticamente conforme o período escolhido (mensal ou anual), salvo cancelamento prévio.</p>

                    <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Cancelamento</h2>
                    <p>Você pode cancelar sua assinatura a qualquer momento através do painel do usuário. O acesso continuará ativo até o fim do período já pago.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
