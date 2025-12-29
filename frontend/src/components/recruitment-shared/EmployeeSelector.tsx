import React, { useState, useEffect } from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/calc-draft-utils';

interface Employee {
  _id: string;
  name: string;
  employeeId?: string;
  position?: string;
}

interface EmployeeSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function EmployeeSelector({
  value,
  onChange,
  required = false,
  placeholder = 'Select employee...',
  className,
  disabled = false,
}: EmployeeSelectorProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call to fetch employees
      // For now, using mock data
      const response = await fetch('http://localhost:3000/employees', {
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
      // Set empty array as fallback
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEmployee = employees.find((emp) => emp._id === value);

  return (
    <div className={cn('relative', className)}>
      <Select.Root value={value} onValueChange={onChange} disabled={disabled || loading}>
        <Select.Trigger
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
            'ring-offset-white placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
        >
          <Select.Value placeholder={loading ? 'Loading...' : placeholder}>
            {selectedEmployee ? (
              <span>
                {selectedEmployee.name}
                {selectedEmployee.employeeId && (
                  <span className="text-gray-500 ml-2">({selectedEmployee.employeeId})</span>
                )}
              </span>
            ) : (
              placeholder
            )}
          </Select.Value>
          <Select.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md"
            position="popper"
            sideOffset={4}
          >
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            <Select.Viewport className="p-1 max-h-[200px] overflow-y-auto">
              {error ? (
                <div className="py-6 text-center text-sm text-red-600">{error}</div>
              ) : filteredEmployees.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  {searchTerm ? 'No employees found' : 'No employees available'}
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <Select.Item
                    key={employee._id}
                    value={employee._id}
                    className={cn(
                      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none',
                      'focus:bg-blue-100 focus:text-blue-900',
                      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                    )}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Select.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </Select.ItemIndicator>
                    </span>
                    <Select.ItemText>
                      <div className="flex flex-col">
                        <span className="font-medium">{employee.name}</span>
                        {(employee.employeeId || employee.position) && (
                          <span className="text-xs text-gray-500">
                            {employee.employeeId && `ID: ${employee.employeeId}`}
                            {employee.employeeId && employee.position && ' • '}
                            {employee.position}
                          </span>
                        )}
                      </div>
                    </Select.ItemText>
                  </Select.Item>
                ))
              )}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {required && !value && (
        <p className="mt-1 text-xs text-red-600">This field is required</p>
      )}
    </div>
  );
}
