import { splitProps, untrack } from 'solid-js';
import { WithDataAttributes } from 'src/app/models/with-data-attributes';

export function useDataAttributes<T extends object>(props: T): WithDataAttributes {
    const keys = untrack(() => Object.keys(props).filter(key => key.startsWith('data-')));
    const [dataAttrs] = splitProps(props, keys as (keyof T)[]);
    return dataAttrs;
}
