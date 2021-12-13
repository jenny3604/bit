import webpack, { Configuration } from 'webpack';
import { Target, BundlerContext, ModuleTarget } from '@teambit/bundler';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fallbacks } from './webpack-fallbacks';
import { fallbacksProvidePluginConfig } from './webpack-fallbacks-provide-plugin-config';
import { fallbacksAliases } from './webpack-fallbacks-aliases';
import { html } from './html';

const { ModuleFederationPlugin } = require('webpack').container;

export function previewConfigFactory(target: Target, context: BundlerContext): Configuration {
  const truthyEntries = target.entries.length ? target.entries.filter(Boolean) : target.entries || {};
  const dev = Boolean(context.development);

  return {
    mode: dev ? 'development' : 'production',
    // Stop compilation early in production
    bail: true,
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    entry: truthyEntries,

    output: {
      // The build folder.
      path: `${target.outputPath}/public`,

      // filename: 'static/js/[name].[contenthash:8].js',
      // There are also additional JS chunk files if you use code splitting.
      // chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
    },

    resolve: {
      alias: fallbacksAliases,

      fallback: fallbacks,
    },

    plugins: [
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            templateContent: html('Preview'),
          },
          {
            minify: dev
              ? {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true,
                }
              : undefined,
          }
        )
      ),
      new webpack.ProvidePlugin(fallbacksProvidePluginConfig),
    ].concat(createModuleFederationPlugins(target.modules || [])),
  };
}

function createModuleFederationPlugins(modules: ModuleTarget[]) {
  return modules.map((module) => {
    return new ModuleFederationPlugin({
      name: module.name,
      filename: `${module.name}.js`,
      exposes: module.exposes,
    });
  });
  // return [new ModuleFederationPlugin({
  //   name: '@teambit/community.envs.community-react',
  //   fileName: 'remote-entry.js',
  //   exposes: {
  //     './overview': '/Users/ranmizrahi/Bit/bit/node_modules/@teambit/react.ui.docs-app/dist/index.js',
  //     './compositions': '/Users/ranmizrahi/Bit/bit/node_modules/@teambit/react/dist/mount.js'
  //   }
  // })];
}
