const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package.json');

const version = packageJson.version;

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: ['/node_modules', '/lib']
            },
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false
                }
            }
        ]
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            test: [/\.ts$/],
            exclude: 'vendor',
            filename: 'app.[hash].js.map',
            append: '//# sourceMappingURL=[url]',
            moduleFilenameTemplate: '[resource-path]',
            fallbackModuleFilenameTemplate: '[resource-path]'
        }),
        new webpack.DefinePlugin({
            TON_CONNECT_SDK_VERSION: JSON.stringify(version)
        })
    ],
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            src: path.resolve(__dirname, 'src')
        }
    },
    output: {
        filename: 'tonconnect-sdk.min.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'TonConnectSDK',
        clean: true
    },
    devtool: 'source-map',
    mode: 'production'
};
