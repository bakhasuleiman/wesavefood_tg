import crypto from 'crypto';
import { TELEGRAM_CONFIG } from './config';

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function validateTelegramAuth(authData: TelegramAuthData): boolean {
  const { hash, ...data } = authData;
  
  // Проверяем срок действия auth_date (24 часа)
  const authTimestamp = data.auth_date;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (currentTimestamp - authTimestamp > 86400) {
    return false;
  }

  // Создаем data_check_string
  const dataCheckArr = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`);
  const dataCheckString = dataCheckArr.join('\n');

  // Создаем secret_key из токена бота
  const secretKey = crypto
    .createHash('sha256')
    .update(TELEGRAM_CONFIG.BOT_TOKEN)
    .digest();

  // Создаем HMAC-SHA256
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return hmac === hash;
}

export function createTelegramLoginWidget(elementId: string): string {
  const { WIDGET_CONFIG, BOT_USERNAME, DOMAIN } = TELEGRAM_CONFIG;
  
  return `
    <script async src="https://telegram.org/js/telegram-widget.js?22"
      data-telegram-login="${BOT_USERNAME}"
      data-size="${WIDGET_CONFIG.size}"
      data-radius="${WIDGET_CONFIG.cornerRadius}"
      data-auth-url="${DOMAIN}/api/auth/telegram/callback"
      data-request-access="${WIDGET_CONFIG.requestAccess}"
      ${WIDGET_CONFIG.showPhoto ? 'data-userpic="true"' : ''}
    ></script>
  `;
} 