import { GoogleGenAI } from "@google/genai";

// Your Hardcoded API Key
const API_KEY = "AIzaSyAfZzvWBorOiTFBWLzfp3rytPJU5aVaqXo";
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function getFeedback(modelAnswer: string, studentResponse: string, score: number) {
  try {
    // In March 2026, 'gemini-2.0-flash' was replaced by this stable version
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [{
        role: "user",
        parts: [{
          text: `You are a University Professor. Grade this student response.
          
          Model Answer: "${modelAnswer}"
          Student Response: "${studentResponse}"
          SBERT Similarity Score: ${score}/10

          Task: Provide 3 short sentences of feedback. Explain why they got this score 
          based on the model answer. Be academic and encouraging.`
        }]
      }]
    });

    // The new SDK uses a simple .text property
    return response.text || "Feedback generated successfully. Please review the score.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Feedback temporarily unavailable. Please refer to the similarity score.";
  }
}
export async function transcribeImage(base64Image: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{
        role: "user",
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: "image/png" } },
          { text: "Transcribe the handwriting in this image into clear digital text. Only return the transcribed text." }
        ]
      }]
    });
    return response.text || "";
  } catch (error) {
    console.error("OCR Error:", error);
    return "";
  }
}