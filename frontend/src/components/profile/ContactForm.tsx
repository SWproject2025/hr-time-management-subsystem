'use client';

import { useState } from 'react';
import { EmployeeProfile, UpdateContactDto } from '@/types/employee';
import { EmployeeService } from '@/services/employee.service';
import toast from 'react-hot-toast';

export const ContactForm = ({ profile }: { profile: EmployeeProfile }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateContactDto>({
    mobilePhone: profile.mobilePhone || '',
    personalEmail: profile.personalEmail || '',
    address: {
      streetAddress: profile.address?.streetAddress || '',
      city: profile.address?.city || '',
      country: profile.address?.country || '',
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await EmployeeService.updateContact(profile._id, formData);
      toast.success("Contact information updated successfully");
    } catch (error) {
      toast.error("Failed to update contact info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Mobile Phone</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={formData.mobilePhone}
            onChange={(e) => setFormData({...formData, mobilePhone: e.target.value})}
            placeholder="+1 234 567 890"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Personal Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={formData.personalEmail}
            onChange={(e) => setFormData({...formData, personalEmail: e.target.value})}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Address Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Street Address</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={formData.address?.streetAddress}
              onChange={(e) => setFormData({
                ...formData, 
                address: { ...formData.address, streetAddress: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={formData.address?.city}
              onChange={(e) => setFormData({
                ...formData, 
                address: { ...formData.address, city: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={formData.address?.country}
              onChange={(e) => setFormData({
                ...formData, 
                address: { ...formData.address, country: e.target.value }
              })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};
