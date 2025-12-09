import axios from 'axios';
import { env } from '$env/dynamic/private';

interface TelegramMessageParams {
  text: string;
  chat_id: string;
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  error_code?: number;
  description?: string;
}

// Helper function to slugify text (same as CompetitionCard)
const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export class TelegramAPI {
  private static readonly BASE_URL = 'https://api.telegram.org';
  private static readonly TOKEN = env.TELEGRAM_MJUR_TOKEN || '';
  private static readonly CHANNEL = "@maujuara";
  private static readonly HOST = env.PUBLIC_HOST || 'https://maujuara.com';

  /**
   * Send message to Telegram channel
   */
  static async sendMessage(message: string): Promise<TelegramResponse> {
    if (!this.TOKEN || !this.CHANNEL) {
      console.error('Telegram credentials not configured');
      throw new Error('Telegram credentials not configured');
    }

    const url = `${this.BASE_URL}/bot${this.TOKEN}/sendMessage`;
    
    const payload: TelegramMessageParams = {
      text: message,
      chat_id: this.CHANNEL,
    };

    try {
      const response = await axios.post<TelegramResponse>(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Telegram API error: ${error.response?.data?.description || error.message}`);
      }
      throw new Error('Failed to send Telegram message');
    }
  }

  /**
   * Send competition update notification
   */
  static async sendCompetitionUpdateNotification(competitionId: string, competitionTitle: string): Promise<TelegramResponse> {
    const slug = slugify(`${competitionTitle}-${competitionId}`);
    const url = `${this.HOST}/competitions/detail/${slug}`;
    
    const message = `#kompetisi #updatekompetisi

${competitionTitle}

${url}`;

    return this.sendMessage(message);
  }

  /**
   * Send new competition notification
   */
  static async sendNewCompetitionNotification(competitionId: string, competitionTitle: string): Promise<TelegramResponse> {
    const slug = slugify(`${competitionTitle}-${competitionId}`);
    const url = `${this.HOST}/competitions/detail/${slug}`;
    
    const message = `#kompetisi #kompetisibaru

${competitionTitle}

${url}`;

    return this.sendMessage(message);
  }
}

export default TelegramAPI;
