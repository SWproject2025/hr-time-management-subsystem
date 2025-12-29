"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // 👈 Use Context
import axios from 'axios'; // 👈 Use Axios
import toast from 'react-hot-toast';

export default function EditProfilePage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth(); // Get auth state
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    mobilePhone: '',
    personalEmail: '',
  });

  // 1. Load Current Data
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
        router.push('/login');
        return;
    }

    const loadProfile = async () => {
      try {
        const res = await axios.get('http://localhost:3000/employee-profile/me');
        const data = res.data;
        
        // Pre-fill form with existing data
        setFormData({
          mobilePhone: data.profile.mobilePhone || '',
          personalEmail: data.profile.personalEmail || '',
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [authLoading, token, router]);

  // 2. Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.patch('http://localhost:3000/employee-profile/me/contact', formData);

      toast.success("Profile Updated Successfully!");
      router.push('/employee/profile'); // Go back to profile
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (authLoading || loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:underline">Cancel</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Mobile Phone */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Phone</label>
            <input 
              type="text" 
              value={formData.mobilePhone}
              onChange={(e) => setFormData({...formData, mobilePhone: e.target.value})}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="+1 234 567 8900"
            />
          </div>

          {/* Personal Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Personal Email</label>
            <input 
              type="email" 
              value={formData.personalEmail}
              onChange={(e) => setFormData({...formData, personalEmail: e.target.value})}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Note: This is used for account recovery.</p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="w-1/2 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="w-1/2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold shadow"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}