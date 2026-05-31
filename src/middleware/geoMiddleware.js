import geoip from 'geoip-lite';
import { COUNTRY_MAP, GLOBAL_FALLBACK, SUPPORTED_LANGUAGES } from '../config/geoConfig.js';

// الدالة الوسيطة المخصصة لاكتشاف البيانات الجغرافية
export const localeDetector = (req, res, next) => {
  // 1. جلب الـ IP الخاص بالمتصل
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  // للاختبار المحلي (Localhost) يمكنك تبديل العناوين هنا للتأكد من عمل النظام:
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    // ip = '94.254.128.0';  // 🇵🇱 IP بولندي للتجربة
    // ip = '103.45.200.0';  // 🇮🇳 IP هندي للتجربة
    ip = '2.160.0.0';       // 🇩🇪 IP ألماني للتجربة
  }

  const geo = geoip.lookup(ip);
  let detectedCurrency = GLOBAL_FALLBACK.currency;
  let detectedLang = GLOBAL_FALLBACK.defaultLang;

  // 2. مطابقة الدولة المكتشفة مع قاعدة بياناتنا في الـ config
  if (geo && geo.country) {
    const countryCode = geo.country.toUpperCase();
    
    if (COUNTRY_MAP[countryCode]) {
      detectedCurrency = COUNTRY_MAP[countryCode].currency;
      detectedLang = COUNTRY_MAP[countryCode].defaultLang;
    }
  }

  // 3. تخزين البيانات المستنتجة داخل كائن الطلب (Request Object)
  req.localeInfo = {
    currency: detectedCurrency,
    language: detectedLang,
    supportedLanguages: SUPPORTED_LANGUAGES
  };
  
  next();
};