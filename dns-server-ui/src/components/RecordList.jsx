import React from "react";
import { Edit2, Trash2 } from "lucide-react";

const RecordList = ({ records, onEditRecord, onDeleteRecord }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
              TTL
            </th>
            <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="py-4 px-6 text-sm font-medium text-gray-900">
                {record.name}
              </td>
              <td className="py-4 px-6 text-sm">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">
                  {record.type}
                </span>
              </td>
              <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate font-mono">
                {record.value}
              </td>
              <td className="py-4 px-6 text-sm text-gray-600">
                {record.ttl}
              </td>
              <td className="py-4 px-6 text-sm text-gray-600">
                {record.priority || "-"}
              </td>
              <td className="py-4 px-6 text-sm">
                <div className="flex space-x-3">
                  <button
                    onClick={() => onEditRecord(record)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteRecord(record.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordList;