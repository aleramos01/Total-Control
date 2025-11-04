import { GoogleGenAI, Type } from "@google/genai";
import { CustomCategory } from '../types';
import { CATEGORY_KEYS, CATEGORY_MAP } from '../constants';

type Locale = 'pt-BR' | 'en-US' | 'zh-CN' | 'ru-RU';

// Usa um padrão singleton para o cliente de IA
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

export const categorizeTransaction = async (
    description: string, 
    locale: Locale, 
    customCategories: CustomCategory[]
): Promise<string | null> => {
    
    const aiClient = getAiClient();
    if (!aiClient) {
        return 'other'; // Fallback se a chave da API estiver ausente
    }
    
    const allCategories = [
        ...CATEGORY_KEYS.map(key => ({ key, name: CATEGORY_MAP[key][locale] || CATEGORY_MAP[key]['en-US'] })),
        ...customCategories.map(cat => ({ key: cat.key, name: cat.name }))
    ];

    const allCategoryKeys = allCategories.map(cat => cat.key);
    
    if (allCategoryKeys.length === 0) return 'other';

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analise a descrição da transação: "${description}". Selecione a chave de categoria mais apropriada da lista fornecida.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        categoryKey: {
                            type: Type.STRING,
                            description: "A única melhor chave de categoria para a transação.",
                            enum: allCategoryKeys,
                        },
                    },
                    required: ["categoryKey"],
                },
            },
        });

        const result = JSON.parse(response.text);

        if (result.categoryKey && allCategoryKeys.includes(result.categoryKey)) {
            return result.categoryKey;
        }
        
        console.warn("Gemini returned an invalid or missing category key.", result);
        return 'other'; // Fallback para 'other' se a resposta não for válida

    } catch (error) {
        console.error("Error categorizing transaction with Gemini:", error);
        // Falha silenciosamente para 'other' para não interromper o fluxo do usuário.
        return 'other'; 
    }
};
