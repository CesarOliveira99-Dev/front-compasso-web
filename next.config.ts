import type { NextConfig } from 'next';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
interface BuildCompiler {
  outputPath: string;
  hooks: {
    emit: {
      tap(
        options: { name: string; stage: number },
        callback: (compilation: { getAssets(): { name: string }[] }) => void,
      ): void;
    };
  };
}
const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  distDir:
    process.env.COMPASSO_NEXT_DIST_DIR ||
    (process.env.NODE_ENV === 'production' ? '.next-production' : '.next'),
  webpack(configuration, { dev, isServer }) {
    if (process.platform === 'win32') {
      configuration.plugins.push({
        apply(compiler: BuildCompiler) {
          // Prepare shared directories before Webpack emits assets concurrently on Windows.
          compiler.hooks.emit.tap(
            { name: 'CompassoWindowsDirectories', stage: Number.MAX_SAFE_INTEGER },
            (compilation) => {
              for (const directory of new Set(
                compilation
                  .getAssets()
                  .map((asset) => dirname(resolve(compiler.outputPath, asset.name))),
              ))
                mkdirSync(directory, { recursive: true });
              if (isServer && !dev) {
                // These built-in pages write both root and nested segment files during prerender.
                for (const route of ['_not-found', '_global-error', 'conta', 'convite', 'descobrir', 'loja'])
                  mkdirSync(resolve(compiler.outputPath, 'app', `${route}.segments`, route), {
                    recursive: true,
                  });
              }
            },
          );
        },
      });
    }
    return configuration;
  },
};
export default config;
