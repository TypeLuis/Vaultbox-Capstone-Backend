// // import React from 'react';
// import { useAuth } from '../context/authcontext';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { apiCreateDevice, apiFetchDevices } from '../utilities/functions/ApiFunctions';
// import { selfHosted } from '../utilities/functions/configFunctions';
// import { useEffect, useState } from 'react';
// import type { Device } from '../utilities/types/types';
// import DeviceCard from '../components/DeviceCard';
// import VaultBoxLoader from '../components/Vaultboxloader';

// type DashboardProps = {

// }

// const Dashboard = ({ }: DashboardProps) => {
//   const [devices, setDevices] = useState<Device[]>([])
//   const [loading, setLoading] = useState(false)
//   const { logout, token } = useAuth()
//   const nav = useNavigate()


//   // const createDevice = () => apiCreateDevice(token, selfHosted ? "yes" : "no")

//   function handleLogout() {
//     logout()
//     nav('/auth')
//   }

//   async function loadDevices() {
//     try {
//       setLoading(true);
//       const data = await apiFetchDevices(token);
//       setDevices(data);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function createDevice() {
//     try {
//       setLoading(true);

//       const created = await apiCreateDevice(token, selfHosted ? "yes" : "no");
//       console.log(created);

//       setDevices((prev) => [created, ...prev]);

//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleGetData() {
//     try {
//       let res = await axios.get("/api/auth", {
//         headers: { "x-auth-token": token }
//       }) // Get user info with id and auth token
//       console.log(res.data)
//     } catch (error) {

//     }
//   }

//   useEffect(() => {

//     void loadDevices()
//   }, [])


//   if(loading) return <VaultBoxLoader />

//   return (
//     <>
//       Testing
//       <button onClick={handleLogout}>Logout</button>
//       <button onClick={handleGetData}>Get Data</button>
//       <button onClick={createDevice}>Get Device Data</button>
//       {devices.length > 0 && devices.map((el) => {
//         return <DeviceCard key={el._id} device={el} />
//       })}
//     </>
//   );
// };

// export default Dashboard;


import { useState, useMemo } from "react";
import { useDevices } from "../hooks/Usedevices";
import {DeviceCard} from "../components/DeviceCard";
import "../styles/Dashboard.scss";

// VaultBox SVG inline (the tesseract icon)
function VaultBoxIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="dashboard__logo-svg">
      <defs>
        <radialGradient id="db-bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "#1a2535", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#0d1117", stopOpacity: 1 }} />
        </radialGradient>
        <linearGradient id="db-faceTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#2dd4bf", stopOpacity: 0.85 }} />
          <stop offset="100%" style={{ stopColor: "#0d9488", stopOpacity: 0.6 }} />
        </linearGradient>
        <linearGradient id="db-faceRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#0d9488", stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: "#065f46", stopOpacity: 0.5 }} />
        </linearGradient>
        <linearGradient id="db-innerTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#5eead4", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#2dd4bf", stopOpacity: 0.9 }} />
        </linearGradient>
        <filter id="db-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="db-eg" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#db-bgGlow)" />
      <polygon points="58,42 118,28 152,62 92,76" fill="url(#db-faceTop)" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.75" />
      <polygon points="118,28 152,62 152,132 118,98" fill="url(#db-faceRight)" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.6" />
      <polygon points="92,76 152,62 152,132 92,146" fill="#1a3a4a" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.55" />
      <polygon points="58,42 92,76 92,146 58,112" fill="#0f2535" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.5" />
      <polygon points="58,112 118,98 152,132 92,146" fill="#0a1e2e" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.4" />
      <polygon points="58,42 118,28 118,98 58,112" fill="#0d1a28" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.35" />
      <polygon points="82,72 112,64 130,82 100,90" fill="url(#db-innerTop)" stroke="#5eead4" strokeWidth="1" opacity="0.9" />
      <polygon points="112,64 130,82 130,112 112,94" fill="#2dd4bf" stroke="#5eead4" strokeWidth="1" opacity="0.85" />
      <polygon points="100,90 130,82 130,112 100,120" fill="#134e4a" stroke="#5eead4" strokeWidth="1" opacity="0.8" />
      <polygon points="82,72 100,90 100,120 82,102" fill="#134e4a" stroke="#5eead4" strokeWidth="1" opacity="0.75" />
      <polygon points="82,102 112,94 130,112 100,120" fill="#0d3a36" stroke="#5eead4" strokeWidth="1" opacity="0.65" />
      <polygon points="82,72 112,64 112,94 82,102" fill="#0f3535" stroke="#5eead4" strokeWidth="1" opacity="0.6" />
      {([[58,42],[118,28],[152,62],[92,76],[58,112],[118,98],[152,132],[92,146]] as [number,number][]).map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill="#2dd4bf" filter="url(#db-eg)" opacity={0.9} />
      ))}
      {([[82,72],[112,64],[130,82],[100,90],[82,102],[112,94],[130,112],[100,120]] as [number,number][]).map(([cx,cy],i) => (
        <circle key={`i${i}`} cx={cx} cy={cy} r="3" fill="#ffffff" filter="url(#db-glow)" opacity={0.95} />
      ))}
    </svg>
  );
}

