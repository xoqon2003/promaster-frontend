/**
 * OrderDetail i18n messages (S06 T6.09).
 *
 * Co-located typed dict — `next-intl` bootstrap'idan keyin
 * `messages/uz.json` ga ko'chiriladi. Kalit shakli `order.detail.<key>`.
 */
import type { OrderStatus } from '@/lib/db/schema/orders';
import type { SupportedLocale } from '@/lib/format/duration';

export interface OrderDetailMessages {
  back: string;
  pageTitle: string;
  proCard: { proLabel: string; defaultName: string; ratingPlaceholder: string };
  addressCard: { title: string; coordinates: string };
  priceCard: { title: string; currency: string };
  scheduledCard: { title: string; immediate: string };
  cta: {
    cancel: string;
    cancelConfirm: string;
    cancelCancel: string;
    cancelReason: string;
    chat: string;
    chatComingSoon: string;
  };
  pushBanner: {
    title: string;
    description: string;
    enable: string;
    dismiss: string;
  };
  errors: {
    cancelFailed: string;
    notFound: string;
    forbidden: string;
  };
  statusBadge: Record<OrderStatus, string>;
}

export const MESSAGES: Record<SupportedLocale, OrderDetailMessages> = {
  uz: {
    back: 'Orqaga',
    pageTitle: 'Buyurtma',
    proCard: {
      proLabel: 'Usta',
      defaultName: 'Hali tanlanmagan',
      ratingPlaceholder: '—',
    },
    addressCard: {
      title: 'Manzil',
      coordinates: 'Koordinatalar',
    },
    priceCard: {
      title: 'Narx',
      currency: "so'm",
    },
    scheduledCard: {
      title: 'Vaqt',
      immediate: 'Iloji boricha tezroq',
    },
    cta: {
      cancel: 'Bekor qilish',
      cancelConfirm: 'Tasdiqlayman',
      cancelCancel: "Yo'q, qaytaman",
      cancelReason: 'Bekor qilish sababi (ixtiyoriy)',
      chat: 'Chat',
      chatComingSoon: 'Tez orada ishga tushadi',
    },
    pushBanner: {
      title: 'Bildirishnomalarni yoqing',
      description: 'Status o`zgarganda darhol xabar olishingiz uchun.',
      enable: 'Yoqish',
      dismiss: 'Keyinroq',
    },
    errors: {
      cancelFailed: "Bekor qilib bo'lmadi. Qayta urinib ko'ring.",
      notFound: 'Buyurtma topilmadi',
      forbidden: 'Bu buyurtmani ko`rishga ruxsat yo`q',
    },
    statusBadge: {
      pending: 'Kutilmoqda',
      accepted: 'Qabul qilindi',
      en_route: "Yo'lda",
      arrived: 'Yetib keldi',
      in_progress: 'Ish jarayonida',
      completed: 'Tugatildi',
      cancelled: 'Bekor qilindi',
    },
  },
  ru: {
    back: 'Назад',
    pageTitle: 'Заказ',
    proCard: {
      proLabel: 'Мастер',
      defaultName: 'Ещё не выбран',
      ratingPlaceholder: '—',
    },
    addressCard: {
      title: 'Адрес',
      coordinates: 'Координаты',
    },
    priceCard: {
      title: 'Цена',
      currency: 'сум',
    },
    scheduledCard: {
      title: 'Время',
      immediate: 'Как можно скорее',
    },
    cta: {
      cancel: 'Отменить',
      cancelConfirm: 'Подтвердить',
      cancelCancel: 'Нет, вернуться',
      cancelReason: 'Причина отмены (необязательно)',
      chat: 'Чат',
      chatComingSoon: 'Скоро появится',
    },
    pushBanner: {
      title: 'Включите уведомления',
      description: 'Чтобы получать обновления статуса мгновенно.',
      enable: 'Включить',
      dismiss: 'Позже',
    },
    errors: {
      cancelFailed: 'Не удалось отменить. Попробуйте снова.',
      notFound: 'Заказ не найден',
      forbidden: 'Нет прав для просмотра',
    },
    statusBadge: {
      pending: 'Ожидает',
      accepted: 'Принят',
      en_route: 'В пути',
      arrived: 'Прибыл',
      in_progress: 'В работе',
      completed: 'Завершён',
      cancelled: 'Отменён',
    },
  },
  en: {
    back: 'Back',
    pageTitle: 'Order',
    proCard: {
      proLabel: 'Pro',
      defaultName: 'Not yet assigned',
      ratingPlaceholder: '—',
    },
    addressCard: {
      title: 'Address',
      coordinates: 'Coordinates',
    },
    priceCard: {
      title: 'Price',
      currency: 'UZS',
    },
    scheduledCard: {
      title: 'Time',
      immediate: 'As soon as possible',
    },
    cta: {
      cancel: 'Cancel',
      cancelConfirm: 'Confirm',
      cancelCancel: 'No, keep it',
      cancelReason: 'Reason (optional)',
      chat: 'Chat',
      chatComingSoon: 'Coming soon',
    },
    pushBanner: {
      title: 'Enable notifications',
      description: 'Get instant status updates.',
      enable: 'Enable',
      dismiss: 'Later',
    },
    errors: {
      cancelFailed: 'Could not cancel. Try again.',
      notFound: 'Order not found',
      forbidden: 'No access to this order',
    },
    statusBadge: {
      pending: 'Pending',
      accepted: 'Accepted',
      en_route: 'En route',
      arrived: 'Arrived',
      in_progress: 'In progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
  },
};

/**
 * `priceMinor` (so'mda integer) → "120 000" (UZ thousands separator).
 * RU/EN ham bo'sh joy ishlatadi (ICU-friendly default).
 */
export function formatPriceMinor(priceMinor: number, currency: string): string {
  const formatted = new Intl.NumberFormat('ru-RU').format(priceMinor);
  return `${formatted} ${currency}`;
}
