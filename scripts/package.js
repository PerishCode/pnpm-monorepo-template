import { join } from "path";
import { readFile, writeFile, mkdir, rm } from "fs/promises";
import { Command } from "commander";

const DEFAULT_SCOPE_NAME = "@example";
const DEFAULT_PACKAGE_VERSION = "0.0.1";

const DEFAULT_INDEX_TS_CONTENT = `export function add(a: number, b: number) {
  return a + b;
}`;

/**
 * @param {string} name
 * @param {string} version
 * @returns
 */
function generatePackageJson(name, version) {
  return {
    name: `${DEFAULT_SCOPE_NAME}/${name}`,
    version,
    description: "",
    type: "module",
    main: "dist/index.js",
    scripts: {
      dev: "tsc -w --declaration",
      build: "tsc",
    },
    keywords: [],
    author: "",
    license: "ISC",
    devDependencies: {
      [`${DEFAULT_SCOPE_NAME}/configs`]: "workspace:*",
    },
  };
}

function generateTsconfigJson() {
  return {
    extends: `${DEFAULT_SCOPE_NAME}/configs/tsconfig.package.json`,
    compilerOptions: {
      composite: true,
      rootDir: "src",
      outDir: "dist",
      declarationDir: "types",
      tsBuildInfoFile: ".tsbuildinfo",
    },
    include: ["src/**/*"],
  };
}

async function addPackage(packageName, options) {
  try {
    const packageVersion = options.version ?? DEFAULT_PACKAGE_VERSION;
    const packageJson = generatePackageJson(packageName, packageVersion);
    const tsconfigJson = generateTsconfigJson();

    const packagePath = join("packages", packageName);
    const packageJsonPath = join(packagePath, "package.json");
    const tsconfigJsonPath = join(packagePath, "tsconfig.json");

    await mkdir(packagePath, { recursive: true });
    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    await writeFile(tsconfigJsonPath, JSON.stringify(tsconfigJson, null, 2));

    const srcPath = join(packagePath, "src");
    await mkdir(srcPath, { recursive: true });
    await writeFile(join(srcPath, "index.ts"), DEFAULT_INDEX_TS_CONTENT);

    const rootTsconfigPath = "tsconfig.json";
    const rootTsconfig = JSON.parse(await readFile(rootTsconfigPath, "utf-8"));

    rootTsconfig.references.push({
      path: "./" + tsconfigJsonPath,
    });

    await writeFile(rootTsconfigPath, JSON.stringify(rootTsconfig, null, 2));

    console.log(`✨ Package ${packageName} created successfully!`);
  } catch (error) {
    console.error("❌ Error creating package:", error.message);
    process.exit(1);
  }
}

async function removePackage(packageName) {
  try {
    const packagePath = join("packages", packageName);
    const tsconfigJsonPath = join(packagePath, "tsconfig.json");

    // Remove package directory
    await rm(packagePath, { recursive: true, force: true });

    // Update root tsconfig.json to remove the package reference
    const rootTsconfigPath = "tsconfig.json";
    const rootTsconfig = JSON.parse(await readFile(rootTsconfigPath, "utf-8"));

    rootTsconfig.references = rootTsconfig.references.filter(
      (ref) => ref.path !== "./" + tsconfigJsonPath
    );

    await writeFile(rootTsconfigPath, JSON.stringify(rootTsconfig, null, 2));

    console.log(`🗑️  Package ${packageName} removed successfully!`);
  } catch (error) {
    console.error("❌ Error removing package:", error.message);
    process.exit(1);
  }
}

const program = new Command();

program
  .name("package")
  .description("Manage packages in the monorepo");

program
  .command("add")
  .description("Create a new package in the monorepo")
  .argument("<name>", "Package name")
  .option("-v, --version <version>", "Package version", DEFAULT_PACKAGE_VERSION)
  .action(addPackage);

program
  .command("remove")
  .description("Remove a package from the monorepo")
  .argument("<name>", "Package name")
  .action(removePackage);

program.parse();