import { accessSync } from 'node:fs';
import { resolve, extname, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  // Only intercept local .js imports (not node_modules)
  if (specifier.startsWith('.') && specifier.endsWith('.js')) {
    const parentDir = context.parentURL ? dirname(fileURLToPath(context.parentURL)) : process.cwd();
    const jsPath = resolve(parentDir, specifier);
    const tsPath = jsPath.replace(/\.js$/, '.ts');
    
    try {
      accessSync(tsPath);
      // .ts file exists, resolve to it
      return {
        shortCircuit: true,
        url: pathToFileURL(tsPath).href,
      };
    } catch {
      // .ts doesn't exist, fall through to default
    }
  }
  
  return nextResolve(specifier, context);
}
