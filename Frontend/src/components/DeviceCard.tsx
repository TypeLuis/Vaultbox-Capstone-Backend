// import React, { useState } from "react";

// type Drive = {
//   fs: string;
//   type: string;
//   mount: string;
//   sizeMB: number;
//   usedMB: number;
//   availableMB: number;
//   usePercent: number;
//   rw: boolean;
// };

// type Device = {
//   _id: string;
//   userId: string;
//   name: string;
//   os: string;
//   real: boolean;
//   drives: Drive[];
//   status: "online" | "offline";
//   createdAt: string;
//   updatedAt: string;
//   storageTotalGB: number;
//   storageUsedGB: number;
//   availableGB: number;
// };

// const formatMB = (mb: number) => {
//   if (mb >= 1024 * 1024) return `${(mb / 1024 / 1024).toFixed(1)} TB`;
//   if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
//   return `${mb.toFixed(0)} MB`;
// };

// const formatDate = (d: string) =>
//   new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// const OS_ICON: Record<string, string> = {
//   linux: "🐧",
//   windows: "🪟",
//   darwin: "🍎",
//   macos: "🍎",
// };

// function DriveRow({ drive }: { drive: Drive }) {
//   const pct = Math.min(drive.usePercent, 100);
//   const barColor =
//     pct > 85 ? "#f87171" : pct > 60 ? "#facc15" : "#7c6af7";

//   return (
//     <div style={s.driveRow}>
//       <div style={s.driveTop}>
//         <div style={s.driveLeft}>
//           <span style={s.driveMount}>{drive.mount}</span>
//           <span style={s.driveMeta}>
//             {drive.fs} · {drive.type} · {drive.rw ? "rw" : "ro"}
//           </span>
//         </div>
//         <div style={s.driveRight}>
//           <span style={s.driveUsed}>{formatMB(drive.usedMB)}</span>
//           <span style={s.driveTotal}> / {formatMB(drive.sizeMB)}</span>
//         </div>
//       </div>
//       <div style={s.barTrack}>
//         <div
//           style={{
//             ...s.barFill,
//             width: `${pct}%`,
//             background: barColor,
//             boxShadow: `0 0 8px ${barColor}55`,
//           }}
//         />
//       </div>
//       <div style={s.driveBottom}>
//         <span style={{ color: barColor, fontSize: 10, fontWeight: 700 }}>{pct.toFixed(1)}% used</span>
//         <span style={s.driveAvail}>{formatMB(drive.availableMB)} free</span>
//       </div>
//     </div>
//   );
// }

// export default function DeviceCard({ device }: { device: Device }) {
//   const [expanded, setExpanded] = useState(false);
//   const totalPct = ((device.storageUsedGB / device.storageTotalGB) * 100).toFixed(1);

//   return (
//     <>
//       <style>{css}</style>
//       <div style={s.card} className="dc-card">
//         {/* Header */}
//         <div style={s.header}>
//           <div style={s.headerLeft}>
//             <div style={s.osIcon}>{OS_ICON[device.os] ?? "🖥️"}</div>
//             <div>
//               <div style={s.deviceName}>{device.name}</div>
//               <div style={s.deviceMeta}>
//                 <span style={s.osBadge}>{device.os}</span>
//                 {device.real && <span style={s.realBadge}>◆ physical</span>}
//               </div>
//             </div>
//           </div>
//           <div style={s.headerRight}>
//             <div style={{ ...s.statusPill, ...(device.status === "online" ? s.statusOnline : s.statusOffline) }}>
//               <span style={{ ...s.statusDot, background: device.status === "online" ? "#4ade80" : "#6b7280" }} />
//               {device.status}
//             </div>
//           </div>
//         </div>

//         {/* Storage summary */}
//         <div style={s.summaryRow}>
//           <div style={s.summaryItem}>
//             <span style={s.summaryVal}>{device.storageTotalGB.toLocaleString()} GB</span>
//             <span style={s.summaryLabel}>Total</span>
//           </div>
//           <div style={s.summaryDivider} />
//           <div style={s.summaryItem}>
//             <span style={s.summaryVal}>{device.storageUsedGB.toLocaleString()} GB</span>
//             <span style={s.summaryLabel}>Used</span>
//           </div>
//           <div style={s.summaryDivider} />
//           <div style={s.summaryItem}>
//             <span style={{ ...s.summaryVal, color: "#4ade80" }}>{device.availableGB.toLocaleString()} GB</span>
//             <span style={s.summaryLabel}>Free</span>
//           </div>
//           <div style={s.summaryDivider} />
//           <div style={s.summaryItem}>
//             <span style={s.summaryVal}>{device.drives.length}</span>
//             <span style={s.summaryLabel}>Drives</span>
//           </div>
//         </div>

//         {/* Overall usage bar */}
//         <div style={s.overallBarWrap}>
//           <div style={s.overallBarLabel}>
//             <span style={s.overallBarText}>Overall usage</span>
//             <span style={s.overallBarPct}>{totalPct}%</span>
//           </div>
//           <div style={s.barTrack}>
//             <div
//               style={{
//                 ...s.barFill,
//                 width: `${totalPct}%`,
//                 background: "linear-gradient(90deg, #7c6af7, #a78bfa)",
//               }}
//             />
//           </div>
//         </div>

