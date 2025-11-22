import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import { addBPReading, getBPReadings, addSugarReading, getSugarReadings } from '../../services/apiService';
import api from '../../services/api';
import { FiActivity, FiPlus } from 'react-icons/fi';
import '../Dashboard.css';

const HealthTracking = () => {
  const [activeTab, setActiveTab] = useState('bp');
  const [bpReadings, setBpReadings] = useState([]);
  const [sugarReadings, setSugarReadings] = useState([]);
  const [bpMedication, setBpMedication] = useState(null);
  const [sugarMedication, setSugarMedication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    sugarLevel: '',
    mealContext: 'fasting'
  });
  const [medicationData, setMedicationData] = useState({
    drugName: '',
    dosage: '',
    tabletsPerDay: '',
    stockAvailable: ''
  });
  const [showMedicationModal, setShowMedicationModal] = useState(false);

  useEffect(() => {
    fetchReadings();
  }, []);

  const fetchReadings = async () => {
    try {
      console.log('[HealthTracking] Fetching readings...');
      
      // Fetch readings (limited to last 50)
      const [bpReadingsRes, sugarReadingsRes, bpDocRes, sugarDocRes] = await Promise.all([
        api.get('/user/BP?include=readings&limit=50').catch(err => {
          console.log('[HealthTracking] BP readings error:', err.response?.status, err.response?.data);
          return null;
        }),
        api.get('/user/Sugar?include=readings&limit=50').catch(err => {
          console.log('[HealthTracking] Sugar readings error:', err.response?.status, err.response?.data);
          return null;
        }),
        api.get('/user/BP?include=document').catch(err => {
          console.log('[HealthTracking] BP document error:', err.response?.status, err.response?.data);
          return null;
        }),
        api.get('/user/Sugar?include=document').catch(err => {
          console.log('[HealthTracking] Sugar document error:', err.response?.status, err.response?.data);
          return null;
        })
      ]);
      
      console.log('[HealthTracking] BP readings response:', bpReadingsRes?.data);
      console.log('[HealthTracking] Sugar readings response:', sugarReadingsRes?.data);
      console.log('[HealthTracking] BP document response:', bpDocRes?.data);
      console.log('[HealthTracking] Sugar document response:', sugarDocRes?.data);
      
      setBpReadings(bpReadingsRes?.data?.readings || []);
      setSugarReadings(sugarReadingsRes?.data?.readings || []);
      setBpMedication(bpDocRes?.data?.document || null);
      setSugarMedication(sugarDocRes?.data?.document || null);
      
      console.log('[HealthTracking] State updated - BP readings:', bpReadingsRes?.data?.readings?.length || 0);
      console.log('[HealthTracking] State updated - Sugar readings:', sugarReadingsRes?.data?.readings?.length || 0);
    } catch (error) {
      console.error('[HealthTracking] Error fetching readings:', error);
      toast.error('Failed to load health tracking data');
    }
  };

  const handleMedicationSubmit = async (e) => {
    e.preventDefault();
    try {
      const medicationPayload = {
        drugName: medicationData.drugName,
        dosage: medicationData.dosage,
        tabletsPerDay: Number(medicationData.tabletsPerDay),
        stockAvailable: Number(medicationData.stockAvailable)
      };

      if (activeTab === 'bp') {
        await api.post('/user/BP', medicationPayload);
        toast.success('BP medication profile updated');
      } else {
        await api.post('/user/Sugar', medicationPayload);
        toast.success('Sugar medication profile updated');
      }
      setShowMedicationModal(false);
      setMedicationData({ drugName: '', dosage: '', tabletsPerDay: '', stockAvailable: '' });
      fetchReadings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update medication');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'bp') {
        await addBPReading({
          systolic: Number(formData.systolic),
          diastolic: Number(formData.diastolic),
          pulse: Number(formData.pulse),
          recordedAt: new Date().toISOString()
        });
        toast.success('BP reading added');
      } else {
        await addSugarReading({
          level: Number(formData.sugarLevel),
          type: formData.mealContext,
          recordedAt: new Date().toISOString()
        });
        toast.success('Sugar reading added');
      }
      setShowModal(false);
      setFormData({ systolic: '', diastolic: '', pulse: '', sugarLevel: '', mealContext: 'fasting' });
      fetchReadings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add reading');
    }
  };

  const currentReadings = activeTab === 'bp' ? bpReadings : sugarReadings;
  const currentMedication = activeTab === 'bp' ? bpMedication : sugarMedication;

  console.log('[HealthTracking] Rendering - activeTab:', activeTab);
  console.log('[HealthTracking] Rendering - currentReadings:', currentReadings?.length || 0);
  console.log('[HealthTracking] Rendering - currentMedication:', currentMedication);

  return (
    <div className="dashboard-layout">
      <Sidebar role="patient" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1><FiActivity /> Health Tracking</h1>
          <p>Monitor your blood pressure and blood sugar levels</p>
        </div>

        <div className="page-section">
          <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)'}}>
            <button
              onClick={() => setActiveTab('bp')}
              style={{
                padding: '0.875rem 1.5rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'bp' ? '3px solid var(--bright-teal-blue)' : 'none',
                color: activeTab === 'bp' ? 'var(--bright-teal-blue)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'bp' ? '600' : '400',
                cursor: 'pointer'
              }}
            >
              Blood Pressure
            </button>
            <button
              onClick={() => setActiveTab('sugar')}
              style={{
                padding: '0.875rem 1.5rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'sugar' ? '3px solid var(--bright-teal-blue)' : 'none',
                color: activeTab === 'sugar' ? 'var(--bright-teal-blue)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'sugar' ? '600' : '400',
                cursor: 'pointer'
              }}
            >
              Blood Sugar
            </button>
          </div>

          {/* Debug Info - Remove after testing */}
          <div style={{background: '#f0f0f0', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'monospace'}}>
            <strong>Current Info:</strong><br/>
            Active Tab: {activeTab}<br/>
            BP Readings: {bpReadings.length}<br/>
            Sugar Readings: {sugarReadings.length}<br/>
            BP Medication: {bpMedication ? 'Loaded' : 'null'} {bpMedication && `(${bpMedication.drugName})`}<br/>
            Sugar Medication: {sugarMedication ? 'Loaded' : 'null'} {sugarMedication && `(${sugarMedication.drugName})`}<br/>
            Current Medication: {currentMedication ? 'Loaded' : 'null'}<br/>
            Current Readings: {currentReadings.length}
          </div>

          {/* Medication Info Card */}
          {currentMedication && (
            <div style={{
              background: 'var(--bg-secondary)',
              border: '2px solid var(--bright-teal-blue)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{color: 'var(--bright-teal-blue)', marginBottom: '0.75rem', fontSize: '1.1rem'}}>💊 Current Medication</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                <div>
                  <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem'}}>Drug Name</p>
                  <p style={{color: 'var(--text-primary)', fontWeight: '600'}}>{currentMedication?.drugName || 'N/A'}</p>
                </div>
                <div>
                  <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem'}}>Dosage</p>
                  <p style={{color: 'var(--text-primary)', fontWeight: '600'}}>{currentMedication?.dosage || 'N/A'}</p>
                </div>
                <div>
                  <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem'}}>Per Day</p>
                  <p style={{color: 'var(--text-primary)', fontWeight: '600'}}>{currentMedication?.tabletsPerDay || 0} tablet(s)</p>
                </div>
                <div>
                  <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem'}}>Stock Available</p>
                  <p style={{
                    color: (currentMedication?.stockAvailable || 0) < 5 ? '#ff6b6b' : 'var(--text-primary)',
                    fontWeight: '600'
                  }}>
                    {currentMedication?.stockAvailable || 0} tablets
                    {(currentMedication?.stockAvailable || 0) < 5 && ' ⚠️'}
                  </p>
                </div>
              </div>
              {currentMedication?.recentSuggestion && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'var(--bg-primary)',
                  borderRadius: '8px',
                  borderLeft: '4px solid var(--bright-teal-blue)'
                }}>
                  <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem'}}>💡 Latest Suggestion</p>
                  <p style={{color: 'var(--text-primary)', fontWeight: '500'}}>{currentMedication?.recentSuggestion}</p>
                </div>
              )}
            </div>
          )}

          <div className="section-header">
            <h2 className="section-title">{activeTab === 'bp' ? 'BP Readings' : 'Sugar Readings'}</h2>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button className="btn btn-secondary" onClick={() => setShowGraph(!showGraph)}>
                📊 {showGraph ? 'Hide' : 'Show'} Graph
              </button>
              <button className="btn btn-secondary" onClick={() => setShowMedicationModal(true)}>
                💊 Medication
              </button>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <FiPlus /> Add Reading
              </button>
            </div>
          </div>

          {/* Graph Visualization */}
          {showGraph && currentReadings.length > 0 && (
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{color: 'var(--text-primary)', marginBottom: '1rem'}}>📈 Health Trend Analysis</h3>
              
              {/* Chart Container */}
              <div style={{
                background: 'var(--bg-primary)',
                borderRadius: '8px',
                padding: '2rem 1rem 1rem 3rem',
                position: 'relative'
              }}>
                {/* Y-axis labels */}
                <div style={{
                  position: 'absolute',
                  left: '0.5rem',
                  top: '2rem',
                  bottom: '3rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)'
                }}>
                  {activeTab === 'bp' ? (
                    <>
                      <span>200</span>
                      <span>150</span>
                      <span>100</span>
                      <span>50</span>
                      <span>0</span>
                    </>
                  ) : (
                    <>
                      <span>400</span>
                      <span>300</span>
                      <span>200</span>
                      <span>100</span>
                      <span>0</span>
                    </>
                  )}
                </div>

                {/* Chart Area with Grid */}
                <div style={{
                  height: '350px',
                  position: 'relative',
                  borderLeft: '2px solid var(--border-color)',
                  borderBottom: '2px solid var(--border-color)'
                }}>
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: `${i * 25}%`,
                      borderTop: '1px dashed var(--border-color)',
                      opacity: 0.3
                    }} />
                  ))}

                  {/* Data visualization */}
                  <svg width="100%" height="100%" style={{position: 'absolute', top: 0, left: 0}}>
                    {activeTab === 'bp' ? (
                      <>
                        {/* Systolic line (red) */}
                        <polyline
                          points={currentReadings.slice(0, 20).reverse().map((reading, idx) => {
                            const x = (idx / Math.max(currentReadings.slice(0, 20).length - 1, 1)) * 100;
                            const y = 100 - ((reading.systolic / 200) * 100);
                            return `${x}%,${y}%`;
                          }).join(' ')}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Systolic points */}
                        {currentReadings.slice(0, 20).reverse().map((reading, idx) => {
                          const x = (idx / Math.max(currentReadings.slice(0, 20).length - 1, 1)) * 100;
                          const y = 100 - ((reading.systolic / 200) * 100);
                          return (
                            <circle
                              key={`sys-${idx}`}
                              cx={`${x}%`}
                              cy={`${y}%`}
                              r="5"
                              fill="#ef4444"
                              stroke="var(--bg-primary)"
                              strokeWidth="2"
                              style={{cursor: 'pointer'}}
                            >
                              <title>{`Systolic: ${reading.systolic}\n${new Date(reading.recordedAt).toLocaleDateString()}`}</title>
                            </circle>
                          );
                        })}

                        {/* Diastolic line (blue) */}
                        <polyline
                          points={currentReadings.slice(0, 20).reverse().map((reading, idx) => {
                            const x = (idx / Math.max(currentReadings.slice(0, 20).length - 1, 1)) * 100;
                            const y = 100 - ((reading.diastolic / 200) * 100);
                            return `${x}%,${y}%`;
                          }).join(' ')}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Diastolic points */}
                        {currentReadings.slice(0, 20).reverse().map((reading, idx) => {
                          const x = (idx / Math.max(currentReadings.slice(0, 20).length - 1, 1)) * 100;
                          const y = 100 - ((reading.diastolic / 200) * 100);
                          return (
                            <circle
                              key={`dia-${idx}`}
                              cx={`${x}%`}
                              cy={`${y}%`}
                              r="5"
                              fill="#3b82f6"
                              stroke="var(--bg-primary)"
                              strokeWidth="2"
                              style={{cursor: 'pointer'}}
                            >
                              <title>{`Diastolic: ${reading.diastolic}\n${new Date(reading.recordedAt).toLocaleDateString()}`}</title>
                            </circle>
                          );
                        })}

                        {/* Reference lines */}
                        <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#fbbf24" strokeWidth="1" strokeDasharray="5,5" opacity="0.5">
                          <title>Systolic: 130 (Stage 1 Hypertension)</title>
                        </line>
                        <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#10b981" strokeWidth="1" strokeDasharray="5,5" opacity="0.5">
                          <title>Diastolic: 80 (Normal limit)</title>
                        </line>
                      </>
                    ) : (
                      <>
                        {/* Sugar level line */}
                        <polyline
                          points={currentReadings.slice(0, 20).reverse().map((reading, idx) => {
                            const x = (idx / Math.max(currentReadings.slice(0, 20).length - 1, 1)) * 100;
                            const y = 100 - ((reading.level / 400) * 100);
                            return `${x}%,${y}%`;
                          }).join(' ')}
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Sugar level points */}
                        {currentReadings.slice(0, 20).reverse().map((reading, idx) => {
                          const x = (idx / Math.max(currentReadings.slice(0, 20).length - 1, 1)) * 100;
                          const y = 100 - ((reading.level / 400) * 100);
                          const getColor = () => {
                            if (reading.status === 'Normal') return '#4ade80';
                            if (reading.status === 'Low') return '#60a5fa';
                            if (reading.status === 'Pre-diabetic') return '#fbbf24';
                            return '#ef4444';
                          };
                          return (
                            <circle
                              key={`sugar-${idx}`}
                              cx={`${x}%`}
                              cy={`${y}%`}
                              r="6"
                              fill={getColor()}
                              stroke="var(--bg-primary)"
                              strokeWidth="2"
                              style={{cursor: 'pointer'}}
                            >
                              <title>{`${reading.level} mg/dL (${reading.type})\n${reading.status}\n${new Date(reading.recordedAt).toLocaleDateString()}`}</title>
                            </circle>
                          );
                        })}

                        {/* Reference lines for sugar */}
                        <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#10b981" strokeWidth="1" strokeDasharray="5,5" opacity="0.5">
                          <title>Fasting Normal: 100 mg/dL</title>
                        </line>
                        <line x1="0" y1="68.75%" x2="100%" y2="68.75%" stroke="#fbbf24" strokeWidth="1" strokeDasharray="5,5" opacity="0.5">
                          <title>Pre-diabetic: 125 mg/dL</title>
                        </line>
                      </>
                    )}
                  </svg>
                </div>

                {/* X-axis labels (dates) */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem',
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  paddingLeft: '0.5rem',
                  paddingRight: '0.5rem'
                }}>
                  {currentReadings.slice(0, 20).length > 0 && (
                    <>
                      <span>{new Date(currentReadings.slice(0, 20)[currentReadings.slice(0, 20).length - 1]?.recordedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span>
                      {currentReadings.slice(0, 20).length > 1 && (
                        <span>{new Date(currentReadings.slice(0, 20)[0]?.recordedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div style={{marginTop: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.9rem', justifyContent: 'center'}}>
                {activeTab === 'bp' ? (
                  <>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{width: '30px', height: '3px', background: '#ef4444', display: 'inline-block', borderRadius: '2px'}}></span>
                      Systolic
                    </span>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{width: '30px', height: '3px', background: '#3b82f6', display: 'inline-block', borderRadius: '2px'}}></span>
                      Diastolic
                    </span>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{width: '20px', height: '1px', background: '#fbbf24', display: 'inline-block', borderRadius: '1px', borderTop: '1px dashed #fbbf24'}}></span>
                      Stage 1 (130)
                    </span>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{width: '20px', height: '1px', background: '#10b981', display: 'inline-block', borderRadius: '1px', borderTop: '1px dashed #10b981'}}></span>
                      Normal (80)
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{width: '12px', height: '12px', background: '#4ade80', borderRadius: '50%', display: 'inline-block'}}></span>
                      Normal
                    </span>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{width: '12px', height: '12px', background: '#60a5fa', borderRadius: '50%', display: 'inline-block'}}></span>
                      Low
                    </span>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{width: '12px', height: '12px', background: '#fbbf24', borderRadius: '50%', display: 'inline-block'}}></span>
                      Pre-diabetic
                    </span>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', display: 'inline-block'}}></span>
                      Diabetic
                    </span>
                  </>
                )}
              </div>

              {/* Stats Summary */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'var(--bg-primary)',
                borderRadius: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                {activeTab === 'bp' ? (
                  <>
                    <div>
                      <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Avg Systolic</p>
                      <p style={{fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)'}}>
                        {Math.round(currentReadings.slice(0, 20).reduce((sum, r) => sum + r.systolic, 0) / currentReadings.slice(0, 20).length)}
                      </p>
                    </div>
                    <div>
                      <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Avg Diastolic</p>
                      <p style={{fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)'}}>
                        {Math.round(currentReadings.slice(0, 20).reduce((sum, r) => sum + r.diastolic, 0) / currentReadings.slice(0, 20).length)}
                      </p>
                    </div>
                    <div>
                      <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Avg Pulse</p>
                      <p style={{fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)'}}>
                        {Math.round(currentReadings.slice(0, 20).reduce((sum, r) => sum + (r.pulse || 0), 0) / currentReadings.slice(0, 20).length)}
                      </p>
                    </div>
                    <div>
                      <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Total Readings</p>
                      <p style={{fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)'}}>
                        {currentReadings.length}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Avg Level</p>
                      <p style={{fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)'}}>
                        {Math.round(currentReadings.slice(0, 20).reduce((sum, r) => sum + r.level, 0) / currentReadings.slice(0, 20).length)} mg/dL
                      </p>
                    </div>
                    <div>
                      <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Highest</p>
                      <p style={{fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)'}}>
                        {Math.max(...currentReadings.slice(0, 20).map(r => r.level))} mg/dL
                      </p>
                    </div>
                    <div>
                      <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Lowest</p>
                      <p style={{fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)'}}>
                        {Math.min(...currentReadings.slice(0, 20).map(r => r.level))} mg/dL
                      </p>
                    </div>
                    <div>
                      <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Total Readings</p>
                      <p style={{fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)'}}>
                        {currentReadings.length}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {currentReadings.length > 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {currentReadings.map((reading, idx) => {
                const getStatusColor = () => {
                  if (activeTab === 'bp') {
                    if (reading.category === 'Normal') return '#4ade80';
                    if (reading.category === 'Elevated') return '#fbbf24';
                    if (reading.category.includes('Hypertension')) return '#fb923c';
                    return '#ef4444';
                  } else {
                    if (reading.status === 'Normal') return '#4ade80';
                    if (reading.status === 'Low') return '#60a5fa';
                    if (reading.status === 'Pre-diabetic') return '#fbbf24';
                    return '#ef4444';
                  }
                };
                return (
                  <div key={idx} style={{
                    padding: '1.25rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${getStatusColor()}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'}}>
                        {activeTab === 'bp' ? (
                          <>
                            <h3 style={{color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: '700'}}>
                              {reading.systolic}/{reading.diastolic}
                            </h3>
                            <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>mmHg</span>
                            <span style={{color: 'var(--text-secondary)', marginLeft: '1rem'}}>💓 {reading.pulse} bpm</span>
                          </>
                        ) : (
                          <>
                            <h3 style={{color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: '700'}}>
                              {reading.level}
                            </h3>
                            <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>mg/dL</span>
                            <span style={{
                              background: 'var(--bg-primary)',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              color: 'var(--text-primary)',
                              textTransform: 'capitalize'
                            }}>{reading.type}</span>
                          </>
                        )}
                      </div>
                      <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem'}}>
                        📅 {new Date(reading.recordedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {reading.delta && activeTab === 'bp' && (
                        <p style={{color: 'var(--text-secondary)', fontSize: '0.8rem'}}>
                          Change: 
                          <span style={{color: reading.delta.systolic > 0 ? '#ef4444' : reading.delta.systolic < 0 ? '#4ade80' : 'var(--text-secondary)', fontWeight: '600', marginLeft: '0.5rem'}}>
                            {reading.delta.systolic > 0 ? '↑' : reading.delta.systolic < 0 ? '↓' : '→'} {Math.abs(reading.delta.systolic)}/{Math.abs(reading.delta.diastolic)}
                          </span>
                        </p>
                      )}
                      {reading.delta && activeTab === 'sugar' && (
                        <p style={{color: 'var(--text-secondary)', fontSize: '0.8rem'}}>
                          Change: 
                          <span style={{color: reading.delta > 0 ? '#ef4444' : reading.delta < 0 ? '#4ade80' : 'var(--text-secondary)', fontWeight: '600', marginLeft: '0.5rem'}}>
                            {reading.delta > 0 ? '↑' : reading.delta < 0 ? '↓' : '→'} {Math.abs(reading.delta)} mg/dL
                          </span>
                        </p>
                      )}
                    </div>
                    <div style={{
                      background: getStatusColor(),
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      textAlign: 'center',
                      minWidth: '120px'
                    }}>
                      {activeTab === 'bp' ? reading.category : reading.status}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <h3>No readings yet</h3>
              <p>Add your first {activeTab === 'bp' ? 'blood pressure' : 'blood sugar'} reading</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add {activeTab === 'bp' ? 'BP' : 'Sugar'} Reading</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit} style={{padding: '1.5rem'}}>
                {activeTab === 'bp' ? (
                  <>
                    <div className="form-group">
                      <label>Systolic (mmHg) *</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.systolic}
                        onChange={(e) => setFormData({...formData, systolic: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Diastolic (mmHg) *</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.diastolic}
                        onChange={(e) => setFormData({...formData, diastolic: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Pulse (bpm) *</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.pulse}
                        onChange={(e) => setFormData({...formData, pulse: e.target.value})}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Sugar Level (mg/dL) *</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.sugarLevel}
                        onChange={(e) => setFormData({...formData, sugarLevel: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Meal Context *</label>
                      <select
                        className="form-input"
                        value={formData.mealContext}
                        onChange={(e) => setFormData({...formData, mealContext: e.target.value})}
                        required
                      >
                        <option value="fasting">Fasting</option>
                        <option value="post-meal">Post Meal</option>
                        <option value="random">Random</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Reading
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showMedicationModal && (
          <div className="modal-overlay" onClick={() => setShowMedicationModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>💊 Medication Profile - {activeTab === 'bp' ? 'Blood Pressure' : 'Blood Sugar'}</h2>
                <button className="modal-close" onClick={() => setShowMedicationModal(false)}>×</button>
              </div>
              <form onSubmit={handleMedicationSubmit} style={{padding: '1.5rem'}}>
                <div className="form-group">
                  <label>Drug Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Amlodipine"
                    value={medicationData.drugName}
                    onChange={(e) => setMedicationData({...medicationData, drugName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Dosage *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., 5mg once daily"
                    value={medicationData.dosage}
                    onChange={(e) => setMedicationData({...medicationData, dosage: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tablets Per Day *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g., 1"
                    value={medicationData.tabletsPerDay}
                    onChange={(e) => setMedicationData({...medicationData, tabletsPerDay: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock Available *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g., 12"
                    value={medicationData.stockAvailable}
                    onChange={(e) => setMedicationData({...medicationData, stockAvailable: e.target.value})}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowMedicationModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Medication
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthTracking;
