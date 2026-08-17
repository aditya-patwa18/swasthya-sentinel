import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, ArrowRight, Check, AlertCircle, FileSpreadsheet } from 'lucide-react';

const ReportForm = () => {
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Clinical Summary
    department: 'Outpatient Clinic',
    chiefComplaint: '',
    symptoms: [],
    symptomDuration: 3,
    patientCount: 1,
    ageGroup: 'Adult (19-60)',
    
    // Step 2: Diagnosis
    diseaseCategory: 'Respiratory',
    suspectedCondition: '',
    diagnosisStatus: 'Suspected',
    confirmedDiagnosis: '',

    // Step 3: Lab & AMR
    labPerformed: false,
    testName: '',
    testResult: '',
    cultureResult: '',
    pathogen: '',
    resistance: 'None',
    susceptibility: '',

    // Step 4: Medications
    antibioticPrescribed: false,
    antibioticName: '',
    antibioticClass: 'Fluoroquinolones',
    dosage: '500mg OD',
    duration: 5
  });

  const availableSymptoms = [
    'Fever', 'Cough', 'Sore Throat', 'Shortness of Breath', 'Diarrhea', 
    'Vomiting', 'Abdominal Cramps', 'Dysuria', 'Headache', 'Joint Pain', 
    'Skin Rashes', 'Fatigue', 'Chills', 'Nausea'
  ];

  const handleTextChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSymptomToggle = (symptom) => {
    const current = [...formData.symptoms];
    const index = current.indexOf(symptom);
    if (index === -1) {
      current.push(symptom);
    } else {
      current.splice(index, 1);
    }
    setFormData({ ...formData, symptoms: current });
  };

  const nextStep = () => {
    // Basic field validation
    if (step === 1) {
      if (!formData.chiefComplaint) return setError('Please specify the chief complaint.');
      if (formData.symptoms.length === 0) return setError('Please select at least one symptom.');
      if (formData.patientCount < 1) return setError('Patient count must be at least 1.');
    }
    if (step === 2) {
      if (!formData.suspectedCondition) return setError('Please enter the suspected/diagnosed condition.');
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/doctor');
        }, 2000);
      } else {
        setError(data.error || 'Submission failed.');
        setSubmitting(false);
      }
    } catch (err) {
      setError('Network error during report submission.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      {/* Wizard Step Progress Header */}
      <div style={styles.wizardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSpreadsheet color="#3b82f6" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Submit Surveillance Report</h2>
        </div>
        <div style={styles.stepIndicator}>
          Step {step} of 5
        </div>
      </div>

      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${(step / 5) * 100}%` }} />
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="glass-card" style={styles.successCard}>
          <div style={styles.successIcon}><Check size={28} /></div>
          <h3>Clinical report submitted successfully.</h3>
          <p>Your report has been added to the facility surveillance pipeline. Redirecting to workspace...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card" style={{ marginTop: '1.5rem' }}>
          {/* STEP 1: CLINICAL SUMMARY */}
          {step === 1 && (
            <div>
              <h3 style={styles.stepTitle}>Step 1 — Clinical Summary</h3>
              
              <div className="form-group">
                <label className="form-label">Clinic / Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleTextChange}
                  placeholder="General Medicine / Outpatient"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chief Complaint Summary</label>
                <textarea
                  name="chiefComplaint"
                  value={formData.chiefComplaint}
                  onChange={handleTextChange}
                  placeholder="e.g. Cough, high fever, and throat irritation"
                  className="form-control"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Observed Symptoms (Select All)</label>
                <div style={styles.symptomsGrid}>
                  {availableSymptoms.map((sym) => {
                    const isChecked = formData.symptoms.includes(sym);
                    return (
                      <button
                        type="button"
                        key={sym}
                        onClick={() => handleSymptomToggle(sym)}
                        style={{
                          ...styles.symptomTag,
                          backgroundColor: isChecked ? '#3b82f6' : '#ffffff',
                          color: isChecked ? '#ffffff' : '#334155',
                          borderColor: isChecked ? '#3b82f6' : '#cbd5e1'
                        }}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={styles.row}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Symptom Duration (Days)</label>
                  <input
                    type="number"
                    name="symptomDuration"
                    value={formData.symptomDuration}
                    onChange={handleTextChange}
                    min="1"
                    className="form-control"
                    required
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Patient Count (Group/Cluster)</label>
                  <input
                    type="number"
                    name="patientCount"
                    value={formData.patientCount}
                    onChange={handleTextChange}
                    min="1"
                    className="form-control"
                    required
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    Allows reporting aggregate clusters with similar symptoms.
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Patient Age Group</label>
                <select
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleTextChange}
                  className="form-control"
                >
                  <option value="Pediatric (0-12)">Pediatric (0-12)</option>
                  <option value="Adolescent (13-18)">Adolescent (13-18)</option>
                  <option value="Adult (19-60)">Adult (19-60)</option>
                  <option value="Geriatric (60+)">Geriatric (60+)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: DIAGNOSIS */}
          {step === 2 && (
            <div>
              <h3 style={styles.stepTitle}>Step 2 — Diagnostic Evaluation</h3>

              <div className="form-group">
                <label className="form-label">Surveillance Disease Category</label>
                <select
                  name="diseaseCategory"
                  value={formData.diseaseCategory}
                  onChange={handleTextChange}
                  className="form-control"
                >
                  <option value="Respiratory">Respiratory</option>
                  <option value="Fever">Fever / Vector-borne</option>
                  <option value="Gastrointestinal">Gastrointestinal</option>
                  <option value="Vector-borne">Vector-borne</option>
                  <option value="Skin">Skin</option>
                  <option value="Neurological">Neurological</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Suspected / Working Condition</label>
                <input
                  type="text"
                  name="suspectedCondition"
                  value={formData.suspectedCondition}
                  onChange={handleTextChange}
                  placeholder="e.g. Influenza-like Illness / Dengue Fever"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Diagnosis Status</label>
                <div style={styles.statusToggle}>
                  {['Suspected', 'Probable', 'Confirmed'].map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => setFormData({ ...formData, diagnosisStatus: status })}
                      style={{
                        ...styles.toggleBtn,
                        backgroundColor: formData.diagnosisStatus === status ? '#3b82f6' : '#f1f5f9',
                        color: formData.diagnosisStatus === status ? '#ffffff' : '#334155'
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {formData.diagnosisStatus === 'Confirmed' && (
                <div className="form-group">
                  <label className="form-label">Confirmed Diagnostic Summary</label>
                  <input
                    type="text"
                    name="confirmedDiagnosis"
                    value={formData.confirmedDiagnosis}
                    onChange={handleTextChange}
                    placeholder="e.g. Laboratory confirmed Influenza A"
                    className="form-control"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: LAB & AMR */}
          {step === 3 && (
            <div>
              <h3 style={styles.stepTitle}>Step 3 — Lab & Antimicrobial Data (Optional)</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Laboratory and antimicrobial susceptibility data strengthen AMR early-warning surveillance signals.
              </p>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="labPerformed"
                  name="labPerformed"
                  checked={formData.labPerformed}
                  onChange={handleTextChange}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="labPerformed" style={{ fontWeight: '600', cursor: 'pointer' }}>Lab diagnostics performed?</label>
              </div>

              {formData.labPerformed && (
                <div style={styles.collapsibleForm}>
                  <div style={styles.row}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Diagnostic Test Name</label>
                      <input
                        type="text"
                        name="testName"
                        value={formData.testName}
                        onChange={handleTextChange}
                        placeholder="e.g. Urine Culture / RT-PCR"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Test Result</label>
                      <input
                        type="text"
                        name="testResult"
                        value={formData.testResult}
                        onChange={handleTextChange}
                        placeholder="e.g. Positive / Growth detected"
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Identified Pathogen</label>
                    <input
                      type="text"
                      name="pathogen"
                      value={formData.pathogen}
                      onChange={handleTextChange}
                      placeholder="e.g. Escherichia coli"
                      className="form-control"
                    />
                  </div>

                  <div style={styles.row}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Culture AMR Sensitivity Status</label>
                      <select
                        name="resistance"
                        value={formData.resistance}
                        onChange={handleTextChange}
                        className="form-control"
                      >
                        <option value="None">No AMR testing / Not Resistant</option>
                        <option value="Resistant">Resistant</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Susceptible">Susceptible</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Tested Antibiotic Name (Resistant)</label>
                      <input
                        type="text"
                        name="antibioticName"
                        value={formData.antibioticName}
                        onChange={handleTextChange}
                        placeholder="e.g. Ciprofloxacin"
                        className="form-control"
                        disabled={formData.resistance === 'None'}
                        style={{ opacity: formData.resistance === 'None' ? 0.6 : 1 }}
                      />
                    </div>
                  </div>

                  {formData.resistance === 'Resistant' && (
                    <div className="form-group">
                      <label className="form-label">Alternative Antibiotics Showing Susceptibility</label>
                      <input
                        type="text"
                        name="susceptibility"
                        value={formData.susceptibility}
                        onChange={handleTextChange}
                        placeholder="e.g. Amikacin, Meropenem"
                        className="form-control"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: MEDICATIONS */}
          {step === 4 && (
            <div>
              <h3 style={styles.stepTitle}>Step 4 — Medication & Antibiotic Stewardship</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Monitors regional prescribing densities.
              </p>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="antibioticPrescribed"
                  name="antibioticPrescribed"
                  checked={formData.antibioticPrescribed}
                  onChange={handleTextChange}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="antibioticPrescribed" style={{ fontWeight: '600', cursor: 'pointer' }}>Antibiotics prescribed to patient(s)?</label>
              </div>

              {formData.antibioticPrescribed && (
                <div style={styles.collapsibleForm}>
                  <div style={styles.row}>
                    <div className="form-group" style={{ flex: 1.2 }}>
                      <label className="form-label">Antibiotic Name</label>
                      <input
                        type="text"
                        name="antibioticName"
                        value={formData.antibioticName}
                        onChange={handleTextChange}
                        placeholder="e.g. Ciprofloxacin / Amoxicillin"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 0.8 }}>
                      <label className="form-label">Drug Class</label>
                      <select
                        name="antibioticClass"
                        value={formData.antibioticClass}
                        onChange={handleTextChange}
                        className="form-control"
                      >
                        <option value="Penicillins">Penicillins</option>
                        <option value="Cephalosporins">Cephalosporins</option>
                        <option value="Fluoroquinolones">Fluoroquinolones</option>
                        <option value="Macrolides">Macrolides</option>
                        <option value="Aminoglycosides">Aminoglycosides</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div className="form-group" style={{ flex: 1.2 }}>
                      <label className="form-label">Dosage Instructions</label>
                      <input
                        type="text"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleTextChange}
                        placeholder="e.g. 500mg BD (twice daily)"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 0.8 }}>
                      <label className="form-label">Duration (Days)</label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleTextChange}
                        min="1"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div>
              <h3 style={styles.stepTitle}>Step 5 — Summary Review</h3>
              
              <div style={styles.reviewBox}>
                <div style={styles.reviewSection}>
                  <h4>Clinical Summary</h4>
                  <p><strong>Chief Complaint:</strong> {formData.chiefComplaint}</p>
                  <p><strong>Symptoms:</strong> {formData.symptoms.join(', ')}</p>
                  <p><strong>Duration:</strong> {formData.symptomDuration} days • <strong>Patient Caseload Count:</strong> {formData.patientCount}</p>
                  <p><strong>Age Cohort:</strong> {formData.ageGroup}</p>
                </div>

                <div style={styles.reviewSection}>
                  <h4>Diagnostic Evaluation</h4>
                  <p><strong>Disease Category:</strong> {formData.diseaseCategory}</p>
                  <p><strong>Working Condition:</strong> {formData.suspectedCondition} ({formData.diagnosisStatus})</p>
                  {formData.confirmedDiagnosis && <p><strong>Confirmed Diagnosis:</strong> {formData.confirmedDiagnosis}</p>}
                </div>

                <div style={styles.reviewSection}>
                  <h4>Laboratory Records</h4>
                  <p><strong>Lab Performed:</strong> {formData.labPerformed ? 'Yes' : 'No'}</p>
                  {formData.labPerformed && (
                    <>
                      <p><strong>Test & Result:</strong> {formData.testName} ({formData.testResult})</p>
                      {formData.pathogen && <p><strong>Pathogen:</strong> {formData.pathogen}</p>}
                      <p><strong>Antimicrobial Status:</strong> {formData.resistance === 'Resistant' ? `Resistant to ${formData.antibioticName}` : formData.resistance}</p>
                    </>
                  )}
                </div>

                <div style={{ ...styles.reviewSection, borderBottom: 'none' }}>
                  <h4>Prescribed Medications</h4>
                  <p><strong>Prescribed Antibiotic:</strong> {formData.antibioticPrescribed ? 'Yes' : 'No'}</p>
                  {formData.antibioticPrescribed && (
                    <p><strong>Prescription:</strong> {formData.antibioticName} ({formData.dosage} for {formData.duration} days)</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation controls */}
          <div style={styles.navigationRow}>
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="btn btn-secondary">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button type="button" onClick={nextStep} className="btn btn-primary">
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

const styles = {
  wizardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem'
  },
  stepIndicator: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    padding: '0.25rem 0.625rem',
    borderRadius: '4px'
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '1rem'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    transition: 'width 0.3s ease'
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    color: '#b91c1c',
    padding: '0.75rem',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.25rem'
  },
  successCard: {
    textAlign: 'center',
    padding: '3rem 2rem',
    marginTop: '2rem',
    h3: {
      color: '#10b981',
      fontSize: '1.25rem',
      marginBottom: '0.5rem'
    },
    p: {
      fontSize: '0.9rem',
      color: '#64748b'
    }
  },
  successIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#d1fae5',
    color: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem auto'
  },
  stepTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '1.25rem',
    color: '#0f172a',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.5rem'
  },
  symptomsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  symptomTag: {
    border: '1px solid',
    padding: '0.4rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  row: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  statusToggle: {
    display: 'flex',
    gap: '0.5rem',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    padding: '2px'
  },
  toggleBtn: {
    flex: 1,
    border: 'none',
    padding: '0.5rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  collapsibleForm: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '1rem',
    marginTop: '0.75rem'
  },
  reviewBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  reviewSection: {
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
    h4: {
      fontSize: '0.85rem',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '0.5rem'
    },
    p: {
      fontSize: '0.9rem',
      margin: '0.25rem 0',
      color: '#334155'
    }
  },
  navigationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2rem',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '1rem'
  }
};

export default ReportForm;
