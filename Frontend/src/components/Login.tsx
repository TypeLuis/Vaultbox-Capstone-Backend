import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authcontext";
import { useNavigate } from "react-router-dom";
import { LoginStyles, css } from "../styles/LoginStyles";
import type { FormData } from "../utilities/types/types";

type LoginProps = {
  setNewUser:  React.Dispatch<React.SetStateAction<boolean>>
}

const LoginForm = ({setNewUser}:LoginProps) => {
  const {login} = useAuth()
  const nav = useNavigate()

  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    try {
      await login(formData);
      nav("/dashboard");
    } catch (error: any) {
      setErrors(
        error.response.data.errors.map((err: any, i: number) => (
          <p key={i} style={LoginStyles.errorItem}>{err.msg || err}</p>
        ))
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{css}</style>
      <div style={LoginStyles.root}>
        {/* Left panel — decorative */}
        <div style={LoginStyles.panel}>
          <div style={LoginStyles.panelNoise} />
          <div style={LoginStyles.panelGrid} />
          <div style={LoginStyles.panelContent}>
            <div style={LoginStyles.logo}>
              <span style={LoginStyles.logoMark}>◈</span>
              <span style={LoginStyles.logoText}>VAULTBOX</span>
            </div>
            <p style={LoginStyles.panelTagline}>
              Secure file storage,<br />beautifully managed.
            </p>
            <div style={LoginStyles.panelStats}>
              <div style={LoginStyles.stat}>
                <span style={LoginStyles.statNum}>∞</span>
                <span style={LoginStyles.statLabel}>Storage</span>
              </div>
              <div style={LoginStyles.statDivider} />
              <div style={LoginStyles.stat}>
                <span style={LoginStyles.statNum}>E2E</span>
                <span style={LoginStyles.statLabel}>Encrypted</span>
              </div>
              <div style={LoginStyles.statDivider} />
              <div style={LoginStyles.stat}>
                <span style={LoginStyles.statNum}>↯</span>
                <span style={LoginStyles.statLabel}>Fast</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div style={LoginStyles.formSide}>
          <div style={LoginStyles.formCard} className="vault-card">
            <div style={LoginStyles.formHeader}>
              <h1 style={LoginStyles.formTitle}>Welcome back</h1>
              <p style={LoginStyles.formSub}>Sign in to your account</p>
            </div>

            {errors && <div style={LoginStyles.errorBox}>{errors}</div>}

            <form autoComplete="off" onSubmit={handleSubmit} style={LoginStyles.form}>
              <div style={LoginStyles.field}>
                <label htmlFor="email" style={LoginStyles.label}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  onChange={handleChange}
                  value={formData.email}
                  style={LoginStyles.input}
                  className="vault-input"
                  required
                />
              </div>

              <div style={LoginStyles.field}>
                <label htmlFor="password" style={LoginStyles.label}>Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  minLength={6}
                  onChange={handleChange}
                  value={formData.password}
                  style={LoginStyles.input}
                  className="vault-input"
                  required
                />
              </div>

              <button
                type="submit"
                style={{ ...LoginStyles.submitBtn, ...(loading ? LoginStyles.submitBtnLoading : {}) }}
                disabled={loading}
                className="vault-btn"
              >
                {loading ? (
                  <span style={LoginStyles.btnInner}>
                    <span className="vault-spinner" />
                    Signing in…
                  </span>
                ) : (
                  <span style={LoginStyles.btnInner}>
                    Sign In <span style={LoginStyles.btnArrow}>→</span>
                  </span>
                )}
              </button>
            </form>

            <p style={LoginStyles.switchText}>
              Don't have an account?{" "}
              <button onClick={()=>{setNewUser(true)}} style={LoginStyles.switchLink}>Sign up</button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
