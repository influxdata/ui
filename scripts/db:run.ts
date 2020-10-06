import { exec, execSync } from "child_process"
import * as path from "path"

const tempDir = "../temp/"
const influxdbDir = path.join(tempDir, "influxdb")
const os = process.platform

process.stdout.write(`Starting server...\n`)
execSync(`./bin/${os}/influxd --assets-path=../../build --e2e-testing --store=memory --feature-flags=communityTemplates=true`,
  { cwd: influxdbDir, stdio: "inherit" })

