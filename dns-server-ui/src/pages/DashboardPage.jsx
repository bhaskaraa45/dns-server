import React from "react";
import DomainList from "../components/DomainList";

const DashboardPage = ({ domains }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-600 text-sm">Total Domains</p>
          <p className="text-2xl font-semibold text-gray-900">{domains.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-600 text-sm">Active Domains</p>
          <p className="text-2xl font-semibold text-gray-900">
            {domains.filter((d) => d.nsAccess).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-600 text-sm">Total Records</p>
          <p className="text-2xl font-semibold text-gray-900">
            {domains.reduce((total, domain) => total + domain.records, 0)}
          </p>
        </div>
      </div>
      <DomainList domains={domains} />
    </div>
  );
};

export default DashboardPage;