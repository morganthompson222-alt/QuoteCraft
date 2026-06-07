import { findMarketEntry, getMarketDataPrompt } from "./market-data";

type PricingSource = "user_rule" | "market_data" | "missing";

type BreakdownItem = {
  item: string;
  source: PricingSource;
  calculation: string;
  unitPrice: number;
  quantity: number;
  cost: number;
};

type PricingResult =
  | { status: "success"; sourceMap: Record<string, PricingSource>; breakdown: BreakdownItem[]; total: number; currency: string }
  | { status: "missing_data"; missingItem: string; message: string };

type ParsedTask = {
  task: string;
  quantity: number;
  unit: string;
};

type UserRule = {
  task: string;
  unitPrice: number;
  unit: string;
};

function parseUserRules(instructions: string): UserRule[] {
  const rules: UserRule[] = [];
  if (!instructions?.trim()) return rules;

  const lines = instructions.split(/[\n.]/);
  const patterns = [
    /(?:i\s+)?(?:charge|cost|price|rate).*?£?(\d+[.,]?\d*)\s*(?:per|a|an|\/)\s*(\w+(?:\s+\w+)?)/i,
    /(?:i\s+)?(?:charge|cost|price|rate).*?(\d+[.,]?\d*)/i,
    /£(\d+[.,]?\d*)\s*(?:per|a|an|\/)\s*(\w+(?:\s+\w+)?)/i,
    /(?:is|costs?|priced?\s+at)\s*£?(\d+[.,]?\d*)\s*(?:per|a|an|\/)?\s*(\w+(?:\s+\w+)?)?/i,
  ];

  for (const line of lines) {
    if (!line.trim()) continue;
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const unitPrice = parseFloat(match[1].replace(",", "."));
        const unit = match[2]?.trim()?.toLowerCase() ?? "unit";
        if (unitPrice > 0 && unitPrice < 10000) {
          rules.push({ task: line.trim().toLowerCase(), unitPrice, unit });
          break;
        }
      }
    }
  }
  return rules;
}

function matchUserRule(task: string, rules: UserRule[]): { unitPrice: number; unit: string } | null {
  const taskLower = task.toLowerCase();
  for (const rule of rules) {
    const ruleWords = rule.task.split(/[\s,]+/);
    const taskWords = taskLower.split(/[\s,]+/);
    const overlap = ruleWords.filter(w => taskWords.includes(w)).length;
    if (overlap >= 2 || rule.task.includes(taskLower) || taskLower.includes(rule.task)) {
      return { unitPrice: rule.unitPrice, unit: rule.unit };
    }
  }
  return null;
}

function parseUnits(taskStr: string): { quantity: number; unit: string } {
  const lower = taskStr.toLowerCase();

  const areaMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:x|×|by)\s*(\d+(?:[.,]\d+)?)/);
  if (areaMatch) {
    const w = parseFloat(areaMatch[1].replace(",", "."));
    const h = parseFloat(areaMatch[2].replace(",", "."));
    return { quantity: w * h, unit: "sqm" };
  }

  const sqmMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:sq(?:uare)?\s*(?:m(?:et(?:er|re))?)?s?|m2|m²|sq\s*m)/i);
  if (sqmMatch) return { quantity: parseFloat(sqmMatch[1].replace(",", ".")), unit: "sqm" };

  const metreMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:met(?:er|re)|m\b)/i);
  if (metreMatch) return { quantity: parseFloat(metreMatch[1].replace(",", ".")), unit: "metre" };

  const hourMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:hr|hour|hrs)/i);
  if (hourMatch) return { quantity: parseFloat(hourMatch[1].replace(",", ".")), unit: "hour" };

  const numMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:panel|window|door|room|fence|per|load|ton)/i);
  if (numMatch) {
    const unit = lower.match(/panel|window|door|room|fence|per|load|ton/i)?.[0] ?? "unit";
    return { quantity: parseFloat(numMatch[1].replace(",", ".")), unit };
  }

  return { quantity: 1, unit: "job" };
}

