import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import pb from '@/lib/pocketbaseClient.js';

const STYLES = `
  .admin-container {
    max-width: var(--max);
    margin: 0 auto;
    padding: 120px 40px 80px;
    min-height: 100vh;
  }
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 40px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--line);
  }
  
  /* Tabs */
  .admin-tabs {
    display: flex;
    gap: 32px;
    margin-bottom: 32px;
    border-bottom: 1px solid var(--line);
  }
  .admin-tab {
    padding: 0 0 12px 0;
    background: none;
    border: none;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-4);
    cursor: pointer;
    position: relative;
    transition: color 0.2s;
  }
  .admin-tab:hover { color: var(--ink); }
  .admin-tab.active { color: var(--ink); font-weight: 500; }
  .admin-tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--ink);
  }

  .admin-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--white);
  }
  .admin-table th {
    text-align: left;
    padding: 16px;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-4);
    border-bottom: 1px solid var(--line);
    font-weight: 400;
  }
  .admin-table td {
    padding: 16px;
    font-size: 14px;
    color: var(--ink);
    border-bottom: 1px solid var(--line);
    vertical-align: middle;
  }
  .admin-table tr:last-child td {
    border-bottom: none;
  }
  .admin-actions {
    display: flex;
    gap: 8px;
  }
  
  /* Modal Styles */
  .admin-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(14, 12, 9, 0.72);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .admin-modal {
    background: var(--white);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 40px;
    box-shadow: 0 32px 80px -16px rgba(0,0,0,0.45);
  }
  .admin-modal::-webkit-scrollbar { width: 4px; }
  .admin-modal::-webkit-scrollbar-track { background: transparent; }
  .admin-modal::-webkit-scrollbar-thumb { background: var(--line-dk); border-radius: 2px; }

  .form-group { margin-bottom: 24px; }
  .form-label {
    display: block;
    font-size: 11px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--ink-3);
    margin-bottom: 8px;
  }
  .form-input, .form-textarea, .form-select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--line);
    background: var(--off);
    color: var(--ink);
    font-family: inherit;
    font-size: 14px;
    transition: border-color 0.2s;
  }
  .form-input:focus, .form-textarea:focus, .form-select:focus {
    outline: none;
    border-color: var(--gold);
  }
  .form-textarea { min-height: 100px; resize: vertical; }
  
  .availability-panel {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 40px;
    align-items: start;
  }
  @media (max-width: 768px) {
    .availability-panel { grid-template-columns: 1fr; }
  }
  .panel-card {
    background: var(--white);
    padding: 24px;
    border: 1px solid var(--line);
  }
`;

