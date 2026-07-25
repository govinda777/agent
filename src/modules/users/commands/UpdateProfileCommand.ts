import { ICommand } from '@/lib/cqrs/types';

export interface UpdateProfileCommand extends ICommand {
  userId: string;
  llmProvider?: string | null;
  llmApiKey?: string | null;
}
