import React from 'react';

const WorkflowProgress = ({ report }) => {
  if (!report) return null;

  // Determine workflow stages based on fund type
  const getWorkflowStages = () => {
    const fundType = report.fundType;
    const stages = [
      {
        id: 1,
        name: 'Faculty Review',
        approval: report.facultyApproval,
        status: report.status,
        activeStatuses: ['Submitted'],
        approver: report.facultyName
      },
      {
        id: 2,
        name: 'School Chair Review',
        approval: report.schoolChairApproval,
        status: report.status,
        activeStatuses: ['Faculty Approved'],
        approver: report.schoolChairName
      }
    ];

    // Add conditional middle stages based on fund type
    if (fundType === 'Project Fund') {
      stages.push({
        id: 3,
        name: 'Dean SRIC Review',
        approval: report.deanSRICApproval,
        status: report.status,
        activeStatuses: ['School Chair Approved'],
        approver: report.deanSRICName,
        fundTypeSpecific: 'Project Fund'
      });
    } else if (fundType === 'Institute Fund') {
      stages.push({
        id: 3,
        name: 'Director Review',
        approval: report.directorApproval,
        status: report.status,
        activeStatuses: ['School Chair Approved'],
        approver: report.directorName,
        fundTypeSpecific: 'Institute Fund'
      });
    }

    // Add Audit and Finance (common to all)
    stages.push({
      id: stages.length + 1,
      name: 'Audit Review',
      approval: report.auditApproval,
      status: report.status,
      activeStatuses: 
        fundType === 'Project Fund' ? ['Dean SRIC Approved'] :
        fundType === 'Institute Fund' ? ['Director Approved'] :
        ['School Chair Approved'],
      approver: report.auditName
    });

    stages.push({
      id: stages.length + 1,
      name: 'Finance Review',
      approval: report.financeApproval,
      status: report.status,
      activeStatuses: ['Audit Approved'],
      approver: report.financeName
    });

    return stages;
  };

  const getStageState = (stage) => {
    // Check if this stage sent back the report (takes priority)
    if (stage.approval?.action === 'sendback') {
      return { state: 'sentback', color: 'bg-yellow-500', badgeColor: 'bg-yellow-100 text-yellow-800' };
    }
    
    // Check if approved
    if (stage.approval?.approved === true) {
      return { state: 'approved', color: 'bg-green-500', badgeColor: 'bg-green-100 text-green-800' };
    }
    
    // Check if rejected
    if (stage.approval?.approved === false) {
      return { state: 'rejected', color: 'bg-red-500', badgeColor: 'bg-red-100 text-red-800' };
    }
    
    // Special case: If report status is Draft and we're past Faculty stage, 
    // but no sendback at this stage, it was sent back from a later stage
    if (report.status === 'Draft' && stage.approval) {
      // This stage was completed before sendback from another stage
      if (stage.approval.approved === undefined && !stage.approval.action) {
        return { state: 'notstarted', color: 'bg-gray-300', badgeColor: 'bg-gray-100 text-gray-600' };
      }
    }
    
    // Check if currently pending (active)
    if (stage.activeStatuses.includes(report.status)) {
      return { state: 'pending', color: 'bg-blue-500', badgeColor: 'bg-blue-100 text-blue-800' };
    }
    
    // Not started yet
    return { state: 'notstarted', color: 'bg-gray-300', badgeColor: 'bg-gray-100 text-gray-600' };
  };

  const getStageLabel = (stage) => {
    const stageState = getStageState(stage);
    
    switch (stageState.state) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'sentback':
        return 'Sent Back';
      case 'pending':
        return 'Pending';
      default:
        return 'Not Started';
    }
  };

  const stages = getWorkflowStages();

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

      {/* Workflow Stages */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const stageState = getStageState(stage);
          const isLastStage = index === stages.length - 1;

          return (
            <div key={stage.id}>
              <div className="flex items-start gap-4">
                {/* Stage Number Circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${stageState.color}`}>
                  {stage.id}
                </div>

                {/* Stage Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {stage.name}
                      {stage.fundTypeSpecific && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({stage.fundTypeSpecific} only)
                        </span>
                      )}
                    </h4>
                    <span className={`px-3 py-1 rounded text-xs font-medium ${stageState.badgeColor}`}>
                      {getStageLabel(stage)}
                    </span>
                  </div>

                  {/* Approval Details */}
                  {stage.approval && (
                    <div className="mt-2 text-sm bg-gray-50 p-3 rounded">
                      {stage.approver && (
                        <p className="text-gray-700 mb-1">
                          <span className="font-medium">By:</span> {stage.approver}
                        </p>
                      )}
                      {stage.approval.date && (
                        <p className="text-gray-600 mb-1">
                          <span className="font-medium">Date:</span>{' '}
                          {new Date(stage.approval.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                      {stage.approval.remarks && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-gray-700">
                            <span className="font-medium">Remarks:</span>
                          </p>
                          <p className="text-gray-600 italic mt-1">
                            "{stage.approval.remarks}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLastStage && (
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
          {report.status === 'Draft' && (report.facultyApproval || report.schoolChairApproval || report.deanSRICApproval || report.directorApproval || report.auditApproval || report.financeApproval) && (
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
