const path = require('path');
const glob = require('glob');
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const WooCommerceDependencyExtractionWebpackPlugin = require('@woocommerce/dependency-extraction-webpack-plugin');
// const webpack = require('webpack');

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

module.exports = {
    ...defaultConfig,
    entry: entries,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    // devServer: {
    // 	static: {
    // 		directory: buildDir,
    // 	},
    // 	hot: true,
    // 	port: 9000,
    // 	proxy: [
    // 		{
    // 			context: ['/'],
    // 			target: 'http://localhost:3080',
    // 			changeOrigin: true
    // 		}
    // 	]
    // },
    plugins: [
        ...defaultConfig.plugins.filter(
            (plugin) =>
                plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
        ),
        new WooCommerceDependencyExtractionWebpackPlugin({
            requestToExternal,
            requestToHandle
        }),
        // new webpack.HotModuleReplacementPlugin(),
    ]
};