//         {/* Drives toggle */}
//         <button
//           style={s.toggleBtn}
//           className="dc-toggle"
//           onClick={() => setExpanded(!expanded)}
//         >
//           <span>Drives</span>
//           <span style={{ ...s.toggleChevron, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
//             ▾
//           </span>
//         </button>

//         {expanded && (
//           <div style={s.drivesWrap}>
//             {device.drives.map((drive, i) => (
//               <DriveRow key={i} drive={drive} />
//             ))}
//           </div>
//         )}

//         {/* Footer */}
//         <div style={s.footer}>
//           <span style={s.footerId}>ID: {device._id.slice(-8)}</span>
//           <span style={s.footerDate}>Added {formatDate(device.createdAt)}</span>
//         </div>
//       </div>
//     </>
//   );
// }

// // ─── STYLES ──────────────────────────────────────────────────────────────────
// const s: Record<string, React.CSSProperties> = {
//   card: {
//     background: "#111118",
//     border: "1px solid #1e1e2e",
//     borderRadius: 16,
//     padding: "24px",
//     fontFamily: "'DM Mono', 'Courier New', monospace",
//     color: "#e2e2e8",
//     width: "100%",
//     maxWidth: 480,
//     display: "flex",
//     flexDirection: "column",
//     gap: 20,
//     boxSizing: "border-box",
//   },

//   // Header
//   header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
//   headerLeft: { display: "flex", alignItems: "center", gap: 14 },
//   headerRight: {},
//   osIcon: {
//     width: 44, height: 44, borderRadius: 12,
//     background: "#1a1a2e", display: "flex",
//     alignItems: "center", justifyContent: "center", fontSize: 22,
//   },
//   deviceName: { fontSize: 17, fontWeight: 700, color: "#f0f0f5", letterSpacing: "-0.01em" },
//   deviceMeta: { display: "flex", alignItems: "center", gap: 8, marginTop: 4 },
//   osBadge: {
//     fontSize: 10, color: "#7c6af7", background: "rgba(124,106,247,0.12)",
//     padding: "2px 8px", borderRadius: 4, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const,
//   },
//   realBadge: { fontSize: 10, color: "#555", letterSpacing: "0.06em" },

//   statusPill: {
//     display: "flex", alignItems: "center", gap: 6,
//     fontSize: 11, fontWeight: 600, padding: "5px 12px",
//     borderRadius: 20, letterSpacing: "0.06em",
//   },
//   statusOnline: { background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" },
//   statusOffline: { background: "rgba(107,114,128,0.1)", color: "#6b7280", border: "1px solid rgba(107,114,128,0.2)" },
//   statusDot: { width: 6, height: 6, borderRadius: "50%" },

//   // Summary row
//   summaryRow: {
//     display: "flex", alignItems: "center",
//     background: "#0d0d14", borderRadius: 12,
//     padding: "14px 0", border: "1px solid #1e1e2e",
//   },
//   summaryItem: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
//   summaryVal: { fontSize: 15, fontWeight: 700, color: "#e2e2e8" },
//   summaryLabel: { fontSize: 9, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" as const },
//   summaryDivider: { width: 1, height: 28, background: "#1e1e2e" },

//   // Overall bar
//   overallBarWrap: { display: "flex", flexDirection: "column", gap: 8 },
//   overallBarLabel: { display: "flex", justifyContent: "space-between", alignItems: "center" },
//   overallBarText: { fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" as const },
//   overallBarPct: { fontSize: 12, fontWeight: 700, color: "#7c6af7" },

//   barTrack: { height: 6, background: "#1e1e2e", borderRadius: 999, overflow: "hidden" },
//   barFill: { height: "100%", borderRadius: 999, transition: "width 0.6s ease" },

//   // Toggle
//   toggleBtn: {
//     display: "flex", alignItems: "center", justifyContent: "space-between",
//     background: "#0d0d14", border: "1px solid #1e1e2e",
//     borderRadius: 10, padding: "10px 16px",
//     color: "#888", fontSize: 12, fontWeight: 600,
//     cursor: "pointer", fontFamily: "inherit",
//     letterSpacing: "0.08em", textTransform: "uppercase" as const,
//     width: "100%",
//   },
//   toggleChevron: { fontSize: 14, transition: "transform 0.25s ease", display: "inline-block" },

//   // Drives
//   drivesWrap: { display: "flex", flexDirection: "column", gap: 14 },
//   driveRow: {
//     background: "#0d0d14", border: "1px solid #1e1e2e",
//     borderRadius: 10, padding: "12px 14px",
//     display: "flex", flexDirection: "column", gap: 8,
//   },
//   driveTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
//   driveLeft: { display: "flex", flexDirection: "column", gap: 2 },
//   driveMount: { fontSize: 13, fontWeight: 600, color: "#e2e2e8" },
//   driveMeta: { fontSize: 10, color: "#555" },
//   driveRight: { textAlign: "right" as const },
//   driveUsed: { fontSize: 13, fontWeight: 700, color: "#e2e2e8" },
//   driveTotal: { fontSize: 11, color: "#555" },
//   driveBottom: { display: "flex", justifyContent: "space-between", alignItems: "center" },
//   driveAvail: { fontSize: 10, color: "#555" },

