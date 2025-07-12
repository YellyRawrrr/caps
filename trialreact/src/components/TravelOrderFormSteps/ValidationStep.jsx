import SignatureCanvas from 'react-signature-canvas';
import { useEffect, useState } from 'react';

// Approval chain map
const approvalMap = {
  urdaneta_csc: ['urdaneta_csc', 'pangasinan_po', 'tmsd', 'afsd', 'regional'],
  sison_csc: ['sison_csc', 'pangasinan_po', 'tmsd', 'afsd', 'regional'],
  pugo_csc: ['pugo_csc', 'launion_po', 'tmsd', 'afsd', 'regional'],
  sudipen_csc: ['sudipen_csc', 'launion_po', 'tmsd', 'afsd', 'regional'],
  tagudin_csc: ['tagudin_csc', 'ilocossur_po', 'tmsd', 'afsd', 'regional'],
  banayoyo_csc: ['banayoyo_csc', 'ilocossur_po', 'tmsd', 'afsd', 'regional'],
  dingras_csc: ['dingras_csc', 'ilocosnorte_po', 'tmsd', 'afsd', 'regional'],
  pangasinan_po: ['pangasinan_po', 'tmsd', 'afsd', 'regional'],
  ilocossur_po: ['ilocossur_po', 'tmsd', 'afsd', 'regional'],
  ilocosnorte_po: ['ilocosnorte_po', 'tmsd', 'afsd', 'regional'],
  launion_po: ['launion_po', 'tmsd', 'afsd', 'regional'],
  tmsd: ['tmsd', 'afsd', 'regional'],
  afsd: ['afsd', 'regional'],

};

export default function ValidationStep({
  formData,
  preparedByInputRef,
  employeeList,
  preparedBySearch,
  setPreparedBySearch,
  showPreparedByDropdown,
  setShowPreparedByDropdown,
  filteredEmployeeOptions,
  setFormData,
  signatureData,
  sigPadRef,
  setSignatureData,
  preparedByPositionName,
  setPreparedByPositionName,
  preparedByUserType,
  setPreparedByUserType
}) {
  const [approversByLevel, setApproversByLevel] = useState({});

  useEffect(() => {
    if (sigPadRef.current && signatureData) {
      sigPadRef.current.fromDataURL(signatureData);
    }
  }, [signatureData, sigPadRef]);

  const handleClear = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      setSignatureData(null);
    }
  };

  useEffect(() => {
    const found = employeeList.find(e => e.id?.toString() === formData.prepared_by);
    if (found) {
      const position = found.employee_position_name || found.position || '';
      const typeOfUser = found.type_of_user_display || found.type_of_user || '';

      setPreparedByPositionName(position);
      setPreparedByUserType(typeOfUser);

      setFormData(prev => ({
        ...prev,
        prepared_by_position_name: position,
        prepared_by_user_type: typeOfUser,
      }));

      const chain = approvalMap[found.employee_type] || [];
      const approvers = {};

      chain.forEach(level => {
        approvers[level] = employeeList.filter(emp =>
          emp.user_level === 'head' && emp.employee_type === level
        );
      });

      setApproversByLevel(approvers);
    } else {
      setPreparedByPositionName('');
      setPreparedByUserType('');
      setApproversByLevel({});
    }
  }, [formData.prepared_by, employeeList]);

  return (
    <>
      {/* Prepared By Field */}
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
            setFormData(prev => ({ ...prev, prepared_by: '' }));
            setPreparedByPositionName('');
            setPreparedByUserType('');
            setApproversByLevel({});
          }}
          onFocus={() => setShowPreparedByDropdown(true)}
          onBlur={() => setTimeout(() => setShowPreparedByDropdown(false), 150)}
          onKeyDown={e => {
            if (e.key === 'Enter') e.preventDefault();
          }}
          placeholder="-- Select Employee --"
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />

        {showPreparedByDropdown &&
          filteredEmployeeOptions(0, [preparedBySearch], employeeList).length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded shadow w-full mt-1 max-h-40 overflow-y-auto">
              {filteredEmployeeOptions(0, [preparedBySearch], employeeList).map(opt => (
                <li
                  key={opt.id}
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                  onMouseDown={() => {
                    setFormData(prev => ({ ...prev, prepared_by: opt.id.toString() }));
                    setPreparedBySearch(`${opt.first_name} ${opt.last_name}`);
                    setPreparedByPositionName(opt.employee_position_name || opt.position || '');
                    setPreparedByUserType(opt.type_of_user_display || opt.type_of_user || '');
                    setShowPreparedByDropdown(false);
                  }}
                >
                  {opt.first_name} {opt.last_name}
                </li>
              ))}
            </ul>
          )}
      </div>

      {/* Position Field */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">Employee Position</label>
        <input
          type="text"
          value={preparedByPositionName}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
        />
      </div>

      {/* Type of User Field */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">Type of User</label>
        <input
          type="text"
          value={preparedByUserType}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
        />
      </div>

      {/* One dropdown per head level */}
      {Object.entries(approversByLevel).map(([level, approvers]) => (
  <div className="mb-4" key={level}>
    <label className="block mb-1 text-sm font-medium text-gray-700">
      {level === 'regional'
        ? 'regional director'
        : `${level.replace(/_/g, ' ').toUpperCase()} Head`}
    </label>
    <select className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50" disabled>
      {approvers.length === 0 ? (
        <option>No available head</option>
      ) : (
        approvers.map(a => (
          <option key={a.id}>
            {a.first_name} {a.last_name}  {a.employee_position_name || a.position}
          </option>
        ))
      )}
    </select>
  </div>
))}


      {/* Signature Pad */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">Signature</label>
        <div className="border border-gray-300 rounded bg-gray-50 overflow-x-auto">
          <SignatureCanvas
            ref={sigPadRef}
            penColor="black"
            canvasProps={{
              width: 500,
              height: 150,
              className: 'block rounded'
            }}
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={handleClear}
            className="bg-gray-300 px-3 py-1 rounded text-sm"
          >
            Clear
          </button>
        </div>
      </div>
    </>
  );
}
