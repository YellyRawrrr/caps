export default function IdentificationStep({ formData, handleChange }) {
  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        Mode of Filing
      </label>
      <div className="flex gap-4">
        {["IMMEDIATE", "NOT_IMMEDIATE"].map((mode) => (
          <label key={mode} className="flex items-center text-sm text-gray-700">
            <input
              type="radio"
              name="mode_of_filing"
              value={mode}
              checked={formData.mode_of_filing === mode}
              onChange={handleChange}
              className="mr-2"
            />
            {mode.replace("_", " ")}
          </label>
        ))}
      </div>
    </div>
  );
}
