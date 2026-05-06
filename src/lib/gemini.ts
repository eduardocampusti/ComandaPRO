import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// No novo SDK @google/genai, usamos a classe GoogleGenAI
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Gera uma sugestão de harmonização ou descrição gourmet para um item do menu.
 */
export async function getMenuAIAssistance(itemName: string, description: string = '') {
  if (!ai) {
    console.warn('GoogleGenAI não inicializado. Verifique a chave VITE_GEMINI_API_KEY no .env');
    return null;
  }

  const prompt = `
    Você é um chef de cozinha e sommelier experiente. 
    Dado o item do menu: "${itemName}" com a descrição: "${description}".
    
    Por favor, forneça:
    1. Uma descrição gourmet curta e apetitosa (máximo 2 frases).
    2. Uma sugestão de acompanhamento ou bebida do cardápio que harmonize perfeitamente.
    
    Retorne apenas um objeto JSON no seguinte formato:
    {
      "gourmetDescription": "string",
      "pairingSuggestion": "string"
    }
  `;

  try {
    // No novo SDK, usamos ai.models.generateContent
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = response.text;
    if (!text) return null;
    
    // Extrair JSON da resposta (limpar possíveis tags de markdown)
    const jsonStr = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Erro ao chamar Gemini AI:', error);
    return null;
  }
}
