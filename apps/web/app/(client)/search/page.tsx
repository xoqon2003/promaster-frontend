/**
 * `/search` — Qidiruv sahifasi (Server Component wrapper).
 *
 * Task: T3.12
 *
 * Server Component faqat metadata va `<SearchView />` render qiladi —
 * barcha logika (filter URL state, view toggle, fetch) client'da.
 *
 * `force-dynamic` — sahifa har doim URL parametriga bog'liq, prerender
 * yo'q. Default static rendering URL state'ni "muzlatib qo'yardi".
 */
import type { Metadata } from 'next';

import { SearchView } from './search-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Qidiruv — UstaTop',
  description:
    "Toshkent va MDH bo'yicha tekshirilgan ustalar. Kategoriya, narx, reyting, masofa bo'yicha filtrlang.",
};

export default function ClientSearchPage() {
  return <SearchView />;
}
