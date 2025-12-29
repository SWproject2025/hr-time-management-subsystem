import React from 'react';

export default function EquipmentReturnList({ checklist }: any) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h4 className="font-medium mb-3">Equipment Return</h4>

      {checklist.equipmentList.length === 0 && (
        <p className="text-sm text-gray-500">No equipment assigned</p>
      )}

      {checklist.equipmentList.map((eq: any) => (
        <div
          key={eq._id}
          className="flex justify-between items-center text-sm border-b py-2"
        >
          <span>{eq.name}</span>
          <span>{eq.returned ? 'Returned' : 'Pending'}</span>
        </div>
      ))}
    </div>
  );
}
