import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyCHK_9m7dwti-kYYWmr-ciR-Kp9_QTgvOc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function makeGeminiRequest(prompt: string) {
  try {
    const response = await axios({
      url: `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
    });

    const text = response.data.candidates[0].content.parts[0].text;
    console.log(text)
    try {
      const cleanString = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanString);
    } catch {
      // If JSON parsing fails, return the text as content
      const cleanCode = text
        .replace(/```solidity|```/g, "")
        .replace(/```/g, "")
        .trim();
      
      return {
        content: cleanCode,
        success: true
      };
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function querySecurityAudit(code: string, language: string) {
  const prompt = `Analyze this ${language} code for security issues. Return a JSON array of security issues with these fields:
  - id: string (unique identifier)
  - severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  - title: string
  - description: string
  - lineNumber: number (if applicable)
  - recommendation: string
  - category: string

  Code to analyze:
  ${code}`;

  return makeGeminiRequest(prompt);
}

export async function queryCodeSuggestions(code: string, language: string) {
  const prompt = `Analyze this ${language} code and provide improvement suggestions. Return a JSON array of suggestions with these fields:
  - id: string (unique identifier)
  - type: 'optimization' | 'best-practice' | 'security' | 'maintainability'
  - title: string
  - description: string
  - codeExample: string (if applicable)
  - impact: 'high' | 'medium' | 'low'

  Code to analyze:
  ${code}`;

  return makeGeminiRequest(prompt);
}

export async function queryCodeAnalytics(code: string, language: string) {
  const prompt = `Analyze this ${language} code and provide detailed metrics. Return a JSON object with these fields:
  {
    "complexity": {
      "cyclomatic": number,
      "cognitive": number,
      "score": "excellent" | "good" | "moderate" | "complex" | "very-complex"
    },
    "codeQuality": {
      "maintainability": number (0-100),
      "readability": number (0-100),
      "testability": number (0-100)
    },
    "metrics": {
      "linesOfCode": number,
      "functions": number,
      "variables": number,
      "comments": number,
      "commentRatio": number
    }${language === 'solidity' ? ',\n    "gasOptimization": {\n      "estimatedGas": number,\n      "optimizationPotential": number,\n      "suggestions": string[]\n    }' : ''}
  }

  Code to analyze:
  ${code}`;

  return makeGeminiRequest(prompt);
}