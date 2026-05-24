import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, InsightRequest, InsightResponse } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Provider abstraction
// ─────────────────────────────────────────────────────────────────────────────
const PROVIDER = process.env.AI_PROVIDER ?? "gemini";
const MODEL = process.env.AI_MODEL ?? "gemini-2.0-flash";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─────────────────────────────────────────────────────────────────────────────
// Core completion function
// ─────────────────────────────────────────────────────────────────────────────
export async function complete(
  messages: { role: "user" | "assistant"; content: string }[],
  systemPrompt: string,
  maxTokens = 1500
): Promise<string> {
  if (PROVIDER === "anthropic") {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    });
    return response.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { type: "text"; text: string }).text)
      .join("");
  }

  // Fallback: OpenAI-compatible
  if (PROVIDER === "openai") {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: maxTokens,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });
    return res.choices[0]?.message?.content ?? "";
  }

  // Fallback: Gemini
  if (PROVIDER === "gemini") {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: MODEL });
    
    let prompt = `${systemPrompt}\n\n`;
    for (const msg of messages) {
      prompt += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
    }
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  throw new Error(`Unsupported AI provider: ${PROVIDER}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Insight generation
// ─────────────────────────────────────────────────────────────────────────────
const INSIGHT_SYSTEM = `You are DataPulse AI, an expert revenue analytics assistant embedded in a SaaS analytics platform.
Your task is to analyze sales data and produce clear, concise, actionable insights for business leaders.
Guidelines:
- Use specific numbers and percentages from the data
- Identify trends, anomalies, and opportunities
- Keep responses structured with clear sections
- Use markdown formatting: **bold** for key metrics, ## for section headers, - for bullet lists
- Be direct and business-focused — no fluff
- Always end with 2-3 concrete recommendations`;

const INSIGHT_PROMPTS: Record<string, (req: InsightRequest) => string> = {
  executive: (req) => {
    const ds = req.data
      .slice(-6)
      .map(
        (d) =>
          `${d.month ?? d.date}: Revenue $${(d.revenue ?? 0).toLocaleString()}, Sales ${d.sales ?? 0}, Orders ${d.orders ?? 0}, Profit $${(d.profit ?? 0).toLocaleString()}`
      )
      .join("\n");
    const ps = (req.products ?? [])
      .map((p) => `${p.name}: $${p.revenue.toLocaleString()}, growth ${p.growth}%`)
      .join("\n");
    const totalRev = req.data.reduce((s, d) => s + (d.revenue ?? 0), 0);
    const totalProfit = req.data.reduce((s, d) => s + (d.profit ?? 0), 0);
    return `Analyze this sales performance data and write a comprehensive executive summary:\n\n**Last 6 Months:**\n${ds}\n\n**Top Products:**\n${ps}\n\n**Totals:** Revenue $${totalRev.toLocaleString()}, Profit Margin ${totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : 0}%\n\nProvide 4 sections: 1) Overall Performance, 2) Growth Drivers, 3) Areas of Concern, 4) Strategic Recommendations.`;
  },
  trends: (req) => {
    const ds = req.data
      .map((d) => `${d.month ?? d.date}: $${(d.revenue ?? 0).toLocaleString()}`)
      .join(", ");
    return `Perform a deep trend analysis on this monthly revenue data:\n${ds}\n\nAnalyze: 1) Primary growth trend and velocity 2) Seasonal patterns 3) Month-over-month acceleration/deceleration 4) Revenue inflection points 5) Predictive signals for next quarter. Include specific percentage calculations.`;
  },
  anomalies: (req) => {
    const ds = req.data
      .map((d, i) => {
        const prev = req.data[i - 1];
        const curRev = d.revenue ?? 0;
        const prevRev = prev ? (prev.revenue ?? 0) : 0;
        const chg = prev && prevRev > 0 ? ((curRev - prevRev) / prevRev * 100).toFixed(1) : "N/A";
        return `${d.month ?? d.date}: $${curRev.toLocaleString()} (${chg}% MoM)`;
      })
      .join("\n");
    return `Detect anomalies and unusual patterns in this sales data:\n${ds}\n\nFlag: 1) Revenue changes >20% MoM 2) Unusual deviation from trend 3) Potential causes for flagged months 4) Risk signals 5) Hidden opportunities. Be specific about which periods are anomalous and quantify the deviation.`;
  },
  forecast: (req) => {
    const ds = req.data
      .slice(-8)
      .map((d) => `${d.month ?? d.date}: $${(d.revenue ?? 0).toLocaleString()}`)
      .join(", ");
    const recent = req.data.slice(-3);
    const avg = recent.length > 0 ? recent.reduce((s, d) => s + (d.revenue ?? 0), 0) / recent.length : 0;
    return `Based on this historical sales data, generate a revenue forecast:\n${ds}\n\nRecent 3-month avg: $${avg.toLocaleString()}\n\nProvide: 1) Next 3-month forecast with specific numbers 2) Annual growth projection 3) Best/Base/Worst case scenarios 4) Key assumptions 5) Risk factors. Show your calculation methodology.`;
  },
  products: (req) => {
    const ps = (req.products ?? [])
      .map((p) => `${p.name}: Revenue $${p.revenue.toLocaleString()}, Units ${p.units.toLocaleString()}, Growth ${p.growth}%`)
      .join("\n");
    return `Analyze product portfolio performance:\n${ps}\n\nProvide: 1) Star products to double investment in 2) Underperformers to investigate 3) Cross-sell opportunities between products 4) Pricing strategy insights 5) Product mix optimization recommendations. Be specific about each product.`;
  },
};

export async function generateInsight(req: InsightRequest): Promise<InsightResponse> {
  const promptFn = INSIGHT_PROMPTS[req.type];
  if (!promptFn) throw new Error(`Unknown insight type: ${req.type}`);

  const prompt = promptFn(req);
  const content = await complete(
    [{ role: "user", content: prompt }],
    INSIGHT_SYSTEM,
    1500
  );

  return {
    content,
    model: MODEL,
    tokensUsed: Math.round(content.length / 4), // rough estimate
    generatedAt: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat with data
// ─────────────────────────────────────────────────────────────────────────────
export async function chatWithData(
  question: string,
  history: ChatMessage[],
  dataContext: string
): Promise<string> {
  const systemPrompt = `You are DataPulse AI, an expert data analyst assistant. You help users understand their sales data.

Available data context:
${dataContext}

Guidelines:
- Answer questions about the data precisely and concisely (2-4 sentences for simple questions)
- For complex questions, use bullet points or numbered lists
- Always reference specific numbers from the context
- If asked to forecast, extrapolate from patterns in the data
- If a question is outside the data scope, say so clearly
- Be conversational but professional`;

  const messages = [
    ...history.slice(-10).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    {
      role: "user" as const,
      content: question,
    },
  ];

  return complete(messages, systemPrompt, 800);
}
