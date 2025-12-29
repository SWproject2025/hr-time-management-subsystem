'use client';

import { useState } from 'react';
import { authFetch } from '@/lib/auth'; // Adjust path if needed
import toast from 'react-hot-toast';

export function ContactForm({ profile }: { profile: any }) {
  const [formData, setFormData] = useState({
    mobilePhone: profile?.mobilePhone || '',
    personalEmail: profile?.personalEmail || '',
    streetAddress: profile?.address?.street || '',
    city: profile?.address?.city || '',
    country: profile?.address?.country || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authFetch(`http://localhost:3000/employee-profile/${profile._id}/contact`, {
        method: 'PUT',
        body: JSON.stringify({
          mobilePhone: formData.mobilePhone,
          personalEmail: formData.personalEmail,
          address: {
            street: formData.streetAddress,
            city: formData.city,
            country: formData.country,
          }
        }),
      });

      if (!res.ok) throw new Error('Failed to update');
      toast.success('Contact info updated!');
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Shared class for all inputs to ensure text is visible
  // Added: 'text-black' and 'bg-white'
  const inputClass = "w-full p-2 border border-gray-300 rounded mt-1 text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">Mobile Phone</label>
          <input 
            name="mobilePhone" 
            value={formData.mobilePhone} 
            onChange={handleChange} 
            className={inputClass} // <--- USING FIXED CLASS
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">Personal Email</label>
          <input 
            name="personalEmail" 
            value={formData.personalEmail} 
            onChange={handleChange} 
            className={inputClass} // <--- USING FIXED CLASS
          />
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-2 mt-2">Address</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Street Address</label>
            <input 
              name="streetAddress" 
              value={formData.streetAddress} 
              onChange={handleChange} 
              className={inputClass} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">City</label>
              <input 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                className={inputClass} 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Country</label>
              <input 
                name="country" 
                value={formData.country} 
                onChange={handleChange} 
                className={inputClass} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm transition-colors disabled:bg-blue-300"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
