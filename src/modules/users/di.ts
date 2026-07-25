import { PrismaUserRepository } from './infrastructure/PrismaUserRepository';
import { CreateUserHandler } from './handlers/CreateUserHandler';
import { UpdateProfileHandler } from './handlers/UpdateProfileHandler';
import { initUserProjections } from './projections/UserProjectionHandler';

export const userRepository = new PrismaUserRepository();
export const createUserHandler = new CreateUserHandler();
export const updateProfileHandler = new UpdateProfileHandler();

// Projections initialized here will only run once due to Singleton behavior
// of exported functions if they guard against multiple registrations,
// but the worker route already calls them.
