import Stripe from 'stripe';
import { env } from '@/config/env';
import { StartCheckoutHandler } from './handlers/StartCheckoutHandler';
import { ProcessCheckoutUseCase } from './useCases/ProcessCheckoutUseCase';
import { initCheckoutProjections } from './projections/CheckoutProjectionHandler';

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2023-10-16' as any,
});

const processCheckoutUseCase = new ProcessCheckoutUseCase(stripe);
export const startCheckoutHandler = new StartCheckoutHandler(processCheckoutUseCase);

// Initialize projections
initCheckoutProjections();
