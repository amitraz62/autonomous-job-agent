import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || 'demo_key';
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Layer 4 & Layer 10: Native JS AI Matching & Localization Engine.
 * Calculates composite fit score and generates dynamic cover letter keywords.
 */
export async function evaluateJobFit(jobTitle, jobDescription, candidateProfile) {
  const prompt = `
You are an expert ATS recruitment evaluation engine.
Analyze the following job description against the candidate profile.

Candidate Profile:
${JSON.stringify(candidateProfile, null, 2)}

Target Job:
Title: ${jobTitle}
Description:
${jobDescription.substring(0, 3000)}

Requirements:
1. Provide a numerical matchScore from 0 to 100.
2. If matchScore is under 70, action is 'SKIP'. If 70 or above, action is 'PROCEED'.
3. Extract 3-5 top matching keywords to highlight in dynamic application notes.
4. Detect required currency/salary range if mentioned.

Respond STRICTLY with valid JSON format:
{
  "matchScore": 85,
  "action": "PROCEED",
  "reason": "Direct match for Java 21, Spring Boot, REST APIs, and microservices.",
  "tailoredKeywords": ["Spring Boot", "JDK 21", "Redis", "Distributed Systems"],
  "currencyDetected": "INR"
}
`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text().trim());
    return parsed;
  } catch (error) {
    console.error('AI Matching evaluation fallback triggered:', error.message);
    // Safe programmatic fallback
    const titleMatch = jobTitle.toLowerCase().includes('java') || jobTitle.toLowerCase().includes('spring') || jobTitle.toLowerCase().includes('backend');
    return {
      matchScore: titleMatch ? 75 : 50,
      action: titleMatch ? 'PROCEED' : 'SKIP',
      reason: titleMatch ? 'Rule-based heuristic match for Java/Backend title.' : 'Match score below 70 threshold.',
      tailoredKeywords: ['Java', 'Spring Boot', 'Backend'],
      currencyDetected: 'INR'
    };
  }
}
