import { Quote, Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

interface TestimonialDef {
  id: string;
  quoteUz: string;
  quoteRu: string;
  quoteEn: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

const TESTIMONIALS: readonly TestimonialDef[] = [
  {
    id: 't1',
    quoteUz:
      "Birinchi marta usta chaqirishda hech qanday muammo bo'lmadi. AI menga aynan kerakli santexnikni topib berdi. 30 daqiqada keldi va ish sifati a'lo.",
    quoteRu:
      'Впервые вызвал мастера без проблем. AI подобрал именно нужного сантехника. Приехал за 30 минут, качество отличное.',
    quoteEn:
      'First time booking a master with zero hassle. The AI found exactly the plumber I needed. He arrived in 30 minutes and did excellent work.',
    name: 'Sherali Yusupov',
    role: 'Toshkent · Mijoz',
    avatar: 'https://i.pravatar.cc/120?img=68',
    rating: 5,
  },
  {
    id: 't2',
    quoteUz:
      "Escrow tizimi tufayli mijozlarim har doim ishonch bilan menga to'lov beradi. Reyting ham real, soxta sharhlar yo'q. UstaTop'da ishlash — bu professionalizm.",
    quoteRu:
      'Благодаря Escrow клиенты всегда платят с уверенностью. Рейтинг реальный, фейковых отзывов нет. UstaTop — это профессионализм.',
    quoteEn:
      'Thanks to escrow my clients always pay with confidence. Ratings are real, no fake reviews. Working on UstaTop is professionalism.',
    name: 'Anvar Karimov',
    role: 'Plumber · Premium tier',
    avatar: 'https://i.pravatar.cc/120?img=12',
    rating: 5,
  },
  {
    id: 't3',
    quoteUz:
      "Real-time tracking — bu ajoyib. Usta xaritada ko'rinadi, qachon kelishini aniq bilaman. Chat orqali tezda javob beradi. Avval OLX'dan qidirib charchaganman.",
    quoteRu:
      'Real-time tracking — это супер. Мастер виден на карте, точно знаю когда приедет. В чате отвечает быстро. До этого устал искать на OLX.',
    quoteEn:
      'Real-time tracking is amazing. I see the master on the map and know exactly when he arrives. Quick replies in chat. I was tired of searching on OLX before.',
    name: 'Madina Saidova',
    role: 'Toshkent · Mijoz',
    avatar: 'https://i.pravatar.cc/120?img=47',
    rating: 5,
  },
];

export async function TestimonialsSection() {
  const t = await getTranslations('marketing.testimonials');
  // Locale-dependent quote selection happens via cookie locale resolution.
  const tCommon = await getTranslations('common');
  const locale = (tCommon('brand'), 'uz'); // fallback default
  // Read locale from next-intl context
  const { getLocale } = await import('next-intl/server');
  const activeLocale = await getLocale();

  const pickQuote = (q: TestimonialDef) =>
    activeLocale === 'ru' ? q.quoteRu : activeLocale === 'en' ? q.quoteEn : q.quoteUz;

  void locale;

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="bg-background scroll-mt-20 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="testimonials-heading"
            className="text-foreground font-display text-3xl font-bold text-balance sm:text-4xl"
          >
            {t('title')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm text-pretty sm:text-base">
            {t('subtitle')}
          </p>
        </div>

        <ul role="list" className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <li
              key={item.id}
              className="border-border bg-card relative flex flex-col gap-4 rounded-2xl border p-6"
            >
              <Quote
                aria-hidden="true"
                className="text-brand-500/30 absolute top-5 right-5 size-8"
              />

              {/* Rating */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    aria-hidden="true"
                    className={
                      idx < item.rating
                        ? 'text-warning-fg size-4 fill-current'
                        : 'text-muted-foreground size-4'
                    }
                  />
                ))}
                <span className="sr-only">{item.rating} / 5</span>
              </div>

              {/* Quote */}
              <p className="text-foreground text-sm leading-relaxed text-pretty">
                &ldquo;{pickQuote(item)}&rdquo;
              </p>

              {/* Author */}
              <div className="border-border mt-auto flex items-center gap-3 border-t pt-4">
                <div className="border-border relative size-10 shrink-0 overflow-hidden rounded-full border">
                  <Image src={item.avatar} alt="" fill sizes="40px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-muted-foreground truncate text-xs">{item.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
