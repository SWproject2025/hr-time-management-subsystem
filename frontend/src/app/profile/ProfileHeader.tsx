'use client';

import { useState } from 'react';
import { EmployeeProfile } from '@/types/employee';
import { EmployeeService } from '@/services/employee.service';
import { Camera, MapPin, Mail, Hash, User } from 'lucide-react';
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
      const promise = EmployeeService.uploadPhoto(profile._id, e.target.files[0]);
      
      toast.promise(promise, {
        loading: 'Uploading...',
        success: 'Photo updated!',
        error: 'Upload failed',
      });

      try {
        await promise;
        refreshProfile();
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      {/* Cover Background */}
      <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-end -mt-12 mb-4">
          
          {/* Avatar Area */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-md">
              {profile.profilePictureUrl ? (
                // Assuming backend serves static files from root
                <img 
                  src={`http://localhost:3000/${profile.profilePictureUrl}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <User size={48} />
                </div>
              )}
            </div>
            {/* Upload Button Overlay */}
            <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
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

          {/* Name & Basic Info */}
          <div className="sm:ml-6 mt-4 sm:mt-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Hash size={16} /> ID: {profile.employeeNumber}
              </span>
              <span className="flex items-center gap-1">
                <Mail size={16} /> {profile.workEmail}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={16} /> {profile.address?.city || 'Location N/A'}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-1">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile.status === 'ACTIVE' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {profile.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
