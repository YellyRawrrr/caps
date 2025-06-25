import { useEffect, useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export default function TravelOrderForm({ isOpen, onClose, fetchOrders }) {
  if (!isOpen) return null;

  const tabs = ['identification', 'employee', 'itinerary', 'validation'];
  const tabLabels = {
    identification: 'Identification',
    employee: 'Employee Details',
    itinerary: 'Itinerary',
    validation: 'Validation'
  };

  const [activeTab, setActiveTab] = useState('identification');
  const [formData, setFormData] = useState({
    destination: '',
    purpose: '',
    date_travel_from: '',
    date_travel_to: '',
    mode_of_filing: '',
    date_of_filing: new Date().toISOString().split('T')[0],
    fund_cluster: ''
  });
  const [minDateFrom, setMinDateFrom] = useState('');
  const [minDateTo, setMinDateTo] = useState('');
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([null]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const getFutureDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [empRes, userRes] = await Promise.all([
          axios.get('employees/'),
          axios.get('user-info/')
        ]);
        setEmployeeList(empRes.data);
        setCurrentUserId(userRes.data.id);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchInitialData();
  }, []);

useEffect(() => {
  const updatedMinDateFrom =
    formData.mode_of_filing === 'IMMEDIATE'
      ? getFutureDate(0)
      : formData.mode_of_filing === 'NOT_IMMEDIATE'
      ? getFutureDate(3)
      : '';

  setMinDateFrom(updatedMinDateFrom);

  setFormData(prev => ({
    ...prev,
    date_travel_from:
      prev.date_travel_from && prev.date_travel_from < updatedMinDateFrom
        ? ''
        : prev.date_travel_from,
    date_travel_to: ''
  }));

  setMinDateTo('');
}, [formData.mode_of_filing]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'date_travel_from') {
      setMinDateTo(value);
    }
  };

  const handleEmployeeChange = (index, value) => {
    const updated = [...selectedEmployees];
    updated[index] = value;
    setSelectedEmployees(updated);
  };

  const handleAddEmployee = () => {
    setSelectedEmployees(prev => [...prev, null]);
  };

  const handleRemoveEmployee = (index) => {
    setSelectedEmployees(prev => prev.filter((_, i) => i !== index));
  };

  const availableOptions = (index) => {
    return employeeList.filter(emp =>
      emp.id !== currentUserId &&
      (!selectedEmployees.includes(emp.id?.toString()) || emp.id?.toString() === selectedEmployees[index])
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    data.append('employees', currentUserId);

    const additional = selectedEmployees.filter(id => id && id !== currentUserId?.toString());
    additional.forEach(id => data.append('employees', id));
    data.append('number_of_employees', 1 + additional.length);

    try {
      const response = await axios.post('travel-orders/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if ([200, 201].includes(response.status)) {
        toast.success('Travel order submitted!');
        onClose();
        await fetchOrders?.();
      } else {
        toast.error('Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Submission failed. Please try again.');
    }
  };

  const goToNextTab = () => {
    if (!isCurrentTabValid()) {
      alert('Please fill in all required fields before proceeding.');
      return;
    }
    const index = tabs.indexOf(activeTab);
    if (index < tabs.length - 1) setActiveTab(tabs[index + 1]);
  };

  const goToPreviousTab = () => {
    const index = tabs.indexOf(activeTab);
    if (index > 0) setActiveTab(tabs[index - 1]);
  };

  const isCurrentTabValid = () => {
    if (activeTab === 'identification') {
      return !!formData.mode_of_filing;
    }

    if (activeTab === 'employee') {
      const hasEmployees = selectedEmployees.length > 0 && selectedEmployees.every(emp => !!emp);
      const hasRequiredFields = [
        formData.destination,
        formData.purpose,
        formData.date_travel_from,
        formData.date_travel_to,
        formData.fund_cluster
      ].every(Boolean);

      return hasEmployees && hasRequiredFields;
    }

    return true;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2 border-gray-200">Travel Request Form</h2>

        <nav className="flex border-b mb-4">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600 hover:border-blue-300'}`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </nav>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'identification' && (
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">Mode of Filing</label>
              <div className="flex gap-4">
                {['IMMEDIATE', 'NOT_IMMEDIATE'].map(mode => (
                  <label key={mode} className="flex items-center text-sm text-gray-700">
                    <input
                      type="radio"
                      name="mode_of_filing"
                      value={mode}
                      checked={formData.mode_of_filing === mode}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {mode.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'employee' && (
            <>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Date of Filing</label>
                <input
                  type="date"
                  name="date_of_filing"
                  value={formData.date_of_filing}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">Fund Cluster</label>
                <div className="flex gap-4">
                  {['01_RF', '07_TF'].map(cluster => (
                    <label key={cluster} className="flex items-center text-sm text-gray-700">
                      <input
                        type="radio"
                        name="fund_cluster"
                        value={cluster}
                        checked={formData.fund_cluster === cluster}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      {cluster}
                    </label>
                  ))}
                </div>
              </div>

              <label className="block mb-1 text-sm font-medium text-gray-700">Employee(s)</label>
              {selectedEmployees.map((emp, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={emp || ''}
                    onChange={e => handleEmployeeChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">-- Select Employee --</option>
                    {availableOptions(index).map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.first_name} {opt.last_name}
                      </option>
                    ))}
                  </select>
                  {selectedEmployees.length > 1 && (
                    <button type="button" onClick={() => handleRemoveEmployee(index)} className="text-red-500 text-sm">❌</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddEmployee} className="text-blue-600 hover:underline text-sm mt-1">
                + Add another employee
              </button>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Number of employee(s)</label>
                <input
                  type="number"
                  readOnly
                  value={selectedEmployees.filter(emp => emp && emp !== currentUserId?.toString()).length}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600"
                />
              </div>

              {[{ label: 'Date of Official Travel(From)', name: 'date_travel_from', type: 'date', min: minDateFrom },
                { label: 'Date of Official Travel(To)', name: 'date_travel_to', type: 'date', min: minDateTo },
                { label: 'Destination', name: 'destination', type: 'text' }].map(({ label, name, type, min }) => (
                <div key={name}>
                  <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                    min={min}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              ))}

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Purpose</label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  rows="3"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </>
          )}

          {activeTab === 'itinerary' && <div className="text-sm text-gray-500 italic text-center">Itinerary details coming soon.</div>}

          {activeTab === 'validation' && <div className="text-sm text-gray-600 italic">Please review all details before submission.</div>}

          <div className="flex justify-between items-center pt-4 border-t">
            <button type="button" onClick={onClose} className="text-sm text-gray-600 hover:text-gray-800">Cancel</button>
            <div className="flex space-x-2">
              {activeTab !== 'identification' && (
                <button type="button" onClick={goToPreviousTab} className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-1 rounded">Back</button>
              )}
              {activeTab !== 'validation' ? (
                <button type="button" onClick={goToNextTab} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 rounded">Next</button>
              ) : (
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1 rounded">Submit Travel Order</button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
