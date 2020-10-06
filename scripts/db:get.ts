import { execSync } from "child_process"
import * as fs from "fs"

const tempDir = "../temp/"
const influxGit = "https://github.com/influxdb/influxdb.git"

if (fs.existsSync(tempDir)) {
  (fs.rmdirSync as any)(tempDir, { recursive: true })
}

fs.mkdirSync(tempDir)

process.stdout.write(`Cloning influxdb from ${influxGit}`)
execSync(`git clone ${influxGit} --depth 1`, { cwd: tempDir, stdio: 'ignore' })

process.stdout.write(`building influxdb`)
execSync(`make`, { cwd: "../temp/influxdb", stdio: 'ignore' })

