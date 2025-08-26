export default function EmployeeStep({
  formData,
  handleChange,
  fundList,
  selectedEmployees,
  employeeList,
  employeeSearch,
  showDropdown,
  inputRefs,
  handleEmployeeChange,
  handleAddEmployee,
  handleRemoveEmployee,
  filteredEmployeeOptions,
  availableOptions,
  currentUserId,
  setEmployeeSearch,
  setShowDropdown,
  minDateFrom,
  minDateTo,
  employeePositions
}) {
  return (
    <>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Date of Filing<span className="text-red-500 ml-1">*</span>
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
          Fund Cluster<span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex gap-2">
  {["01_RF", "07_TF"].map((cluster) => (
    <label key={cluster} className="w-full">
      <input
        type="radio"
        name="fund_cluster"
        value={cluster}
        checked={formData.fund_cluster === cluster}
        onChange={handleChange}
        className="hidden peer"
      />
      <div className="w-full text-center px-4 py-3 border rounded-md cursor-pointer bg-gray-50
        peer-checked:bg-blue-800 peer-checked:text-white peer-checked:border-blue-800
        transition duration-200"
      >
        {cluster}
      </div>
    </label>
  ))}
</div>

      </div>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        Employee(s)<span className="text-red-500 ml-1">*</span>
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
          {selectedEmployees.length > 1 && index !== 0 && (
            <button
              type="button"
              onClick={() => handleRemoveEmployee(index)}
              className="text-red-500 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-red-100 transition"
              title="Remove employee"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Remove</span>
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
          Number of employee(s)<span className="text-red-500 ml-1">*</span>
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
          Purpose<span className="text-red-500 ml-1">*</span>
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
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Specific Role<span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          name="specific_role"
          value={formData.specific_role}
          onChange={handleChange}
          rows="3"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">Fund Source<span className="text-red-500 ml-1">*</span></label>
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
  );
}