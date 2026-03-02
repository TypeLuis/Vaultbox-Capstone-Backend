import si from "systeminformation";
import { execSync, spawn } from "child_process";
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
    } catch (e) {
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
                // follow redirects
                if (res.statusCode === 301 || res.statusCode === 302) {
                    return request(res.headers.location!);
                }
                res.pipe(file);
                file.on("finish", () => { file.close(); resolve(); });
            }).on("error", (e) => {
                fs.unlink(dest, () => {});
                reject(e);
            });
        };
        request(url);
    });
}

// ─── Platform Installers ─────────────────────────────────────────────────────

async function installLinux(arch: string) {
    log("Detected: Linux");

    // pick binary for arm or amd64
    const binaryArch = arch.includes("arm") || arch.includes("aarch") ? "arm64" : "amd64";
    const url = `https://dl.min.io/server/minio/release/linux-${binaryArch}/minio`;
    const dest = "/usr/local/bin/minio";

    info("Downloading MinIO binary...");
    await downloadFile(url, dest);

    run(`chmod +x ${dest}`, "Made MinIO executable");

    // create a dedicated user & service
    try {
        execSync("id -u minio-user", { stdio: "ignore" });
        info("minio-user already exists, skipping...");
    } catch {
        run("useradd -r minio-user -s /sbin/nologin", "Created minio-user");
    }

    const dataDir = "/var/lib/minio/data";
    if (!fs.existsSync(dataDir)) {
        run(`mkdir -p ${dataDir}`, `Created data dir: ${dataDir}`);
        run(`chown -R minio-user:minio-user /var/lib/minio`, "Set ownership");
    }

    // write systemd service
    const service = `[Unit]
Description=MinIO Object Storage
Documentation=https://docs.min.io
Wants=network-online.target
After=network-online.target

[Service]
User=minio-user
Group=minio-user
ProtectProc=invisible
EnvironmentFile=-/etc/default/minio
ExecStartPre=/bin/bash -c "if [ -z \\"${MINIO_VOLUMES}\\" ]; then echo \\"Variable MINIO_VOLUMES not set in /etc/default/minio\\"; exit 1; fi"
ExecStart=/usr/local/bin/minio server $MINIO_OPTS $MINIO_VOLUMES
Restart=always
LimitNOFILE=65536
TasksMax=infinity
TimeoutStopSec=infinity
SendSIGKILL=no

[Install]
WantedBy=multi-user.target
`;

    fs.writeFileSync("/etc/systemd/system/minio.service", service);
    log("Created systemd service");

    // write default env file if not present
    const envFile = "/etc/default/minio";
    if (!fs.existsSync(envFile)) {
        const envContent = `MINIO_VOLUMES="/var/lib/minio/data"
MINIO_OPTS="--console-address :9001"
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
`;
        fs.writeFileSync(envFile, envContent);
        log("Created /etc/default/minio with default credentials");
        warn("Change MINIO_ROOT_USER and MINIO_ROOT_PASSWORD before going to production!");
    }

    run("systemctl daemon-reload", "Reloaded systemd");
    run("systemctl enable minio", "Enabled MinIO on startup");
    run("systemctl start minio", "Started MinIO service");
}

async function installMac(arch: string) {
    log("Detected: macOS");

    if (!isInstalled("brew")) {
        err("Homebrew is not installed. Install it first: https://brew.sh");
    }

    run("brew install minio/stable/minio", "Installed MinIO via Homebrew");
    run("brew services start minio/stable/minio", "Started MinIO service");
}

async function installWindows() {
    log("Detected: Windows");

    const dest = path.join(process.env.USERPROFILE || "C:\\Users\\Public", "minio.exe");
    const url = "https://dl.min.io/server/minio/release/windows-amd64/minio.exe";

    if (fs.existsSync(dest)) {
        info(`MinIO already found at ${dest}, skipping download.`);
    } else {
        info("Downloading MinIO binary for Windows...");
        await downloadFile(url, dest);
        log(`Downloaded MinIO to ${dest}`);
    }

    // add to PATH if not already there
    const currentPath = process.env.PATH || "";
    const destDir = path.dirname(dest);
    if (!currentPath.includes(destDir)) {
        try {
            execSync(`setx PATH "%PATH%;${destDir}"`, { stdio: "ignore" });
            log(`Added ${destDir} to PATH`);
        } catch {
            warn(`Could not auto-add to PATH. Add manually: ${destDir}`);
        }
    }

    info("To start MinIO on Windows, run:");
    info(`  ${dest} server C:\\minio\\data --console-address :9001`);
    info("Or add it as a Windows Service using NSSM: https://nssm.cc");
}

// ─── .env updater ────────────────────────────────────────────────────────────

function updateEnv() {
    const envPath = path.resolve(process.cwd(), ".env");
    const envExamplePath = path.resolve(process.cwd(), ".env.example");

    const minioVars = `
# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=vaultbox
MINIO_REGION=us-east-1
`;

    // update .env
    if (fs.existsSync(envPath)) {
        const current = fs.readFileSync(envPath, "utf-8");
        if (!current.includes("MINIO_ENDPOINT")) {
            fs.appendFileSync(envPath, minioVars);
            log("Added MinIO vars to .env");
        } else {
            info(".env already has MinIO vars, skipping.");
        }
    } else {
        warn(".env not found. Run `npm run env` first to create it.");
    }

    // update .env.example
    if (fs.existsSync(envExamplePath)) {
        const current = fs.readFileSync(envExamplePath, "utf-8");
        if (!current.includes("MINIO_ENDPOINT")) {
            fs.appendFileSync(envExamplePath, minioVars);
            log("Added MinIO vars to .env.example");
        }
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log("\n🚀 MinIO Installer\n");

    const osInfo = await si.osInfo();
    const platform = osInfo.platform.toLowerCase();
    const arch = osInfo.arch.toLowerCase();

    info(`OS:   ${osInfo.distro || osInfo.platform} ${osInfo.release}`);
    info(`Arch: ${arch}`);

    if (platform === "linux") {
        if (process.getuid && process.getuid() !== 0) {
            err("Linux install requires root. Re-run with: sudo npm run install:minio");
        }
        await installLinux(arch);
    } else if (platform === "darwin") {
        await installMac(arch);
    } else if (platform === "win32" || platform === "windows") {
        await installWindows();
    } else {
        err(`Unsupported platform: ${platform}. Supported: linux, macOS, windows`);
    }

    updateEnv();

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  MinIO installation complete!

   Console UI:  http://localhost:9001
   API:         http://localhost:9000

   Default credentials (change these!):
   User:     minioadmin
   Password: minioadmin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main().catch((e) => err(String(e.message || e)));
