import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FlaskConical, Check, AlertCircle } from 'lucide-react';

const LabReportForm = () => {
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    department: 'Microbiology Lab',
    chiefComplaint: 'Culture and sensitivity referral',
    symptoms: ['Fever'],
    symptomDuration: 3,
    patientCount: 1,
    ageGroup: 'Adult (19-60)',
    diseaseCategory: 'Other',
    suspectedCondition: 'Suspected Infection',
    diagnosisStatus: 'Confirmed',
    labPerformed: true,
    testName: 'Culture & Sensitivity',
    testResult: '',
    cultureResult: '',
    pathogen: '',
    resistance: 'Resistant',
    antibioticName: '',
    antibioticClass: 'Fluoroquinolones',
    susceptibility: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.pathogen || !formData.antibioticName) {
      return setError('Pathogen and antibiotic name are required.');
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/lab'), 1800);
      } else {
        setError(data.error || 'Submission failed.');
        setSubmitting(false);
      }
    } catch (err) {
      setError('Network error during submission.');
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="glass-card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Check size={28} />
        </div>
        <h3 style={{ color: '#10b981', fontSize: '1.25rem' }}>AMR report submitted successfully.</h3>
        <p style={{ color: '#4a665e', fontSize: '0.9rem' }}>Feeds into national AMR Watch. Redirecting...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <FlaskConical color="#0f766e" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1b332a' }}>Submit Culture / AMR Report</h2>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#dc2626', padding: '0.75rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card">
        <div className="form-group">
          <label className="form-label">Identified Pathogen</label>
          <input type="text" name="pathogen" value={formData.pathogen} onChange={handleChange} placeholder="e.g. Escherichia coli" className="form-control" required />
        </div>

        <div className="form-group">
          <label className="form-label">Culture Result</label>
          <input type="text" name="cultureResult" value={formData.cultureResult} onChange={handleChange} placeholder="e.g. E. coli > 10^5 CFU/mL" className="form-control" />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Tested Antibiotic</label>
            <input type="text" name="antibioticName" value={formData.antibioticName} onChange={handleChange} placeholder="e.g. Ciprofloxacin" className="form-control" required />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Antibiotic Class</label>
            <select name="antibioticClass" value={formData.antibioticClass} onChange={handleChange} className="form-control">
              <option>Penicillins</option>
              <option>Cephalosporins</option>
              <option>Fluoroquinolones</option>
              <option>Macrolides</option>
              <option>Aminoglycosides</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Sensitivity Result</label>
          <div style={{ display: 'flex', gap: '0.5rem', borderRadius: 6, overflow: 'hidden', background: '#f1f5f9', padding: 2 }}>
            {['Resistant', 'Intermediate', 'Susceptible'].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setFormData({ ...formData, resistance: s })}
                style={{
                  flex: 1, border: 'none', padding: '0.5rem', borderRadius: 4, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: formData.resistance === s ? '#1b4d3e' : 'transparent',
                  color: formData.resistance === s ? '#fff' : '#334155'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {formData.resistance === 'Resistant' && (
          <div className="form-group">
            <label className="form-label">Alternative Antibiotics Showing Susceptibility</label>
            <input type="text" name="susceptibility" value={formData.susceptibility} onChange={handleChange} placeholder="e.g. Amikacin, Meropenem" className="form-control" />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Test Result Summary</label>
          <input type="text" name="testResult" value={formData.testResult} onChange={handleChange} placeholder="e.g. Growth of Escherichia coli" className="form-control" />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit AMR Report'}
        </button>
      </form>
    </div>
  );
};

export default LabReportForm;
