import { useState } from 'react';
import { getCountryByCode, convertCurrency, formatCurrency } from '../../utils/countryStateData';
import { generateExpenseReportPDF } from '../../utils/pdfGenerator';
import { getImageUrl } from '../../config/api';
import { HiOutlinePrinter } from 'react-icons/hi2';

const ExpenseReportModal = ({ request, isOpen, onClose }) => {
  if (!isOpen || !request) return null;

  const submitter = request.studentId || request.facultySubmitterId;
  const submitterRole = request.studentId ? 'Student' : 'Faculty';

  const formatCurrencyAmount = (amount) => {
    const country = getCountryByCode(request.country || 'IN');
    if (country) {
      return `${country.symbol}${amount.toFixed(2)}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const getINREquivalent = (amount) => {
    if (request.country && request.country !== 'IN') {
      const inrAmount = convertCurrency(amount, request.country, 'IN');
      return ` (≈ ₹${inrAmount.toFixed(2)} INR)`;
    }
    return '';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrintReport = async () => {
    try {
      await generateExpenseReportPDF(request);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Check if report is in a final state
  const isReportFinal = request.status === 'Finance Approved' || 
                       request.status === 'Completed' || 
                       request.status === 'Rejected';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Expense Reimbursement Report</h1>
              <p className="text-blue-100 mt-1">Report ID: {request._id}</p>
            </div>
            <div className="flex items-center gap-3">
              {isReportFinal && (
                <button
                  onClick={handlePrintReport}
                  className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-white font-medium rounded-lg hover:bg-opacity-30 transition-colors"
                  title="Download PDF Report"
                >
                  <HiOutlinePrinter className="w-5 h-5" />
                  Print
                </button>
              )}
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-8 space-y-8">
          {/* Employee Information */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Employee Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <p className="text-lg text-gray-900">{submitter?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg text-gray-900">{submitter?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Role</label>
                <p className="text-lg text-gray-900">{submitterRole}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Submission Date</label>
                <p className="text-lg text-gray-900">{formatDate(request.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Expense Details */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Expense Details</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Expense Title</label>
                  <p className="text-xl font-semibold text-gray-900">{request.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Amount Claimed</label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrencyAmount(request.amount)}
                    {getINREquivalent(request.amount) && (
                      <span className="text-sm text-gray-600 block">{getINREquivalent(request.amount)}</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Expense Category</label>
                  <p className="text-lg text-gray-900">{request.expenseType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Expense Date</label>
                  <p className="text-lg text-gray-900">{formatDate(request.expenseDate)}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                <p className="text-gray-900 bg-white p-4 rounded border">{request.description}</p>
              </div>
            </div>
          </div>

          {/* Category-Specific Details */}
          {request.expenseType === 'Travel' && (request.originCity || request.destinationCity) && (
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Travel Details</h2>
              <div className="grid grid-cols-2 gap-6">
                {request.originCity && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Origin</label>
                    <p className="text-lg text-gray-900">{request.originCity}</p>
                  </div>
                )}
                {request.destinationCity && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Destination</label>
                    <p className="text-lg text-gray-900">{request.destinationCity}</p>
                  </div>
                )}
                {request.travelMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Mode of Transport</label>
                    <p className="text-lg text-gray-900">{request.travelMode}</p>
                  </div>
                )}
                {request.distance && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Distance</label>
                    <p className="text-lg text-gray-900">{request.distance} km</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {request.expenseType === 'Meal' && (request.restaurantName || request.mealType) && (
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Meal Details</h2>
              <div className="grid grid-cols-2 gap-6">
                {request.restaurantName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Restaurant</label>
                    <p className="text-lg text-gray-900">{request.restaurantName}</p>
                  </div>
                )}
                {request.mealType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Meal Type</label>
                    <p className="text-lg text-gray-900">{request.mealType}</p>
                  </div>
                )}
                {request.attendees && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Attendees</label>
                    <p className="text-lg text-gray-900">{request.attendees}</p>
                  </div>
                )}
                {request.perPersonCost && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Per Person Cost</label>
                    <p className="text-lg text-gray-900">{formatCurrencyAmount(request.perPersonCost)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {request.expenseType === 'Accommodation' && (request.hotelName || request.accommodationCity) && (
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Accommodation Details</h2>
              <div className="grid grid-cols-2 gap-6">
                {request.hotelName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Hotel Name</label>
                    <p className="text-lg text-gray-900">{request.hotelName}</p>
                  </div>
                )}
                {request.accommodationCity && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Location</label>
                    <p className="text-lg text-gray-900">{request.accommodationCity}</p>
                  </div>
                )}
                {request.checkinDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Check-in Date</label>
                    <p className="text-lg text-gray-900">{formatDate(request.checkinDate)}</p>
                  </div>
                )}
                {request.checkoutDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Check-out Date</label>
                    <p className="text-lg text-gray-900">{formatDate(request.checkoutDate)}</p>
                  </div>
                )}
                {request.nightsStayed && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Nights Stayed</label>
                    <p className="text-lg text-gray-900">{request.nightsStayed}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {request.expenseType === 'Office Supplies' && (request.itemName || request.vendorName) && (
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Office Supplies Details</h2>
              <div className="grid grid-cols-2 gap-6">
                {request.itemName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Item Name</label>
                    <p className="text-lg text-gray-900">{request.itemName}</p>
                  </div>
                )}
                {request.quantity && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Quantity</label>
                    <p className="text-lg text-gray-900">{request.quantity}</p>
                  </div>
                )}
                {request.vendorName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Vendor</label>
                    <p className="text-lg text-gray-900">{request.vendorName}</p>
                  </div>
                )}
                {request.invoiceNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Invoice Number</label>
                    <p className="text-lg text-gray-900">{request.invoiceNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Supporting Documents */}
          {request.images && request.images.length > 0 && (
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Supporting Documents</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {request.images.map((image, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <img
                      src={getImageUrl(image)}
                      alt={`Receipt ${index + 1}`}
                      className="w-full h-32 object-cover cursor-pointer hover:opacity-75"
                      onClick={() => window.open(getImageUrl(image), '_blank')}
                    />
                    <div className="p-2 bg-gray-50">
                      <p className="text-sm text-gray-600">Receipt {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approval Status */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Approval Status</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium">Current Status:</span>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  request.status.includes('Approved') ? 'bg-blue-100 text-blue-800' :
                  request.status.includes('Sent Back') ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {request.status}
                </span>
              </div>
              
              {(request.auditRemarks || request.financeRemarks) && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700">Reviewer Comments:</h3>
                  {request.auditRemarks && (
                    <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                      <p className="text-sm font-medium text-purple-700">Audit Review:</p>
                      <p className="text-gray-900">{request.auditRemarks}</p>
                    </div>
                  )}
                  {request.financeRemarks && (
                    <div className="bg-white p-3 rounded border-l-4 border-green-500">
                      <p className="text-sm font-medium text-green-700">Finance Review:</p>
                      <p className="text-gray-900">{request.financeRemarks}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Total Amount Claimed</label>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrencyAmount(request.amount)}
                  {getINREquivalent(request.amount) && (
                    <span className="text-sm text-gray-600 block">{getINREquivalent(request.amount)}</span>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Report Generated</label>
                <p className="text-lg text-gray-900">{formatDate(new Date())}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 rounded-b-lg border-t">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              This is an automated expense report generated by the ExpenseClaim System
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseReportModal;