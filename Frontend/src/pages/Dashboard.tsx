import { useDevices } from "../hooks/Usedevices";
import "../styles/Dashboard.scss";
import VaultBoxIcon from "../components/VaultboxIcon";
import { DevicesPage } from "./Devicepage";

export default function Dashboard() {
  const { devices } = useDevices();

  // Stats
  const totalStorageGB = devices.reduce((sum, d) => sum + (d.storageTotalGB ?? 0), 0).toFixed(1);
  const usedStorageGB  = devices.reduce((sum, d) => sum + (d.storageUsedGB ?? 0), 0).toFixed(1);

  return (
    <div className="dashboard">
      {/* Background grid */}
      <div className="dashboard__grid-bg" />

      {/* Sidebar */}
      <aside className="dashboard__sidebar">
        <div className="dashboard__brand">
          <VaultBoxIcon />
          <div className="dashboard__brand-text">
            <span className="dashboard__brand-name">
              vault<span className="accent">box</span>
            </span>
            <span className="dashboard__brand-sub">personal server</span>
          </div>
        </div>

        <nav className="dashboard__nav">
          <a className="dashboard__nav-item active" href="#">
            <span className="dashboard__nav-icon">⬡</span>
            Devices
          </a>
          <a className="dashboard__nav-item" href="#">
            <span className="dashboard__nav-icon">⊞</span>
            Apps
          </a>
          <a className="dashboard__nav-item" href="#">
            <span className="dashboard__nav-icon">⬛</span>
            Files
          </a>
          <a className="dashboard__nav-item" href="#">
            <span className="dashboard__nav-icon">⚙</span>
            Settings
          </a>
        </nav>

        {/* Sidebar storage summary */}
        <div className="dashboard__sidebar-stats">
          <div className="dashboard__sidebar-stat">
            <span className="label">Total Storage</span>
            <span className="value">{totalStorageGB} GB</span>
          </div>
          <div className="dashboard__sidebar-stat">
            <span className="label">Used</span>
            <span className="value accent">{usedStorageGB} GB</span>
          </div>
          <div className="dashboard__sidebar-stat">
            <span className="label">Devices</span>
            <span className="value">{devices.length}</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <DevicesPage />
    </div>
  );
}