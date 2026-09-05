import Groq from "groq-sdk";

export const MODELS = {
  "openai/gpt-oss-120b": "GPT-OSS 120B — best quality (recommended)",
  "openai/gpt-oss-20b": "GPT-OSS 20B — fastest",
};

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Friendly, specific errors instead of raw SDK exceptions bubbling to the client.
export async function generate(prompt, model, maxRetries = 3) {
  let lastErr;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
        temperature: 0.3,
      });
      return response.choices[0].message.content;
    } catch (err) {
      const status = err?.status;
      if (status === 401) {
        throw new Error("Invalid Groq API key. Check the GROQ_API_KEY in server/.env.");
      }
      lastErr = err;
      if (attempt < maxRetries - 1) {
        await sleep(Math.min(2 ** attempt * 1000, 8000));
        continue;
      }
      if (status === 429) {
        throw new Error("Groq rate limit reached. Wait a minute, or switch models.");
      }
      throw new Error(`AI provider error: ${err.message || err}`);
    }
  }
  throw new Error(`AI provider error: ${lastErr?.message || lastErr}`);
}
