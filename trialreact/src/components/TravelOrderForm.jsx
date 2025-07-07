import { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export default function TravelOrderForm({ isOpen, onClose, fetchOrders }) {
  if (!isOpen) return null;

  const tabs = ['identification', 'employee', 'itinerary', 'validation'];
  const tabLabels = {
    identification: 'Identification',
    employee: 'Employee Details',
    itinerary: 'Itinerary',
    validation: 'Validation',
  };

  const [activeTab, setActiveTab] = useState('identification');
  const [formData, setFormData] = useState({
    destination: '',
    purpose: '',
    date_travel_from: '',
    date_travel_to: '',
    mode_of_filing: '',
    date_of_filing: new Date().toISOString().split('T')[0],
    fund_cluster: '',
    prepared_by: '',
    employee_position: '',
  });

  const [itineraryList, setItineraryList] = useState([
    {
      itinerary_date: '',
      departure_time: '',
      arrival_time: '',
      transportation:'',
      transportation_allowance: '',
      per_diem: '',
      other_expense: '',
      total_amount: '',
    },
  ]);

  const [fundList, setFundList] = useState([]);
  const [transportationList, setTransportationList] = useState([]); // ← ADD THIS
  const [employeePositions, setEmployeePositions] = useState([]);
  const [preparedByPositionName, setPreparedByPositionName] = useState('');
  const [minDateFrom, setMinDateFrom] = useState('');
  const [minDateTo, setMinDateTo] = useState('');
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([null]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Autocomplete state for employee selection
  const [employeeSearch, setEmployeeSearch] = useState([]); // array of search strings per employee
  const [showDropdown, setShowDropdown] = useState([]); // array of booleans per employee
  const inputRefs = useRef([]);
  // Autocomplete state for prepared_by
  const [preparedBySearch, setPreparedBySearch] = useState('');
  const [showPreparedByDropdown, setShowPreparedByDropdown] = useState(false);
  const preparedByInputRef = useRef(null);

  const getFutureDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

useEffect(() => {
  const fetchInitialData = async () => {
    try {
      const [empRes, userRes, fundRes, transRes, posRes] = await Promise.all([
        axios.get('employees/'),
        axios.get('user-info/'),
        axios.get('funds/'),
        axios.get('transportation/'),
        axios.get('employee-position/'),
      ]);

      setEmployeeList(empRes.data);
      setCurrentUserId(userRes.data.id);
      setFundList(fundRes.data);
      setTransportationList(transRes.data);
      setEmployeePositions(posRes.data);

      const preparedEmp = empRes.data.find(
        (e) => e.id === userRes.data.id
      );

      const position = preparedEmp?.employee_position
        ? posRes.data.find((p) => p.id === preparedEmp.employee_position)
        : null;

      setPreparedByPositionName(position?.position_name || '');

      setFormData((prev) => ({
        ...prev,
        prepared_by: userRes.data.id.toString(),
        employee_position: preparedEmp?.employee_position?.toString() || '',
      }));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  fetchInitialData();
}, []);


useEffect(() => {
  const fetchPreparedByPosition = async () => {
    if (!formData.prepared_by) {
      setPreparedByPositionName('');
      return;
    }

    const emp = employeeList.find(
      (e) => e.id === parseInt(formData.prepared_by)
    );

    if (emp?.employee_position) {
      const pos = employeePositions.find(
        (p) => p.id === emp.employee_position
      );
      setPreparedByPositionName(pos?.position_name || '');

      // Optional: set this if sending to backend
      // setFormData((prev) => ({
      //   ...prev,
      //   employee_position: emp.employee_position?.toString() || '',
      // }));
    } else {
      setPreparedByPositionName('');
    }
  };

  fetchPreparedByPosition();
}, [formData.prepared_by, employeeList, employeePositions]);



  useEffect(() => {
    const updatedMinDateFrom =
      formData.mode_of_filing === 'IMMEDIATE'
        ? getFutureDate(0)
        : formData.mode_of_filing === 'NOT_IMMEDIATE'
        ? getFutureDate(3)
        : '';
    setMinDateFrom(updatedMinDateFrom);
    setFormData((prev) => ({
      ...prev,
      date_travel_from:
        prev.date_travel_from && prev.date_travel_from < updatedMinDateFrom
          ? ''
          : prev.date_travel_from,
      date_travel_to: '',
    }));
    setMinDateTo('');
  }, [formData.mode_of_filing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    setSelectedEmployees((prev) => [...prev, null]);
  };

  const handleRemoveEmployee = (index) => {
    setSelectedEmployees((prev) => prev.filter((_, i) => i !== index));
  };

  const availableOptions = (index) => {
    return employeeList.filter(
      (emp) =>
        emp.id !== currentUserId &&
        (!selectedEmployees.includes(emp.id?.toString()) ||
          emp.id?.toString() === selectedEmployees[index])
    );
  };

  // Helper for filtering employees for autocomplete
  const filteredEmployeeOptions = (index, searchList, optionsList) => {
    const search = (searchList[index] || '').toLowerCase();
    return optionsList.filter(
      (opt) => `${opt.first_name} ${opt.last_name}`.toLowerCase().includes(search)
    );
  };

  const handleItineraryChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...itineraryList];
    updated[index][name] = value;

    if (
      ['transportation_allowance', 'per_diem', 'other_expense'].includes(name)
    ) {
      const { transportation_allowance, per_diem, other_expense } =
        updated[index];
      updated[index].total_amount =
        parseFloat(transportation_allowance || 0) +
        parseFloat(per_diem || 0) +
        parseFloat(other_expense || 0);
    }

    setItineraryList(updated);
  };

  const addItinerary = () => {
    setItineraryList((prev) => [
      ...prev,
      {
        itinerary_date: '',
        departure_time: '',
        arrival_time: '',
        transportation_allowance: '',
        per_diem: '',
        other_expense: '',
        total_amount: '',
      },
    ]);
  };

  const removeItinerary = (index) => {
    const updated = [...itineraryList];
    updated.splice(index, 1);
    setItineraryList(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validEmployees = selectedEmployees.filter((id) => !!id);
const payload = {
  ...formData,
  fund: formData.fund ? Number(formData.fund) : null,
  prepared_by: formData.prepared_by ? Number(formData.prepared_by) : null,
  // Optional: include this if backend accepts it
  // employee_position: formData.employee_position ? Number(formData.employee_position) : null,
  employees: [currentUserId, ...validEmployees].map(Number),
  number_of_employees: validEmployees.length + 1,
  itinerary: itineraryList.map((item) => ({
    ...item,
    transportation_allowance: parseFloat(item.transportation_allowance) || 0,
    per_diem: parseFloat(item.per_diem) || 0,
    other_expense: parseFloat(item.other_expense) || 0,
    total_amount: parseFloat(item.total_amount) || 0,
  })),
};


    try {
      const response = await axios.post('travel-orders/', payload);
      if ([200, 201].includes(response.status)) {
        toast.success('Travel order submitted!');
        onClose();
        await fetchOrders?.();
      } else {
        toast.error('Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
      toast.error('Submission failed. Please check your form.');
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
    const hasEmployees =
      selectedEmployees.length > 0 &&
      selectedEmployees.every((emp) => !!emp);
    const hasRequiredFields = [
      formData.destination,
      formData.purpose,
      formData.date_travel_from,
      formData.date_travel_to,
      formData.fund_cluster,
    ].every(Boolean);

    return hasEmployees && hasRequiredFields;
  }

  if (activeTab === 'itinerary') {
    return itineraryList.every((entry) =>
      ['itinerary_date', 'departure_time', 'arrival_time'].every(
        (field) => !!entry[field]
      )
    );
  }

  return true;
};


  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2 border-gray-200">
          Travel Request Form
        </h2>

        {/* Stepper UI */}
        <div className="flex items-center justify-between mb-6">
          {tabs.map((tab, idx) => (
            <div key={tab} className="flex-1 flex flex-col items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-bold mb-1
                  ${activeTab === tab ? 'border-blue-800 bg-white-600 text-blue' :
                    idx < tabs.indexOf(activeTab) ? 'border-blue-800 bg-blue-800 text-white' :
                    'border-gray-300 bg-white text-gray-500'}
                `}
              >
                {idx + 1}
              </div>
              <span className={`text-xs ${activeTab === tab ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>{tabLabels[tab]}</span>
              {idx < tabs.length - 1 && (
                <div className="w-full h-0.5 bg-gray-300 mt-1 mb-1" style={{ minWidth: 24 }}></div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && activeTab !== 'validation') {
                  e.preventDefault();
                }
              }}
              className="space-y-4"
            >
          {/* Identification Step */}
          {activeTab === 'identification' && (
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Mode of Filing
              </label>
              <div className="flex gap-4">
                {['IMMEDIATE', 'NOT_IMMEDIATE'].map((mode) => (
                  <label
                    key={mode}
                    className="flex items-center text-sm text-gray-700"
                  >
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

          {/* Employee Step */}
          {activeTab === 'employee' && (
            <>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Date of Filing
                </label>
                <input
                  type="date"
                  name="date_of_filing"
                  value={formData.date_of_filing}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Fund Cluster
                </label>
                <div className="flex gap-4">
                  {['01_RF', '07_TF'].map((cluster) => (
                    <label
                      key={cluster}
                      className="flex items-center text-sm text-gray-700"
                    >
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

              <label className="block mb-1 text-sm font-medium text-gray-700">
                Employee(s)
              </label>
              {selectedEmployees.map((emp, index) => (
                <div key={index} className="flex gap-2 mb-2 relative">
                  <div className="flex-1">
                    <input
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      value={
                        emp
                          ? (() => {
                              const found = employeeList.find(e => e.id?.toString() === emp);
                              return found ? `${found.first_name} ${found.last_name}` : '';
                            })()
                          : (employeeSearch[index] || '')
                      }
                      onChange={e => {
                        const val = e.target.value;
                        setEmployeeSearch(prev => {
                          const arr = [...prev];
                          arr[index] = val;
                          return arr;
                        });
                        setShowDropdown(prev => {
                          const arr = [...prev];
                          arr[index] = true;
                          return arr;
                        });
                        // Clear selection if user types
                        handleEmployeeChange(index, '');
                      }}
                      onFocus={() => setShowDropdown(prev => {
                        const arr = [...prev];
                        arr[index] = true;
                        return arr;
                      })}
                      onBlur={() => setTimeout(() => setShowDropdown(prev => {
                        const arr = [...prev];
                        arr[index] = false;
                        return arr;
                      }), 150)}
                      placeholder="-- Select Employee --"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    {showDropdown[index] && filteredEmployeeOptions(index, employeeSearch, availableOptions(index)).length > 0 && (
                      <ul className="absolute z-10 bg-white border border-gray-300 rounded shadow w-full mt-1 max-h-40 overflow-y-auto">
                        {filteredEmployeeOptions(index, employeeSearch, availableOptions(index)).map(opt => (
                          <li
                            key={opt.id}
                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                            onMouseDown={() => {
                              handleEmployeeChange(index, opt.id.toString());
                              setEmployeeSearch(prev => {
                                const arr = [...prev];
                                arr[index] = `${opt.first_name} ${opt.last_name}`;
                                return arr;
                              });
                              setShowDropdown(prev => {
                                const arr = [...prev];
                                arr[index] = false;
                                return arr;
                              });
                              // Focus next input if adding
                              if (index === selectedEmployees.length - 1 && inputRefs.current[index + 1]) {
                                inputRefs.current[index + 1].focus();
                              }
                            }}
                          >
                            {opt.first_name} {opt.last_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {selectedEmployees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmployee(index)}
                      className="text-red-500 text-sm"
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

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Number of employee(s)
                </label>
                <input
                  type="number"
                  readOnly
                  value={selectedEmployees.filter((emp) => !!emp).length}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600"
                />
              </div>

              {[
                {
                  label: 'Date of Official Travel(From)',
                  name: 'date_travel_from',
                  type: 'date',
                  min: minDateFrom,
                },
                {
                  label: 'Date of Official Travel(To)',
                  name: 'date_travel_to',
                  type: 'date',
                  min: minDateTo,
                },
                { label: 'Destination', name: 'destination', type: 'text' },
              ].map(({ label, name, type, min }) => (
                <div key={name}>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {label}
                  </label>
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
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Purpose
                </label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  rows="3"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">Fund Source</label>
                <select
                  name="fund"
                  value={formData.fund}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">-- Select Fund --</option>
                  {fundList.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                      {fund.source_of_fund}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Itinerary Step */}
          {activeTab === 'itinerary' && (
            <div>
              {itineraryList.map((entry, index) => (
                <div key={index} className="mb-4 border p-4 rounded">
                  <h4 className="font-medium text-sm mb-2">Itinerary #{index + 1}</h4>

                  {/* Date */}
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      name="itinerary_date"
                      value={entry.itinerary_date}
                      onChange={(e) => handleItineraryChange(index, e)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>

                  {/* Departure Time */}
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Departure Time</label>
                    <input
                      type="time"
                      name="departure_time"
                      value={entry.departure_time}
                      onChange={(e) => handleItineraryChange(index, e)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>

                  {/* Arrival Time */}
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Arrival Time</label>
                    <input
                      type="time"
                      name="arrival_time"
                      value={entry.arrival_time}
                      onChange={(e) => handleItineraryChange(index, e)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>

                  {/* 🚗 Means of Transportation */}
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Means of Transportation</label>
                    <select
                      name="transportation"
                      value={entry.transportation || ''}
                      onChange={(e) => handleItineraryChange(index, e)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                      required
                    >
                      <option value="">-- Select Transportation --</option>
                      {transportationList.map((transportation) => (
                        <option key={transportation.id} value={transportation.id}>
                          {transportation.means_of_transportation}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Transportation Allowance */}
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Transportation Allowance</label>
                    <input
                      type="number"
                      name="transportation_allowance"
                      value={entry.transportation_allowance}
                      onChange={(e) => handleItineraryChange(index, e)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>

                  {/* Per Diem */}
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Per Diem</label>
                    <input
                      type="number"
                      name="per_diem"
                      value={entry.per_diem}
                      onChange={(e) => handleItineraryChange(index, e)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>

                  {/* Other Expense */}
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Other Expense</label>
                    <input
                      type="number"
                      name="other_expense"
                      value={entry.other_expense}
                      onChange={(e) => handleItineraryChange(index, e)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>

                  {/* Total Amount */}
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <input
                      type="number"
                      name="total_amount"
                      value={entry.total_amount}
                      readOnly
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                    />
                  </div>

                  {itineraryList.length > 1 && (
                    <button
                      onClick={() => removeItinerary(index)}
                      type="button"
                      className="text-red-500 text-sm mt-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addItinerary}
                type="button"
                className="text-blue-600 text-sm mt-2"
              >
                + Add Itinerary
              </button>
            </div>
          )}

          {/* Validation Step */}
          {activeTab === 'validation' && (
            <>
              <div className="mb-4 relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">Prepared By</label>
                <input
                  ref={preparedByInputRef}
                  type="text"
                  value={(() => {
                    const found = employeeList.find(e => e.id?.toString() === formData.prepared_by);
                    return found ? `${found.first_name} ${found.last_name}` : preparedBySearch;
                  })()}
                  onChange={e => {
                    setPreparedBySearch(e.target.value);
                    setShowPreparedByDropdown(true);
                    // Clear selection if user types
                    setFormData(prev => ({ ...prev, prepared_by: '' }));
                  }}
                  onFocus={() => setShowPreparedByDropdown(true)}
                  onBlur={() => setTimeout(() => setShowPreparedByDropdown(false), 150)}
                  placeholder="-- Select Employee --"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
                {showPreparedByDropdown && filteredEmployeeOptions(0, [preparedBySearch], employeeList).length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-300 rounded shadow w-full mt-1 max-h-40 overflow-y-auto">
                    {filteredEmployeeOptions(0, [preparedBySearch], employeeList).map(opt => (
                      <li
                        key={opt.id}
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                        onMouseDown={() => {
                          setFormData(prev => ({ ...prev, prepared_by: opt.id.toString() }));
                          setPreparedBySearch(`${opt.first_name} ${opt.last_name}`);
                          setShowPreparedByDropdown(false);
                        }}
                      >
                        {opt.first_name} {opt.last_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Employee Position
              </label>
              <select
                name="employee_position"
                value={formData.employee_position || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              >
                <option value="">-- Select Position --</option>
                {employeePositions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.position_name}
                  </option>
                ))}
              </select>
            </div>
            </>
          )}


          <div className="flex justify-between items-center pt-4 border-t">
            <button type="button" onClick={onClose} className="text-sm text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <div className="flex space-x-2">
              {activeTab !== 'identification' && (
                <button type="button" onClick={goToPreviousTab} className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-1 rounded">
                  Back
                </button>
              )}
              {activeTab !== 'validation' ? (
                <button
                  type="button"
                  onClick={goToNextTab}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 rounded"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1 rounded"
                >
                  Submit Travel Order
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
