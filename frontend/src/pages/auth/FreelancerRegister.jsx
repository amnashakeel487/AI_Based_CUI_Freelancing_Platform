import React, { useState } from 'react';

/* ---------- Components live OUTSIDE the page so inputs keep focus while typing ---------- */

const Ico = ({ children, size = '1.23em', color = '#7d8db0', w = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    style={{ width: size, height: size, flex: '0 0 auto' }}>{children}</svg>
);

const Eye = () => (
  <Ico><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Ico>
);
const Lock = () => (
  <Ico><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Ico>
);

const Field = ({ id, label, icon, error, ...props }) => (
  <div className="ca-field">
    <label htmlFor={id}>{label}</label>
    <div className="ca-box">{icon}<input id={id} {...props} /></div>
    {error && <p className="ca-err">{error}</p>}
  </div>
);

const PasswordField = ({ id, name, label, placeholder, value, onChange, show, onToggle, error }) => (
  <div className="ca-field">
    <label htmlFor={id}>{label}</label>
    <div className="ca-box">
      <Lock />
      <input id={id} name={name} type={show ? 'text' : 'password'} placeholder={placeholder} value={value} onChange={onChange} />
      <button type="button" aria-label="Toggle password visibility" onClick={onToggle}><Eye /></button>
    </div>
    {error && <p className="ca-err">{error}</p>}
  </div>
);

const Illustration = () => {
  const f = 'Plus Jakarta Sans, sans-serif';
  return (
    <svg className="ca-art" viewBox="0 0 410 260" role="img" aria-label="Laptop showing freelance project matches">
      <ellipse cx="215" cy="228" rx="190" ry="20" fill="#d6e5fb" />
      <circle cx="70" cy="140" r="62" fill="#dfeafc" />
      <path d="M72 36c40-30 110-10 130 18" fill="none" stroke="#2563eb" strokeWidth="1.2" strokeDasharray="3 4" />
      <rect x="14" y="4" width="54" height="54" rx="13" fill="#2563eb" />
      <g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
        <path d="M41 18v26" /><path d="M41 22c-5-5-14-2-14 5 0 3 1 4 3 5-2 3-1 7 3 8 3 1 6-1 8-3" />
        <path d="M41 22c5-5 14-2 14 5 0 3-1 4-3 5 2 3 1 7-3 8-3 1-6-1-8-3" />
      </g>
      <rect x="238" y="8" width="164" height="62" rx="9" fill="#fff" />
      <rect x="250" y="20" width="36" height="36" rx="8" fill="#e3eeff" />
      <rect x="260" y="30" width="16" height="12" rx="2.5" fill="#2563eb" />
      <rect x="296" y="24" width="88" height="5" rx="2.5" fill="#bcd0f2" />
      <rect x="296" y="36" width="64" height="5" rx="2.5" fill="#d3e0f6" />
      <rect x="296" y="50" width="22" height="5" rx="2.5" fill="#e3eaf7" />
      <rect x="364" y="49" width="20" height="8" rx="4" fill="#9db9ee" />
      <rect x="98" y="62" width="244" height="142" rx="8" fill="#12265a" />
      <rect x="105" y="69" width="230" height="128" rx="4" fill="#f3f7fe" />
      <rect x="105" y="69" width="38" height="128" fill="#1a2f6b" />
      <g fill="#6f93e6"><circle cx="116" cy="84" r="4" /><circle cx="116" cy="104" r="3" /><circle cx="116" cy="118" r="3" /><circle cx="116" cy="132" r="3" /></g>
      <rect x="150" y="76" width="176" height="12" rx="6" fill="#fff" />
      {[[150, 96], [244, 96], [150, 146], [244, 146]].map(([x, y]) => (
        <g key={x + '-' + y}><rect x={x} y={y} width="82" height="42" rx="6" fill="#fff" /><rect x={x + 26} y={y + 12} width="46" height="4" rx="2" fill="#cfdcf3" /></g>
      ))}
      <rect x="84" y="204" width="272" height="9" rx="4.5" fill="#c9d8f0" />
      <rect x="14" y="196" width="104" height="14" rx="3" fill="#1d3a8a" />
      <rect x="22" y="210" width="96" height="14" rx="3" fill="#2d56c4" />
      <rect x="44" y="164" width="30" height="32" rx="3" fill="#fff" />
      <path d="M58 164c-14-4-24-18-18-42 12 6 20 22 18 42z" fill="#2563eb" />
      <path d="M60 164c4-18 16-32 32-34-2 20-14 32-32 34z" fill="#1d4ed8" />
      <path d="M56 164c-10-8-24-6-32-22 16-2 28 6 32 22z" fill="#5b8def" />
      <rect x="318" y="100" width="100" height="108" rx="9" fill="#fff" />
      <text x="334" y="120" fontSize="9" fontWeight="700" fill="#12265a" fontFamily={f}>Match Score</text>
      <circle cx="368" cy="154" r="22" fill="none" stroke="#cfe0fb" strokeWidth="9" />
      <circle cx="368" cy="154" r="22" fill="none" stroke="#2563eb" strokeWidth="9" strokeDasharray="127 138" transform="rotate(-90 368 154)" />
      <text x="368" y="158" textAnchor="middle" fontSize="11" fontWeight="800" fill="#12265a" fontFamily={f}>92%</text>
      <path d="m334 192 2.2 4.6 5 .6-3.7 3.4 1 5-4.5-2.5-4.5 2.5 1-5-3.7-3.4 5-.6z" fill="#2563eb" />
      <rect x="348" y="196" width="56" height="5" rx="2.5" fill="#bcd0f2" />
    </svg>
  );
};

const features = [
  {
    t: 'AI-powered project matching',
    d: 'Get personalized project and freelancer recommendations based on your skills and preferences.',
    i: <><path d="M12 5v15" /><path d="M12 7C11 4.5 7 4 5.5 6.5 4 7 3.5 9 4.5 10 3 11.5 4 14 6 14.5c0 2 2.5 3 4 1.5" /><path d="M12 7c1-2.5 5-3 6.5-.5C20 7 20.5 9 19.5 10c1.5 1.5.5 4-1.5 4.5 0 2-2.5 3-4 1.5" /></>,
  },
  {
    t: 'Build your professional portfolio',
    d: 'Showcase your work, skills and experience to attract better opportunities.',
    i: <><rect x="3.5" y="4" width="17" height="16" rx="2.5" /><circle cx="9" cy="10" r="1.8" /><path d="m4 18 5-5 3.5 3.5 3-3L20 17" /></>,
  },
  {
    t: 'Manage projects in one place',
    d: 'Track deadlines, communicate with clients, and grow your career with ease.',
    i: <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  },
];

/*
  Everything is sized in "em". The page's base font-size follows the screen
  (smaller of height / width), so the whole layout scales up on big screens
  and down on small ones, always filling the viewport with no scrolling.
*/
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.ca{display:flex;height:100vh;overflow:hidden;font-size:clamp(10px,min(1.7vh,1.0vw),22px);font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:#fbfdff;color:#12265a}
.ca *{box-sizing:border-box}
.ca-left{flex:1 1 55%;display:flex;justify-content:center;align-items:center;padding:2vh 4vw;overflow-y:auto}
.ca-form{width:100%;max-width:38em;display:flex;flex-direction:column}
.ca-logo{display:flex;align-items:center;gap:.77em;font-size:1.65em;font-weight:800}
.ca-logo svg{width:1.6em;height:1.4em}
.ca-pill{margin-top:1.5em;align-self:flex-start;display:inline-flex;align-items:center;gap:.5em;background:#e3eeff;color:#2563eb;font-size:.8em;font-weight:700;letter-spacing:.04em;padding:.5em .9em;border-radius:999px}
.ca h1{margin:.45em 0 0;font-size:2.9em;line-height:1.1;font-weight:800;letter-spacing:-.015em}
.ca h1 span{color:#2563eb}
.ca-sub{margin:.8em 0 0;font-size:1.1em;line-height:1.5;color:#5b6b8c;max-width:28em}
.ca-fields{margin-top:1.6em;display:flex;flex-direction:column;gap:1.15em}
.ca-field{flex:1 1 12em;display:flex;flex-direction:column;gap:.55em;min-width:0}
.ca-fields>.ca-field{flex:0 0 auto}
.ca-field label{font-size:.95em;font-weight:700}
.ca-box{display:flex;align-items:center;gap:.8em;height:3.5em;padding:0 1.1em;background:#f7faff;border:1px solid #d3e0f4;border-radius:.65em}
.ca-box:focus-within{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12)}
.ca-box input{flex:1;min-width:0;border:0;outline:0;background:transparent;font-size:1.02em;font-family:inherit;color:#12265a}
.ca-box input::placeholder{color:#8a99b5}
.ca-box button{border:0;background:none;padding:0;cursor:pointer;display:flex}
.ca-row{display:flex;gap:1.15em}
.ca-check{display:flex;align-items:center;gap:.6em;font-size:.95em}
.ca-check input{width:1.2em;height:1.2em;margin:0;accent-color:#2563eb}
.ca a{color:#2563eb}
.ca-btn{height:3.6em;border:0;border-radius:.65em;background:#2563eb;color:#fff;font:600 1.1em 'Plus Jakarta Sans',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.6em;box-shadow:0 .5em 1.1em rgba(37,99,235,.25)}
.ca-btn:disabled{opacity:.6;cursor:not-allowed}
.ca-login{margin:0;text-align:center;font-size:.95em;color:#5b6b8c}
.ca-login a{font-weight:600;text-decoration:none}
.ca-err{margin:0;font-size:.85em;color:#ef4444}
.ca-right{flex:1 1 45%;background:#eaf2ff;padding:2vh 3vw;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.6em;overflow:hidden}
.ca-art{width:100%;max-width:34em;height:auto}
.ca-feats{width:100%;max-width:34em;display:flex;flex-direction:column;gap:1.9em}
.ca-feat{display:flex;gap:1.4em;align-items:flex-start}
.ca-ico{flex:0 0 auto;width:4em;height:4em;border-radius:50%;background:#dbe8fb;display:flex;align-items:center;justify-content:center}
.ca-feat h3{margin:0;font-size:1.1em;font-weight:700;line-height:1.25}
.ca-feat p{margin:.4em 0 0;font-size:.92em;line-height:1.5;color:#5b6b8c}
@media (max-width:900px){.ca-right{display:none}.ca{height:auto;min-height:100vh;overflow:visible}.ca-left{overflow:visible}}
`;

const FreelancerRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    else if (!formData.email.includes('comsats.edu.pk')) newErrors.email = 'Please use your COMSATS university email address';

    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the Terms of Service and Privacy Policy';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    // TODO: replace with the real registration API call
    setTimeout(() => {
      setLoading(false);
      console.log('Registration submitted:', formData);
      alert('Registration form is ready for backend integration');
    }, 2000);
  };

  return (
    <div className="ca">
      <style>{css}</style>

      <div className="ca-left">
        <form className="ca-form" onSubmit={handleSubmit} noValidate>
          <div className="ca-logo">
            <svg viewBox="0 0 36 32" aria-hidden="true">
              <path d="M18 2 2 10l16 8 16-8z" fill="#12265a" />
              <path d="M8 15v7c0 3 4.5 6 10 6s10-3 10-6v-7l-10 5z" fill="#1d3a8a" />
              <rect x="31" y="11" width="2" height="10" rx="1" fill="#2563eb" />
            </svg>
            CUI Freelance
          </div>

          <div className="ca-pill">
            <Ico size="1.1em" color="#2563eb" w={2.2}>
              <circle cx="9" cy="8" r="3.5" />
              <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
              <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.5c2 .7 3 2.6 3 5.5" />
            </Ico>
            JOIN THE CUI COMMUNITY
          </div>

          <h1>Create your freelancer <span>account</span></h1>
          <p className="ca-sub">Build your profile, showcase your skills, and discover projects matched to you.</p>

          <div className="ca-fields">
            <Field id="fullName" name="fullName" label="Full name" type="text" placeholder="e.g. Amna Shakeel"
              value={formData.fullName} onChange={handleChange} error={errors.fullName}
              icon={<Ico><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></Ico>} />

            <Field id="email" name="email" label="COMSATS email address" type="email" placeholder="name@comsats.edu.pk"
              value={formData.email} onChange={handleChange} error={errors.email}
              icon={<Ico><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></Ico>} />

            <Field id="phoneNumber" name="phoneNumber" label="Phone number" type="tel" placeholder="+92 3XX XXXXXXX"
              value={formData.phoneNumber} onChange={handleChange} error={errors.phoneNumber}
              icon={<Ico><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></Ico>} />

            <div className="ca-row">
              <PasswordField id="password" name="password" label="Password" placeholder="Enter your password"
                value={formData.password} onChange={handleChange}
                show={showPassword} onToggle={() => setShowPassword((s) => !s)} error={errors.password} />
              <PasswordField id="confirmPassword" name="confirmPassword" label="Confirm password" placeholder="Confirm your password"
                value={formData.confirmPassword} onChange={handleChange}
                show={showConfirmPassword} onToggle={() => setShowConfirmPassword((s) => !s)} error={errors.confirmPassword} />
            </div>

            <label className="ca-check">
              <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} />
              <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
            </label>
            {errors.agreeToTerms && <p className="ca-err">{errors.agreeToTerms}</p>}

            <button className="ca-btn" type="submit" disabled={!formData.agreeToTerms || loading}>
              {loading ? 'Creating account...' : 'Create account'}
              <Ico color="#fff" w={2}><path d="M5 12h14M13 6l6 6-6 6" /></Ico>
            </button>
            <p className="ca-login">Already have an account? <a href="/login">Log in</a></p>
          </div>
        </form>
      </div>

      <aside className="ca-right">
        <Illustration />
        <div className="ca-feats">
          {features.map((x) => (
            <div className="ca-feat" key={x.t}>
              <div className="ca-ico"><Ico size="2em" color="#2563eb" w={1.6}>{x.i}</Ico></div>
              <div><h3>{x.t}</h3><p>{x.d}</p></div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default FreelancerRegister;
