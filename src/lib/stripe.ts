// ============================================================================
// 💳 BeatMarket — Configuration Stripe
// ============================================================================

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY manquant dans les variables d\'environnement');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
  typescript: true,
});

/**
 * Calcule la commission plateforme
 * @param amountCents - Montant en centimes
 * @returns Commission en centimes
 */
export function calculatePlatformFee(amountCents: number): number {
  const rate = parseFloat(process.env.PLATFORM_COMMISSION_RATE || '0.15');
  return Math.round(amountCents * rate);
}

/**
 * Crée une session Stripe Checkout pour l'achat de beats
 */
export async function createCheckoutSession({
  items,
  buyerEmail,
  buyerCountry,
  successUrl,
  cancelUrl,
}: {
  items: Array<{
    trackTitle: string;
    licenseType: string;
    price: number; // centimes
    producerStripeConnectId: string;
  }>;
  buyerEmail: string;
  buyerCountry: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    (item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.trackTitle,
          description: `Licence ${item.licenseType}`,
        },
        unit_amount: item.price,
      },
      quantity: 1,
    })
  );

  // Calculer le montant total de commission
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
  const platformFee = calculatePlatformFee(totalAmount);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: buyerEmail,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    // TVA automatique via Stripe Tax
    automatic_tax: {
      enabled: true,
    },
    // Métadonnées pour le webhook
    metadata: {
      buyerCountry,
      platformFee: platformFee.toString(),
      itemsJson: JSON.stringify(
        items.map((i) => ({
          title: i.trackTitle,
          license: i.licenseType,
          price: i.price,
        }))
      ),
    },
    // Split payment via Stripe Connect
    payment_intent_data: {
      // Le transfert sera fait après confirmation dans le webhook
      metadata: {
        platformFee: platformFee.toString(),
      },
    },
  });

  return session;
}

/**
 * Crée un compte Stripe Connect pour un producteur
 */
export async function createConnectAccount(
  email: string,
  country: string = 'FR'
): Promise<Stripe.Account> {
  return stripe.accounts.create({
    type: 'express',
    country,
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata: {
      platform: 'beatmarket',
    },
  });
}

/**
 * Génère un lien d'onboarding Stripe Connect
 */
export async function createConnectOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<string> {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: 'account_onboarding',
  });

  return accountLink.url;
}

/**
 * Transfère les fonds au producteur via Stripe Connect
 */
export async function transferToProducer(
  amountCents: number,
  destinationAccountId: string,
  orderId: string
): Promise<Stripe.Transfer> {
  return stripe.transfers.create({
    amount: amountCents,
    currency: 'eur',
    destination: destinationAccountId,
    metadata: {
      orderId,
      platform: 'beatmarket',
    },
  });
}
