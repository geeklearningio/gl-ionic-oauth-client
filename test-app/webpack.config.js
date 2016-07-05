/**
 * Created by Vidailhet on 17/06/16.
 */

'use strict';

var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');

var node_modules_dir = path.join(__dirname, 'node_modules');

var deps = [
    {
        alias: 'ionic-sdk/release/js/ionic.bundle',
        resolve: 'ionic-sdk/release/js/ionic.bundle.min.js'
    },
];

module.exports = {
    entry: [
        './src/app/index.module.ts',
        './node_modules/ionic-sdk/release/css/ionic.css'
    ],
    devtool: 'inline-source-map',
    output: {
        path: path.join(__dirname, "www"),
        filename: "bundle.js"
    },
    resolve: {
        root: __dirname,
        extensions: ['', '.ts', '.js', '.css'],
        alias: {}
    },
    resolveLoader: {
        modulesDirectories: ["node_modules"]
    },
    plugins: [
        new ngAnnotatePlugin({
            add: true
        }),
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 8080,
            server: {
                baseDir: 'www'
            },
            ui: false,
            online: false,
            notify: false
        }),
        new HtmlWebpackPlugin({
            pkg: require('./package.json'),
            template: path.join(__dirname, 'src/app/index.cordova.html'),
            inject: 'body',
            hash: true
        }),
        new ExtractTextPlugin("style.css")
    ],
    module: {
        loaders: [{
            test: /\.ts$/,
            loader: 'awesome-typescript-loader'
        }, {
            test: /\.html$/,
            loader: 'html'
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style-loader', 'raw')
        }
        ],
        noParse: []
    }
};

deps.forEach(function (dep) {
    var depPath = path.resolve(node_modules_dir, dep.resolve);
    module.exports.resolve.alias[dep.alias] = depPath;
    module.exports.module.noParse.push(depPath);
});
