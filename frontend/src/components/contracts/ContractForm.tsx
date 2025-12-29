import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Contract } from '@/lib/recruitmentService';
import { EmployeeSelector } from '@/components/recruitment-shared';
import { BenefitsMultiSelect } from './BenefitsMultiSelect';

interface ContractFormData {
  offerId: string;
  employeeId: string;
  grossSalary: string;
  signingBonus: string;
  role: string;
  startDate: string;
  benefits: string[];
}

interface ContractFormProps {
  initialData?: Contract;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function ContractForm({ initialData, onSubmit, onCancel }: ContractFormProps) {
  const [formData, setFormData] = useState<ContractFormData>({
    offerId: initialData?.offerId || '',
    employeeId: initialData?.employeeId || '',
    grossSalary: initialData?.grossSalary?.toString() || '',
    signingBonus: initialData?.signingBonus?.toString() || '',
    role: initialData?.role || '',
    startDate: initialData?.startDate
      ? new Date(initialData.startDate).toISOString().split('T')[0]
      : '',
    benefits: initialData?.benefits || [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContractFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ContractFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContractFormData, string>> = {};

    if (!formData.offerId.trim()) {
      newErrors.offerId = 'Offer ID is required';
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (!formData.grossSalary.trim()) {
      newErrors.grossSalary = 'Gross salary is required';
    } else if (parseFloat(formData.grossSalary) <= 0) {
      newErrors.grossSalary = 'Gross salary must be greater than 0';
    }

    if (formData.signingBonus && parseFloat(formData.signingBonus) < 0) {
      newErrors.signingBonus = 'Signing bonus cannot be negative';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else if (new Date(formData.startDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
      newErrors.startDate = 'Start date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        offerId: formData.offerId,
        employeeId: formData.employeeId,
        grossSalary: parseFloat(formData.grossSalary),
        signingBonus: formData.signingBonus ? parseFloat(formData.signingBonus) : undefined,
        role: formData.role,
        startDate: formData.startDate,
        benefits: formData.benefits,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Offer and Employee Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="offerId" className="block text-sm font-medium text-gray-700 mb-1">
            Offer ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="offerId"
            value={formData.offerId}
            onChange={(e) => handleInputChange('offerId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.offerId ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter offer ID..."
          />
          {errors.offerId && <p className="mt-1 text-sm text-red-600">{errors.offerId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee <span className="text-red-500">*</span>
          </label>
          <EmployeeSelector
            value={formData.employeeId}
            onChange={(value) => handleInputChange('employeeId', value)}
            required
          />
          {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>}
        </div>
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role/Position <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="role"
          value={formData.role}
          onChange={(e) => handleInputChange('role', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.role ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="e.g., Senior Software Engineer"
        />
        {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
      </div>

      {/* Financial Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="grossSalary" className="block text-sm font-medium text-gray-700 mb-1">
            Gross Salary (USD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              id="grossSalary"
              value={formData.grossSalary}
              onChange={(e) => handleInputChange('grossSalary', e.target.value)}
              className={`w-full pl-8 pr-3 py-2 border rounded-md text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.grossSalary ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          {errors.grossSalary && <p className="mt-1 text-sm text-red-600">{errors.grossSalary}</p>}
        </div>

        <div>
          <label htmlFor="signingBonus" className="block text-sm font-medium text-gray-700 mb-1">
            Signing Bonus (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              id="signingBonus"
              value={formData.signingBonus}
              onChange={(e) => handleInputChange('signingBonus', e.target.value)}
              className={`w-full pl-8 pr-3 py-2 border rounded-md text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.signingBonus ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          {errors.signingBonus && (
            <p className="mt-1 text-sm text-red-600">{errors.signingBonus}</p>
          )}
        </div>
      </div>

      {/* Start Date */}
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
          Start Date <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className={`w-full pl-10 pr-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.startDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
      </div>

      {/* Benefits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
        <BenefitsMultiSelect
          value={formData.benefits}
          onChange={(benefits) => handleInputChange('benefits', benefits)}
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Contract' : 'Create Contract'}
        </button>
      </div>
    </form>
  );
}
