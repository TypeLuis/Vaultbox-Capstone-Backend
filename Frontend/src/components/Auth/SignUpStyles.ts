// ─── STYLES ──────────────────────────────────────────────────────────────────
export const SignUpStyles: Record<string, React.CSSProperties> = {
    root: {
      display: "flex",
      minHeight: "100vh",
      width: "100vw",
      background: "#0a0a0f",
      fontFamily: "'DM Mono', 'Courier New', monospace",
    },
  
    panel: {
      flex: "0 0 44%",
      background: "linear-gradient(135deg, #0d0d18 0%, #110d1e 60%, #0a0f1a 100%)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "flex-end",
      padding: "48px",
      borderRight: "1px solid #1e1e2e",
    },
    panelNoise: {
      position: "absolute", inset: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      backgroundSize: "200px",
      opacity: 0.6,
      pointerEvents: "none",
    },
    panelGrid: {
      position: "absolute", inset: 0,
      backgroundImage: `linear-gradient(rgba(124,106,247,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,247,0.06) 1px, transparent 1px)`,
      backgroundSize: "40px 40px",
      pointerEvents: "none",
    },
    panelContent: { position: "relative", zIndex: 1 },
    logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 32 },
    logoMark: { fontSize: 28, color: "#7c6af7" },
    logoText: { fontSize: 18, fontWeight: 700, letterSpacing: "0.2em", color: "#f0f0f5" },
    panelTagline: {
      fontSize: 26, fontWeight: 600, lineHeight: 1.4,
      color: "#c8c8d8", margin: "0 0 36px",
    },
    featureList: { display: "flex", flexDirection: "column", gap: 12 },
    feature: { display: "flex", alignItems: "center", gap: 10 },
    featureDot: { fontSize: 8, color: "#7c6af7", flexShrink: 0 },
    featureText: { fontSize: 13, color: "#888" },
  
    formSide: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
    },
    formCard: { width: "100%", maxWidth: 400 },
    formHeader: { marginBottom: 28 },
    formTitle: { margin: "0 0 6px", fontSize: 24, fontWeight: 700, color: "#f0f0f5", letterSpacing: "-0.02em" },
    formSub: { margin: 0, fontSize: 13, color: "#555" },
  
    form: { display: "flex", flexDirection: "column", gap: 18 },
    field: { display: "flex", flexDirection: "column", gap: 8 },
    labelRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
    label: { fontSize: 11, fontWeight: 600, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase" },
    strengthLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" },
    input: {
      background: "#0d0d14",
      border: "1px solid #2a2a38",
      borderRadius: 10,
      padding: "12px 16px",
      color: "#e2e2e8",
      fontSize: 14,
      outline: "none",
      fontFamily: "inherit",
      transition: "border-color 0.2s, box-shadow 0.2s",
      width: "100%",
      boxSizing: "border-box" as const,
    },
  
    strengthBar: { display: "flex", gap: 4, marginTop: -2 },
    strengthSegment: { flex: 1, height: 3, borderRadius: 2 },
  
    submitBtn: {
      background: "#7c6af7",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "13px 20px",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "inherit",
      letterSpacing: "0.02em",
      transition: "all 0.2s",
      marginTop: 4,
    },
    submitBtnLoading: { opacity: 0.7, cursor: "not-allowed" },
    btnInner: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
    btnArrow: {},
  
    errorBox: {
      background: "#1e0e0e",
      border: "1px solid #4a1e1e",
      borderRadius: 10,
      padding: "12px 16px",
      marginBottom: 4,
    },
    errorItem: { margin: "2px 0", fontSize: 12, color: "#f87171" },
  
    switchText: { textAlign: "center" as const, fontSize: 13, color: "#555", marginTop: 24 },
    switchLink: { color: "#7c6af7", textDecoration: "none", fontWeight: 600 },
  };
  
export const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
  
    .vault-input:focus {
      border-color: #7c6af7 !important;
      box-shadow: 0 0 0 3px rgba(124, 106, 247, 0.12) !important;
    }
    .vault-btn:hover:not(:disabled) {
      background: #8f7fff !important;
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(124, 106, 247, 0.3);
    }
    .vault-btn:active:not(:disabled) {
      transform: translateY(0);
    }
    .vault-spinner {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: vspin 0.7s linear infinite;
    }
    @keyframes vspin { to { transform: rotate(360deg); } }
    .vault-card {
      animation: vfadein 0.4s ease both;
    }
    @keyframes vfadein {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;