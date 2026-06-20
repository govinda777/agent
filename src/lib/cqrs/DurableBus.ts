import { Client } from "@upstash/qstash";
import { IEvent } from "./types";

/**
 * DURABLE BUS (MENSAGERIA RESILIENTE 2026)
 *
 * Utiliza o Upstash QStash em produção e um simulador local em desenvolvimento.
 */
class DurableBus {
  private client: Client | null = null;
  private isDev = process.env.NODE_ENV === 'development';

  constructor() {
    if (!this.isDev) {
      this.client = new Client({
        token: process.env.QSTASH_TOKEN || "",
      });
    }
  }

  async publish(event: IEvent) {
    if (this.isDev) {
      return this.publishLocal(event);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = `${appUrl}/api/webhooks/projections`;

    try {
      await this.client?.publishJSON({
        url: webhookUrl,
        body: event,
      });
    } catch (error) {
      console.error(`[DurableBus] QStash publish failed:`, error);
    }
  }

  private async publishLocal(event: IEvent) {
    const simulatorUrl = 'http://localhost:8080';
    console.log(`[DurableBus-Dev] Dispatching to Local Simulator...`);

    try {
      await fetch(simulatorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn(`[DurableBus-Dev] Simulator not found at ${simulatorUrl}. Is 'task worker' running?`);
    }
  }
}

export const durableBus = new DurableBus();
