import { GoogleGenAI, Type } from "@google/genai";
import { SubscriptionFormData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractSubscriptionFromImage(base64Image: string, mimeType: string): Promise<Partial<SubscriptionFormData>> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          }
        },
        {
          text: "Extract the software subscription details from this screenshot. Return a JSON object. If a field is not found, leave it as an empty string."
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Software or application name" },
            websiteUrl: { type: Type.STRING, description: "Official website link, or 'mobile app' if it appears to be a mobile app only" },
            plan: { type: Type.STRING, description: "Current subscription plan name (e.g., Pro, Premium, Basic)" },
            amount: { type: Type.STRING, description: "The specific price/amount and billing cycle (e.g., $40/month, $15.99/mo, €100/year)" },
            expirationDate: { type: Type.STRING, description: "Expiration or next renewal date (format as YYYY-MM-DD if possible)" },
            cancellationUrl: { type: Type.STRING, description: "Cancellation link if visible, otherwise empty" }
          },
          required: ["name", "websiteUrl", "plan", "amount", "expirationDate", "cancellationUrl"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Partial<SubscriptionFormData>;
    }
    return {};
  } catch (error) {
    console.error("Error extracting subscription from image:", error);
    throw new Error("Failed to analyze image. Please try again or enter manually.");
  }
}
