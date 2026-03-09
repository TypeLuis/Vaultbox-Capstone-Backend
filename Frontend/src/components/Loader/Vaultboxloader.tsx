import React from "react";
import "./Vaultboxloader.scss";

interface VaultBoxLoaderProps {
  message?: string;
}

const VaultBoxLoader: React.FC<VaultBoxLoaderProps> = ({
  message = "Initializing vault...",
}) => {
  return (
    <div className="vaultbox-loader">
      <div className="loader-backdrop" />

      <div className="loader-content">
        <div className="icon-wrapper">
          {/* Orbiting ring */}
          <div className="orbit-ring" />
          <div className="orbit-ring orbit-ring--delayed" />

          {/* Pulse rings */}
          <div className="pulse-ring pulse-ring--1" />
          <div className="pulse-ring pulse-ring--2" />
          <div className="pulse-ring pulse-ring--3" />

         
        </div>

        {/* Text + progress bar */}
        <div className="loader-text">
          <span className="loader-message">{message}</span>
          {/* <div className="progress-track">
            <div className="progress-fill" />
          </div> */}
          <div className="loader-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultBoxLoader;