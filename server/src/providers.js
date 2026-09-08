import Groq from "groq-sdk";
import Anthropic from "@anthropic-ai/sdk";

// Model registry. Keys are "<provider>:<model>" so the UI can offer one flat
// list while routing to the right SDK underneath.
export const MODELS = {
  "groq:openai/gpt-oss-120b": { provider: "groq", model: "openai/gpt-oss-120b", label: "Groq GPT-OSS 120B — fast, free (recommended)" },
  "groq:openai/gpt-oss-20b": { provider: "groq", model: "openai/gpt-oss-20b", label: "Groq GPT-OSS 20B — fastest, free" },
  "anthropic:claude-sonnet-5": { provider: "anthropic", model: "claude-sonnet-5", label: "Claude Sonnet 5 — best quality" },
  "anthropic:claude-opus-5": { provider: "anthropic", model: "claude-opus-5", label: "Claude Opus 5 — max quality, slower" },
};

export function availableModels() {
  const out = {};
  for (const [key, def] of Object.entries(MODELS)) {
    if (def.provider === "anthropic" && !process.env.ANTHROPIC_API_KEY) continue;
    if (def.provider === "groq" && !process.env.GROQ_API_KEY) continue;
    out[key] = def.label;
  }
  return out;
}

export function defaultModelKey() {
  const available = availableModels();
  return (
    Object.keys(available).find((k) => k.startsWith("groq:")) ||
    Object.keys(available)[0] ||
    null
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const groqClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });
const anthropicClient = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function callGroq(prompt, model) {
  const response = await groqClient().chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4096,
    temperature: 0.3,
  });
  return response.choices[0].message.content;
}

async function callAnthropic(prompt, model) {
  const response = await anthropicClient().messages.create({
    model,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}

// Friendly, specific errors instead of raw SDK exceptions bubbling to the client.
export async function generate(prompt, modelKey, maxRetries = 3) {
  const def = MODELS[modelKey];
  if (!def) throw new Error(`Unknown model "${modelKey}".`);

  let lastErr;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (def.provider === "anthropic") return await callAnthropic(prompt, def.model);
      return await callGroq(prompt, def.model);
    } catch (err) {
      const status = err?.status;
      if (status === 401) {
        const envVar = def.provider === "anthropic" ? "ANTHROPIC_API_KEY" : "GROQ_API_KEY";
        throw new Error(`Invalid ${def.provider} API key. Check ${envVar} in server/.env.`);
      }
      lastErr = err;
      if (attempt < maxRetries - 1) {
        await sleep(Math.min(2 ** attempt * 1000, 8000));
        continue;
      }
      if (status === 429) {
        throw new Error(`${def.provider} rate limit reached. Wait a minute, or switch models.`);
      }
      throw new Error(`AI provider error: ${err.message || err}`);
    }
  }
  throw new Error(`AI provider error: ${lastErr?.message || lastErr}`);
}
