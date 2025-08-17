import { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import SignatureCanvas from 'react-signature-canvas';
import IdentificationStep from './TravelOrderFormSteps/IdentificationStep';
import EmployeeStep from './TravelOrderFormSteps/EmployeeStep';
import ItineraryStep from './TravelOrderFormSteps/ItineraryStep';
import ValidationStep from './TravelOrderFormSteps/ValidationStep';



export default function TravelOrderForm({ isOpen, onClose, fetchOrders, mode = 'create', existingOrder = null, onRemoveRejected = null }) {

  if (!isOpen) return null;

  // Tab navigation
  const tabs = ['identification', 'employee', 'itinerary', 'validation'];
  const tabLabels = {
    identification: 'Identification',
    employee: 'Employee Details',
    itinerary: 'Itinerary',
    validation: 'Validation',
  };

  // Form state
  const [activeTab, setActiveTab] = useState('identification');
  const [formData, setFormData] = useState({
  destination: '',
  purpose: '',
  specific_role: '',
  date_travel_from: '',
  date_travel_to: '',
  mode_of_filing: '',
  date_of_filing: new Date().toISOString().split('T')[0],
  fund_cluster: '',
  prepared_by: '',
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
  const sigPadRef = useRef();
  const [signatureData, setSignatureData] = useState(null);

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
  const submitBtnRef = useRef();
  const [preparedByPositionName, setPreparedByPositionName] = useState('');
  const [preparedByUserType, setPreparedByUserType] = useState('');

  const [submitClicked, setSubmitClicked] = useState(false);


  const getFutureDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

useEffect(() => {
  const fetchInitialData = async () => {
    try {
      const [empRes, userRes, fundRes, transRes] = await Promise.all([
        axios.get('employees/'),
        axios.get('user-info/'),
        axios.get('funds/'),
        axios.get('transportation/'),
      ]);

      const nonExcludedEmployees = empRes.data.filter(
        emp => !['admin', 'bookkeeper', 'accountant'].includes(emp.user_level)
      );
      setEmployeeList(nonExcludedEmployees);

      setCurrentUserId(userRes.data.id);
      setSelectedEmployees([userRes.data.id.toString()]);
      setEmployeeSearch([`${userRes.data.first_name} ${userRes.data.last_name}`]);
      setShowDropdown([false]);
      setFundList(fundRes.data);
      setTransportationList(transRes.data);

      const preparedEmp = nonExcludedEmployees.find(e => e.id === userRes.data.id);
      setPreparedByPositionName(preparedEmp?.employee_position_name || ''); // Optional: placeholder

      setFormData((prev) => ({
        ...prev,
        prepared_by: userRes.data.id.toString(),
      }));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  fetchInitialData();
}, []);

useEffect(() => {
  if (existingOrder) {
    setFormData((prev) => ({
      ...prev,
      destination: existingOrder.destination || '',
      purpose: existingOrder.purpose || '',
      specific_role: existingOrder.specific_role || '',
      date_travel_from: existingOrder.date_travel_from || '',
      date_travel_to: existingOrder.date_travel_to || '',
      mode_of_filing: existingOrder.mode_of_filing || '',
      fund: existingOrder.fund?.toString() || '',
      fund_cluster: existingOrder.fund_cluster || '',
      prepared_by: existingOrder.prepared_by?.toString() || '',
    }));

    setSelectedEmployees(existingOrder.employees.map(String));
    setEmployeeSearch(existingOrder.employees.map((empId) => {
      const emp = employeeList.find(e => e.id.toString() === empId.toString());
      return emp ? `${emp.first_name} ${emp.last_name}` : '';
    }));
    setShowDropdown(existingOrder.employees.map(() => false));

    setItineraryList(existingOrder.itinerary || []);
  }
}, [existingOrder, employeeList]);




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
setEmployeeSearch((prev) => [...prev, '']);
setShowDropdown((prev) => [...prev, false]);

  };

  const handleRemoveEmployee = (index) => {
    setSelectedEmployees((prev) => prev.filter((_, i) => i !== index));
  };

const availableOptions = (index) => {
  return employeeList.filter((emp) => {
    const isAlreadySelected = selectedEmployees.includes(emp.id?.toString());
    const isCurrentSelection = emp.id?.toString() === selectedEmployees[index];
    const isPreparedBy = emp.id === currentUserId;

    return (!isAlreadySelected || isCurrentSelection) && emp.id !== currentUserId;
  });
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
  if (!submitClicked) return;
  setSubmitClicked(false);

  let signatureBase64 = null;
  if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
    signatureBase64 = sigPadRef.current.getCanvas().toDataURL('image/png');
  }

  const validEmployees = selectedEmployees.filter((id) => !!id);
  const payload = {
    ...formData,
    fund: formData.fund ? Number(formData.fund) : null,
    prepared_by: formData.prepared_by ? Number(formData.prepared_by) : null,
    prepared_by_position_name: preparedByPositionName,
    employees: [currentUserId, ...validEmployees].map(Number),
    number_of_employees: validEmployees.length + 1,
    itinerary: itineraryList.map((item) => ({
      ...item,
      transportation_allowance: parseFloat(item.transportation_allowance) || 0,
      per_diem: parseFloat(item.per_diem) || 0,
      other_expense: parseFloat(item.other_expense) || 0,
      total_amount: parseFloat(item.total_amount) || 0,
    })),
    signature: signatureBase64,
  };

  try {
    const response = mode === 'edit'
      ? await axios.put(`/travel-orders/${existingOrder.id}/`, payload)
      : await axios.post('travel-orders/', payload);

    if ([200, 201].includes(response.status)) {
      toast.success(mode === 'edit' ? 'Travel order resubmitted!' : 'Travel order submitted!');
      onClose();
       if (mode === 'edit' && onRemoveRejected && existingOrder?.id) {
    onRemoveRejected(existingOrder.id);
  }
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
      formData.specific_role,
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
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="space-y-4"
            >
          {/* Identification Step */}
          {activeTab === 'identification' && (
            <IdentificationStep
              formData={formData}
              handleChange={handleChange}
            />
          )}

          {/* Employee Step */}
          {activeTab === 'employee' && (
            <EmployeeStep
              formData={formData}
              handleChange={handleChange}
              fundList={fundList}
              selectedEmployees={selectedEmployees}
              employeeList={employeeList}
              employeeSearch={employeeSearch}
              showDropdown={showDropdown}
              inputRefs={inputRefs}
              handleEmployeeChange={handleEmployeeChange}
              handleAddEmployee={handleAddEmployee}
              handleRemoveEmployee={handleRemoveEmployee}
              filteredEmployeeOptions={filteredEmployeeOptions}
              availableOptions={availableOptions}
              currentUserId={currentUserId}
              setEmployeeSearch={setEmployeeSearch}
              setShowDropdown={setShowDropdown}
              minDateFrom={minDateFrom}
              minDateTo={minDateTo}
            />
          )}

          {/* Itinerary Step */}
          {activeTab === 'itinerary' && (
            <ItineraryStep
              itineraryList={itineraryList}
              handleItineraryChange={handleItineraryChange}
              addItinerary={addItinerary}
              removeItinerary={removeItinerary}
              transportationList={transportationList}
            />
          )}

          {/* Validation Step */}
          {activeTab === 'validation' && (
            <ValidationStep
              formData={formData}
              preparedByInputRef={preparedByInputRef}
              employeeList={employeeList}
              preparedBySearch={preparedBySearch}
              setPreparedBySearch={setPreparedBySearch}
              showPreparedByDropdown={showPreparedByDropdown}
              setShowPreparedByDropdown={setShowPreparedByDropdown}
              filteredEmployeeOptions={filteredEmployeeOptions}
              setFormData={setFormData}
              signatureData={signatureData}
              sigPadRef={sigPadRef}
              setSignatureData={setSignatureData}
              preparedByPositionName={preparedByPositionName} // ✅
              setPreparedByPositionName={setPreparedByPositionName} // ✅
                preparedByUserType={preparedByUserType}
  setPreparedByUserType={setPreparedByUserType} 
            />
          )}


          <div className="flex justify-between items-center pt-4 border-t">

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
                  className="bg-blue-800 hover:bg-blue-700 text-white text-sm px-4 py-1 rounded"
                >
                  Next
                </button>
              ) : (
               <button
  type="submit"
  ref={submitBtnRef}
  onClick={() => setSubmitClicked(true)}
  className={`text-white text-sm px-4 py-1 rounded ${
    mode === 'edit' ? 'bg-blue-800 hover:bg-blue-700' : 'bg-blue-800 hover:bg-blue-700'
  }`}
>
  {mode === 'edit' ? 'Resubmit Travel Order' : 'Submit Travel Order'}
</button>

              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}