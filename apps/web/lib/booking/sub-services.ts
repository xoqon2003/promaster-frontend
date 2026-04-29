/**
 * Kategoriya bo'yicha sub-xizmat ro'yxati.
 *
 * Task: T4.04 (Step 1 — Service details)
 *
 * Real backend kelajakda CMS/admin panel orqali boshqaradi. Hozircha
 * statik mock — har kategoriya uchun 4-6 ta tipik xizmat. Frontend
 * Combobox'da filter qilish uchun yetarli.
 */

export interface SubService {
  id: string;
  label: string;
}

const SUB_SERVICES: Record<string, readonly SubService[]> = {
  elektrik: [
    { id: 'rozetka-almashtirish', label: 'Rozetka almashtirish' },
    { id: 'simlar-tortish', label: 'Simlar tortish (proshivka)' },
    { id: 'lyustra-ornatish', label: "Lyustra / chiroq o'rnatish" },
    { id: 'shchit-yigish', label: "Elektr shchitini yig'ish" },
    { id: 'qisqa-tutashuv', label: 'Qisqa tutashuv tashxisi' },
  ],
  santexnik: [
    { id: 'kran-almashtirish', label: 'Kran almashtirish' },
    { id: 'unitaz-ornatish', label: "Unitaz o'rnatish" },
    { id: 'truba-tiqilish', label: 'Truba tiqilishi tozalash' },
    { id: 'isitkich-ornatish', label: "Suv isitkich o'rnatish" },
    { id: 'dush-kabina', label: 'Dush kabina yig`ish' },
  ],
  remont: [
    { id: 'kapital-remont', label: 'Kapital remont' },
    { id: 'kosmetik-remont', label: 'Kosmetik remont (oboy, bo`yoq)' },
    { id: 'ventilatsiya', label: 'Ventilatsiya / shamollatish' },
    { id: 'pol-laminat', label: 'Pol qoplash (laminat / parket)' },
    { id: 'shipovka', label: 'Shipovka / natyajnoy potolok' },
  ],
  dizayn: [
    { id: 'interer-dizayn', label: 'Interyer dizayn loyihasi' },
    { id: 'logo-brending', label: 'Logo + brending' },
    { id: 'web-ui-dizayn', label: 'Web/mobil UI dizayn' },
    { id: '3d-vizualizatsiya', label: '3D vizualizatsiya (interyer)' },
  ],
  tarbiyachi: [
    { id: 'kunlik-bola-bog', label: 'Kunlik bola parvarishi' },
    { id: 'tunlik-tarbiyachi', label: 'Tunlik tarbiyachi (siesta)' },
    { id: 'maktab-yoshigacha', label: 'Maktab yoshiga tayyorlash' },
  ],
  repetitor: [
    { id: 'matematika', label: 'Matematika' },
    { id: 'fizika', label: 'Fizika' },
    { id: 'ingliz-tili', label: 'Ingliz tili' },
    { id: 'rus-tili', label: 'Rus tili' },
    { id: 'dtm-tayyorlash', label: 'DTM tayyorlash' },
    { id: 'ielts', label: 'IELTS / TOEFL' },
  ],
  tarjimon: [
    { id: 'rus-uzb', label: 'Rus → O`zbek' },
    { id: 'uzb-rus', label: "O'zbek → Rus" },
    { id: 'eng-uzb', label: 'Ingliz → O`zbek' },
    { id: 'notarial', label: 'Notarial tarjima (hujjat)' },
    { id: 'sinxron', label: 'Sinxron tarjima (uchrashuv)' },
  ],
  haydovchi: [
    { id: 'shahar-ichi', label: 'Shahar ichida' },
    { id: 'shahar-tashqi', label: 'Shahardan tashqari (toy, taxi)' },
    { id: 'aeroport', label: 'Aeroport transferi' },
    { id: 'kunlik-ish', label: 'Kunlik ish (8-12 soat)' },
  ],
  kurer: [
    { id: 'hujjat', label: 'Hujjat / pochta' },
    { id: 'mahsulot', label: 'Mahsulot / mayda yuk' },
    { id: 'oziq-ovqat', label: 'Oziq-ovqat yetkazib berish' },
    { id: 'ovqat-yigish', label: 'Restoran buyurtmasini olib kelish' },
  ],
  nikoh: [
    { id: 'fotograf', label: "To'y fotografi" },
    { id: 'videograf', label: "To'y videografi" },
    { id: 'tamada', label: 'Tamada / boshlovchi' },
    { id: 'restoran-zal', label: 'Restoran zal bezagi' },
    { id: 'kortej', label: 'Mashina kortej' },
  ],
};

/** Boshqa kategoriya — universal "Boshqa" sub-xizmat. */
const FALLBACK_SUB_SERVICES: readonly SubService[] = [{ id: 'boshqa', label: 'Boshqa' }];

/**
 * Kategoriya ID bo'yicha sub-xizmatlarni qaytaradi.
 *
 * @example
 *   getSubServices('elektrik') // → [{id: 'rozetka-almashtirish', ...}, ...]
 *   getSubServices('unknown')  // → [{id: 'boshqa', label: 'Boshqa'}]
 */
export function getSubServices(categoryId: string): readonly SubService[] {
  return SUB_SERVICES[categoryId] ?? FALLBACK_SUB_SERVICES;
}

/**
 * Sub-xizmat ID + kategoriya berilganda label'ini qaytaradi.
 * Topilmasa — `null` (UI'da disabled holat).
 */
export function findSubServiceLabel(categoryId: string, subId: string): string | null {
  const list = getSubServices(categoryId);
  return list.find((s) => s.id === subId)?.label ?? null;
}
