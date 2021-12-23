import HtmlWebpackPlugin from 'html-webpack-plugin';
import { WebpackConfigMutator } from '@teambit/webpack';
import { html } from './html';
import { PreviewDefinition } from '../preview-definition';

export function splitChunksTransformer(config: WebpackConfigMutator): WebpackConfigMutator {
  config.raw.optimization = config.raw.optimization || {};
  config.raw.optimization.splitChunks = {
    chunks: 'all',
    name: false,
  };
  return config;
}

export function runtimeChunkTransformer(config: WebpackConfigMutator): WebpackConfigMutator {
  config.raw.optimization = config.raw.optimization || {};
  config.raw.optimization.runtimeChunk = {
    // name: (entrypoint) => `runtime-${entrypoint.name}`,
    name: 'runtime',
  };
  console.log('config.raw.optimization', config.raw.optimization);
  return config;
}

export function generateHtmlPluginTransformer(
  previewDefs: PreviewDefinition[],
  previewRootChunkName: string,
  options: { dev?: boolean }
) {
  const htmlPlugins = previewDefs.map((previewModule) =>
    generateHtmlPluginForModule(previewModule, previewRootChunkName, options)
  );
  console.log('htmlPlugins', htmlPlugins);
  return (config: WebpackConfigMutator): WebpackConfigMutator => {
    config.addPlugins(htmlPlugins);
    console.log('after plugins', config.raw.plugins);
    return config;
  };
}

function generateHtmlPluginForModule(
  previewDef: PreviewDefinition,
  previewRootChunkName: string,
  options: { dev?: boolean }
) {
  const baseConfig = {
    inject: true,
    chunks: [previewDef.prefix, previewRootChunkName],
    filename: `${previewDef.prefix}.html`,
    templateContent: html('Preview'),
    minify: options?.dev ?? true,
  };
  return new HtmlWebpackPlugin(baseConfig);
}

export const transformersArray = [splitChunksTransformer, runtimeChunkTransformer];
