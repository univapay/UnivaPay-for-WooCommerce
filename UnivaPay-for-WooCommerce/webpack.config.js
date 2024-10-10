const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const WooCommerceDependencyExtractionWebpackPlugin = require('@woocommerce/dependency-extraction-webpack-plugin');
const webpack = require('webpack');

const wcDepMap = {
    '@woocommerce/blocks-registry': ['wc', 'wcBlocksRegistry'],
    '@woocommerce/settings'       : ['wc', 'wcSettings']
};

const wcHandleMap = {
    '@woocommerce/blocks-registry': 'wc-blocks-registry',
    '@woocommerce/settings'       : 'wc-settings'
};

const requestToExternal = (request) => {
    if (wcDepMap[request]) {
        return wcDepMap[request];
    }
};

const requestToHandle = (request) => {
    if (wcHandleMap[request]) {
        return wcHandleMap[request];
    }
};

const buildDir = path.resolve(__dirname, 'build');
const entries = glob.sync(`${buildDir}/*.js`).reduce((acc, file) => {
    const name = path.basename(file, '.js');
    acc[name] = file;
    return acc;
}, {});

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: entries,
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].bundle.js',
        },
        resolve: {
            extensions: ['.js', '.jsx'],
            alias: {
                '@components': path.resolve(__dirname, 'build/components/'),
            },
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                    ],
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                        },
                    },
                },
            ],
        },
        plugins: [
            new WooCommerceDependencyExtractionWebpackPlugin({
                requestToExternal,
                requestToHandle
            }),
            new MiniCssExtractPlugin({
                filename: '[name].css',
            }),
            new webpack.HotModuleReplacementPlugin(),
        ],
        devServer: {
            static: {
                directory: buildDir,
            },
            hot: true,
            port: 3081,
            devMiddleware: {
                writeToDisk: true,
            },
        },
    };
};
