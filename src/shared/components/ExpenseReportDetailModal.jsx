import { useState, useEffect } from 'react';
import API from '../services/axios';

const ExpenseReportDetailModal = ({ reportId, isOpen, onClose }) => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && reportId) {
      fetchReportDetails();
    }
  }, [isOpen, reportId]);

  const fetchReportDetails = async () => {
    setIsLoading(true);
    try {
      const { data } = await API.get(`/expense-reports/${reportId}`);
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch report details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Expense Report Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Submitter Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Submitter Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Name:</span> {report.submitterId?.name || report.facultyName || report.studentName}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {report.submitterRole}
                  </div>
                  <div>
                    <span className="font-medium">Department:</span> {report.department}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {report.submitterId?.email}
                  </div>
                </div>
                {report.submitterRole === 'Student' && report.facultyId && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Faculty Supervisor</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Name:</span> {report.facultyId.name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {report.facultyId.email}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Report Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Report Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Report Type:</span> {report.reportType}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      report.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                      report.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                      report.status === 'Faculty Approved' ? 'bg-green-100 text-green-800' :
                      report.status === 'Audit Approved' ? 'bg-green-100 text-green-800' :
                      report.status === 'Finance Approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Period:</span> {new Date(report.expensePeriodStart).toLocaleDateString()} - {new Date(report.expensePeriodEnd).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Total Amount:</span> ₹{report.totalAmount?.toFixed(2) || '0.00'}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Purpose:</span> {report.purposeOfExpense}
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Financial Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Funding Source:</span> {report.fundingSource}
                  </div>
                  <div>
                    <span className="font-medium">Cost Center:</span> {report.costCenter}
                  </div>
                  {report.programProjectCode && (
                    <div>
                      <span className="font-medium">Project Code:</span> {report.programProjectCode}
                    </div>
                  )}
                </div>
              </div>

              {/* Expense Items */}
              {report.items && report.items.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Expense Items ({report.items.length})</h3>
                  <div className="space-y-3">
                    {report.items.map((item, index) => (
                      <div key={index} className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{item.category}</h4>
                            <p className="text-gray-600">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">₹{item.amountInINR?.toFixed(2)}</div>
                            {item.currency !== 'INR' && (
                              <div className="text-sm text-gray-500">
                                {item.currency} {item.amount?.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div><span className="font-medium">Date:</span> {new Date(item.date).toLocaleDateString()}</div>
                          <div><span className="font-medium">Payment:</span> {item.paymentMethod}</div>
                          <div><span className="font-medium">Business Purpose:</span> {item.businessPurpose}</div>
                          {item.vendor && <div><span className="font-medium">Vendor:</span> {item.vendor}</div>}
                          {(item.fromCity || item.toCity) && (
                            <div className="col-span-2">
                              <span className="font-medium">Route:</span> 
                              {item.fromCity && `${item.fromCity}, ${item.fromState}`}
                              {item.fromCity && item.toCity && ' → '}
                              {item.toCity && `${item.toCity}, ${item.toState}`}
                            </div>
                          )}
                        </div>
                        {/* Receipt Image */}
                        {item.receiptImage && (
                          <div className="border-t pt-3">
                            <span className="font-medium text-sm">Receipt:</span>
                            <div className="mt-2">
                              <img 
                                src={item.receiptImage} 
                                alt="Receipt"
                                className="max-w-xs max-h-32 object-contain border rounded cursor-pointer"
                                onClick={() => window.open(item.receiptImage, '_blank')}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval History */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Approval History</h3>
                <div className="space-y-3">
                  {report.facultyApproval && (report.submitterRole !== 'Faculty' && report.submitterId?.role !== 'Faculty') && (
                    <div className="p-2 bg-white rounded">
                      <div className="flex justify-between items-center">
                        <span>Faculty Approval</span>
                        <span className={
                          report.facultyApproval.approved === true ? 'text-green-600' :
                          report.facultyApproval.action === 'sendback' ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {report.facultyApproval.approved === true ? 'Approved' :
                           report.facultyApproval.action === 'sendback' ? 'Sent Back' :
                           'Rejected'}
                          {report.facultyApproval.date && ` on ${new Date(report.facultyApproval.date).toLocaleDateString()}`}
                        </span>
                      </div>
                      {report.facultyApproval.remarks && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Remarks:</span> {report.facultyApproval.remarks}
                        </div>
                      )}
                      {report.facultyName && (
                        <div className="mt-1 text-xs text-gray-500">
                          By: {report.facultyName}
                        </div>
                      )}
                    </div>
                  )}
                  {report.auditApproval && (
                    <div className="p-2 bg-white rounded">
                      <div className="flex justify-between items-center">
                        <span>Audit Approval</span>
                        <span className={
                          report.auditApproval.approved === true ? 'text-green-600' :
                          report.auditApproval.action === 'sendback' ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {report.auditApproval.approved === true ? 'Approved' :
                           report.auditApproval.action === 'sendback' ? 'Sent Back' :
                           'Rejected'}
                          {report.auditApproval.date && ` on ${new Date(report.auditApproval.date).toLocaleDateString()}`}
                        </span>
                      </div>
                      {report.auditApproval.remarks && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Remarks:</span> {report.auditApproval.remarks}
                        </div>
                      )}
                    </div>
                  )}
                  {report.financeApproval && (
                    <div className="p-2 bg-white rounded">
                      <div className="flex justify-between items-center">
                        <span>Finance Approval</span>
                        <span className={
                          report.financeApproval.approved === true ? 'text-green-600' :
                          report.financeApproval.action === 'sendback' ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {report.financeApproval.approved === true ? 'Approved' :
                           report.financeApproval.action === 'sendback' ? 'Sent Back' :
                           'Rejected'}
                          {report.financeApproval.date && ` on ${new Date(report.financeApproval.date).toLocaleDateString()}`}
                        </span>
                      </div>
                      {report.financeApproval.remarks && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Remarks:</span> {report.financeApproval.remarks}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Failed to load report details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseReportDetailModal;