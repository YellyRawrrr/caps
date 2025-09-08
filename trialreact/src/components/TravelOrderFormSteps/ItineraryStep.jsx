export default function ItineraryStep({
  itineraryList,
  handleItineraryChange,
  addItinerary,
  removeItinerary,
  transportationList
}) {
  return (
    <div>
      {itineraryList.map((entry, index) => (
        <div key={index} className="mb-4 border p-4 rounded">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-sm">Itinerary #{index + 1}</h4>
            {itineraryList.length > 1 && (
              <button
                onClick={() => removeItinerary(index)}
                type="button"
                className="text-red-500 text-sm hover:bg-red-50 px-2 py-1 rounded"
              >
                Remove
              </button>
            )}
          </div>
          
          {/* All fields in a single horizontal line */}
          <div className="grid grid-cols-8 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date<span className="text-red-500 ml-1">*</span></label>
              <input
                type="date"
                name="itinerary_date"
                value={entry.itinerary_date}
                onChange={(e) => handleItineraryChange(index, e)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departure<span className="text-red-500 ml-1">*</span></label>
              <input
                type="time"
                name="departure_time"
                value={entry.departure_time}
                onChange={(e) => handleItineraryChange(index, e)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Arrival<span className="text-red-500 ml-1">*</span></label>
              <input
                type="time"
                name="arrival_time"
                value={entry.arrival_time}
                onChange={(e) => handleItineraryChange(index, e)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transport<span className="text-red-500 ml-1">*</span></label>
              <select
                name="transportation"
                value={entry.transportation || ''}
                onChange={(e) => handleItineraryChange(index, e)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                required
              >
                <option value="">-- Select --</option>
                {transportationList.map((transportation) => (
                  <option key={transportation.id} value={transportation.id}>
                    {transportation.means_of_transportation}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allowance<span className="text-red-500 ml-1">*</span></label>
              <input
                type="number"
                name="transportation_allowance"
                value={entry.transportation_allowance}
                onChange={(e) => handleItineraryChange(index, e)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Per Diem<span className="text-red-500 ml-1">*</span></label>
              <input
                type="number"
                name="per_diem"
                value={entry.per_diem}
                onChange={(e) => handleItineraryChange(index, e)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Other</label>
              <input
                type="number"
                name="other_expense"
                value={entry.other_expense}
                onChange={(e) => handleItineraryChange(index, e)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total<span className="text-red-500 ml-1">*</span></label>
              <input
                type="number"
                name="total_amount"
                value={entry.total_amount}
                readOnly
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-100"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>
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
  );
}