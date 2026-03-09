import si from "systeminformation";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import https from "https";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const log = (msg: string) => console.log(`\n✅ ${msg}`);
const info = (msg: string) => console.log(`   ${msg}`);
const warn = (msg: string) => console.log(`\n⚠️  ${msg}`);
const err = (msg: string) => { console.error(`\n❌ ${msg}`); process.exit(1); };

function run(cmd: string, label: string) {
    info(`Running: ${cmd}`);
    try {
        execSync(cmd, { stdio: "inherit" });
        log(label);
    } catch {
        err(`Failed: ${label}`);
    }
}

function isInstalled(cmd: string): boolean {
    try {
        execSync(`${cmd} --version`, { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

function downloadFile(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
        info(`Downloading from ${url}`);
        const file = fs.createWriteStream(dest);
        const request = (u: string) => {
            https.get(u, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    return request(res.headers.location!);
                }
                res.pipe(file);
                file.on("finish", () => { file.close(); resolve(); });
            }).on("error", (e) => {
                fs.unlink(dest, () => { });
                reject(e);
            });
        };
        request(url);
    });
}

// ─── Platform Installers ─────────────────────────────────────────────────────

async function installLinux() {
    log("Detected: Linux");

    if (isInstalled("mongod")) {
        info("mongod already installed, skipping.");
    } else {
        info("Adding MongoDB 7.0 apt repository...");
        run(
            `curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg`,
            "Added MongoDB GPG key"
        );
        run(
            `echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list`,
            "Added MongoDB apt source"
        );
        run("apt-get update -y", "Updated apt");
        run("apt-get install -y mongodb-org", "Installed MongoDB");
    }

    // Patch config — runs whether freshly installed or already present
    const mongodConf = "/etc/mongod.conf";
    if (fs.existsSync(mongodConf)) {
        const conf = fs.readFileSync(mongodConf, "utf-8");
        const updated = conf.replace(/bindIp:\s*127\.0\.0\.1/, "bindIp: 0.0.0.0");
        fs.writeFileSync(mongodConf, updated);
        log("Set bindIp to 0.0.0.0 in /etc/mongod.conf");
    }

    run("systemctl daemon-reload", "Reloaded systemd");
    run("systemctl enable mongod", "Enabled mongod on startup");
    run("systemctl restart mongod", "Started mongod service"); // restart to pick up config change
}

async function installMac() {
    log("Detected: macOS");

    if (!isInstalled("brew")) {
        err("Homebrew is not installed. Install it first: https://brew.sh");
    }

    if (isInstalled("mongod")) {
        info("mongod already installed, skipping.");
    } else {
        run("brew tap mongodb/brew", "Tapped mongodb/brew");
        run("brew install mongodb-community", "Installed MongoDB Community via Homebrew");
    }

    run("brew services start mongodb/brew/mongodb-community", "Started MongoDB service");
}

async function installWindows() {
    log("Detected: Windows");

    // Download the MongoDB zip and extract mongod.exe into %USERPROFILE%\mongodb\bin
    const mongoDir = path.join(process.env.USERPROFILE || "C:\\Users\\Public", "mongodb");
    const binDir = path.join(mongoDir, "bin");
    const mongodExe = path.join(binDir, "mongod.exe");

    if (fs.existsSync(mongodExe)) {
        info(`mongod.exe already found at ${mongodExe}, skipping download.`);
    } else {
        // MongoDB 7.0 Windows zip (amd64)
        const url = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.6.zip";
        const dest = path.join(mongoDir, "mongodb.zip");

        fs.mkdirSync(mongoDir, { recursive: true });
        info("Downloading MongoDB for Windows (this may take a moment)...");
        await downloadFile(url, dest);
        log(`Downloaded MongoDB zip to ${dest}`);

        info("Extracting...");
        run(`powershell -Command "Expand-Archive -Path '${dest}' -DestinationPath '${mongoDir}' -Force"`, "Extracted MongoDB");

        // The zip extracts into a versioned subfolder — find it and normalise
        const extracted = fs.readdirSync(mongoDir).find(
            (f) => f.startsWith("mongodb-") && fs.statSync(path.join(mongoDir, f)).isDirectory()
        );
        if (extracted) {
            const extractedBin = path.join(mongoDir, extracted, "bin");
            fs.mkdirSync(binDir, { recursive: true });
            for (const file of fs.readdirSync(extractedBin)) {
                fs.renameSync(path.join(extractedBin, file), path.join(binDir, file));
            }
            fs.rmSync(path.join(mongoDir, extracted), { recursive: true, force: true });
        }

        fs.unlinkSync(dest);
        log(`Installed mongod.exe to ${binDir}`);
    }

    // Add to PATH
    const currentPath = process.env.PATH || "";
    if (!currentPath.includes(binDir)) {
        try {
            execSync(`setx PATH "%PATH%;${binDir}"`, { stdio: "ignore" });
            log(`Added ${binDir} to PATH`);
        } catch {
            warn(`Could not auto-add to PATH. Add manually: ${binDir}`);
        }
    }

    info("To start MongoDB on Windows, run:  npm run mongodb");
    info("Or register it as a Windows Service using NSSM: https://nssm.cc");
}

// ─── .env updater ────────────────────────────────────────────────────────────

function updateEnv() {
    const envPath = path.resolve(process.cwd(), ".env");
    const envExamplePath = path.resolve(process.cwd(), ".env.example");

    const mongoVars = `
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=myapp
`;

    for (const [filePath, label] of [[envPath, ".env"], [envExamplePath, ".env.example"]] as const) {
        if (!fs.existsSync(filePath)) {
            warn(`${label} not found, skipping.`);
            continue;
        }
        const current = fs.readFileSync(filePath, "utf-8");
        if (!current.includes("MONGODB_URI")) {
            fs.appendFileSync(filePath, mongoVars);
            log(`Added MongoDB vars to ${label}`);
        } else {
            info(`${label} already has MongoDB vars, skipping.`);
        }
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
    console.log("\n🚀 MongoDB Installer\n");

    const osInfo = await si.osInfo();
    const platform = osInfo.platform.toLowerCase();

    info(`OS:   ${osInfo.distro || osInfo.platform} ${osInfo.release}`);
    info(`Arch: ${osInfo.arch}`);

    if (platform === "linux") {
        if (process.getuid && process.getuid() !== 0) {
            err("Linux install requires root. Re-run with: sudo npm run install:mongodb");
        }
        await installLinux();
    } else if (platform === "darwin") {
        await installMac();
    } else if (platform === "win32" || platform === "windows") {
        await installWindows();
    } else {
        err(`Unsupported platform: ${platform}. Supported: linux, macOS, windows`);
    }

    updateEnv();

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  MongoDB installation complete!

   Connection URI:  mongodb://localhost:27017
   Default DB:      myapp  (set MONGODB_DB_NAME in .env)

   To start:   npm run mongodb
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main().catch((e) => err(String(e.message || e)));