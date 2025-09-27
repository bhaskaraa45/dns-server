import React from "react";
import { Plus } from "lucide-react";

const RecordForm = ({ newRecord, setNewRecord, handleAddRecord, editingRecord, handleUpdateRecord }) => {
  return (
    <div className="p-6 border-b">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {editingRecord ? "Edit Record" : "Add New Record"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <input
          type="text"
          placeholder="Name"
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          value={newRecord.name}
          onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
        />
        <select
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          value={newRecord.type}
          onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
        >
          {["A", "AAAA", "CNAME", "MX", "TXT", "NS", "PTR", "SRV", "CAA"].map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Value"
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          value={newRecord.value}
          onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
        />
        <input
          type="number"
          placeholder="TTL"
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          value={newRecord.ttl}
          onChange={(e) => setNewRecord({ ...newRecord, ttl: parseInt(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Priority"
          className={`px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            !["MX", "SRV"].includes(newRecord.type) ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          value={newRecord.priority}
          onChange={(e) => setNewRecord({ ...newRecord, priority: e.target.value })}
          disabled={!["MX", "SRV"].includes(newRecord.type)}
        />
        <div className="flex space-x-2">
          <button
            onClick={editingRecord ? handleUpdateRecord : handleAddRecord}
            className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center justify-center transition-colors disabled:bg-gray-400"
            disabled={!newRecord.name || !newRecord.value}
          >
            {editingRecord ? "Update" : <Plus size={18} />}
          </button>
          {editingRecord && (
            <button
              onClick={() => {
                setEditingRecord(null);
                setNewRecord({
                  name: "",
                  type: "A",
                  value: "",
                  ttl: 300,
                  priority: "",
                });
              }}
              className="border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordForm;