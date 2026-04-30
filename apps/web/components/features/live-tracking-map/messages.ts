/**
 * LiveTrackingMap i18n messages (S06 T6.07).
 *
 * Co-located typed dict — `next-intl` bootstrap'idan keyin JSON ga
 * ko'chiriladi. Kalit shakli `order.tracking.<key>`.
 */
import type { SupportedLocale } from '@/lib/format/duration';

export interface MapMessages {
  connectionLost: string;
  connectionLostHint: string;
  retry: string;
  loadingMap: string;
  proLabel: string;
  clientLabel: string;
}

export const MESSAGES: Record<SupportedLocale, MapMessages> = {
  uz: {
    connectionLost: "Aloqa yo'qoldi",
    connectionLostHint: 'oxirgi yangilanishdan',
    retry: 'Qayta urinish',
    loadingMap: 'Xarita yuklanmoqda...',
    proLabel: 'Usta',
    clientLabel: 'Mijoz',
  },
  ru: {
    connectionLost: 'Связь потеряна',
    connectionLostHint: 'с последнего обновления',
    retry: 'Повторить',
    loadingMap: 'Карта загружается...',
    proLabel: 'Мастер',
    clientLabel: 'Клиент',
  },
  en: {
    connectionLost: 'Connection lost',
    connectionLostHint: 'since last update',
    retry: 'Retry',
    loadingMap: 'Loading map...',
    proLabel: 'Pro',
    clientLabel: 'Client',
  },
};
