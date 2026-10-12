import React from 'react';

const StatusBadge = ({ 
  status, 
  className = '' 
}) => {
  const statusConfig = {
    active: {
      classes: 'bg-green-100 text-green-800',
      label: 'Active'
    },
    pending: {
      classes: 'bg-yellow-100 text-yellow-800',  
      label: 'Pending'
    },
    completed: {
      classes: 'bg-blue-100 text-blue-800',
      label: 'Completed'
    },
    cancelled: {
      classes: 'bg-red-100 text-red-800',
      label: 'Cancelled'
    },
    draft: {
      classes: 'bg-gray-100 text-gray-800',
      label: 'Draft'
    },
    approved: {
      classes: 'bg-green-100 text-green-800',
      label: 'Approved'
    },
    rejected: {
      classes: 'bg-red-100 text-red-800',
      label: 'Rejected'
    },
    in_progress: {
      classes: 'bg-blue-100 text-blue-800',
      label: 'In Progress'
    }
  };
  
  const config = statusConfig[status] || statusConfig.draft;
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const badgeClasses = `${baseClasses} ${config.classes} ${className}`;
  
  return (
    <span className={badgeClasses}>
      {config.label}
    </span>
  );
};

export default StatusBadge;