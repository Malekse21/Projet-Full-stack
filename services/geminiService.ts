import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMemoryMetadata = async (
  imageBase64: string | undefined,
  currentTitle: string,
  currentDesc: string
): Promise<{ title: string; description: string; tags: string[] }> => {
  try {
    const ai = getClient();
    const modelId = imageBase64 ? 'gemini-2.5-flash-image' : 'gemini-2.5-flash';

    let prompt = `
      Tu es un assistant intelligent pour un journal personnel.
      Ta tâche est de générer ou d'améliorer les métadonnées d'un souvenir.
      Réponds UNIQUEMENT avec un objet JSON valide ayant la structure suivante :
      {
        "title": "Un titre court et accrocheur en Français (max 50 caractères)",
        "description": "Une description nostalgique et chaleureuse en Français (max 200 caractères)",
        "tags": ["tableau", "de", "3-5", "tags", "pertinents"]
      }
    `;

    if (currentTitle) prompt += `\nL'utilisateur a fourni ce titre : "${currentTitle}".`;
    if (currentDesc) prompt += `\nL'utilisateur a fourni cette description : "${currentDesc}".`;
    
    const parts: any[] = [{ text: prompt }];

    if (imageBase64) {
      // Remove data url prefix if present
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      });
      parts[0].text += "\nAnalyse l'image fournie pour générer les métadonnées.";
    } else {
       parts[0].text += "\nGénère des métadonnées basées sur le texte fourni. Si le texte est vide, génère un contenu générique sur un 'Beau Moment'.";
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("Pas de réponse de l'IA");

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return {
      title: currentTitle || "Nouveau Souvenir",
      description: currentDesc || "Un moment inoubliable.",
      tags: ["souvenir"]
    };
  }
};