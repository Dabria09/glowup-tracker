import { useState, useEffect } from 'react';
import translations from './translations';

export default function useTranslation() {
  const [lang, setLang] = useState(() => localStorage.getItem('ggu_lang') || 'en');

  useEffect(() => {
    const handler = () => setLang(localStorage.getItem('ggu_lang') || 'en');
    window.addEventListener('ggu_lang_change', handler);
    return () => window.removeEventListener('ggu_lang_change', handler);
  }, []);

  const dict = translations[lang] || translations['en'];
  const t = (key) => dict[key] || translations['en'][key] || key;

  return { t, lang };
}