import { GoogleGenAI, Content } from "@google/genai";
import { Transaction } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

let ai: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable is not set.");
        return null;
    }
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

export const sendMessage = async (message: string, history: Message[], transactions: Transaction[]): Promise<string> => {
    const aiClient = getAiClient();
    if (!aiClient) {
        return "The AI assistant is currently unavailable because the API key is not configured.";
    }

    const systemInstruction = `Você é Jorginho, um assistente financeiro amigável e perspicaz. Seu papel é analisar os dados financeiros do usuário e responder às suas perguntas de forma clara e concisa.
- As transações financeiras do usuário são fornecidas abaixo no formato JSON.
- Use esses dados exclusivamente para responder às perguntas.
- Não invente ou presuma qualquer informação. Se a resposta não puder ser encontrada nos dados fornecidos, afirme isso claramente.
- Forneça resumos e insights úteis com base nos dados.
- A data de hoje é ${new Date().toLocaleDateString('pt-BR')}.

Transações do Usuário:
${transactions.length > 0 ? JSON.stringify(transactions, null, 2) : "Nenhuma transação ainda."}
`;

    // Converte nosso histórico de mensagens para o formato que o Gemini espera, pulando a mensagem de boas-vindas inicial.
    const contents: Content[] = history.slice(1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
    // Adiciona a nova mensagem do usuário
    contents.push({ role: 'user', parts: [{ text: message }] });

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        // Isso será traduzido no componente
        return 'chat_error';
    }
};
