import { useState } from 'react';
import { motion } from 'framer-motion';
import userService from '../../services/userService';

const EditProfilePanel = ({ user, onUpdated }) => {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    fullName: user?.fullName || '',
    collegeName: user?.collegeName || '',
    collegeId: user?.collegeId || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    emergencyContact: {
      name: user?.emergencyContact?.name || '',
      phone: user?.emergencyContact?.phone || '',
      relationship: user?.emergencyContact?.relationship || ''
    }
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [field]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      await userService.updateProfile(form);
      setMsg('Profile updated successfully');
      onUpdated?.();
    } catch (e) {
      setMsg(e.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Profile</h2>
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Full Name</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">College</label>
            <input name="collegeName" value={form.collegeName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">College ID</label>
            <input name="collegeId" value={form.collegeId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">DOB</label>
            <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="border-t mt-6 pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input name="emergencyContact.name" placeholder="Name" value={form.emergencyContact.name} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
            <input name="emergencyContact.phone" placeholder="Phone" value={form.emergencyContact.phone} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
            <input name="emergencyContact.relationship" placeholder="Relationship" value={form.emergencyContact.relationship} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
          </div>
        </div>

        {msg && <div className="mt-4 text-sm text-gray-700">{msg}</div>}

        <div className="mt-6 flex gap-3">
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </motion.div>
  );
};

export default EditProfilePanel;


