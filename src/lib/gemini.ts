
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Missing VITE_GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

export interface AnalysisResult {
    severity: "high" | "medium" | "low";
    conditions: string[];
    recommendation: string;
    nextSteps: string[];
    suggestedSpecialty: string;
}

export interface ChatMessage {
    role: "user" | "model";
    content: string;
}

export async function analyzeSymptoms(
    description: string,
    selectedSymptoms: string[]
): Promise<AnalysisResult> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const symptomsList = selectedSymptoms.join(", ");
    const prompt = `
    Analyze the following symptoms provided by a patient:
    Selected Common Symptoms: ${symptomsList}
    Patient Description: "${description}"

    Provide a JSON response with the following structure:
    {
      "severity": "high" | "medium" | "low",
      "conditions": ["condition1", "condition2", "condition3"],
      "recommendation": "Brief recommendation string",
      "nextSteps": ["step1", "step2", "step3"],
      "suggestedSpecialty": "Medical Specialty (e.g. Cardiologist, General Physician)"
    }
    
    Ensure the response is valid JSON. Do not include markdown code block syntax.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error analyzing symptoms:", error);
        throw new Error("Failed to analyze symptoms");
    }
}

export async function analyzeMedicalReport(
    fileFormatted: { inlineData: { data: string; mimeType: string } } | string
): Promise<AnalysisResult> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let promptParts: any[] = [
        `Analyze this medical report image or text. Extract the key findings, potential diagnosis/verdict, and recommendations.
        
        Provide a JSON response with the following structure:
        {
        "severity": "high" | "medium" | "low",
        "conditions": ["condition1", "condition2"],
        "recommendation": "Brief summary of the report verdict and advice",
        "nextSteps": ["step1", "step2"],
        "suggestedSpecialty": "Relevant Medical Specialty"
        }

        Ensure the response is valid JSON. Do not include markdown code block syntax.
        `
    ];

    if (typeof fileFormatted === 'string') {
        promptParts.push(`Report Content: ${fileFormatted}`);
    } else {
        promptParts.push(fileFormatted);
    }

    try {
        const result = await model.generateContent(promptParts);
        const response = await result.response;
        const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error analyzing medical report:", error);
        throw new Error("Failed to analyze medical report");
    }
}

export async function chatWithGemini(
    history: ChatMessage[],
    newMessage: string,
    context?: string
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Construct chat history for the model
    // Note: Gemini SDK has startChat but for stateless/simple request we can just prompt or use startChat
    // optimizing for simple stateless for now or using startChat if history is provided

    const chat = model.startChat({
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.content }]
        }))
    });

    try {
        let msgToSend = newMessage;
        if (context && history.length === 0) {
            msgToSend = `Context: ${context}\n\nUser Question: ${newMessage}`;
        }

        const result = await chat.sendMessage(msgToSend);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error in chat:", error);
        throw new Error("Failed to get response");
    }
}
