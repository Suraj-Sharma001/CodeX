import mongoose from "mongoose";
import { IProblem, Problem } from "../models/Problem.js";
import { logger } from "../utils/logger.js";

function buildProblemContext(p: IProblem): string {
  const parts: string[] = [
    `Title: ${p.title}`,
    `Platform: ${p.platform}, Difficulty: ${p.difficulty}, Topics: ${p.topics.join(", ")}`,
  ];
  if (p.keyIntuition) parts.push(`Key intuition: ${p.keyIntuition}`);
  if (p.approaches?.bruteForceSolution) {
    parts.push(
      `Brute force: ${p.approaches.bruteForceSolution.description} (T: ${p.approaches.bruteForceSolution.timeComplexity}, S: ${p.approaches.bruteForceSolution.spaceComplexity})`
    );
  }
  if (p.approaches?.optimizedSolution) {
    parts.push(
      `Optimized: ${p.approaches.optimizedSolution.description} (T: ${p.approaches.optimizedSolution.timeComplexity}, S: ${p.approaches.optimizedSolution.spaceComplexity})`
    );
  }
  if (p.mistakesMade?.length) {
    parts.push(`Mistakes: ${p.mistakesMade.join("; ")}`);
  }
  if (p.edgeCases?.length) {
    parts.push(`Edge cases noted: ${p.edgeCases.join("; ")}`);
  }
  if (p.notes) parts.push(`Notes: ${p.notes}`);
  if (p.codeSnippets?.length) {
    p.codeSnippets.forEach((s) => {
      parts.push(`\n[${s.language}]\n${s.code.slice(0, 8000)}`);
    });
  }
  return parts.join("\n\n");
}

// Google Gemini API
async function geminiChat(system: string, user: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Google Gemini is not configured. Set GOOGLE_GEMINI_API_KEY in the server environment."
    );
  }

  const fullPrompt = `${system}\n\nUser: ${user}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 2500,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    logger.error(`Google Gemini API error: ${res.status} ${errText}`);
    throw new Error("AI request failed");
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new Error("Empty AI response");
  }
  return text;
}

// OpenAI API
async function openaiChat(system: string, user: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      "OpenAI is not configured. Set OPENAI_API_KEY in the server environment."
    );
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.25,
      max_tokens: 2500,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    logger.error(`OpenAI API error: ${res.status} ${errText}`);
    throw new Error("AI request failed");
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Empty AI response");
  }
  return text;
}

// Route to appropriate AI provider
async function aiChat(system: string, user: string): Promise<string> {
  const provider = process.env.AI_PROVIDER || "openai";
  
  if (provider === "gemini") {
    return geminiChat(system, user);
  }
  return openaiChat(system, user);
}

async function loadProblem(userId: string, problemId: string): Promise<IProblem> {
  const problem = await Problem.findOne({
    _id: problemId,
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!problem) {
    throw new Error("Problem not found");
  }
  return problem;
}

class AiService {
  async summarizeApproach(userId: string, problemId: string): Promise<string> {
    const p = await loadProblem(userId, problemId);
    const ctx = buildProblemContext(p);
    return aiChat(
      "You are an interview coach. Produce a concise bullet summary of the solution approach (brute force vs optimal), key patterns, and complexity. Under 200 words.",
      ctx
    );
  }

  async approachToCode(userId: string, problemId: string, language: string) {
    const p = await loadProblem(userId, problemId);
    const ctx = buildProblemContext(p);
    const lang = language || "typescript";
    return aiChat(
      `You output only clean ${lang} code for the optimized solution, with minimal comments. No markdown fences unless needed.`,
      `${ctx}\n\nImplement the optimized solution in ${lang}.`
    );
  }

  async suggestImprovements(userId: string, problemId: string): Promise<string> {
    const p = await loadProblem(userId, problemId);
    const ctx = buildProblemContext(p);
    return aiChat(
      "Critique the documented solution: naming, complexity, edge handling, and readability. Bullet list, actionable, interview-focused.",
      ctx
    );
  }

  async interviewExplain(userId: string, problemId: string): Promise<string> {
    const p = await loadProblem(userId, problemId);
    const ctx = buildProblemContext(p);
    return aiChat(
      "Explain how you would walk through this problem in a live interview: clarify requirements, propose brute force, optimize, discuss tradeoffs. Conversational but structured.",
      ctx
    );
  }

  async missingEdgeCases(userId: string, problemId: string): Promise<string> {
    const p = await loadProblem(userId, problemId);
    const ctx = buildProblemContext(p);
    return aiChat(
      "List likely missing or tricky edge cases for this problem that candidates forget. Short bullets; mention stress scenarios.",
      ctx
    );
  }
}

export const aiService = new AiService();
