import React, { useState } from 'react';
import axios from 'axios';
import { MessageCircle, Mail, Camera, Lock, User, ArrowRight } from 'lucide-react';
import './Auth.css';

const LANGUAGES = [
  { value: 'hindi', label: 'Hindi' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'odia', label: 'Odia' },
  { value: 'english', label: 'English' },
];

function Auth({ onLogin }) {
  const [mode, setMode] = useState('login'); // login | register | verify | profile
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // OTP
  const [otp, setOtp] = useState('');

  // Profile fields
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const res = await axios.post('http://localhost:8080/api/users/login', {
        email: loginEmail,
        password: loginPassword
      });
      localStorage.setItem('user', JSON.stringify(res.data));
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!regEmail || !regPassword || !regConfirm) { setError('Please fill in all fields'); return; }
    if (regPassword !== regConfirm) { setError('Passwords do not match'); return; }
    if (regPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      await axios.post('http://localhost:8080/api/users/register/initiate', {
        email: regEmail,
        password: regPassword
      });
      setMode('verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (!otp) { setError('Please enter the OTP'); return; }
    setLoading(true); setError('');
    try {
      await axios.post('http://localhost:8080/api/users/register/verify', {
        email: regEmail,
        otp: otp
      });
      setMode('profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCompleteProfile = async () => {
    if (!username.trim()) { setError('Please enter a username'); return; }
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('email', regEmail);
      formData.append('username', username);
      if (bio) formData.append('bio', bio);
      if (photo) formData.append('photo', photo);

      const res = await axios.post(
        'http://localhost:8080/api/users/register/complete',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      localStorage.setItem('user', JSON.stringify(res.data));
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Profile setup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <MessageCircle size={48} className="brand-icon" />
          <h1>BharatChat</h1>
          <p>Connect across languages seamlessly</p>
        </div>
        <div className="auth-content">
          {/* LOGIN */}
          {mode === 'login' && (
            <>
              <div className="auth-header">
                <h2>Welcome Back!</h2>
                <p>Sign in to continue</p>
              </div>
              <div className="auth-tabs">
                <button className="tab active">Login</button>
                <button className="tab" onClick={() => { setMode('register'); setError(''); }}>Sign Up</button>
              </div>
              <div className="auth-form">
                <div className="input-group">
                  <Mail size={18} className="input-icon" />
                  <input type="email" placeholder="Email Address" value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                <div className="input-group">
                  <Lock size={18} className="input-icon" />
                  <input type="password" placeholder="Password" value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                {error && <div className="error">{error}</div>}
                <button className="submit-btn" onClick={handleLogin} disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <button className="link-btn" onClick={() => { }}>Forgot Password?</button>
              </div>
            </>
          )}

          {/* REGISTER */}
          {mode === 'register' && (
            <>
              <div className="auth-header">
                <h2>Create Account</h2>
                <p>Sign up to get started</p>
              </div>
              <div className="auth-tabs">
                <button className="tab" onClick={() => { setMode('login'); setError(''); }}>Login</button>
                <button className="tab active">Sign Up</button>
              </div>
              <div className="auth-form">
                <div className="input-group">
                  <Mail size={18} className="input-icon" />
                  <input type="email" placeholder="Email Address" value={regEmail}
                    onChange={e => setRegEmail(e.target.value)} />
                </div>
                <div className="input-group">
                  <Lock size={18} className="input-icon" />
                  <input type="password" placeholder="Password (min 6 chars)" value={regPassword}
                    onChange={e => setRegPassword(e.target.value)} />
                </div>
                <div className="input-group">
                  <Lock size={18} className="input-icon" />
                  <input type="password" placeholder="Confirm Password" value={regConfirm}
                    onChange={e => setRegConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRegister()} />
                </div>
                {error && <div className="error">{error}</div>}
                <button className="submit-btn" onClick={handleRegister} disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Continue'} <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}

          {/* VERIFY OTP */}
          {mode === 'verify' && (
            <div className="auth-form verify-form">
              <div className="auth-header">
                <h2>Verify Email</h2>
                <p>Enter the code we sent you</p>
              </div>
              <div className="verify-info">
                <Mail size={40} className="verify-icon-svg" />
                <p>We sent a 6-digit code to</p>
                <strong>{regEmail}</strong>
              </div>
              <input
                type="text"
                placeholder="••••••"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
                className="otp-input"
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
              />
              {error && <div className="error">{error}</div>}
              <button className="submit-btn" onClick={handleVerify} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button className="link-btn" onClick={() => handleRegister()}>
                Resend OTP
              </button>
            </div>
          )}

          {/* PROFILE SETUP */}
          {mode === 'profile' && (
            <div className="auth-form">
              <div className="auth-header">
                <h2>Almost There!</h2>
                <p>Set up your profile details</p>
              </div>

              <div className="photo-upload" onClick={() => document.getElementById('photoInput').click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="photo-preview" />
                ) : (
                  <div className="photo-placeholder">
                    <Camera size={32} />
                    <p>Add Photo</p>
                  </div>
                )}
              </div>
              <input id="photoInput" type="file" accept="image/*"
                onChange={handlePhotoChange} style={{ display: 'none' }} />

              <div className="input-group">
                <User size={18} className="input-icon" />
                <input type="text" placeholder="Username" value={username}
                  onChange={e => setUsername(e.target.value)} />
              </div>
              <textarea placeholder="Bio (optional)" value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3} style={{ resize: 'none' }} />

              {error && <div className="error">{error}</div>}
              <button className="submit-btn" onClick={handleCompleteProfile} disabled={loading}>
                {loading ? 'Saving...' : 'Finish Setup'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;