export default function AdminDoctorsPage() {
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' | 'availability'
  
  // Doctors State
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [editingDoc, setEditingDoc] = useState(null);
  const [formData, setFormData] = useState({
    name: '', qualification: '', experience_years: '', specialization: '',
    short_description: '', full_description: '', photo: null
  });

  // Availability State
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  const [singleSlotForm, setSingleSlotForm] = useState({ date: '', time: '' });
  const [bulkSlotForm, setBulkSlotForm] = useState({
    startDate: '', endDate: '', startTime: '09:00', endTime: '17:00', interval: '30'
  });
  const [slotSaving, setSlotSaving] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState(new Set());

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await pb.collection('doctors').getList(1, 100, { sort: '-created', $autoCancel: false });
      setDoctors(res.items);
      if (res.items.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(res.items[0].id);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // --- Doctors Management ---
  const handleOpenForm = (doc = null) => {
    if (doc) {
      setEditingDoc(doc);
      setFormData({
        name: doc.name || '', qualification: doc.qualification || '',
        experience_years: doc.experience_years || '', specialization: doc.specialization || '',
        short_description: doc.short_description || '', full_description: doc.full_description || '',
        photo: null
      });
    } else {
      setEditingDoc(null);
      setFormData({
        name: '', qualification: '', experience_years: '', specialization: '',
        short_description: '', full_description: '', photo: null
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDoc(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('qualification', formData.qualification);
      data.append('experience_years', formData.experience_years);
      data.append('specialization', formData.specialization);
      data.append('short_description', formData.short_description);
      data.append('full_description', formData.full_description);
      if (formData.photo instanceof File) data.append('photo', formData.photo);

      if (editingDoc) {
        await pb.collection('doctors').update(editingDoc.id, data, { $autoCancel: false });
      } else {
        await pb.collection('doctors').create(data, { $autoCancel: false });
      }
      await fetchDoctors();
      handleCloseForm();
    } catch (err) {
      console.error('Error saving doctor:', err);
      alert('Failed to save doctor.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (doc) => {
    setEditingDoc(doc);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!editingDoc) return;
    setSaving(true);
    try {
      const allSlots = await pb.collection('availability_slots').getFullList({
        filter: `doctor_id = "${editingDoc.id}"`,
        fields: 'id',
        $autoCancel: false
      });
      await Promise.all(allSlots.map(s =>
        pb.collection('availability_slots').delete(s.id, { $autoCancel: false })
      ));
      await pb.collection('doctors').delete(editingDoc.id, { $autoCancel: false });
      await fetchDoctors();
      setIsDeleteOpen(false);
      setEditingDoc(null);
    } catch (err) {
      console.error('Error deleting doctor:', err);
      alert('Failed to delete doctor.');
    } finally {
      setSaving(false);
    }
  };

  // --- Availability Management ---
  const fetchSlots = async () => {
    if (!selectedDoctorId) return;
    setSlotsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await pb.collection('availability_slots').getFullList({
        filter: `doctor_id = "${selectedDoctorId}" && date >= "${today} 00:00:00"`,
        sort: 'date,time_slot',
        $autoCancel: false
      });
      setSlots(res);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'availability') {
      fetchSlots();
      setSelectedSlots(new Set());
    }
  }, [selectedDoctorId, activeTab]);

  const existingSlotKeys = new Set(
    slots.map(s => `${s.date.substring(0, 10)}|${s.time_slot}`)
  );

  const handleAddSingleSlot = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !singleSlotForm.date || !singleSlotForm.time) return;
    if (existingSlotKeys.has(`${singleSlotForm.date}|${singleSlotForm.time}`)) {
      alert('A slot for this date and time already exists.');
      return;
    }
    setSlotSaving(true);
    try {
      await pb.collection('availability_slots').create({
        doctor_id: selectedDoctorId,
        date: singleSlotForm.date + " 12:00:00.000Z",
        time_slot: singleSlotForm.time,
        is_available: true
      }, { $autoCancel: false });
      setSingleSlotForm({ date: '', time: '' });
      await fetchSlots();
    } catch (err) {
      console.error('Error adding slot:', err);
      alert('Failed to add slot.');
    } finally {
      setSlotSaving(false);
    }
  };

  const handleBulkAddSlots = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !bulkSlotForm.startDate || !bulkSlotForm.endDate) return;
    setSlotSaving(true);
    
    try {
      const start = new Date(bulkSlotForm.startDate);
      const end = new Date(bulkSlotForm.endDate);
      const interval = parseInt(bulkSlotForm.interval, 10);
      
      const promises = [];
      let skipped = 0;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];

        let [currH, currM] = bulkSlotForm.startTime.split(':').map(Number);
        const [endH, endM] = bulkSlotForm.endTime.split(':').map(Number);

        while (currH < endH || (currH === endH && currM < endM)) {
          const timeStr = `${currH.toString().padStart(2, '0')}:${currM.toString().padStart(2, '0')}`;

          if (existingSlotKeys.has(`${dateStr}|${timeStr}`)) {
            skipped++;
          } else {
            promises.push(
              pb.collection('availability_slots').create({
                doctor_id: selectedDoctorId,
                date: dateStr + " 12:00:00.000Z",
                time_slot: timeStr,
                is_available: true
              }, { $autoCancel: false })
            );
          }

          currM += interval;
          if (currM >= 60) {
            currH += Math.floor(currM / 60);
            currM = currM % 60;
          }
        }
      }

      if (promises.length === 0) {
        alert('All slots in this range already exist. No new slots were added.');
        return;
      }
      await Promise.all(promises);
      const skippedMsg = skipped > 0 ? ` (${skipped} already existed and were skipped)` : '';
      alert(`Successfully added ${promises.length} slot(s)${skippedMsg}.`);
      await fetchSlots();
    } catch (err) {
      console.error('Error bulk adding slots:', err);
      alert('Failed to add some slots. They might already exist.');
    } finally {
      setSlotSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await pb.collection('availability_slots').delete(slotId, { $autoCancel: false });
      setSelectedSlots(prev => { const n = new Set(prev); n.delete(slotId); return n; });
      await fetchSlots();
    } catch (err) {
      console.error('Error deleting slot:', err);
      alert('Failed to delete slot.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSlots.size === 0) return;
    if (!window.confirm(`Delete ${selectedSlots.size} selected slot(s)?`)) return;
    setSlotSaving(true);
    try {
      await Promise.all([...selectedSlots].map(id =>
        pb.collection('availability_slots').delete(id, { $autoCancel: false })
      ));
      setSelectedSlots(new Set());
      await fetchSlots();
    } catch (err) {
      console.error('Error deleting slots:', err);
      alert('Failed to delete some slots.');
    } finally {
      setSlotSaving(false);
    }
  };

  const toggleSlot = (id) => setSelectedSlots(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const toggleAllSlots = () => {
    if (selectedSlots.size === slots.length) {
      setSelectedSlots(new Set());
    } else {
      setSelectedSlots(new Set(slots.map(s => s.id)));
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <Helmet>
        <title>Admin: Manage Doctors | The Vedic Protocol</title>
      </Helmet>

      <Header />

      <main className="admin-container" style={{ background: 'var(--off)' }}>
        <div className="admin-header">
          <div>
            <p className="section-label">Administration</p>
            <h1 className="section-h2" style={{ margin: 0 }}>Doctor Management</h1>
          </div>
          {activeTab === 'doctors' && (
            <button className="btn btn-dark" onClick={() => handleOpenForm()}>
              Add New Doctor
            </button>
          )}
        </div>

        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            Doctors Directory
          </button>
          <button 
            className={`admin-tab ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            Availability Management
          </button>
        </div>

        {activeTab === 'doctors' && (
          loading ? (
            <p style={{ color: 'var(--ink-3)' }}>Loading doctors...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Qualification</th>
                    <th>Experience</th>
                    <th>Specialization</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--ink-4)', padding: '40px' }}>
                        No doctors found. Add one to get started.
                      </td>
                    </tr>
                  ) : (
                    doctors.map(doc => (
                      <tr key={doc.id}>
                        <td style={{ fontWeight: 500 }}>{doc.name}</td>
                        <td>{doc.qualification}</td>
                        <td>{doc.experience_years} yrs</td>
                        <td>{doc.specialization}</td>
                        <td>
                          <div className="admin-actions" style={{ justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-light btn-sm" 
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleOpenForm(doc)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-light btn-sm" 
                              style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--ink)' }}
                              onClick={() => handleOpenDelete(doc)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === 'availability' && (
          <div className="availability-panel">
            {/* Left Column: Forms */}
            <div>
              <div className="form-group">
                <label className="form-label">Select Doctor</label>
                <select 
                  className="form-select"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                >
                  <option value="" disabled>Select a doctor...</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                  ))}
                </select>
              </div>

              {selectedDoctorId && (
                <>
                  <div className="panel-card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', marginBottom: '16px' }}>Add Single Slot</h3>
                    <form onSubmit={handleAddSingleSlot}>
                      <div className="form-group">
                        <label className="form-label">Date</label>
                        <input type="date" className="form-input" required value={singleSlotForm.date} onChange={e => setSingleSlotForm({...singleSlotForm, date: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Time</label>
                        <input type="time" className="form-input" required value={singleSlotForm.time} onChange={e => setSingleSlotForm({...singleSlotForm, time: e.target.value})} />
                      </div>
                      <button type="submit" className="btn btn-dark btn-full" disabled={slotSaving}>
                        {slotSaving ? 'Adding...' : 'Add Slot'}
                      </button>
                    </form>
                  </div>

                  <div className="panel-card">
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', marginBottom: '16px' }}>Bulk Add Slots</h3>
                    <form onSubmit={handleBulkAddSlots}>
                      <div className="form-group">
                        <label className="form-label">Start Date</label>
                        <input type="date" className="form-input" required value={bulkSlotForm.startDate} onChange={e => setBulkSlotForm({...bulkSlotForm, startDate: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Date</label>
                        <input type="date" className="form-input" required value={bulkSlotForm.endDate} onChange={e => setBulkSlotForm({...bulkSlotForm, endDate: e.target.value})} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Start Time</label>
                          <input type="time" className="form-input" required value={bulkSlotForm.startTime} onChange={e => setBulkSlotForm({...bulkSlotForm, startTime: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">End Time</label>
                          <input type="time" className="form-input" required value={bulkSlotForm.endTime} onChange={e => setBulkSlotForm({...bulkSlotForm, endTime: e.target.value})} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Interval (Minutes)</label>
                        <select className="form-select" value={bulkSlotForm.interval} onChange={e => setBulkSlotForm({...bulkSlotForm, interval: e.target.value})}>
                          <option value="15">15 mins</option>
                          <option value="30">30 mins</option>
                          <option value="60">60 mins</option>
                        </select>
                      </div>
                      <button type="submit" className="btn btn-light btn-full" disabled={slotSaving}>
                        {slotSaving ? 'Generating...' : 'Generate Slots'}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* Right Column: List */}
            <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', margin: 0 }}>Existing Slots</h3>
                {selectedSlots.size > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    disabled={slotSaving}
                    style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', fontSize: '12px', letterSpacing: '0.05em', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {slotSaving ? 'Deleting...' : `Delete ${selectedSlots.size} Selected`}
                  </button>
                )}
              </div>
              
              {!selectedDoctorId ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-4)' }}>
                  Select a doctor to view their availability.
                </div>
              ) : slotsLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)' }}>Loading slots...</div>
              ) : slots.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-4)' }}>
                  No upcoming slots found for this doctor.
                </div>
              ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <table className="admin-table">
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--white)', zIndex: 1 }}>
                      <tr>
                        <th style={{ width: '36px' }}>
                          <input
                            type="checkbox"
                            checked={slots.length > 0 && selectedSlots.size === slots.length}
                            onChange={toggleAllSlots}
                            title="Select all"
                          />
                        </th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map(slot => (
                        <tr key={slot.id} style={{ background: selectedSlots.has(slot.id) ? 'var(--stone)' : undefined }}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedSlots.has(slot.id)}
                              onChange={() => toggleSlot(slot.id)}
                            />
                          </td>
                          <td>{new Date(slot.date).toLocaleDateString()}</td>
                          <td>{slot.time_slot}</td>
                          <td>
                            <span style={{
                              display: 'inline-block', padding: '4px 8px', borderRadius: '2px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em',
                              background: slot.is_available ? '#dcfce7' : '#f3f4f6',
                              color: slot.is_available ? '#166534' : '#4b5563'
                            }}>
                              {slot.is_available ? 'Available' : 'Booked'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Form Modal (Doctors) */}
      {isFormOpen && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCloseForm()}>
          <div className="admin-modal">
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginBottom: '32px' }}>
              {editingDoc ? 'Edit Doctor' : 'Add New Doctor'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <input type="text" name="qualification" className="form-input" value={formData.qualification} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input type="number" name="experience_years" className="form-input" value={formData.experience_years} onChange={handleInputChange} required min="0" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input type="text" name="specialization" className="form-input" value={formData.specialization} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea name="short_description" className="form-textarea" style={{ minHeight: '80px' }} value={formData.short_description} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Full Description</label>
                <textarea name="full_description" className="form-textarea" value={formData.full_description} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Photo</label>
                <input type="file" name="photo" className="form-input" accept="image/*" onChange={handleInputChange} style={{ background: 'transparent', border: 'none', padding: '0' }} />
                {editingDoc && editingDoc.photo && !formData.photo && (
                  <p style={{ fontSize: '12px', color: 'var(--ink-4)', marginTop: '8px' }}>Current photo exists. Uploading a new one will replace it.</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
                <button type="submit" className="btn btn-dark" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Doctor'}
                </button>
                <button type="button" className="btn btn-light" onClick={handleCloseForm} disabled={saving}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Doctors) */}
      {isDeleteOpen && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsDeleteOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: '400px', padding: '32px' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginBottom: '16px' }}>Delete Doctor</h2>
            <p style={{ color: 'var(--ink-3)', marginBottom: '32px', lineHeight: 1.6 }}>
              Are you sure you want to delete <strong>{editingDoc?.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-dark" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button className="btn btn-light" onClick={() => setIsDeleteOpen(false)} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}