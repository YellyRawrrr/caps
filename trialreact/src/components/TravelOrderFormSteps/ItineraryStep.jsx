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
          <h4 className="font-medium text-sm mb-2">Itinerary #{index + 1}</h4>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Date<span className="text-red-500 ml-1">*</span></label>
            <input
              type="date"
              name="itinerary_date"
              value={entry.itinerary_date}
              onChange={(e) => handleItineraryChange(index, e)}
              className="w-full px-2 py-1 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Departure Time<span className="text-red-500 ml-1">*</span></label>
            <input
              type="time"
              name="departure_time"
              value={entry.departure_time}
              onChange={(e) => handleItineraryChange(index, e)}
              className="w-full px-2 py-1 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Arrival Time<span className="text-red-500 ml-1">*</span></label>
            <input
              type="time"
              name="arrival_time"
              value={entry.arrival_time}
              onChange={(e) => handleItineraryChange(index, e)}
              className="w-full px-2 py-1 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Means of Transportation<span className="text-red-500 ml-1">*</span></label>
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
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Transportation Allowance<span className="text-red-500 ml-1">*</span></label>
            <input
              type="number"
              name="transportation_allowance"
              value={entry.transportation_allowance}
              onChange={(e) => handleItineraryChange(index, e)}
              className="w-full px-2 py-1 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Per Diem<span className="text-red-500 ml-1">*</span></label>
            <input
              type="number"
              name="per_diem"
              value={entry.per_diem}
              onChange={(e) => handleItineraryChange(index, e)}
              className="w-full px-2 py-1 border border-gray-300 rounded"
            />
          </div>
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
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Total Amount<span className="text-red-500 ml-1">*</span></label>
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
  );
}