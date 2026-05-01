import type { CategoryKey } from './categories';

export type TrustTier = 'basic' | 'verified' | 'pro' | 'premium';

export interface MasterPreview {
  id: string;
  name: string;
  /** Pravatar avatar URL (royalty-free demo). Replaced by real avatars S09. */
  avatar: string;
  category: CategoryKey;
  rating: number;
  reviews: number;
  yearsExperience: number;
  ordersCount: number;
  trust: TrustTier;
  /** District / city name in Latin script (uz). */
  city: string;
}

/**
 * Demo data for `<TopMasters />` section. S09'da real DB query bilan
 * almashtiriladi (TanStack Query — `useTopMasters()`). Bu mock — visual
 * truth-of-source emas, faqat marketing landing'da "boshlang'ich kontent".
 */
export const TOP_MASTERS: readonly MasterPreview[] = [
  {
    id: 'demo-1',
    name: 'Anvar Karimov',
    avatar: 'https://i.pravatar.cc/200?img=12',
    category: 'plumbing',
    rating: 4.9,
    reviews: 234,
    yearsExperience: 12,
    ordersCount: 412,
    trust: 'premium',
    city: 'Toshkent · Mirzo Ulugʻbek',
  },
  {
    id: 'demo-2',
    name: 'Dilafruz Yusupova',
    avatar: 'https://i.pravatar.cc/200?img=49',
    category: 'beauty',
    rating: 5.0,
    reviews: 187,
    yearsExperience: 8,
    ordersCount: 298,
    trust: 'pro',
    city: 'Toshkent · Yunusobod',
  },
  {
    id: 'demo-3',
    name: 'Sherzod Toshmatov',
    avatar: 'https://i.pravatar.cc/200?img=33',
    category: 'electric',
    rating: 4.8,
    reviews: 156,
    yearsExperience: 15,
    ordersCount: 521,
    trust: 'premium',
    city: 'Samarqand · Markaz',
  },
  {
    id: 'demo-4',
    name: 'Nodira Rahimova',
    avatar: 'https://i.pravatar.cc/200?img=44',
    category: 'tutoring',
    rating: 4.95,
    reviews: 312,
    yearsExperience: 10,
    ordersCount: 678,
    trust: 'pro',
    city: 'Toshkent · Chilonzor',
  },
  {
    id: 'demo-5',
    name: 'Bekzod Abdullayev',
    avatar: 'https://i.pravatar.cc/200?img=15',
    category: 'it',
    rating: 4.85,
    reviews: 98,
    yearsExperience: 7,
    ordersCount: 142,
    trust: 'verified',
    city: 'Buxoro · Markaz',
  },
  {
    id: 'demo-6',
    name: 'Madina Saidova',
    avatar: 'https://i.pravatar.cc/200?img=47',
    category: 'cleaning',
    rating: 4.92,
    reviews: 421,
    yearsExperience: 6,
    ordersCount: 856,
    trust: 'pro',
    city: 'Toshkent · Yashnobod',
  },
] as const;
