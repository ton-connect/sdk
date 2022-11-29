import { Base64 } from 'src/utils';

describe('Base64 tests', () => {
    it('Should encode string correctly', () => {
        const sourceString = 'test=string example: { a: "_b&%" }';
        const expectedEncoded = 'dGVzdD1zdHJpbmcgZXhhbXBsZTogeyBhOiAiX2ImJSIgfQ==';

        const encoded = Base64.encode(sourceString);
        expect(encoded).toEqual(expectedEncoded);
    });

    it('Should encode string url safe correctly', () => {
        const sourceString = 'test=string example: { a: "_b&%" }';
        const expectedEncoded = 'dGVzdD1zdHJpbmcgZXhhbXBsZTogeyBhOiAiX2ImJSIgfQ%3D%3D';

        const encoded = Base64.encode(sourceString, true);
        expect(encoded).toEqual(expectedEncoded);
    });

    it('Should encode object correctly', () => {
        const sourceObject = {
            a: '123&$%-=',
            b: [1, 2],
            c: {
                x: null
            }
        };

        const expectedEncoded = 'eyJhIjoiMTIzJiQlLT0iLCJiIjpbMSwyXSwiYyI6eyJ4IjpudWxsfX0=';

        const encoded = Base64.encode(sourceObject);
        expect(encoded).toEqual(expectedEncoded);
    });

    it('Should encode object url safe correctly', () => {
        const sourceObject = {
            a: '123&$%-=',
            b: [1, 2],
            c: {
                x: null
            }
        };

        const expectedEncoded = 'eyJhIjoiMTIzJiQlLT0iLCJiIjpbMSwyXSwiYyI6eyJ4IjpudWxsfX0%3D';

        const encoded = Base64.encode(sourceObject, true);
        expect(encoded).toEqual(expectedEncoded);
    });

    it('Should encode Uint8Array correctly', () => {
        const uint8Array = new Uint8Array([
            186, 172, 126, 137, 246, 202, 196, 52, 232, 0, 13, 167, 173, 31, 102, 124, 154, 83, 137,
            111, 255, 109, 138, 217, 10, 134, 120, 9, 141, 24, 133, 33
        ]);

        const encoded = Base64.encode(uint8Array);
        const decoded = Base64.decode(encoded).toUint8Array();

        expect(uint8Array).toEqual(decoded);
    });

    it('Should decode string correctly', () => {
        const expectedString = 'test=string example: { a: "_b&%" }';
        const encoded = 'dGVzdD1zdHJpbmcgZXhhbXBsZTogeyBhOiAiX2ImJSIgfQ==';

        const decoded = Base64.decode(encoded);
        expect(decoded.toString()).toEqual(expectedString);
    });

    it('Should decode url safe string correctly', () => {
        const expectedString = 'test=string example: { a: "_b&%" }';
        const encoded = 'dGVzdD1zdHJpbmcgZXhhbXBsZTogeyBhOiAiX2ImJSIgfQ%3D%3D';

        const decoded = Base64.decode(encoded, true);
        expect(decoded.toString()).toEqual(expectedString);
    });
});
