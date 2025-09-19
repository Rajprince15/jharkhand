// Load configuration from environment or config file
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Environment variable overrides
const config = {
  disableHotReload: process.env.DISABLE_HOT_RELOAD === 'true',
};

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    plugins: [
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify('/cesium'),
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(path.dirname(require.resolve('cesium/package.json')), 'Build/Cesium/Workers'),
            to: 'cesium/Workers',
          },
          {
            from: path.join(path.dirname(require.resolve('cesium/package.json')), 'Build/Cesium/ThirdParty'),
            to: 'cesium/ThirdParty',
          },
          {
            from: path.join(path.dirname(require.resolve('cesium/package.json')), 'Build/Cesium/Assets'),
            to: 'cesium/Assets',
          },
          {
            from: path.join(path.dirname(require.resolve('cesium/package.json')), 'Build/Cesium/Widgets'),
            to: 'cesium/Widgets',
          },
        ],
      }),
    ],
    configure: (webpackConfig) => {
      // Cesium configuration
      webpackConfig.module.rules.push({
        test: /\.js$/,
        use: {
          loader: require.resolve('@open-wc/webpack-import-meta-loader'),
        },
      });

      // Cesium source maps and external references
      webpackConfig.module.rules.push({
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: [/cesium/],
      });

      // Handle Cesium's AMD modules
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve.alias,
          cesium: path.resolve(__dirname, 'node_modules/cesium'),
        },
      };
      
      // Disable hot reload completely if environment variable is set
      if (config.disableHotReload) {
        // Remove hot reload related plugins
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
          return !(plugin.constructor.name === 'HotModuleReplacementPlugin');
        });
        
        // Disable watch mode
        webpackConfig.watch = false;
        webpackConfig.watchOptions = {
          ignored: /.*/, // Ignore all files
        };
      } else {
        // Add ignored patterns to reduce watched directories
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
          ],
        };
      }
      
      return webpackConfig;
    },
  },
};