"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../../lib/auth';
import toast from 'react-hot-toast';

export default function SubmitRequestPage() {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [requestType, setRequestType] = useState('General');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      // 1. Get current user ID
      const meRes = await authFetch('http://localhost:3000/employee-profile/me');
      const meData = await meRes.json();
      
      // 2. Submit Request
      const res = await fetch('http://localhost:3000/employee-profile/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: meData.profile._id,
          reason: reason,
          changes: { type: requestType, description: reason } 
        }),
      });

      if (res.ok) {
        toast.success("Request Submitted Successfully!");
        router.push('/employee/profile');
      } else {
        toast.error("Failed to submit request");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Submit New Request</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Request Type</label>
            <select 
              value={requestType} 
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="General">General Inquiry</option>
              <option value="Leave">Leave Request</option>
              <option value="Promotion">Promotion Request</option>
              <option value="Resignation">Resignation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Details / Reason</label>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="w-full border p-2 rounded h-32"
              placeholder="Please describe your request..."
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => router.back()} className="w-1/2 border py-2 rounded">Cancel</button>
            <button type="submit" className="w-1/2 bg-blue-600 text-white py-2 rounded font-bold">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}