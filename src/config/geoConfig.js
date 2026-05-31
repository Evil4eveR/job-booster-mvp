// 1. قائمة اللغات العالمية الـ 10 المتاحة دائماً في الموقع للتغيير اليدوي
export const SUPPORTED_LANGUAGES = {
  ar: { name: 'العربية', flag: '🇲🇦' },
  en: { name: 'English', flag: '🇬🇧' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  fr: { name: 'Français', flag: '🇫🇷' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' },
  pl: { name: 'Polski', flag: '🇵🇱' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  zh: { name: '中文', flag: '🇨🇳' },
  es: { name: 'Español', flag: '🇪🇸' },
  ja: { name: '日本語', flag: '🇯🇵' }
};

// 2. خريطة الدول لتحديد العملة واللغة الافتراضية تلقائياً بناءً على الـ IP
export const COUNTRY_MAP = {
  // بولندا (المثال الذي طلبته)
  PL: { currency: 'PLN', defaultLang: 'pl' },
  // الهند (المثال الذي طلبته)
  IN: { currency: 'INR', defaultLang: 'hi' },
  // ألمانيا
  DE: { currency: 'EUR', defaultLang: 'de' },
  // المغرب وباقي الدول العربية (افتراضياً عملاتها المحلية واللغة العربية)
  MA: { currency: 'MAD', defaultLang: 'ar' },
  SA: { currency: 'SAR', defaultLang: 'ar' },
  AE: { currency: 'AED', defaultLang: 'ar' },
  EG: { currency: 'EGP', defaultLang: 'ar' },
  // الولايات المتحدة والمملكة المتحدة
  US: { currency: 'USD', defaultLang: 'en' },
  GB: { currency: 'GBP', defaultLang: 'en' },
  // فرنسا
  FR: { currency: 'EUR', defaultLang: 'fr' },
  // روسيا
  RU: { currency: 'RUB', defaultLang: 'ru' },
  // الصين
  CN: { currency: 'CNY', defaultLang: 'zh' },
  // إسبانيا ودول أمريكا اللاتينية
  ES: { currency: 'EUR', defaultLang: 'es' },
  MX: { currency: 'MXN', defaultLang: 'es' },
  // اليابان
  JP: { currency: 'JPY', defaultLang: 'ja' }
};

// 3. الإعدادات الافتراضية العالمية في حال جاء مستخدم من دولة خارج القائمة أعلاه
export const GLOBAL_FALLBACK = {
  currency: 'USD',
  defaultLang: 'en'
};