/**
 * Optional hook for region-specific payment providers.
 * Keep this as a fallback integration point if billing providers change.
 */
export type LocalPaymentIntent = {
  provider: string;
  amountCents: number;
  currency: string;
};

export async function createLocalPaymentIntent(
  intent: LocalPaymentIntent,
): Promise<{ url: string } | null> {
  void intent;
  return null;
}
