import webpack, { Configuration } from 'webpack';
import { Target } from '@teambit/bundler';
import { fallbacks } from './webpack-fallbacks';
import { fallbacksProvidePluginConfig } from './webpack-fallbacks-provide-plugin-config';
import { fallbacksAliases } from './webpack-fallbacks-aliases';

export function configFactory(target: Target): Configuration {
  return {
    mode: 'production',
    // Stop compilation early in production
    bail: true,
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    entry: target.entries.filter(Boolean),

    output: {
      // The build folder.
      path: `${target.outputPath}/public`,

      filename: 'static/js/[name].[contenthash:8].js',
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
    },

    resolve: {
      alias: fallbacksAliases,

      fallback: fallbacks,
    },

    plugins: [new webpack.ProvidePlugin(fallbacksProvidePluginConfig)],
  };
}
