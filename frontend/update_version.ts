import { execSync } from "child_process"
import { writeFileSync } from "fs"

const version = execSync("git describe --tags --abbrev=0").toString().trim();
const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
const buildDate = new Date().toISOString();

const content = `export const version = '${version}';
export const buildDate = '${buildDate}';
export const commitHash = '${commitHash}';`;

writeFileSync("./src/environments/version.production.ts", content);
console.log("Build information has been saved: ", { version, commitHash, buildDate });
