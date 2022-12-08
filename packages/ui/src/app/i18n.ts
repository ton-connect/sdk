export type Locales = 'en' | 'ru';
import en from 'src/app/assets/i18n/en.json';
import ru from 'src/app/assets/i18n/ru.json';

export const i18nDictionary: Record<Locales, object> = {
    en,
    ru
};
