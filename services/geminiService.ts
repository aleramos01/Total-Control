
import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORY_MAP, CATEGORY_KEYS, CategoryKey } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

type Locale = 'pt-BR' | 'en-US' | 'zh-CN' | 'ru-RU';

const getPrompt = (description: string, locale: Locale): string => {
    const translatedCategories = CATEGORY_KEYS.map(key => CATEGORY_MAP[key][locale]).join(', ');

    switch (locale) {
        case 'en-US':
            return `You are a personal finance assistant. Analyze the transaction description and classify it into one of the following categories.\nDescription: "${description}"\nAvailable categories: ${translatedCategories}.\nReturn only the most appropriate category. If none fit perfectly, choose '${CATEGORY_MAP['other']['en-US']}'.`;
        case 'zh-CN':
            return `你是一位个人理财助理。请分析这笔交易的描述，并将其归入以下类别之一。\n描述：“${description}”\n可用类别：${translatedCategories}。\n请只返回最合适的类别。如果没有完全匹配的，请选择“${CATEGORY_MAP['other']['zh-CN']}”。`;
        case 'ru-RU':
            return `Вы — помощник по личным финансам. Проанализируйте описание транзакции и отнесите его к одной из следующих категорий.\nОписание: «${description}»\nДоступные категории: ${translatedCategories}.\nВерните только наиболее подходящую категорию. Если ни одна не подходит идеально, выберите «${CATEGORY_MAP['other']['ru-RU']}».`;
        case 'pt-BR':
        default:
            return `Você é um assistente de finanças pessoais. Analise a descrição da transação e classifique-a em uma das seguintes categorias.\nDescrição: "${description}"\nCategorias disponíveis: ${translatedCategories}.\nRetorne apenas a categoria mais apropriada. Se nenhuma se encaixar perfeitamente, escolha '${CATEGORY_MAP['other']['pt-BR']}'.`;
    }
};

export const categorizeTransaction = async (description: string, locale: Locale): Promise<CategoryKey | null> => {
    if (!API_KEY) {
        return null;
    }

    const translatedCategories = CATEGORY_KEYS.map(key => CATEGORY_MAP[key][locale]);

    const schema = {
        type: Type.OBJECT,
        properties: {
            category: {
                type: Type.STRING,
                description: `A categoria da transação.`,
                enum: translatedCategories,
            },
        },
        required: ['category'],
    };

    try {
        const prompt = getPrompt(description, locale);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0,
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        
        const returnedCategory = result.category;

        if (returnedCategory) {
            // Find the key that corresponds to the returned translated category name
            const categoryKey = CATEGORY_KEYS.find(
                key => CATEGORY_MAP[key][locale] === returnedCategory
            );
            return categoryKey || 'other';
        }

        return 'other';
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return null;
    }
};
