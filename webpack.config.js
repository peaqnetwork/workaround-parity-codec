const path = require('path');
var fs = require('fs');
var webpack = require('webpack');

module.exports = {
    //...
    entry: {
        vendor: ['ws', '@polkadot/api'],
        app: './webpack-entry',
    },
    target: 'node',
    mode: "production",
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        include: [
                            // \\ for Windows, \/ for Mac OS and Linux
                            /node_modules[\/]@polkadot[\/]api/,
                            /node_modules[\/]ws/,
                            /node_modules[\/]http/,
                            /node_modules[\/]crypto/,
                        ],
                        exclude: [
                            /node_modules[\/]core-js/,
                            /node_modules[\/]webpack[\/]buildin/,
                        ],
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    optimization: {
        minimize: true,
        splitChunks: {
            cacheGroups: {
                vendor: {
                    // test: /[\\/]node_modules[\\/](@polkadot\\/api|ws|crypto)[\\/]/,
                    name: 'vendor.chunks',
                    chunks: 'all',
                },
            },
        },
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin({
            name: 'vendor.chunk',
            filename: "vendor.chunk.js",
            // (Give the chunk a different name)

            minChunks: Infinity,
            // (with more entries, this ensures that no other module
            //  goes into the vendor chunk)
        }),
    ],
};