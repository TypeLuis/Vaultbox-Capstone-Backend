import { useState, useMemo, useRef } from "react";
// import { useDevices } from "../../hooks/useDevices";
import { useDevices } from "../hooks/UseDevices";
import { useFiles } from "../hooks/UseFiles";
import { uploadFile, downloadFile } from "../utilities/functions/FilesApi";
import type { VaultFile } from "../utilities/types/types";
import '../styles/FilePage.scss'
import { useAuth } from "../context/authcontext";

type ViewMode = "directory" | "list";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMimeCategory(mime: string): string {
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    if (mime.includes("pdf")) return "pdf";
    if (mime.includes("zip") || mime.includes("tar") || mime.includes("gzip")) return "archive";
    if (mime.includes("text/") || mime.includes("json") || mime.includes("xml")) return "text";
    return "file";
}

const CATEGORY_ICON: Record<string, string> = {
    image: "⬛",
    video: "▶",
    audio: "♪",
    pdf: "⊟",
    archive: "⊞",
    text: "≡",
    file: "⬡",
};

const CATEGORY_COLOR: Record<string, string> = {
    image: "#a78bfa",
    video: "#f87171",
    audio: "#fb923c",
    pdf: "#ef4444",
    archive: "#f59e0b",
    text: "#2dd4bf",
    file: "#64748b",
};

function FileIcon({ mime, size = 20 }: { mime: string; size?: number }) {
    const cat = getMimeCategory(mime);
    return (
        <span
            className="file-icon"
            style={{ color: CATEGORY_COLOR[cat], fontSize: size }}
            title={cat}
        >
            {CATEGORY_ICON[cat]}
        </span>
    );
}

// Group files into virtual "folders" by mime category
function groupByCategory(files: VaultFile[]): Record<string, VaultFile[]> {
    if (!Array.isArray(files) || files.length === 0) return {};
    return files.reduce((acc, f) => {
        const cat = getMimeCategory(f.mimeType);
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(f);
        return acc;
    }, {} as Record<string, VaultFile[]>);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FileRow({
    file,
    onDelete,
    onDownload,
}: {
    file: VaultFile;
    onDelete: (id: string) => void;
    onDownload: (file: VaultFile) => void;
}) {
    const [confirming, setConfirming] = useState(false);

    return (
        <div className="file-row">
            <FileIcon mime={file.mimeType} size={16} />
            <span className="file-row__name" title={file.filenameOriginal}>
                {file.filenameOriginal}
            </span>
            <span className="file-row__size">{file.convertedSize}</span>
            <span className="file-row__date">
                {new Date(file.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                })}
            </span>
            <div className="file-row__actions">
                <button
                    className="file-row__btn download"
                    onClick={() => onDownload(file)}
                    title="Download"
                >↓</button>
                <button
                    className={`file-row__btn delete ${confirming ? "confirming" : ""}`}
                    onClick={() => { if (!confirming) { setConfirming(true); return; } onDelete(file._id); }}
                    onBlur={() => setConfirming(false)}
                    title={confirming ? "Confirm?" : "Delete"}
                >
                    {confirming ? "?" : "✕"}
                </button>
            </div>
        </div>
    );
}

