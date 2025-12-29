'use client';

import { useState } from 'react';
import { EmployeeProfile } from '@/types/employee';
import { EmployeeService } from '@/services/employee.service';
import { Camera, MapPin, Mail, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileHeaderProps {
  profile: EmployeeProfile;
  refreshProfile: () => void;
}

export const ProfileHeader = ({ profile, refreshProfile }: ProfileHeaderProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const promise = EmployeeService.uploadPhoto(profile._id, e.target.files[0]);
        await toast.promise(promise, {
          loading: 'Uploading...',
          success: 'Profile picture updated!',
          error: 'Upload failed',
        });
        refreshProfile();
      } catch (error) {
        console.error(error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      {/* Cover Banner */}
      <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-start">
          {/* Avatar Section */}
          <div className="-mt-12 relative group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
              {profile.profilePictureUrl ? (
                <img 
                  src={`http://localhost:3000/${profile.profilePictureUrl}`} 
                  alt={profile.firstName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-3xl font-bold">
                  {profile.firstName[0]}{profile.lastName[0]}
                </div>
              )}
            </div>
            
            <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 border transition-all transform hover:scale-105">
              <Camera size={18} className="text-gray-600" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/png, image/jpeg" 
                onChange={handleFileChange} 
                disabled={uploading} 
              />
            </label>
          </div>

          {/* Info Section */}
          <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 pt-2">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-500 font-medium">#{profile.employeeNumber}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    profile.status === 'ACTIVE' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {profile.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Mail size={16} className="text-gray-400" />
                {profile.workEmail}
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase size={16} className="text-gray-400" />
                Department: {profile.primaryDepartmentId || 'Unassigned'}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-gray-400" />
                {profile.address?.city || 'No City'}, {profile.address?.country || 'No Country'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
