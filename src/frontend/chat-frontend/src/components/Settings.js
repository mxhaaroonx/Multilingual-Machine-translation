import React, { useState } from 'react';
import axios from 'axios';
import { Camera, X } from 'lucide-react';
import './Settings.css';

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

function Settings({ currentUser, onClose, onUpdate }) {
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [preferredLanguage, setPreferredLanguage] = useState(currentUser.preferredLanguage || 'english');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(currentUser.profilePhotoUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('preferredLanguage', preferredLanguage);
      formData.append('bio', bio);
      formData.append('username', username);
      if (photo) formData.append('photo', photo);

      const res = await axios.put(
        `http://localhost:8080/api/users/settings/${currentUser.id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      localStorage.setItem('user', JSON.stringify(res.data));
      onUpdate(res.data);
      setSuccess('Settings saved!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="settings-body">
          <div className="photo-section">
            <div className="settings-photo" onClick={() => document.getElementById('settingsPhoto').click()}>
              {photoPreview ? (
                <img src={photoPreview} alt="profile" />
              ) : (
                <div className="photo-initial">{currentUser.username[0].toUpperCase()}</div>
              )}
              <div className="photo-overlay">
                <Camera size={24} />
              </div>
            </div>
            <input id="settingsPhoto" type="file" accept="image/*"
              onChange={handlePhotoChange} style={{ display: 'none' }} />
            <p className="photo-hint">Click to change photo</p>
          </div>

          <div className="settings-field">
            <label>Username</label>
            <input type="text" value={username}
              onChange={e => setUsername(e.target.value)} />
          </div>

          <div className="settings-field">
            <label>Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)}
              rows={3} placeholder="Tell us about yourself..." />
          </div>

          <div className="settings-field">
            <label>Preferred Language</label>
            <select value={preferredLanguage}
              onChange={e => setPreferredLanguage(e.target.value)}>
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          {error && <div className="settings-error">{error}</div>}
          {success && <div className="settings-success">{success}</div>}

          <button className="save-btn" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;