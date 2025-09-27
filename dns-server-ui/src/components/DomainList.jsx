import React from "react";
import { Plus, Edit2, Info } from "lucide-react";

const DomainList = ({ domains, onAddDomain, onEditDomain, onShowNSInstructions }) => {
  return (
    <div className="bg-white rounded-lg border">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Your Domains</h2>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Enter domain name"
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              onChange={(e) => onAddDomain(e.target.value)}
            />
            <button
              onClick={onAddDomain}
              className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center space-x-2 transition-colors"
            >
              <Plus size={18} />
              <span>Add Domain</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">Domain</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">NS Access</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">Records</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {domains.map((domain) => (
              <tr key={domain.id} className="hover:bg-gray-50">
                <td className="py-4 px-6 text-sm font-medium text-gray-900">{domain.name}</td>
                <td className="py-4 px-6 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${domain.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {domain.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm">
                  {domain.nsAccess ? <span className="text-green-600">✔</span> : <span className="text-red-500">✖</span>}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">{domain.records}</td>
                <td className="py-4 px-6 text-sm">
                  <div className="flex space-x-3">
                    <button onClick={() => onEditDomain(domain)} className="text-gray-600 hover:text-gray-900">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onShowNSInstructions(domain.id)} className="text-gray-600 hover:text-gray-900">
                      <Info size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DomainList;