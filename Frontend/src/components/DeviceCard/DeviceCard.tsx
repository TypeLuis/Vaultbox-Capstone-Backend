import { useState } from "react";
import type { Device } from "../../utilities/types/types";
import { DriveBar } from "../Drivebar/Drivebar";
import "./DeviceCard.scss"

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