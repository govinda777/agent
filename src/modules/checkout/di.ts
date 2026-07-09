import { StartCheckoutHandler } from './handlers/StartCheckoutHandler';
import { initCheckoutProjections } from './projections/CheckoutProjectionHandler';

export const startCheckoutHandler = new StartCheckoutHandler();

// Initialize projections
initCheckoutProjections();
