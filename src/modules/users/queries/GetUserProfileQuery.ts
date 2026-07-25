import { IQuery } from '@/lib/cqrs/types';
import { userRepository } from '../di';
import { User } from '@prisma/client';

export class GetUserProfileQuery implements IQuery<User | null> {
  async execute(userId: string): Promise<User | null> {
    return userRepository.findById(userId);
  }
}

export const getUserProfileQuery = new GetUserProfileQuery();
