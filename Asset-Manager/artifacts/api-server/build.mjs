import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm } from "node:fs/promises";

// Plugins (e.g. 'esbuild-plugin-pino') may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  
  console.log("🔨 Starting build for api-server...");
  console.log("📍 Artifact directory:", artifactDir);
  
  // Check if src/index.ts exists
  const fs = await import("node:fs");
  const indexPath = path.resolve(artifactDir, "src/index.ts");
  if (!fs.existsSync(indexPath)) {
    console.error("❌ src/index.ts not found at:", indexPath);
    process.exit(1);
  }
  console.log("✅ src/index.ts found");

  await rm(distDir, { recursive: true, force: true });
  console.log("✅ Cleaned dist directory");

  try {
    await esbuild({
      entryPoints: [path.resolve(artifactDir, "src/index.ts")],
      platform: "node",
      bundle: true,
      format: "esm",
      outdir: distDir,
      outExtension: { ".js": ".mjs" },
      logLevel: "info",
      external: [
        "*.node",
        "sharp",
        "better-sqlite3",
        "sqlite3",
        "canvas",
        "bcrypt",
        "argon2",
        "fsevents",
        "re2",
        "farmhash",
        "xxhash-addon",
        "bufferutil",
        "utf-8-validate",
        "ssh2",
        "cpu-features",
        "dtrace-provider",
        "isolated-vm",
        "lightningcss",
        "pg-native",
        "oracledb",
        "mongodb-client-encryption",
        "nodemailer",
        "handlebars",
        "knex",
        "typeorm",
        "protobufjs",
        "onnxruntime-node",
        "@tensorflow/*",
        "@prisma/client",
        "@mikro-orm/*",
        "@grpc/*",
        "@swc/*",
        "@aws-sdk/*",
        "@azure/*",
        "@opentelemetry/*",
        "@google-cloud/*",
        "@google/*",
        "googleapis",
        "firebase-admin",
        "@parcel/watcher",
        "@sentry/profiling-node",
        "@tree-sitter/*",
        "aws-sdk",
        "classic-level",
        "dd-trace",
        "ffi-napi",
        "grpc",
        "hiredis",
        "kerberos",
        "leveldown",
        "miniflare",
        "mysql2",
        "newrelic",
        "odbc",
        "piscina",
        "realm",
        "ref-napi",
        "rocksdb",
        "sass-embedded",
        "sequelize",
        "serialport",
        "snappy",
        "tinypool",
        "usb",
        "workerd",
        "wrangler",
        "zeromq",
        "zeromq-prebuilt",
        "playwright",
        "puppeteer",
        "puppeteer-core",
        "electron",
      ],
      sourcemap: "linked",
      plugins: [
        esbuildPluginPino({ transports: ["pino-pretty"] })
      ],
      banner: {
        js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
      },
    });
    console.log("✅ Build completed successfully");
  } catch (error) {
    console.error("❌ Build failed with error:");
    console.error(error);
    process.exit(1);
  }
}

buildAll().catch((err) => {
  console.error("❌ Unhandled error in build process:");
  console.error(err);
  process.exit(1);
});
