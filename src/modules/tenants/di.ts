import { CreateTenantHandler } from './handlers/CreateTenantHandler';
import { initTenantProjections } from './projections/TenantProjectionHandler';
import { PrismaTenantRepository } from './infrastructure/PrismaTenantRepository';

export const createTenantHandler = new CreateTenantHandler();
export const tenantRepository = new PrismaTenantRepository();

// Initialize projections once at application start
initTenantProjections();