type StatusFilter = "all" | "online" | "offline";

export default function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQ, setSearchQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  // Debounce search
  const handleSearch = (val: string) => {
    setSearchQ(val);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => setDebouncedQ(val), 350);
  };

  const filters = useMemo(() => ({
    status: statusFilter !== "all" ? statusFilter : undefined,
    q: debouncedQ || undefined,
  }), [statusFilter, debouncedQ]);

  const { devices, loading, error, refresh, remove, toggleStatus } = useDevices(filters);
  // console.log(devices, loading, error, refresh, remove, toggleStatus)
  // Stats
  const totalOnline = devices.filter((d) => d.status === "online").length;
  const totalOffline = devices.filter((d) => d.status === "offline").length;
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
      <main className="dashboard__main">
        {/* Topbar */}
        <header className="dashboard__topbar">
          <div className="dashboard__page-title">
            <h1>Devices</h1>
            <span className="dashboard__device-count">{devices.length} registered</span>
          </div>

          <div className="dashboard__controls">
            {/* Search */}
            <div className="dashboard__search-wrap">
              <span className="dashboard__search-icon">⌕</span>
              <input
                className="dashboard__search"
                type="text"
                placeholder="Search devices..."
                value={searchQ}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Status filter */}
            <div className="dashboard__filter-tabs">
              {(["all", "online", "offline"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  className={`dashboard__filter-tab ${statusFilter === s ? "active" : ""} ${s}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === "all" ? `All (${devices.length + (statusFilter !== "all" ? 0 : 0)})` : s === "online" ? `Online (${totalOnline})` : `Offline (${totalOffline})`}
                </button>
              ))}
            </div>

            <button className="dashboard__refresh-btn" onClick={refresh} title="Refresh">
              ↺
            </button>
          </div>
        </header>

        {/* Stat pills */}
        <div className="dashboard__stat-pills">
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

        {/* Content */}
        <div className="dashboard__content">
          {loading && (
            <div className="dashboard__state">
              <div className="dashboard__spinner" />
              <p>Connecting to vault...</p>
            </div>
          )}

          {error && !loading && (
            <div className="dashboard__state error">
              <span className="dashboard__state-icon">⚠</span>
              <p>{error}</p>
              <button onClick={refresh}>Retry</button>
            </div>
          )}

          {!loading && !error && devices.length === 0 && (
            <div className="dashboard__state empty">
              <span className="dashboard__state-icon">⬡</span>
              <p>No devices found</p>
              <span className="dashboard__state-sub">
                {searchQ ? "Try a different search term" : "Register your first device to get started"}
              </span>
            </div>
          )}

          {!loading && !error && devices.length > 0 && (
            <div className="dashboard__grid">
              {devices.map((device, i) => (
                <div key={device._id} style={{ animationDelay: `${i * 60}ms` }}>
                  <DeviceCard
                    device={device}
                    onDelete={remove}
                    onToggleStatus={toggleStatus}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}