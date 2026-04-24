type GroqMessage = {
  role: "system" | "user";
  content: string;
};

function hashString(input: string): number {
  // Fast deterministic hash for stable mock output.
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length]!;
}

function titleCase(s: string) {
  return s
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function getGroqApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing for generation");
  }
  return apiKey;
}

async function generateWithGroq(messages: GroqMessage[]): Promise<string> {
  const apiKey = getGroqApiKey();
  const model = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 420,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq request failed: ${err}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const output = payload.choices?.[0]?.message?.content?.trim();
  if (!output) {
    throw new Error("Groq returned an empty response");
  }
  return output;
}

function buildMockDescription(input: {
  productName?: string;
  category?: string;
  source: "text" | "image";
}): string {
  const nameRaw = (input.productName ?? "").trim();
  const categoryRaw = (input.category ?? "").trim();

  const productName = nameRaw ? titleCase(nameRaw) : "";
  const category = categoryRaw ? categoryRaw : "";

  const identity =
    productName ||
    category ||
    (input.source === "image" ? "this product" : "this item");

  const seed = hashString([productName, category, input.source].filter(Boolean).join("|"));

  const hooks = [
    "A premium, high-quality pick designed for modern users.",
    "A refined everyday essential built to look great and perform even better.",
    "A durable, well-crafted option that balances comfort, style, and reliability.",
    "A sleek, performance-minded choice that feels at home in any setup.",
    "A thoughtfully designed product that elevates your daily routine.",
  ];

  const benefits = [
    "Built with attention to detail for long-lasting durability.",
    "Optimized for smooth, consistent performance in real-world use.",
    "Designed with a clean, modern aesthetic that fits anywhere.",
    "Comfortable to use and easy to maintain over time.",
    "Made to handle day-to-day wear with confidence.",
  ];

  const specLabels = [
    "Design",
    "Materials",
    "Fit & feel",
    "Use case",
    "Care",
    "Compatibility",
  ];

  const specValues = [
    "Minimal silhouette with practical, user-friendly details",
    "Durable construction with a premium finish",
    "Comfort-forward ergonomics for all-day use",
    "Ideal for home, office, and on-the-go routines",
    "Easy to clean and maintain",
    "Works seamlessly with most common setups",
  ];

  const ctas = [
    "Add it to your cart and upgrade your everyday experience.",
    "Choose it today for a smarter, cleaner, more premium setup.",
    "Make it your new go-to — quality you can feel from day one.",
    "Bring it home and enjoy reliable performance right away.",
    "Order now and see the difference thoughtful design makes.",
  ];

  const header = productName
    ? `${productName}${category ? ` (${category})` : ""}`
    : category
      ? `${titleCase(category)}`
      : "Premium product description";

  const hintLine =
    input.source === "image"
      ? "Generated from an uploaded image with optional product hints."
      : "Generated from product name and category details.";

  const lines: string[] = [];
  lines.push(header);
  lines.push("");
  lines.push(pick(hooks, seed));
  lines.push(
    `Whether you're shopping for a ${category ? category : "reliable upgrade"}, ${identity} delivers a confident blend of durability, everyday convenience, and a sleek finish.`,
  );
  lines.push("");
  lines.push("Why you’ll love it:");
  lines.push(`- ${pick(benefits, seed, 1)}`);
  lines.push(`- ${pick(benefits, seed, 2)}`);
  lines.push(`- ${pick(benefits, seed, 3)}`);
  lines.push("");
  lines.push("Quick details:");
  lines.push(`- ${pick(specLabels, seed, 1)}: ${pick(specValues, seed, 1)}`);
  lines.push(`- ${pick(specLabels, seed, 2)}: ${pick(specValues, seed, 2)}`);
  lines.push(`- ${pick(specLabels, seed, 3)}: ${pick(specValues, seed, 3)}`);
  lines.push("");
  lines.push(pick(ctas, seed));
  lines.push("");
  // Keep a subtle trace for QA without mentioning AI/external services.
  lines.push(hintLine);

  return lines.join("\n");
}

export async function generateFromText(input: {
  productName: string;
  category?: string;
  features?: string;
  wordLimit?: number;
}): Promise<string> {
  const wordLimit = input.wordLimit ?? 120;
  const prompt = `Write a high-converting and SEO-friendly ecommerce product description.
Product name: ${input.productName}
Category: ${input.category ?? "General"}
Key product features (optional): ${input.features?.trim() || "Not provided"}
Maximum words: ${wordLimit}

Return plain text only with:
1) A short headline
2) A persuasive paragraph
3) 3 bullet benefits
4) A short CTA
5) SEO title (max 60 chars)
6) Meta description (max 155 chars)
7) SEO keywords (comma-separated)

Hard rule: keep the entire output under ${wordLimit} words.`;
  return generateWithGroq([
    {
      role: "system",
      content:
        "You are an expert ecommerce copywriter. Return plain text only, no markdown fences.",
    },
    { role: "user", content: prompt },
  ]);
}

export async function generateBasicFromTextWithGemini(input: {
  productName: string;
  category?: string;
  features?: string;
  wordLimit?: number;
}): Promise<string> {
  return generateFromText(input);
}

export async function generateFromImage(input: {
  base64: string;
  mimeType: string;
  productHint?: string;
  wordLimit?: number;
}): Promise<string> {
  const wordLimit = input.wordLimit ?? 120;
  const prompt = `You are writing ecommerce copy from product context.
${input.productHint ? `Hint: ${input.productHint}` : "Hint: product image uploaded by user."}
Maximum words: ${wordLimit}
Return plain text only with:
1) A short headline
2) A persuasive paragraph
3) 3 bullet benefits
4) A short CTA

Hard rule: keep the entire output under ${wordLimit} words.`;
  // Groq text models are used for all plans. Image bytes are accepted in API flow
  // but generation uses textual hints for consistent behavior across tiers.
  void input.base64;
  void input.mimeType;
  return generateWithGroq([
    {
      role: "system",
      content:
        "You are an expert ecommerce copywriter. Return plain text only, no markdown fences.",
    },
    { role: "user", content: prompt },
  ]);
}

export async function generateBasicFromImageWithGemini(input: {
  base64: string;
  mimeType: string;
  productHint?: string;
  wordLimit?: number;
}): Promise<string> {
  return generateFromImage(input);
}

export async function generateMockFromText(input: {
  productName: string;
  category?: string;
}): Promise<string> {
  return buildMockDescription({
    source: "text",
    productName: input.productName,
    category: input.category,
  });
}

export async function generateMockFromImage(input: {
  base64: string;
  mimeType: string;
  productHint?: string;
}): Promise<string> {
  // Keep image payload for flow parity, but deterministic output for free plan.
  void input.base64;
  void input.mimeType;
  const hint = input.productHint?.trim();
  const category =
    hint && hint.length <= 48 && /\b(jacket|shoe|bag|watch|phone|lamp|chair|shirt|hoodie|bottle|mug)\b/i.test(hint)
      ? hint
      : undefined;

  return buildMockDescription({
    source: "image",
    productName: hint && !category ? hint : undefined,
    category,
  });
}
