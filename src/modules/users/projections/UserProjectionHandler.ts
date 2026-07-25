import { eventBus } from '@/lib/cqrs/EventBus';
import { userRepository } from '../di';
import { IEvent } from '@/lib/cqrs/types';
import { USER_CREATED, USER_PROFILE_UPDATED } from '../events/UserEvents';

export const initUserProjections = () => {
  eventBus.subscribe(USER_CREATED, async (event: IEvent) => {
    const { userId, privyId } = event.payload;
    await userRepository.upsert(userId as string, privyId as string);
  });

  eventBus.subscribe(USER_PROFILE_UPDATED, async (event: IEvent) => {
    const { userId, llmProvider, llmApiKey } = event.payload;
    await userRepository.updateProfile(userId as string, {
        llmProvider: llmProvider as string | null,
        llmApiKey: llmApiKey as string | null,
    });
  });
};
