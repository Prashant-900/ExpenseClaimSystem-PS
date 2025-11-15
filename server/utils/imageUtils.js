/**
 * Image URL generation utility
 * Centralized function to generate S3 profile image URLs
 */

export const getProfileImageUrl = (userId) => {
  if (!userId) {
    throw new Error('userId is required');
  }
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/profiles/${userId}/profile.jpg`;
};

/**
 * Attach profile images to users
 * @param {Array} users - Array of user objects
 * @returns {Promise<Array>} Users with profileImage attached
 */
export const attachProfileImagesToUsers = async (users) => {
  if (!Array.isArray(users)) {
    throw new Error('users must be an array');
  }
  
  return users.map(user => {
    // Convert mongoose document to plain object if needed
    const userObj = user.toObject ? user.toObject() : user;
    
    return {
      ...userObj,
      profileImage: getProfileImageUrl(user._id)
    };
  });
};

/**
 * Attach profile images to reports
 * @param {Array} reports - Array of report objects with populated submitterId
 * @returns {Promise<Array>} Reports with profileImage attached to submitterId
 */
export const attachProfileImagesToReports = async (reports) => {
  if (!Array.isArray(reports)) {
    throw new Error('reports must be an array');
  }

  return reports.map(report => {
    const reportObj = report.toObject ? report.toObject() : report;
    if (reportObj.submitterId) {
      reportObj.submitterId.profileImage = getProfileImageUrl(reportObj.submitterId._id);
    }
    return reportObj;
  });
};
