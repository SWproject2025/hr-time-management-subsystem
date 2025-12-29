"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // 👈 Import Context
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Building2, User, FileText, Mail, Phone, Lock, ArrowRight, ChevronDown } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth(); // 👈 Use register from Context
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    nationalId: '',     
    personalEmail: '', 
    password: '',
    mobilePhone: '',
    gender: '',       
    maritalStatus: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 👈 Call context register function
      await register({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        nationalId: formData.nationalId,
        email: formData.personalEmail, // Map personalEmail to email
        password: formData.password,
        mobilePhone: formData.mobilePhone,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus
      });
      
      toast.success('Registration successful! Please login.');
      router.push('/login');
      
    } catch (error: any) {
      console.error("Registration Error:", error);
      
      // Error handling
      const message = error.message || 'Registration failed';
      
      if (message.includes('exists')) {
         toast.error("Account or details already exist.");
      } else if (Array.isArray(message)) {
         message.forEach(msg => toast.error(msg));
      } else {
         toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      
      {/* Left Side: Branding */}
      <div className="hidden lg:flex lg:w-1/3 bg-gradient-to-br from-blue-600 to-indigo-800 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="h-8 w-8" />
            <h1 className="text-2xl font-bold">HR System</h1>
          </div>
          <h2 className="text-4xl font-bold mb-4">Join Our Team</h2>
          <p className="text-blue-100">Create your employee profile to get started.</p>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-blue-500/20 blur-3xl"></div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-2/3 flex justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-2xl my-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Candidate Registration</h1>
              <p className="text-gray-500 text-sm mt-1">Please fill in your details accurately.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">First Name *</label>
                  <input name="firstName" required onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Middle Name</label>
                  <input name="middleName" onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Paul" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name *</label>
                  <input name="lastName" required onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">National ID *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input name="nationalId" required onChange={handleChange} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="14-digit National ID" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                   <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
                   <select name="gender" onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white">
                     <option value="">Select Gender</option>
                     <option value="MALE">Male</option>
                     <option value="FEMALE">Female</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-9 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                   <label className="text-sm font-medium text-gray-700 mb-1 block">Marital Status</label>
                   <select name="maritalStatus" onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white">
                     <option value="">Select Status</option>
                     <option value="SINGLE">Single</option>
                     <option value="MARRIED">Married</option>
                     <option value="DIVORCED">Divorced</option>
                     <option value="WIDOWED">Widowed</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-9 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Personal Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input name="personalEmail" type="email" required onChange={handleChange} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="you@gmail.com" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Mobile Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input name="mobilePhone" onChange={handleChange} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+1234567890" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input name="password" type="password" required onChange={handleChange} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Create a strong password" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2 mt-6"
              >
                {loading ? 'Submitting...' : <>Submit Application <ArrowRight className="h-4 w-4" /></>}
              </button>

            </form>

            <div className="mt-6 text-center pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}