//   // Footer
//   footer: {
//     display: "flex", justifyContent: "space-between", alignItems: "center",
//     paddingTop: 4, borderTop: "1px solid #1a1a28",
//   },
//   footerId: { fontSize: 10, color: "#333", fontFamily: "monospace" },
//   footerDate: { fontSize: 10, color: "#444" },
// };

// const css = `
//   @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
//   .dc-card {
//     animation: dc-fadein 0.35s ease both;
//   }
//   @keyframes dc-fadein {
//     from { opacity: 0; transform: translateY(10px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
//   .dc-toggle:hover {
//     background: #13131e !important;
//     color: #e2e2e8 !important;
//     border-color: #2a2a3e !important;
//   }
// `;


import { useState } from "react";
// import type { Device } from "../types/device";
import type { Device } from "../utilities/types/types";
import { DriveBar } from "./Drivebar";
import "../styles/DeviceCard.scss";

type Props = {
  device: Device;
  onDelete: (id: string) => void;
  onToggleStatus: (device: Device) => void;
};

function OsIcon({ os }: { os: string }) {
  const lower = os.toLowerCase();
  if (lower.includes("win")) return <span title="Windows">⊞</span>;
  if (lower.includes("mac") || lower.includes("darwin")) return <span title="macOS">⌘</span>;
  return <span title="Linux">⬡</span>;
}

export function DeviceCard({ device, onDelete, onToggleStatus }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const isOnline = device.status === "online";
  const usedPct =
    device.storageTotalGB > 0
      ? Math.round((device.storageUsedGB / device.storageTotalGB) * 100)
      : 0;

  const handleDelete = () => {
    if (!confirming) { setConfirming(true); return; }
    onDelete(device._id);
  };

  return (
    <div className={`device-card ${isOnline ? "online" : "offline"}`}>
      {/* Status beacon */}
      <div className={`device-card__beacon ${isOnline ? "online" : "offline"}`} />

      {/* Header */}
      <div className="device-card__header">
        <div className="device-card__title-row">
          <span className="device-card__os-icon">
            <OsIcon os={device.os} />
          </span>
          <h3 className="device-card__name">{device.name}</h3>
          {device.real && <span className="device-card__badge real">REAL</span>}
          {!device.real && <span className="device-card__badge virtual">VIRT</span>}
        </div>
        <span className={`device-card__status ${isOnline ? "online" : "offline"}`}>
          {isOnline ? "ONLINE" : "OFFLINE"}
        </span>
      </div>

      {/* OS label */}
      <p className="device-card__os">{device.os}</p>

      {/* Storage summary ring + bar */}
      <div className="device-card__storage-summary">
        <div className="device-card__ring-wrap">
          <svg viewBox="0 0 36 36" className="device-card__ring">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(45,212,191,0.1)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={usedPct >= 85 ? "#ef4444" : usedPct >= 60 ? "#f59e0b" : "#2dd4bf"}
              strokeWidth="3"
              strokeDasharray={`${usedPct} ${100 - usedPct}`}
              strokeDashoffset="25"
              strokeLinecap="round"
            />
          </svg>
          <span className="device-card__ring-label">{usedPct}%</span>
        </div>

        <div className="device-card__storage-info">
          <div className="device-card__storage-row">
            <span>Used</span>
            <strong>{device.storageUsedGB} GB</strong>
          </div>
          <div className="device-card__storage-row">
            <span>Free</span>
            <strong>{device.availableGB} GB</strong>
          </div>
          <div className="device-card__storage-row">
            <span>Total</span>
            <strong>{device.storageTotalGB} GB</strong>
          </div>
        </div>
      </div>

      {/* Drives expand */}
      {device.drives.length > 0 && (
        <button
          className="device-card__expand-btn"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "▲" : "▼"} {device.drives.length} drive{device.drives.length > 1 ? "s" : ""}
        </button>
      )}

      {expanded && (
        <div className="device-card__drives">
          {device.drives.map((d, i) => (
            <DriveBar key={i} drive={d} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="device-card__footer">
        <span className="device-card__date">
          {new Date(device.createdAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
          })}
        </span>
        <div className="device-card__actions">
          <button
            className="device-card__action-btn toggle"
            onClick={() => onToggleStatus(device)}
            title={isOnline ? "Set offline" : "Set online"}
          >
            {isOnline ? "⏻" : "⏼"}
          </button>
          <button
            className={`device-card__action-btn delete ${confirming ? "confirming" : ""}`}
            onClick={handleDelete}
            onBlur={() => setConfirming(false)}
            title={confirming ? "Click again to confirm" : "Delete device"}
          >
            {confirming ? "confirm?" : "✕"}
          </button>
        </div>
      </div>
    </div>
  );
}