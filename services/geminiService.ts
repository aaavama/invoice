import { GoogleGenAI, Type } from "@google/genai";
import { LineItem } from "../types";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";

export const generateLineItemsFromText = async (text: string): Promise<LineItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Extract invoice line items from the following description. 
      If quantity is not specified, assume 1.
      If price is not specified, estimate a reasonable professional rate or set to 0.
      
      Description: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              price: { type: Type.NUMBER }
            },
            required: ["description", "quantity", "price"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const rawItems = JSON.parse(jsonText);
    
    // Add IDs to items
    return rawItems.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    }));

  } catch (error) {
    console.error("Error generating line items:", error);
    throw error;
  }
};

export const analyzeFinancials = async (invoiceSummary: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `You are a financial analyst. specificially analyze this invoice data summary and give 3 short, punchy, actionable insights for the business owner to improve cash flow or business health. Keep it under 100 words total.
      
      Data: ${invoiceSummary}`,
    });
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Error analyzing financials:", error);
    return "AI service temporarily unavailable.";
  }
};
