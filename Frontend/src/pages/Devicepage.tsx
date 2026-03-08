import { useState, useMemo } from "react";
// import { useDevices } from "../../hooks/useDevices";
import { useDevices } from "../hooks/Usedevices";
import { DeviceCard } from "../components/DeviceCard";
// import "./DevicesPage.scss";
import '../styles/DevicePage.scss'

type StatusFilter = "all" | "online" | "offline";

export function DevicesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQ, setSearchQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  const handleSearch = (val: string) => {
    setSearchQ(val);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => setDebouncedQ(val), 350);
  };

  const filters = useMemo(() => ({
    status: statusFilter !== "all" ? statusFilter : undefined,
    q: debouncedQ || undefined,
  }), [statusFilter, debouncedQ]);


  const { devices: allDevices } = useDevices();
  const totalOnline  = allDevices.filter((d) => d.status === "online").length;
  const totalOffline = allDevices.filter((d) => d.status === "offline").length;

//   const filteredStatus = statusFilter !== "all" ? statusFilter : undefined;
  const { devices, loading, error, refresh, remove, toggleStatus } = useDevices(filters);

  const totalStorageGB = useMemo(
    () => allDevices.reduce((sum, d) => sum + (d.storageTotalGB ?? 0), 0).toFixed(1),
    [allDevices]
  );
  const usedStorageGB = useMemo(
    () => allDevices.reduce((sum, d) => sum + (d.storageUsedGB ?? 0), 0).toFixed(1),
    [allDevices]
  );

  return (
    <div className="devices-page">
      {/* Topbar */}
      <header className="devices-page__topbar">
        <div className="devices-page__title-row">
          <h1>Devices</h1>
          <span className="devices-page__count">{allDevices.length} registered</span>
        </div>

        <div className="devices-page__controls">
          <div className="devices-page__search-wrap">
            <span className="devices-page__search-icon">⌕</span>
            <input
              className="devices-page__search"
              type="text"
              placeholder="Search devices..."
              value={searchQ}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="devices-page__filter-tabs">
            {(["all", "online", "offline"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                className={`devices-page__filter-tab ${statusFilter === s ? "active" : ""} ${s}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all"
                  ? `All (${allDevices.length})`
                  : s === "online"
                  ? `Online (${totalOnline})`
                  : `Offline (${totalOffline})`}
              </button>
            ))}
          </div>

          <button className="devices-page__refresh-btn" onClick={refresh} title="Refresh">↺</button>
        </div>
      </header>

      {/* Stat pills */}
      <div className="devices-page__pills">
        <div className="stat-pill online">
          <span className="stat-pill__dot" />
          <span className="stat-pill__label">Online</span>
          <strong>{totalOnline}</strong>
        </div>
        <div className="stat-pill offline">
          <span className="stat-pill__dot" />
          <span className="stat-pill__label">Offline</span>
          <strong>{totalOffline}</strong>
        </div>
        <div className="stat-pill storage">
          <span className="stat-pill__label">Storage Used</span>
          <strong>{usedStorageGB} / {totalStorageGB} GB</strong>
        </div>
      </div>

      {/* Grid */}
      <div className="devices-page__content">
        {loading && (
          <div className="devices-page__state">
            <div className="devices-page__spinner" />
            <p>Connecting to vault...</p>
          </div>
        )}

        {error && !loading && (
          <div className="devices-page__state error">
            <span>⚠</span>
            <p>{error}</p>
            <button onClick={refresh}>Retry</button>
          </div>
        )}

        {!loading && !error && devices.length === 0 && (
          <div className="devices-page__state empty">
            <span>⬡</span>
            <p>No devices found</p>
            <span className="sub">
              {searchQ ? "Try a different search term" : "Register your first device to get started"}
            </span>
          </div>
        )}

        {!loading && !error && devices.length > 0 && (
          <div className="devices-page__grid">
            {devices.map((device, i) => (
              <div key={device._id} style={{ animationDelay: `${i * 50}ms` }}>
                <DeviceCard device={device} onDelete={remove} onToggleStatus={toggleStatus} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}