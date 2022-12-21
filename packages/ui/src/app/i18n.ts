import en from 'src/app/assets/i18n/en.json';
import ru from 'src/app/assets/i18n/ru.json';
import { Locales } from 'src/models/locales';

export const i18nDictionary: Record<Locales, object> = {
    en: parseDictionary(en),
    ru: parseDictionary(ru)
};

// replace '$key1.key2.key3' with it's value
function parseDictionary(dictionary: Record<string, unknown>): Record<string, unknown> {
    const refSymbol = '$';

    const iterate = (subDictionary: Record<string, unknown>): void => {
        Object.entries(subDictionary).forEach(([key, value]) => {
            if (typeof value === 'object' && value) {
                return iterate(value as Record<string, unknown>);
            }

            if (typeof value === 'string') {
                if (value[0] === refSymbol) {
                    const path = value.slice(1).split('.');
                    let obj: Record<string, unknown> = dictionary;
                    path.forEach(item => {
                        if (item in obj) {
                            obj = obj[item] as Record<string, unknown>;
                        } else {
                            throw new Error(
                                `Cannot parse translations: there is no property ${item} in translation`
                            );
                        }
                    });

                    subDictionary[key] = obj;
                }

                if (value.slice(0, 2) === `\\${refSymbol}`) {
                    subDictionary[key] = value.slice(1);
                }
            }
        });
    };

    iterate(dictionary);
    return dictionary;
}
