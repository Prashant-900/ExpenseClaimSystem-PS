const ExpenseItemViewModal = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Expense Item Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl">×</button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="text-gray-900">{new Date(item.date).toLocaleDateString()}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="text-gray-900 break-words">{item.category}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="text-gray-900">{item.description}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="text-gray-900 font-semibold">
                  ₹{(item.amountInINR || item.amount)?.toFixed(2) || '0.00'}
                  {item.currency !== 'INR' && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({item.currency} {item.amount})
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <div className="text-gray-900 break-words">{item.paymentMethod}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Purpose</label>
              <div className="text-gray-900">{item.businessPurpose || 'Not specified'}</div>
            </div>

            {/* Receipt Image */}
            {item.receiptImage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Image</label>
                <div className="border rounded p-2 max-w-md">
                  <img 
                    src={item.receiptImage} 
                    alt="Receipt"
                    className="w-full h-48 object-contain rounded cursor-pointer"
                    onClick={() => window.open(item.receiptImage, '_blank')}
                  />
                </div>
              </div>
            )}

            {/* Travel Route Information */}
            {(item.fromCity || item.toCity) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                <div className="text-gray-900">
                  {item.fromCity && `${item.fromCity}, ${item.fromState}`}
                  {item.fromCity && item.toCity && ' → '}
                  {item.toCity && `${item.toCity}, ${item.toState}`}
                </div>
              </div>
            )}

            {/* Category-specific details */}
            {item.category?.startsWith('Travel - Air') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item.airline && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Airline</label>
                    <div className="text-gray-900 break-words">{item.airline}</div>
                  </div>
                )}
                {item.flightNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
                    <div className="text-gray-900 break-words">{item.flightNumber}</div>
                  </div>
                )}
                {item.ticketClass && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Class</label>
                    <div className="text-gray-900 break-words">{item.ticketClass}</div>
                  </div>
                )}
              </div>
            )}

            {item.category?.startsWith('Accommodation') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item.hotelName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
                    <div className="text-gray-900 break-words">{item.hotelName}</div>
                  </div>
                )}
                {item.checkInDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                    <div className="text-gray-900">{new Date(item.checkInDate).toLocaleDateString()}</div>
                  </div>
                )}
                {item.checkOutDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                    <div className="text-gray-900">{new Date(item.checkOutDate).toLocaleDateString()}</div>
                  </div>
                )}
                {item.numberOfNights && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Nights</label>
                    <div className="text-gray-900">{item.numberOfNights}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItemViewModal;