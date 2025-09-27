import React, { useState } from "react";
import RecordForm from "../components/RecordForm";
import RecordList from "../components/RecordList";

const RecordsPage = ({ selectedDomain }) => {
  const [records, setRecords] = useState([]);

  const handleAddRecord = (newRecord) => {
    setRecords([...records, newRecord]);
  };

  const handleUpdateRecord = (updatedRecord) => {
    setRecords(records.map(record => (record.id === updatedRecord.id ? updatedRecord : record)));
  };

  const handleDeleteRecord = (id) => {
    setRecords(records.filter(record => record.id !== id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        DNS Records for {selectedDomain?.name}
      </h2>
      <RecordForm onAddRecord={handleAddRecord} />
      <RecordList 
        records={records} 
        onEditRecord={handleUpdateRecord} 
        onDeleteRecord={handleDeleteRecord} 
      />
    </div>
  );
};

export default RecordsPage;