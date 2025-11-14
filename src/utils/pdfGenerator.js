import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateExpenseReportPDF = async (report) => {
  try {
    // Create a temporary container for the PDF content
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '800px';
    tempContainer.style.padding = '40px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(tempContainer);

    // Generate the HTML content for the PDF
    tempContainer.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h1 style="color: #333; margin: 0; font-size: 28px;">IIT MANDI</h1>
          <h2 style="color: #666; margin: 10px 0; font-size: 20px;">EXPENSE CLAIM REPORT</h2>
          <p style="margin: 5px 0; color: #666;">Report ID: ${report.reportId || 'N/A'}</p>
          <p style="margin: 5px 0; color: #666;">Generated on: ${new Date().toLocaleDateString()}</p>
        </div>

        <!-- Status Badge -->
        <div style="text-align: center; margin-bottom: 30px;">
          <span style="
            display: inline-block;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 14px;
            ${report.status === 'Finance Approved' || report.status === 'Completed' ? 
              'background-color: #d1fae5; color: #065f46;' : 
              report.status === 'Rejected' ? 'background-color: #fee2e2; color: #991b1b;' : 
              'background-color: #fef3c7; color: #92400e;'}
          ">
            STATUS: ${report.status?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>

        <!-- Faculty & Report Information -->
        <div style="margin-bottom: 30px;">
          <h3 style="background-color: #f3f4f6; padding: 15px; margin: 0 0 20px 0; border-left: 4px solid #374151; font-size: 18px; color: #374151;">
            1. FACULTY & REPORT INFORMATION
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb; width: 30%;">Name:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${report.facultyName || report.studentName || report.submitterId?.name || 'N/A'}</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb; width: 30%;">Role:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${report.submitterRole || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb;">Department:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${report.department || 'N/A'}</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb;">Student ID:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${report.studentId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb;">Report Date:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${report.expenseReportDate ? new Date(report.expenseReportDate).toLocaleDateString() : 'N/A'}</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb;">Report Type:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${report.reportType || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb;">Period Start:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${report.expensePeriodStart ? new Date(report.expensePeriodStart).toLocaleDateString() : 'N/A'}</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb;">Period End:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${report.expensePeriodEnd ? new Date(report.expensePeriodEnd).toLocaleDateString() : 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb;">Purpose:</td>
              <td style="padding: 10px; border: 1px solid #ddd;" colspan="3">${report.purposeOfExpense || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <!-- Project/Funding Information -->
        <div style="margin-bottom: 30px;">
          <h3 style="background-color: #f3f4f6; padding: 15px; margin: 0 0 20px 0; border-left: 4px solid #374151; font-size: 18px; color: #374151;">
            2. PROJECT & FUNDING INFORMATION
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb; width: 30%;">Project Title:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${report.projectTitle || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb;">Funding Source:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${report.fundingSource || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb;">Sanctioned Amount:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">₹${report.sanctionedAmount ? parseFloat(report.sanctionedAmount).toFixed(2) : '0.00'}</td>
            </tr>
          </table>
        </div>

        <!-- Expense Items -->
        <div style="margin-bottom: 30px;">
          <h3 style="background-color: #f3f4f6; padding: 15px; margin: 0 0 20px 0; border-left: 4px solid #374151; font-size: 18px; color: #374151;">
            3. EXPENSE ITEMS
          </h3>
          ${report.items && report.items.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #374151; color: white;">
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Date</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Description</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Category</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${report.items.map((item, index) => `
                  <tr style="background-color: ${index % 2 === 0 ? '#f9fafb' : 'white'};">
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.description || 'N/A'}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.category || 'N/A'}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">₹${item.amount ? parseFloat(item.amount).toFixed(2) : '0.00'}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background-color: #374151; color: white; font-weight: bold;">
                  <td style="padding: 12px; border: 1px solid #ddd;" colspan="3">TOTAL AMOUNT:</td>
                  <td style="padding: 12px; border: 1px solid #ddd; text-align: right; font-size: 16px;">₹${report.totalAmount ? parseFloat(report.totalAmount).toFixed(2) : '0.00'}</td>
                </tr>
              </tfoot>
            </table>
          ` : `
            <p style="text-align: center; color: #666; font-style: italic; padding: 20px;">No expense items recorded</p>
          `}
        </div>

        <!-- Approval Status & History -->
        <div style="margin-bottom: 30px;">
          <h3 style="background-color: #f3f4f6; padding: 15px; margin: 0 0 20px 0; border-left: 4px solid #374151; font-size: 18px; color: #374151;">
            4. APPROVAL STATUS & HISTORY
          </h3>
          
          ${report.approvalHistory && report.approvalHistory.length > 0 ? `
            ${report.approvalHistory.map((approval, index) => `
              <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: ${
                approval.approved === true ? '#f0fdf4' : 
                approval.approved === false && approval.action === 'sendback' ? '#fef3c7' :
                approval.approved === false ? '#fef2f2' : '#f9fafb'
              };">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <strong>${index + 1}. ${approval.stage === 'School Chair' ? 'School Chairperson' : approval.stage} ${approval.action === 'sendback' ? 'Send-Back' : approval.approved ? 'Approval' : 'Rejection'}:</strong>
                  <span style="
                    padding: 5px 12px; 
                    border-radius: 15px; 
                    font-weight: bold; 
                    font-size: 12px;
                    ${approval.approved === true ? 'background-color: #16a34a; color: white;' : 
                      approval.action === 'sendback' ? 'background-color: #d97706; color: white;' :
                      'background-color: #dc2626; color: white;'}
                  ">
                    ${approval.approved === true ? 'APPROVED' : 
                      approval.action === 'sendback' ? 'SENT BACK' : 
                      'REJECTED'}
                  </span>
                </div>
                <p style="margin: 5px 0; color: #666; font-size: 14px;">Date: ${approval.date ? new Date(approval.date).toLocaleDateString() : 'N/A'}</p>
                ${approval.approvedBy ? `<p style="margin: 5px 0; color: #666; font-size: 12px;">By: ${approval.approvedBy}</p>` : ''}
                ${approval.remarks ? `<p style="margin: 10px 0; padding: 10px; background-color: rgba(0,0,0,0.05); border-radius: 5px; font-size: 14px;"><strong>Remarks:</strong> ${approval.remarks}</p>` : ''}
              </div>
            `).join('')}
          ` : `
            <!-- Fallback to legacy approval fields if approvalHistory is empty -->
            ${report.facultyApproval ? `
              <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: ${
                report.facultyApproval.approved === true ? '#f0fdf4' : 
                report.facultyApproval.approved === false ? '#fef2f2' : '#fefce8'
              };">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <strong>Faculty Approval:</strong>
                  <span style="
                    padding: 5px 12px; 
                    border-radius: 15px; 
                    font-weight: bold; 
                    font-size: 12px;
                    ${report.facultyApproval.approved === true ? 'background-color: #16a34a; color: white;' : 
                      report.facultyApproval.approved === false ? 'background-color: #dc2626; color: white;' : 
                      'background-color: #d97706; color: white;'}
                  ">
                    ${report.facultyApproval.approved === true ? 'APPROVED' : 
                      report.facultyApproval.action === 'sendback' ? 'SENT BACK' : 
                      'REJECTED'}
                  </span>
                </div>
                <p style="margin: 5px 0; color: #666; font-size: 14px;">Date: ${report.facultyApproval.date ? new Date(report.facultyApproval.date).toLocaleDateString() : 'N/A'}</p>
                ${report.facultyApproval.remarks ? `<p style="margin: 10px 0; padding: 10px; background-color: rgba(0,0,0,0.05); border-radius: 5px; font-size: 14px;"><strong>Remarks:</strong> ${report.facultyApproval.remarks}</p>` : ''}
                ${report.facultyName ? `<p style="margin: 5px 0; color: #666; font-size: 12px;">By: ${report.facultyName}</p>` : ''}
              </div>
            ` : ''}

            ${report.auditApproval ? `
              <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: ${
                report.auditApproval.approved === true ? '#f0fdf4' : 
                report.auditApproval.approved === false ? '#fef2f2' : '#fefce8'
              };">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <strong>Audit Approval:</strong>
                  <span style="
                    padding: 5px 12px; 
                    border-radius: 15px; 
                    font-weight: bold; 
                    font-size: 12px;
                    ${report.auditApproval.approved === true ? 'background-color: #16a34a; color: white;' : 
                      report.auditApproval.approved === false ? 'background-color: #dc2626; color: white;' : 
                      'background-color: #d97706; color: white;'}
                  ">
                    ${report.auditApproval.approved === true ? 'APPROVED' : 
                      report.auditApproval.action === 'sendback' ? 'SENT BACK' : 
                      'REJECTED'}
                  </span>
                </div>
                <p style="margin: 5px 0; color: #666; font-size: 14px;">Date: ${report.auditApproval.date ? new Date(report.auditApproval.date).toLocaleDateString() : 'N/A'}</p>
                ${report.auditApproval.remarks ? `<p style="margin: 10px 0; padding: 10px; background-color: rgba(0,0,0,0.05); border-radius: 5px; font-size: 14px;"><strong>Remarks:</strong> ${report.auditApproval.remarks}</p>` : ''}
              </div>
            ` : ''}

            ${report.financeApproval ? `
              <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: ${
                report.financeApproval.approved === true ? '#f0fdf4' : 
                report.financeApproval.approved === false ? '#fef2f2' : '#fefce8'
              };">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <strong>Finance Approval:</strong>
                  <span style="
                    padding: 5px 12px; 
                    border-radius: 15px; 
                    font-weight: bold; 
                    font-size: 12px;
                    ${report.financeApproval.approved === true ? 'background-color: #16a34a; color: white;' : 
                      report.financeApproval.approved === false ? 'background-color: #dc2626; color: white;' : 
                      'background-color: #d97706; color: white;'}
                  ">
                    ${report.financeApproval.approved === true ? 'APPROVED' : 
                      report.financeApproval.action === 'sendback' ? 'SENT BACK' : 
                      'REJECTED'}
                  </span>
                </div>
                <p style="margin: 5px 0; color: #666; font-size: 14px;">Date: ${report.financeApproval.date ? new Date(report.financeApproval.date).toLocaleDateString() : 'N/A'}</p>
                ${report.financeApproval.remarks ? `<p style="margin: 10px 0; padding: 10px; background-color: rgba(0,0,0,0.05); border-radius: 5px; font-size: 14px;"><strong>Remarks:</strong> ${report.financeApproval.remarks}</p>` : ''}
              </div>
            ` : ''}
          `}
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #333; text-align: center; color: #666; font-size: 12px;">
          <p>This is an official document generated from the IIT Mandi Expense Claim System</p>
          <p>Report generated on ${new Date().toLocaleString()}</p>
          <p style="font-style: italic;">For any queries, please contact the Finance Department</p>
        </div>
      </div>
    `;

    // Convert HTML to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297; // A4 height in mm

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    // Save the PDF
    const fileName = `ExpenseReport_${report.reportId || report._id}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};