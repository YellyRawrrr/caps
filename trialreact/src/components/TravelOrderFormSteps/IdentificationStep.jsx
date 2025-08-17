export default function IdentificationStep({ formData, handleChange }) {
  const options = [
    { value: 'NOT_IMMEDIATE', label: 'Not Immediate' },
    { value: 'IMMEDIATE', label: 'Immediate' },
  ];

  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Mode of Filing<span className="text-red-500 ml-1">*</span>
      </label>
      <div className="flex gap-2">
        {options.map((option) => (
          <label key={option.value} className="w-full">
            <input
              type="radio"
              name="mode_of_filing"
              value={option.value}
              checked={formData.mode_of_filing === option.value}
              onChange={handleChange}
              className="hidden peer"
            />
            <div className="w-full text-center px-4 py-3 border rounded-md cursor-pointer bg-gray-50
              peer-checked:bg-blue-800 peer-checked:text-white peer-checked:border-blue-800
              transition duration-200"
            >
              {option.label}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
