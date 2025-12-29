import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 3000,
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    style: {
      background: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
    },
  });
}

export function showErrorToast(message: string) {
  toast.error(message, {
    duration: 4000,
    style: {
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca',
    },
  });
}
