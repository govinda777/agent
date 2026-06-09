import { PrivyClient } from '@privy-io/server-auth';
import { env } from '@/config/env';

const appId = env.privyAppId;
const appSecret = env.privyAppSecret;

if (!appId || !appSecret) {
  throw new Error('PRIVY_APP_ID or PRIVY_APP_SECRET is not set.');
}

export const privy = new PrivyClient(appId, appSecret);
