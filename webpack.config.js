'use strict';

const pages = [
    'index',
];

const path      = require('path');
const DIST_PATH = path.resolve(__dirname, './dist');
const SRC_PATH  = path.relative(__dirname, './src');

const webpack = require('webpack');

const HtmlWebpackPlugin       = require('html-webpack-plugin');
const { CleanWebpackPlugin }  = require('clean-webpack-plugin');
const MiniCssExtractPlugin    = require('mini-css-extract-plugin');
const TerserJSPlugin          = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = (env, argv) => {
    const isProd = argv.mode === 'production' || false;

    let config = {
        mode: argv.mode,

        devtool: isProd ? '' : 'source-map',

        devServer: {
            contentBase:           DIST_PATH,
            contentBasePublicPath: '/',
            allowedHosts:          ['.qjy1.com']
        },

        entry: {
            app: './src/app.js',
        },

        output: {
            path:          DIST_PATH,
            filename:      isProd ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
            chunkFilename: isProd ? 'js/[name].[chunkhash:8].js'   : 'js/[name].js',
            publicPath:    '/'
        },

        optimization: {
            moduleIds:    'hashed',
            runtimeChunk: 'single',

            splitChunks: {
                cacheGroups: {
                    vendor: {
                        name:               'vendors',
                        test:               /[\\/]node_modules[\\/]/,
                        chunks:             'all',
                        priority:           20,
                        reuseExistingChunk: true,
                        enforce:            true,
                    }
                }
            },

            // minify files when prod
            minimizer: isProd ? [
                new TerserJSPlugin(),
                new OptimizeCSSAssetsPlugin(),
            ] : [],
        },

        plugins: [
            // new webpack.ProgressPlugin(),

            new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),

            new webpack.ProvidePlugin({
                $:               'jquery',
                jQuery:          'jquery',
                'window.jQuery': 'jquery',
                tether:          'tether',
                Tether:          'tether',
                'window.Tether': 'tether'
            }),

            new MiniCssExtractPlugin({
                filename:      isProd ? 'css/[name].[contenthash:8].css' : 'css/[name].css',
                chunkFilename: isProd ? 'css/[name].[chunkhash:8].css'   : 'css/[name].css',
            }),

            new webpack.HashedModuleIdsPlugin(),
        ],

        module: {
            rules: [
                {
                    test: require.resolve('jquery'),
                    use:  [{
                        loader:  'expose-loader',
                        options: 'jQuery'
                    }, {
                        loader:  'expose-loader',
                        options: '$'
                    }]
                },
                {
                    test:    /\.js$/i,
                    exclude: /node_modules|test|dist/,
                    use:     [
                        {
                            loader:  'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        }
                    ]
                },
                {
                    test: /\.(sa|sc|c)ss$/i,
                    use:  [
                        { loader: MiniCssExtractPlugin.loader },
                        { loader: 'css-loader',     options: { sourceMap: true } },
                        { loader: 'postcss-loader', options: { sourceMap: true } },
                        { loader: 'sass-loader',    options: { sourceMap: true } },
                    ],
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    use:  [
                        {
                            loader:  'url-loader',
                            options: {
                                name:  'img/[name].[ext]',
                                limit: 1024,
                            },
                        },
                    ],
                },
            ]
        },

        resolve: {
            alias: {
                Components: SRC_PATH + '/components',
                Pages:      SRC_PATH + '/pages',
                Src:        SRC_PATH,
            },
        },
    };

    pages && pages.length && pages.forEach(page => {

        config.plugins.push(new HtmlWebpackPlugin({
            template: `./src/pages/${page}/template.html`,
            filename: `${page}.html`,
            chunks:   ['vendors', 'app'],
            inject:   'head',
        }));

    });

    return config;
}