function parseJobIntoTasks(input: string): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  const segments = input.split(/[,;.]\s*/);

  for (const seg of segments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;
    const { quantity, unit } = parseUnits(trimmed);
    const taskText = trimmed.replace(/[0-9x×.,]+/g, "").replace(/\s{2,}/g, " ").trim();
    if (taskText) {
      tasks.push({ task: taskText, quantity, unit });
    }
  }
  return tasks;
}

export function calculateQuote(
  jobInput: string,
  userInstructions: string,
): PricingResult {
  const tasks = parseJobIntoTasks(jobInput);
  return priceStructuredTasks(tasks, userInstructions);
}

export function calculateFromAITasks(
  aiTasks: Array<{ task: string; quantity?: number; unit?: string }>,
  userInstructions: string,
): PricingResult {
  const tasks: ParsedTask[] = aiTasks.map(t => ({
    task: t.task,
    quantity: t.quantity ?? 1,
    unit: t.unit ?? "unit",
  }));
  return priceStructuredTasks(tasks, userInstructions);
}

function priceStructuredTasks(tasks: ParsedTask[], userInstructions: string): PricingResult {
  const rules = parseUserRules(userInstructions);
  const breakdown: BreakdownItem[] = [];
  const sourceMap: Record<string, PricingSource> = {};
  let total = 0;

  for (const { task, quantity } of tasks) {
    const rule = matchUserRule(task, rules);
    if (rule) {
      const cost = quantity * rule.unitPrice;
      breakdown.push({
        item: task,
        source: "user_rule",
        calculation: `${quantity} ${rule.unit} × £${rule.unitPrice}`,
        unitPrice: rule.unitPrice,
        quantity,
        cost: Math.round(cost * 100) / 100,
      });
      sourceMap[task] = "user_rule";
      total += cost;
      continue;
    }

    const market = findMarketEntry(task);
    if (market) {
      const cost = quantity * market.avgPrice;
      breakdown.push({
        item: task,
        source: "market_data",
        calculation: `${quantity} ${market.unit} × £${market.avgPrice} (UK market avg)`,
        unitPrice: market.avgPrice,
        quantity,
        cost: Math.round(cost * 100) / 100,
      });
      sourceMap[task] = "market_data";
      total += cost;
      continue;
    }

    return {
      status: "missing_data",
      missingItem: task,
      message: `No pricing rule or market data found for "${task}". Add a pricing rule in Settings.`,
    };
  }

  return {
    status: "success",
    sourceMap,
    breakdown,
    total: Math.round(total * 100) / 100,
    currency: "GBP",
  };
}

export function getPricingSystemPrompt(): string {
  return `You are a job parser for a tradesperson pricing system.

Parse the user's job description into a JSON list of structured tasks. Each task should have:
- "task": the work description (e.g. "patio cleaning")
- "quantity": number (extract from dimensions like "6x4" = 24, or explicit numbers)

Rules:
- For dimensions like "6x4 patio" or "patio 6x4", calculate area = width × height
- For "per X" items, quantity = count of items
- If no quantity specified, default to 1
- Return ONLY valid JSON array, no markdown, no explanation
- Use UK English terms

Example input: "cleaning 6x4 patio, power wash, weed removal, moss removal, resand"
Example output: [{"task":"patio cleaning","quantity":24,"unit":"sqm"},{"task":"power washing","quantity":24,"unit":"sqm"},{"task":"weed removal","quantity":24,"unit":"sqm"},{"task":"moss removal","quantity":24,"unit":"sqm"},{"task":"resanding","quantity":24,"unit":"sqm"}]`;
}

export function getPricingPrompt(userInstructions: string): string {
  let prompt = getPricingSystemPrompt();

  if (userInstructions?.trim()) {
    prompt += `\n\nUSER PRICING RULES (use ONLY these exact rates, no estimation):\n${userInstructions}`;
  }

  prompt += `\n\n${getMarketDataPrompt()}`;
  prompt += `\n\nIMPORTANT: You are ONLY parsing the job into tasks. YOU MUST NOT calculate or estimate any prices. Prices will be applied by a separate pricing engine.`;

  return prompt;
}
