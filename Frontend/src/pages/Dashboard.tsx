import { useState } from "react";
import "../styles/Dashboard.scss";
import { DevicesPage } from "./Devicepage";
import NavDashboard from "../components/NavDashboard/NavDashboard";
import { FilesPage } from "./FilePage";


export type Page = "devices" | "files" | "apps" | "settings";


function ComingSoon({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="coming-soon">
      <span className="coming-soon__icon">{icon}</span>
      <h2>{label}</h2>
      <p>Coming soon</p>
    </div>
  );
}



export default function Dashboard() {
  const [activePage, setActivePage] = useState<Page>("devices");
  // const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="dashboard">
      {/* Background grid */}
      <div className="dashboard__grid-bg" />

      {/* Sidebar */}
      <NavDashboard activePage={activePage} setActivePage={setActivePage} />

      {/* Main */}
      {activePage === "devices" && <DevicesPage />}
      {activePage === "files" && <FilesPage />}
      {activePage === "apps" && <ComingSoon label="Apps" icon="⊞" />}
      {activePage === "settings" && <ComingSoon label="Settings" icon="⚙" />}
    </div>
  );
}