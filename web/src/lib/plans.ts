export type PlanSlug = "basic" | "pro" | "agency";

export const PLANS: Record<
  PlanSlug,
  {
    name: string;
    description: string;
    monthlyLimit: number;
    priceUsd: number;
    features: string[];
    dbPlan: "BASIC" | "PRO" | "AGENCY";
  }
> = {
  basic: {
    name: "Basic",
    description: "Free plan for testing and light usage.",
    monthlyLimit: 5,
    priceUsd: 0,
    features: [
      "5 AI requests / month",
      "Real AI description generation",
      "Limited feature access",
      "Upgrade anytime",
    ],
    dbPlan: "BASIC",
  },
  pro: {
    name: "Pro",
    description: "For growth teams that need higher limits and full access.",
    monthlyLimit: 2000,
    priceUsd: 20,
    features: [
      "2,000 AI requests / month",
      "Full feature access",
      "Priority support",
      "Faster billing support",
    ],
    dbPlan: "PRO",
  },
  agency: {
    name: "Agency",
    description: "For agencies and multi-user teams managing clients at scale.",
    monthlyLimit: 10000,
    priceUsd: 39,
    features: [
      "Highest AI request limits",
      "Team and multi-user support",
      "Full platform access",
      "Priority agency support",
    ],
    dbPlan: "AGENCY",
  },
};

export function isPaidPlan(slug: PlanSlug): slug is "pro" | "agency" {
  return slug === "pro" || slug === "agency";
}

export function limitForPlan(slug: PlanSlug): number {
  return PLANS[slug].monthlyLimit;
}
