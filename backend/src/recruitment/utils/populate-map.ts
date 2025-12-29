export const recruitmentPopulateMap = {
  application: [
    { path: 'requisitionId', select: 'title department' },
    { path: 'candidateId', select: 'firstName lastName email' },
    { path: 'assignedHr', select: 'firstName lastName email' },
  ],

  interview: [
    { path: 'applicationId', select: 'candidateId requisitionId currentStage status' },
    { path: 'panel', select: 'firstName lastName email' },
  ],

  assessment: [
    { path: 'interviewId', select: 'applicationId stage scheduledDate status' },
    { path: 'interviewerId', select: 'firstName lastName email' },
  ],

  offer: [
    { path: 'applicationId', select: 'candidateId currentStage status' },
    { path: 'candidateId', select: 'firstName lastName email' },
  ],

  referral: [
    { path: 'referringEmployeeId', select: 'firstName lastName email' },
    { path: 'candidateId', select: 'firstName lastName email' },
  ],
};
