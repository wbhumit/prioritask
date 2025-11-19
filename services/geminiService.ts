import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a list of subtasks for a given main task using Gemini.
 */
export const generateSubtasksAI = async (taskTitle: string, complexity: string): Promise<string[]> => {
  if (!apiKey) {
    console.warn("No API Key available for Gemini");
    return [
      "Break down this task manually",
      "Check requirements",
      "Execute step 1"
    ];
  }

  try {
    const prompt = `Break down the task "${taskTitle}" (Complexity: ${complexity}) into 3 to 5 concise, actionable sub-tasks. Return only the sub-task titles.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        },
        systemInstruction: "You are a helpful project manager assistant. Keep subtasks short (under 10 words)."
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const parsed = JSON.parse(jsonText);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];

  } catch (error) {
    console.error("Error generating subtasks:", error);
    // Fallback in case of error
    return ["Identify key requirements", "Prepare resources", "Execute task"];
  }
};