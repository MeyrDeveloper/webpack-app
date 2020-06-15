const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const OptimizeCss = require('optimize-css-assets-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isDev = process.env.NODE_ENV === "development"

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }
    if(!isDev) {
        config.minimizer = [
            new TerserWebpackPlugin(),
            new OptimizeCss()
        ]
    }
    return config
}
const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const styleLoader = extra => {
    const loaderConfig = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: isDev,
                reloadAll: true,
            },
        },
        'css-loader'
    ]
    if(extra) {
        loaderConfig.push(extra)
    }
    return loaderConfig
} 

const jsLoader = () => {
    const config = [
        {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env'],
                plugins: [
                    '@babel/plugin-proposal-class-properties',
                    '@babel/plugin-proposal-optional-chaining'
                ]
            } 
        }
    ]

    if(isDev) {
        config.push('eslint-loader')
    }

    return config
}

const plugins = () => {
    const plugs = [
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: !isDev
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin(
            {
                patterns: [
                    {
                        from: '**/*',
                        globOptions: {
                            dot: true,
                            ignore: ['*.js', '**/scripts/*', '*.html', '**/styles/*']
                        }
                    },
                ],
            }
        ),
        new MiniCssExtractPlugin({
            filename: 'styles/[name].css',
        })
    ]

    if(!isDev) {
        plugs.push(new BundleAnalyzerPlugin())
    }

    return plugs
}

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: ['@babel/polyfill', './scripts/index.js'],
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.js', '.json', '.png', '.jpg', '.jpeg', '.svg'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    optimization: optimization(),
    devtool: isDev ? 'source-map' : '',
    devServer: {
        port: 3030,
        hot: isDev
    },
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: styleLoader()
            },
            {
                test: /\.s[ac]ss$/,
                use: styleLoader('sass-loader')
            },
            { 
                test: /\.js$/, 
                exclude: /node_modules/,
                use: jsLoader()
            },
            {
                test: /\.(png|jpg|svg|gif|jpeg|ico)$/,
                use: ['file-loader']
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                use: ['file-loader']
            }
        ]
    }
}