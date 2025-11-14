import React from 'react';

const WorkflowProgress = ({ report }) => {
  if (!report) return null;

  // Build complete approval history from both approvalHistory array and legacy approval fields
  // Helper function to display stage names
  const getDisplayStageName = (stage) => {
    return stage === 'School Chair' ? 'School Chairperson' : stage;
  };

  const buildCompleteHistory = () => {
    const history = [];
    const seenEntries = new Set(); // Track unique entries by stage+date to avoid duplicates
    
    // Add entries from approvalHistory array (new unified approach)
    if (report.approvalHistory && report.approvalHistory.length > 0) {
      report.approvalHistory.forEach(entry => {
        const key = `${entry.stage}-${entry.date}`;
        if (!seenEntries.has(key)) {
          history.push({
            stage: entry.stage,
            approved: entry.approved,
            date: entry.date,
            remarks: entry.remarks,
            action: entry.action,
            approvedBy: entry.approvedBy,
            approvedById: entry.approvedById
          });
          seenEntries.add(key);
        }
      });
    }
    
    // ALWAYS check legacy fields for any entries not in approvalHistory
    // This ensures we catch approvals that happened but weren't added to approvalHistory
    const legacyStages = [
      { name: 'Faculty', approval: report.facultyApproval, approver: report.facultyName },
      { name: 'School Chair', approval: report.schoolChairApproval, approver: report.schoolChairName },
      { name: 'Dean SRIC', approval: report.deanSRICApproval, approver: report.deanSRICName },
      { name: 'Director', approval: report.directorApproval, approver: report.directorName },
      { name: 'Audit', approval: report.auditApproval, approver: report.auditName },
      { name: 'Finance', approval: report.financeApproval, approver: report.financeName }
    ];
    
    legacyStages.forEach(legacy => {
      if (legacy.approval && legacy.approval.date) {
        const key = `${legacy.name}-${legacy.approval.date}`;
        if (!seenEntries.has(key)) {
          history.push({
            stage: legacy.name,
            approved: legacy.approval.approved,
            date: legacy.approval.date,
            remarks: legacy.approval.remarks,
            action: legacy.approval.action,
            approvedBy: legacy.approval.approvedBy || legacy.approver,
            approvedById: legacy.approval.approvedById
          });
          seenEntries.add(key);
        }
      }
    });
    
    // Sort by date to ensure chronological order
    history.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return history;
  };

  // Determine what stage should be shown as "pending" based on current status
  const getPendingStage = () => {
    // If status is Draft and there's a send-back in history, pending is first stage
    if (report.status === 'Draft' && report.approvalHistory && 
        report.approvalHistory.some(h => h.action === 'sendback')) {
      // Report was sent back, now pending at first stage
      if (report.submitterRole === 'Student') {
        return 'Faculty';
      } else {
        return 'School Chair';
      }
    }
    
    // Otherwise determine from status
    switch (report.status) {
      case 'Submitted':
        return report.submitterRole === 'Student' ? 'Faculty' : 'School Chair';
      case 'Faculty Approved':
        return 'School Chair';
      case 'School Chair Approved':
        if (report.fundType === 'Project Fund') return 'Dean SRIC';
        if (report.fundType === 'Institute Fund') return 'Director';
        return 'Audit';
      case 'Dean SRIC Approved':
      case 'Director Approved':
        return 'Audit';
      case 'Audit Approved':
        return 'Finance';
      default:
        return null;
    }
  };

  const getEntryColor = (entry) => {
    if (entry.action === 'sendback') {
      return { bg: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800' };
    } else if (entry.approved === true) {
      return { bg: 'bg-green-500', badge: 'bg-green-100 text-green-800' };
    } else if (entry.approved === false) {
      return { bg: 'bg-red-500', badge: 'bg-red-100 text-red-800' };
    }
    return { bg: 'bg-gray-300', badge: 'bg-gray-100 text-gray-600' };
  };

  const getEntryLabel = (entry) => {
    if (entry.action === 'sendback') {
      return 'Sent Back';
    } else if (entry.approved === true) {
      return 'Approved';
    } else if (entry.approved === false) {
      return 'Rejected';
    }
    return 'Processed';
  };

  const history = buildCompleteHistory();
  const pendingStage = getPendingStage();

  // Add pending stage to display if report is not in final state
  const displayEntries = [...history];
  
  // Only add pending stage if:
  // 1. There is a pending stage AND
  // 2. Report is not in final state AND
  // 3. The last entry in history is not already for this pending stage (to avoid showing it twice)
  // 4. If status is Draft after sendback, do NOT show pending stage (wait for resubmission)
  if (
    pendingStage &&
    !['Finance Approved', 'Rejected', 'Completed'].includes(report.status)
  ) {
    const lastEntry = displayEntries[displayEntries.length - 1];
    let shouldAddPending = !lastEntry || lastEntry.stage !== pendingStage || lastEntry.action === 'sendback';

    // If status is Draft and last action was sendback, do NOT show the next pending stage
    // This applies to both Student reports (Faculty pending) and Faculty reports (School Chair pending)
    if (
      report.status === 'Draft' &&
      report.approvalHistory &&
      report.approvalHistory.some(h => h.action === 'sendback')
    ) {
      shouldAddPending = false;
    }

    if (shouldAddPending) {
      displayEntries.push({
        stage: pendingStage,
        isPending: true
      });
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Approval Workflow</h3>
      
      {/* Fund Type Badge */}
      {report.fundType && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {report.fundType}
          </span>
        </div>
      )}

      {/* Approval History */}
      <div className="space-y-4">
        {displayEntries.map((entry, index) => {
          const colors = entry.isPending 
            ? { bg: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800' }
            : getEntryColor(entry);
          const isLastEntry = index === displayEntries.length - 1;

          return (
            <div key={`${entry.stage}-${index}`}>
              <div className="flex items-start gap-4">
                {/* Sequential Number Circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${colors.bg}`}>
                  {index + 1}
                </div>

                {/* Entry Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {getDisplayStageName(entry.stage)}
                      {entry.isPending && (
                        <span className="ml-2 text-xs text-gray-500">
                          (To be reviewed)
                        </span>
                      )}
                    </h4>
                    <span className={`px-3 py-1 rounded text-xs font-medium ${colors.badge}`}>
                      {entry.isPending ? 'Pending' : getEntryLabel(entry)}
                    </span>
                  </div>

                  {/* Approval Details - only show for non-pending entries */}
                  {!entry.isPending && entry.date && (
                    <div className="mt-2 text-sm bg-gray-50 p-3 rounded">
                      {entry.approvedBy && (
                        <p className="text-gray-700 mb-1">
                          <span className="font-medium">By:</span> {entry.approvedBy}
                        </p>
                      )}
                      {entry.date && (
                        <p className="text-gray-600 mb-1">
                          <span className="font-medium">Date:</span>{' '}
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                      {entry.remarks && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-gray-700">
                            <span className="font-medium">Remarks:</span>
                          </p>
                          <p className="text-gray-600 italic mt-1">
                            "{entry.remarks}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLastEntry && (
                <div className="ml-5 w-0.5 h-6 bg-gray-300"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Status */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Status</p>
            <p className="text-lg font-semibold text-gray-900">{report.status}</p>
          </div>
          {report.status === 'Finance Approved' && (
            <div className="flex items-center text-green-600">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Fully Approved</span>
            </div>
          )}
          {report.status === 'Rejected' && (
            <div className="flex items-center text-red-600">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Rejected</span>
            </div>
          )}
          {report.status === 'Draft' && history.some(h => h.action === 'sendback') && (
            <div className="flex items-center text-yellow-600">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Sent Back - Needs Revision</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgress;
