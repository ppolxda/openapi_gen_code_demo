import "dotenv/config";
import { generateApi } from "swagger-typescript-api";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, "../src/generated");
const specUrl = process.env.OPENAPI_URL;
const specFile = process.env.OPENAPI_FILE;

async function main() {
  if (!specUrl && !specFile) {
    console.error(
      "Provide an OpenAPI spec via OPENAPI_URL (http/https) or OPENAPI_FILE (local path)."
    );
    process.exit(1);
  }

  await fs.mkdir(outputDir, { recursive: true });

  const sourceConfig = specUrl
    ? { url: specUrl }
    : { input: path.resolve(process.cwd(), specFile as string) };

  console.log(
    `Generating from ${
      specUrl ? `URL ${specUrl}` : `file ${sourceConfig.input}`
    }`
  );

  await generateApi({
    name: "api.ts",
    output: outputDir,
    httpClientType: "fetch",
    modular: true,
    generateClient: true,
    defaultResponseType: "void",
    cleanOutput: true,
    singleHttpClient: true,
    prettier: {
      semi: true,
      singleQuote: false,
      printWidth: 100,
    },
    ...sourceConfig,
  });

  console.log(`SDK generated to ${outputDir}`);
}

main().catch((err) => {
  console.error("Generation failed:");
  if (err instanceof Error) {
    console.error(err.message);
    console.error(err.stack);
  } else {
    console.error(err);
  }
  process.exit(1);
});
