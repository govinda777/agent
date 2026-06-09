export interface Agent {
  id: string;
  name: string;
  n8nWebhookUrl: string;
  n8nAuthToken: string; // Pode estar criptografado dependendo do contexto
  channels: {
    web: boolean;
    whatsapp: boolean;
    instagram: boolean;
  };
  createdAt: string;
}
