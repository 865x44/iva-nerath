import { accessSync } from "node:fs";
import { resolve as pathResolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  // Only intercept local .js imports where a .ts file exists instead
  if (specifier.startsWith(".") && specifier.endsWith(".js")) {
    const parentDir = context.parentURL
      ? dirname(fileURLToPath(context.parentURL))
      : process.cwd();
    const jsPath = pathResolve(parentDir, specifier);
    const tsPath = jsPath.replace(/\.js$/, ".ts");

    try {
      accessSync(tsPath);
      return {
        shortCircuit: true,
        url: pathToFileURL(tsPath).href,
      };
    } catch {
      // .ts doesn't exist, fall through to default resolver
    }
  }

  return nextResolve(specifier, context);
}
