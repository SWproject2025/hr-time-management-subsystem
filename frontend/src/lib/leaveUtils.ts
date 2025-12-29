export const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'PENDING_HR':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getUrgencyBadge = (createdAt: string) => {
  const hoursSince = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursSince > 48) {
    return {
      label: 'Urgent (>48h)',
      className: 'bg-red-100 text-red-800 border-red-200'
    };
  } else if (hoursSince > 24) {
    return {
      label: 'High (>24h)',
      className: 'bg-orange-100 text-orange-800 border-orange-200'
    };
  }
  return {
    label: 'Normal',
    className: 'bg-green-100 text-green-800 border-green-200'
  };
};

export const formatDate = (date: string | Date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatThinkingDate = (date: string | Date) => {
    // Helper specifically for logic if needed, otherwise standard formatDate is fine
    return new Date(date).toISOString().split('T')[0];
};
