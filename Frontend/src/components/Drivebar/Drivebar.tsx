// import type { Drive } from "../types/device";
import type { Drive } from "../../utilities/types/types";
import "./Drivebar.scss";

type Props = { drive: Drive };

export function DriveBar({ drive }: Props) {
  const pct = Math.min(Math.round(drive.usePercent), 100);
  const usedGB = (drive.usedMB / 1024).toFixed(1);
  const totalGB = (drive.sizeMB / 1024).toFixed(1);

  const danger = pct >= 85;
  const warn = pct >= 60 && pct < 85;

  return (
    <div className="drive-bar">
      <div className="drive-bar__header">
        <span className="drive-bar__mount">
          <span className="drive-bar__icon">{drive.rw ? "⬡" : "⬢"}</span>
          {drive.mount}
        </span>
        <span className={`drive-bar__pct ${danger ? "danger" : warn ? "warn" : ""}`}>
          {pct}%
        </span>
      </div>

      <div className="drive-bar__track">
        <div
          className={`drive-bar__fill ${danger ? "danger" : warn ? "warn" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="drive-bar__meta">
        <span className="drive-bar__fs">{drive.fs.split("/").pop()}</span>
        <span className="drive-bar__size">
          {usedGB} / {totalGB} GB
        </span>
      </div>
    </div>
  );
}