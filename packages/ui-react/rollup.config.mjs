import dts from "rollup-plugin-dts";
import ts from 'typescript';
import * as fs from 'fs';

const config = [
    {
        input: "./src/index.ts",
        output: [{ file: "lib/index.d.ts", format: "es" }],
        plugins: [dts({
            compilerOptions: {
                baseUrl: './',
                paths: ts.readConfigFile('./tsconfig.json', p => fs.readFileSync(p, 'utf8')).config.compilerOptions.paths,
            },
        }),],
    },
];

export default config;
