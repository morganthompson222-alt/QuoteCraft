export type PriceService = { name: string; category: string; unit: string; charge: number; cost: number };
export type PriceOverhead = { name: string; amount: number; per: "job" | "hour" };
export type PriceTask = { task: string; quantity: number; unit: string };
export type PriceResult = {
  status: "success" | "missing";
  items: Array<{
    task: string; serviceName: string; category: string; unit: string;
    quantity: number; unitCharge: number; unitCost: number;
    totalCharge: number; totalCost: number; profit: number;
    marginPct: number;
  }>;
  overheads: Array<{ name: string; amount: number }>;
  totalCharge: number;
  totalCost: number;
  totalOverheads: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  totalProfit: number;
  currency: string;
  missingItem?: string;
};

export function calculateFromCatalogue(
  tasks: PriceTask[],
  services: PriceService[],
  overheads: PriceOverhead[],
  taxRate: number,
): PriceResult {
  const items: PriceResult["items"] = [];
  let totalCharge = 0;
  let totalCost = 0;

  for (const { task, quantity } of tasks) {
    const lower = task.toLowerCase();
    // Match by name or category
    const match = services.find(s =>
      s.name.toLowerCase() === lower ||
      s.category.toLowerCase() === lower ||
      lower.includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(lower)
    );

    if (!match) {
      return {
        status: "missing",
        items: [],
        overheads: [],
        totalCharge: 0, totalCost: 0, totalOverheads: 0,
        subtotal: 0, taxRate, taxAmount: 0, grandTotal: 0,
        totalProfit: 0, currency: "GBP",
        missingItem: task,
      };
    }

    const unitCharge = match.charge;
    const unitCost = match.cost;
    const totalServiceCharge = quantity * unitCharge;
    const totalServiceCost = quantity * unitCost;
    const profit = totalServiceCharge - totalServiceCost;
    const marginPct = totalServiceCharge > 0 ? Math.round((profit / totalServiceCharge) * 10000) / 100 : 0;

    items.push({
      task, serviceName: match.name, category: match.category,
      unit: match.unit, quantity, unitCharge, unitCost,
      totalCharge: Math.round(totalServiceCharge * 100) / 100,
      totalCost: Math.round(totalServiceCost * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      marginPct,
    });

    totalCharge += totalServiceCharge;
    totalCost += totalServiceCost;
  }

  // Apply overheads
  const totalOverheads: PriceResult["overheads"] = overheads.map(o => ({
    name: o.name,
    amount: o.amount,
  }));
  const totalOverheadCost = overheads.reduce((s, o) => s + o.amount, 0);

  const subtotal = totalCharge;
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;
  const totalProfit = totalCharge - totalCost - totalOverheadCost;

  return {
    status: "success",
    items,
    overheads: totalOverheads,
    totalCharge: Math.round(totalCharge * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    totalOverheads: Math.round(totalOverheadCost * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    currency: "GBP",
  };
}

export function parseJobIntoTasks(input: string): PriceTask[] {
  const tasks: PriceTask[] = [];
  const segments = input.split(/[,;.]\s*/);
  for (const seg of segments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;
    const areaMatch = trimmed.match(/(\d+(?:[.,]\d+)?)\s*(?:x|×|by)\s*(\d+(?:[.,]\d+)?)/);
    if (areaMatch) {
      const qty = parseFloat(areaMatch[1]) * parseFloat(areaMatch[2]);
      const desc = trimmed.replace(/[0-9x×.,]+/g, "").replace(/\s{2,}/g, " ").trim();
      tasks.push({ task: desc || "work", quantity: qty, unit: "sqm" });
      continue;
    }
    const numMatch = trimmed.match(/(\d+(?:[.,]\d+)?)/);
    const qty = numMatch ? parseFloat(numMatch[1]) : 1;
    const desc = trimmed.replace(/[0-9.,x×]+/g, "").replace(/\s{2,}/g, " ").trim();
    tasks.push({ task: desc || "work", quantity: qty, unit: "unit" });
  }
  return tasks;
}

export function parseServicesFromProfile(raw: string): PriceService[] {
  return raw.split("\n").filter(l => l.trim()).map(line => {
    const parts = line.split("|");
    return {
      name: parts[0]?.trim() ?? "",
      category: parts[1]?.trim() ?? "",
      unit: parts[2]?.trim() ?? "job",
      charge: parseFloat(parts[3]) || 0,
      cost: parseFloat(parts[4]) || 0,
    };
  }).filter(s => s.name && s.charge > 0);
}
