import { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function TravelOrderForm({ isOpen, onClose, fetchOrders }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    destination: '',
    purpose: '',
    departure_date: '',
    return_date: '',
  });

  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([null]); // starts with 1 dropdown

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('employees/');
        setEmployeeList(res.data);
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      }
    };
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
      !selectedEmployees.includes(emp.id?.toString()) || emp.id?.toString() === selectedEmployees[index]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('travel-orders/', {
        ...formData,
        employees: selectedEmployees.filter(Boolean).map(id => parseInt(id)),
      });
      alert('Travel order submitted!');
      onClose();
      await fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Submission failed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2 border-gray-200">
          Submit New Travel Order
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Destination</label>
            <input type="text" name="destination" onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Purpose</label>
            <textarea name="purpose" onChange={handleChange} rows="3" required className="w-full px-3 py-2 border border-gray-300 rounded" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Departure Date</label>
            <input type="date" name="departure_date" onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Return Date</label>
            <input type="date" name="return_date" onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Select Employee(s)</label>
            {selectedEmployees.map((emp, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  value={emp || ''}
                  onChange={(e) => handleEmployeeChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">-- Select Employee --</option>
                  {availableOptions(index).map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>

                {selectedEmployees.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEmployee(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddEmployee}
              className="text-blue-600 hover:underline text-sm mt-1"
            >
              + Add another employee
            </button>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">
            Submit Travel Order
          </button>
        </form>
      </div>
    </div>
  );
}