function DirectoryFolder({
    name,
    files,
    onDelete,
    onDownload,
}: {
    name: string;
    files: VaultFile[];
    onDelete: (id: string) => void;
    onDownload: (file: VaultFile) => void;
}) {
    const [open, setOpen] = useState(false);
    const cat = name as string;
    const totalSize = files.reduce((s, f) => s + f.sizeBytes, 0);
    const displaySize = totalSize < 1024 * 1024
        ? `${(totalSize / 1024).toFixed(1)} KB`
        : totalSize < 1024 ** 3
            ? `${(totalSize / 1024 / 1024).toFixed(1)} MB`
            : `${(totalSize / 1024 ** 3).toFixed(2)} GB`;

    return (
        <div className={`dir-folder ${open ? "open" : ""}`}>
            <button className="dir-folder__header" onClick={() => setOpen((o) => !o)}>
                <span className="dir-folder__chevron">{open ? "▼" : "▶"}</span>
                <span className="dir-folder__icon" style={{ color: CATEGORY_COLOR[cat] }}>
                    {open ? "⊟" : "⊞"}
                </span>
                <span className="dir-folder__name">{cat}</span>
                <span className="dir-folder__count">{files.length} file{files.length !== 1 ? "s" : ""}</span>
                <span className="dir-folder__size">{displaySize}</span>
            </button>

            {open && (
                <div className="dir-folder__contents">
                    {files.map((f) => (
                        <FileRow key={f._id} file={f} onDelete={onDelete} onDownload={onDownload} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function FilesPage() {
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
    const [viewMode, setViewMode] = useState<ViewMode>("directory");
    const [searchQ, setSearchQ] = useState("");
    const [debouncedQ, setDebouncedQ] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { token } = useAuth()

    const { devices } = useDevices();

    const handleSearch = (val: string) => {
        setSearchQ(val);
        clearTimeout((handleSearch as any)._t);
        (handleSearch as any)._t = setTimeout(() => setDebouncedQ(val), 350);
    };

    const filters = useMemo(
        () => (selectedDeviceId ? { deviceId: selectedDeviceId, q: debouncedQ || undefined } : null),
        [selectedDeviceId, debouncedQ]
    );

    const { files: rawFiles, loading, error, refresh, remove } = useFiles(filters);
    const files = rawFiles ?? []; // ← nuclear fallback

    //   const grouped = useMemo(() => groupByCategory(files), [files]);
    const grouped = useMemo(() => groupByCategory(files ?? []), [files]);

    //   const totalSize = files.reduce((s, f) => s + f.sizeBytes, 0);
    const totalSize = useMemo(
        () => (files ?? []).reduce((s, f) => s + f.sizeBytes, 0),
        [files]
    );
    const displayTotal = totalSize < 1024 ** 3
        ? `${(totalSize / 1024 / 1024).toFixed(1)} MB`
        : `${(totalSize / 1024 ** 3).toFixed(2)} GB`;

    // const handleDownload = (file: VaultFile) => {
    //     const a = document.createElement("a");
    //     a.href = downloadUrl(file._id, file.filenameOriginal ,token);
    //     a.download = file.filenameOriginal;
    //     a.click();
    // };

    const handleDownload = async (file: VaultFile) => {
        try {
            await downloadFile(file._id, file.filenameOriginal, token);
        } catch (err: any) {
            alert("Download failed: " + err.message);
        }
    };
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedDeviceId) return;
        setUploading(true);
        setUploadProgress(0);
        try {
            await uploadFile(selectedDeviceId, file, setUploadProgress, token);
            await refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const selectedDevice = devices.find((d) => d._id === selectedDeviceId);

    return (
        <div className="files-page">
            {/* Topbar */}
            <header className="files-page__topbar">
                <div className="files-page__title-row">
                    <h1>Files</h1>
                    {selectedDevice && (
                        <span className={`files-page__device-badge ${selectedDevice.status}`}>
                            <span className="files-page__device-dot" />
                            {selectedDevice.name}
                        </span>
                    )}
                </div>

                <div className="files-page__controls">
                    {/* Device selector */}
                    <select
                        className="files-page__device-select"
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                    >
                        <option value="">— Select device —</option>
                        {devices.map((d) => (
                            <option key={d._id} value={d._id}>
                                {d.name} ({d.status})
                            </option>
                        ))}
                    </select>

                    {selectedDeviceId && (
                        <>
                            {/* Search */}
                            <div className="files-page__search-wrap">
                                <span className="files-page__search-icon">⌕</span>
                                <input
                                    className="files-page__search"
                                    type="text"
                                    placeholder="Search files..."
                                    value={searchQ}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>

                            {/* View toggle */}
                            <div className="files-page__view-toggle">
                                <button
                                    className={`files-page__view-btn ${viewMode === "directory" ? "active" : ""}`}
                                    onClick={() => setViewMode("directory")}
                                    title="Directory view"
                                >⊞</button>
                                <button
                                    className={`files-page__view-btn ${viewMode === "list" ? "active" : ""}`}
                                    onClick={() => setViewMode("list")}
                                    title="List view"
                                >≡</button>
                            </div>

                            {/* Upload */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="file-upload"
                                style={{ display: "none" }}
                                onChange={handleUpload}
                            />
                            <label
                                htmlFor="file-upload"
                                className={`files-page__upload-btn ${uploading ? "uploading" : ""}`}
                            >
                                {uploading ? `${uploadProgress}%` : "+ Upload"}
                            </label>

                            <button className="files-page__refresh-btn" onClick={refresh} title="Refresh">↺</button>
                        </>
                    )}
                </div>
            </header>

            {/* Upload progress bar */}
            {uploading && (
                <div className="files-page__upload-bar">
                    <div className="files-page__upload-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
            )}

            {/* Stats */}
            {selectedDeviceId && files.length > 0 && (
                <div className="files-page__stats">
                    <div className="files-stat">
                        <span>Total files</span>
                        <strong>{files.length}</strong>
                    </div>
                    <div className="files-stat">
                        <span>Total size</span>
                        <strong>{displayTotal}</strong>
                    </div>
                    <div className="files-stat">
                        <span>Categories</span>
                        <strong>{Object.keys(grouped).length}</strong>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="files-page__content">

                {/* No device selected */}
                {!selectedDeviceId && (
                    <div className="files-page__state empty">
                        <span className="files-page__state-icon">⊟</span>
                        <p>Select a device to browse files</p>
                        <span className="sub">Choose from the dropdown above</span>
                    </div>
                )}

                {selectedDeviceId && loading && (
                    <div className="files-page__state">
                        <div className="files-page__spinner" />
                        <p>Loading files...</p>
                    </div>
                )}

                {selectedDeviceId && error && !loading && (
                    <div className="files-page__state error">
                        <span>⚠</span>
                        <p>{error}</p>
                        <button onClick={refresh}>Retry</button>
                    </div>
                )}

                {selectedDeviceId && !loading && !error && files.length === 0 && (
                    <div className="files-page__state empty">
                        <span className="files-page__state-icon">⬡</span>
                        <p>No files found</p>
                        <span className="sub">
                            {searchQ ? "Try a different search" : "Upload your first file to this device"}
                        </span>
                    </div>
                )}

                {/* Directory view */}
                {selectedDeviceId && !loading && !error && files.length > 0 && viewMode === "directory" && (
                    <div className="files-page__directory">
                        {/* Path breadcrumb */}
                        <div className="files-page__breadcrumb">
                            <span className="crumb root">⬡ vault</span>
                            <span className="sep">/</span>
                            <span className="crumb">{selectedDevice?.name ?? "device"}</span>
                            <span className="sep">/</span>
                            <span className="crumb active">files</span>
                        </div>

                        <div className="files-page__folders">
                            {Object.entries(grouped).map(([cat, catFiles]) => (
                                <DirectoryFolder
                                    key={cat}
                                    name={cat}
                                    files={catFiles}
                                    onDelete={remove}
                                    onDownload={handleDownload}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* List view */}
                {selectedDeviceId && !loading && !error && files.length > 0 && viewMode === "list" && (
                    <div className="files-page__list">
                        <div className="files-page__list-header">
                            <span>Name</span>
                            <span>Size</span>
                            <span>Date</span>
                            <span></span>
                        </div>
                        {files.map((f) => (
                            <FileRow key={f._id} file={f} onDelete={remove} onDownload={handleDownload} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}