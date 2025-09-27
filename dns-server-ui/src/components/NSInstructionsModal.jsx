import React from "react";
import { Copy } from "lucide-react";

const NSInstructionsModal = ({ isOpen, onClose, nsInstructions }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Nameserver Setup Instructions
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {nsInstructions}
            </pre>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Nameservers:</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    "ns1.yourdns.com\nns2.yourdns.com\nns3.yourdns.com"
                  )
                }
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
              >
                <Copy size={14} />
                <span className="text-sm">Copy</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NSInstructionsModal;