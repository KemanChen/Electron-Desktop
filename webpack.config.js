const HtmlwebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const loaderUtils = require("loader-utils");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StringReplacePlugin = require("string-replace-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

module.exports = {
    devtool: "eval-source-map",
    entry:  {
        app: __dirname + "/src/app.tsx"
    },
    output: {
        path: __dirname + "/www",//打包后的文件存放的地方
        publicPath: './',
        filename: "scripts/bundle.js"//打包后输出文件的文件名
    },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".json",".jsx"]
    },
    node: {
        fs: "empty"
    },
    devServer: {
        contentBase: "./www",//本地服务器所加载的页面所在的目录
        publicPath: "/www/",
        port: "8080",//监听端口号
        historyApiFallback: {
            index: "/www/index.html"
        },//不跳转
        inline: true,//实时刷新
        hot: true
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: StringReplacePlugin.replace({
                            replacements: [
                                {
                                    pattern: /_import\(/ig,
                                    replacement: function (match, p1, offset, string) {
                                        return 'import(';
                                    }
                                }
                            ]
                        })
                    },
                    {
                        loader: 'babel-loader'
                    },
                    {
                        loader: 'ts-loader'
                    },
                ],
                include: path.join(__dirname, 'src')
            },
            {enforce: "pre", test: /\.js$/, loader: "source-map-loader"},
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader?sourceMap'],
                    publicPath: "../"
                })
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|otf|ttf)$/,
                use: [{
                    loader: 'url-loader?limit=100000'
                }]
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                importLoaders: 1,
                                modules: true,
                                localIdentName: '[path]__[name]__[local]__[hash:base64:5]',
                                getLocalIdent: (context, localIdentName, localName, options) => {
                                    switch (localName.substr(0, 4)) {
                                        case "ant-":
                                            return localName;
                                        default:
                                            if (!options.context)
                                                options.context = context.options && typeof context.options.context === "string" ? context.options.context : context.context;
                                            var request = path.relative(options.context, context.resourcePath);
                                            options.content = options.hashPrefix + request + "+" + localName;
                                            localIdentName = localIdentName.replace(/\[local\]/gi, localName);
                                            var hash = loaderUtils.interpolateName(context, localIdentName, options);
                                            return hash.replace(new RegExp("[^a-zA-Z0-9\\-_\u00A0-\uFFFF]", "g"), "-").replace(/^((-?[0-9])|--)/, "_$1");
                                    }
                                }
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        }],
                    publicPath: "../"
                })
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin("版权所有，翻版必究"),
        new HtmlwebpackPlugin({
            template:__dirname + "/src/index.html"
        }),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin({
            filename: "style.css"
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "common",
            filename: "scripts/common.js"
        }),
        new CopyWebpackPlugin([{ from: './src/mock', to: 'mock' }, { from: './src/images', to: 'images' } ]),
        new OpenBrowserPlugin({
            url: 'http://localhost:8080/www/',
            browser: 'chrome'
        })
    ]
};