import React, { useState, useEffect } from 'react';

const EditAppModal = ({ apps, setApps, onClose }) => {
  
  const [localApps, setLocalApps] = useState(apps.map(app => app.url.replace("https://", "")));
  const [hasEmptyField, setHasEmptyField] = useState(false);

  useEffect(() => {
    // Check for empty fields after each change
    setHasEmptyField(localApps.some(app => !app || app.trim() === ""));
  }, [localApps]);

  const handleChange = (e, index) => {
    const updatedApps = [...localApps];
    let value = e.target.value.trim();

    // Remove "https://" prefix if present
    if (value.startsWith("https://")) {
      value = value.replace("https://", "");
    }

    updatedApps[index] = value;
    setLocalApps(updatedApps);
  };

  const handleSave = () => {
    // Add the "https://" prefix to each URL when saving to global state
    const updatedGlobalApps = localApps.map(url => ({ url: "https://" + url.trim() }));
    setApps(updatedGlobalApps);
    onClose();
  };

  return (
    <div className="modal bg-white rounded-lg p-6">
      <h2 className="text-2xl mb-4">Edit Apps</h2>
      {localApps.map((url, index) => (
        <div key={index} className="mb-3">
          <input 
            type="text" 
            value={url}
            onChange={e => handleChange(e, index)}
            className="p-2 border rounded w-full"
            placeholder="Enter App URL without 'https://'..."
          />
        </div>
      ))}
      <button 
        onClick={handleSave} 
        className={`bg-blue-500 text-white px-4 py-2 rounded-lg mt-3 ${hasEmptyField ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={hasEmptyField}
      >
        Save
      </button>
      <button 
        onClick={onClose} 
        className="bg-red-500 text-white px-4 py-2 rounded-lg ml-3"
      >
        Cancel
      </button>
    </div>
  );
};

export default EditAppModal;
