/**
 * `/booking[/...]` — Booking wizard sahifasi (Server Component wrapper).
 *
 * Task: T4.03
 *
 * `[[...wizard]]` — optional catch-all. URL `/booking`, `/booking/anything`
 * — hammasi shu sahifaga mos keladi. Step navigatsiyasi `?step=N` query
 * param orqali boshqariladi (catch-all path emas, query). Catch-all
 * faqat kelajakda nested route variantlari uchun rezerv (S05 tracking
 * `/booking/123` deeplink kerak bo'lsa).
 *
 * `force-dynamic` — sahifa URL state'ga to'liq bog'liq, prerender
 * bermaymiz (S03 `/search` bilan bir xil pattern).
 */
import type { Metadata } from 'next';

import { BookingWizard } from './booking-wizard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Buyurtma berish — UstaTop',
  description:
    '6 qadamli buyurtma sehrgari: xizmat tafsilotlari, manzil va vaqt, ' +
    "fotolar, narx oralig'i, kontakt va tasdiqlash.",
};

export default function ClientBookingPage() {
  return <BookingWizard />;
}
