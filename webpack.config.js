const path = require("path");
const webpack = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = (env, argv) => {
    const isProduction = argv.mode === "production";

    return {
        mode: isProduction ? "production" : "development",
        entry: "./src/main.ts",

        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "weather-widget.js",
            library: {
                name: "WeatherWidget",
                type: "umd",
                export: "default",
            },
            globalObject: "this",
        },

        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: "vue-loader",
                },
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                    options: {
                        appendTsSuffixTo: [/\.vue$/],
                        transpileOnly: true,
                    },
                    exclude: /node_modules/,
                },
                {
                    test: /\.scss$/,
                    use: [
                        "style-loader",
                        "css-loader",
                        {
                            loader: "sass-loader",
                            options: {
                                additionalData: `@use "@/assets/scss/variables" as *;`,
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.svg$/,
                    type: "asset/inline",
                    generator: {
                        dataUrl: {
                            encoding: "base64",
                        },
                    },
                },
            ],
        },

        resolve: {
            extensions: [".ts", ".js", ".vue", ".json"],
            alias: {
                "@": path.resolve(__dirname, "src"),
            },
        },

        plugins: [
            new CleanWebpackPlugin(),
            new VueLoaderPlugin(),
            new HtmlWebpackPlugin({
                template: "./public/index.html",
                filename: "index.html",
                inject: "body",
            }),
            new Dotenv(),
            new webpack.DefinePlugin({
                __VUE_OPTIONS_API__: JSON.stringify(true),
                __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
                __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
            }),
        ],

        devServer: {
            static: {
                directory: path.join(__dirname, "public"),
            },
            compress: true,
            port: 8080,
            hot: false,
            open: true,
        },

        devtool: isProduction ? false : "eval-cheap-module-source-map",
    };
};
