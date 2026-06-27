import { CreateTenantHandler } from './handlers/CreateTenantHandler';
import { initTenantProjections } from './projections/TenantProjectionHandler';

export const createTenantHandler = new CreateTenantHandler();

// Initialize projections once at application start
initTenantProjections();
