import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth} from '../../context/authcontext';
import { SignUpStyles, css } from './SignUpStyles';
import type { FormData } from '../../utilities/types/types';

type SignupProps = {
  setNewUser:  React.Dispatch<React.SetStateAction<boolean>>
}

const SignUp = ({setNewUser}:SignupProps) => {
  const {signup} = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<React.ReactNode[] | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name : "",
    email: "",
    password: "",
    password2: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      setErrors([<p key="mismatch" style={SignUpStyles.errorItem}>Passwords don't match</p>]);
      return;
    }
    setLoading(true);
    setErrors(null);
    try {
      await signup(formData);
      nav("/dashboard");
    } catch (error: any) {
      setErrors(
        error.response.data.errors.map((err: any, i: number) => (
          <p key={i} style={SignUpStyles.errorItem}>{err.msg || err}</p>
        ))
      );
    } finally {
      setLoading(false);
    }
  }

  const pwLen = formData.password.length;
  const strength = pwLen === 0 ? 0 : pwLen < 6 ? 1 : pwLen < 10 ? 2 : 3;
  const strengthColor = ["transparent", "#f87171", "#facc15", "#4ade80"][strength];
  const strengthLabel = ["", "Weak", "Fair", "Strong"][strength];


//   const handleClick = () => {
//     setNewUser(false);
//   };

return (
  <>
    <style>{css}</style>
    <div style={SignUpStyles.root}>
      {/* Left decorative panel */}
      <div style={SignUpStyles.panel}>
        <div style={SignUpStyles.panelNoise} />
        <div style={SignUpStyles.panelGrid} />
        <div style={SignUpStyles.panelContent}>
          <div style={SignUpStyles.logo}>
            <span style={SignUpStyles.logoMark}>◈</span>
            <span style={SignUpStyles.logoText}>VAULTBOX</span>
          </div>
          <p style={SignUpStyles.panelTagline}>
            Your files,<br />under your control.
          </p>
          <div style={SignUpStyles.featureList}>
            {["Device-based file organization", "MinIO-powered object storage", "Secure JWT authentication", "Instant file previews"].map((f, i) => (
              <div key={i} style={SignUpStyles.feature}>
                <span style={SignUpStyles.featureDot}>◆</span>
                <span style={SignUpStyles.featureText}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form side */}
      <div style={SignUpStyles.formSide}>
        <div style={SignUpStyles.formCard} className="vault-card">
          <div style={SignUpStyles.formHeader}>
            <h1 style={SignUpStyles.formTitle}>Create account</h1>
            <p style={SignUpStyles.formSub}>Start managing your files today</p>
          </div>

          {errors && <div style={SignUpStyles.errorBox}>{errors}</div>}

          <form autoComplete="off" onSubmit={handleSubmit} style={SignUpStyles.form}>
            <div style={SignUpStyles.field}>
              <label htmlFor="name1" style={SignUpStyles.label}>Full Name</label>
              <input
                type="text"
                id="name1"
                name="name"
                placeholder="Jane Smith"
                onChange={handleChange}
                value={formData.name}
                style={SignUpStyles.input}
                className="vault-input"
                required
              />
            </div>

            <div style={SignUpStyles.field}>
              <label htmlFor="email1" style={SignUpStyles.label}>Email</label>
              <input
                type="email"
                id="email1"
                name="email"
                placeholder="you@example.com"
                onChange={handleChange}
                value={formData.email}
                style={SignUpStyles.input}
                className="vault-input"
                required
              />
            </div>

            <div style={SignUpStyles.field}>
              <div style={SignUpStyles.labelRow}>
                <label htmlFor="password1" style={SignUpStyles.label}>Password</label>
                {strength > 0 && (
                  <span style={{ ...SignUpStyles.strengthLabel, color: strengthColor }}>{strengthLabel}</span>
                )}
              </div>
              <input
                type="password"
                id="password1"
                name="password"
                placeholder="Min. 6 characters"
                minLength={6}
                onChange={handleChange}
                value={formData.password}
                style={SignUpStyles.input}
                className="vault-input"
                required
              />
              {/* Strength bar */}
              <div style={SignUpStyles.strengthBar}>
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    style={{
                      ...SignUpStyles.strengthSegment,
                      background: strength >= level ? strengthColor : "#1e1e2e",
                      transition: "background 0.3s",
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={SignUpStyles.field}>
              <label htmlFor="password2" style={SignUpStyles.label}>Confirm Password</label>
              <input
                type="password"
                id="password2"
                name="password2"
                placeholder="••••••••"
                minLength={6}
                onChange={handleChange}
                value={formData.password2}
                style={{
                  ...SignUpStyles.input,
                  ...(formData.password2 && formData.password !== formData.password2
                    ? { borderColor: "#f87171" }
                    : formData.password2 && formData.password === formData.password2
                    ? { borderColor: "#4ade80" }
                    : {}),
                }}
                className="vault-input"
                required
              />
            </div>

            <button
              type="submit"
              style={{ ...SignUpStyles.submitBtn, ...(loading ? SignUpStyles.submitBtnLoading : {}) }}
              disabled={loading}
              className="vault-btn"
            >
              {loading ? (
                <span style={SignUpStyles.btnInner}>
                  <span className="vault-spinner" />
                  Creating account…
                </span>
              ) : (
                <span style={SignUpStyles.btnInner}>
                  Create Account <span style={SignUpStyles.btnArrow}>→</span>
                </span>
              )}
            </button>
          </form>

          <p style={SignUpStyles.switchText}>
            Already have an account?{" "}
            <button onClick={()=>{setNewUser(false)}} style={SignUpStyles.switchLink}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  </>
);
};

export default SignUp;
