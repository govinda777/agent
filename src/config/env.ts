export const env = {
  // Public
  stripeProPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID as string,
  stripeConsultingPriceId: process.env.NEXT_PUBLIC_STRIPE_CONSULTING_PRICE_ID as string,
  privyAppIdPublic: process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
  freePlanMaxAgents: Number(process.env.NEXT_PUBLIC_FREE_PLAN_MAX_AGENTS),
  freePlanChannels: process.env.NEXT_PUBLIC_FREE_PLAN_CHANNELS as string,

  // Private
  privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
  privyAppSecret: process.env.PRIVY_APP_SECRET as string,
  encryptionKey: process.env.ENCRYPTION_KEY as string,
  n8nAuthToken: process.env.N8N_AUTH_TOKEN as string,
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL as string,
  freePlanTrialDays: Number(process.env.FREE_PLAN_TRIAL_DAYS),
  freePlanMaxExecutions: Number(process.env.FREE_PLAN_MAX_EXECUTIONS),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY as string,
  nodeEnv: process.env.NODE_ENV as string,
};
