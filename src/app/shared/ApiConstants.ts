import { CommonUtil } from './CommonUtil';


export const API_CONSTANTS = {

  // Sample file path
  SAMPLE_FILE_PATH: 'assets/sample file/',

  // Test
  TEST_API_GET: CommonUtil.getApiEndPointPath() + 'test/testGet',
  TEST_API_POST: CommonUtil.getApiEndPointPath() + 'test/testPost',
  TOKEN_API: CommonUtil.getApiEndPointPath() + 'oauth/token',

  // Content
  CONTENT_SAVE: CommonUtil.getApiEndPointPath() + 'content',
  GET_CONTENT_BY_TYPE: CommonUtil.getApiEndPointPath() + 'content/contentType?type=',
  CONTENT_UPDATE: CommonUtil.getApiEndPointPath() + 'content',

  // User
  GET_USER_LIST: CommonUtil.getApiEndPointPath() + 'user',
  UPDATE_USER: CommonUtil.getApiEndPointPath() + 'user',
  DELETE_USER: CommonUtil.getApiEndPointPath() + 'user',
  GET_USER_BY_EMAIL: CommonUtil.getApiEndPointPath() + 'user/findByEmail',
  ACTIVE_DEACTIVE_USER: CommonUtil.getApiEndPointPath() + 'user/activeDeactiveUser',
  ACTIVATE_USER: CommonUtil.getApiEndPointPath() + 'user/activate',
  DEACTIVATE_USER: CommonUtil.getApiEndPointPath() + 'user/deactivate',
  ADD_USER: CommonUtil.getApiEndPointPath() + 'user/signUp',

  // Verify User
  GET_SUB_ADMIN_USER_LIST: CommonUtil.getApiEndPointPath() + 'user/getAllSubAdminUser',
  VERIFY_USER: CommonUtil.getApiEndPointPath() + 'user/verify',
  RESET_PASSWORD: CommonUtil.getApiEndPointPath() + 'user/resetPassword',
  CHANGE_PASSWORD: CommonUtil.getApiEndPointPath() + 'user/changePassword/',
  SIGN_IN: CommonUtil.getApiEndPointPath() + 'user/signIn',

  // admin user
  GET_USER_PERMISSIONS_LIST_BY_ID: CommonUtil.getApiEndPointPath() + 'userPermission/getPermissionByUserId/',
  ADD_ADMIN_USER: CommonUtil.getApiEndPointPath() + 'user/createAdminUser',
  UPDATE_ADMIN_USER: CommonUtil.getApiEndPointPath() + 'user/UpdateAdminUser',
  UPDATE_ADMIN_USER_PERMISSIONS: CommonUtil.getApiEndPointPath() + 'userPermission',

  // Service
  GET_SERVICE_LIST: CommonUtil.getApiEndPointPath() + 'service',
  UPDATE_SERVICE: CommonUtil.getApiEndPointPath() + 'service/updateService',
  ADD_SERVICE: CommonUtil.getApiEndPointPath() + 'service/create',
  SERVICE_ENABLE: CommonUtil.getApiEndPointPath() + 'service/enableService/',
  SERVICE_DISABLE: CommonUtil.getApiEndPointPath() + 'service/disableService/',
  BULK_UPLOAD_SERVICE: CommonUtil.getApiEndPointPath() + 'service/bulkUpload/',

  // Diversity
  GET_DIVERSITY_LIST: CommonUtil.getApiEndPointPath() + 'diversityCategory',
  UPDATE_DIVERSITY: CommonUtil.getApiEndPointPath() + 'diversityCategory',
  ADD_DIVERSITY: CommonUtil.getApiEndPointPath() + 'diversityCategory',
  DIVERSITY_ENABLE: CommonUtil.getApiEndPointPath() + 'diversityCategory/enable/',
  DIVERSITY_DISABLE: CommonUtil.getApiEndPointPath() + 'diversityCategory/disable/',

  // Company
  GET_COMPANY_LIST: CommonUtil.getApiEndPointPath() + 'company',
  UPDATE_COMPANY: CommonUtil.getApiEndPointPath() + 'company',
  ADD_COMPANY: CommonUtil.getApiEndPointPath() + 'company',
  COMPANY_ENABLE: CommonUtil.getApiEndPointPath() + 'company/enable/',
  COMPANY_DISABLE: CommonUtil.getApiEndPointPath() + 'company/disable/',
  MERGE_COMPANY: CommonUtil.getApiEndPointPath() + 'company/mergeCompany/',
  ASSIGNCOMPANY: CommonUtil.getApiEndPointPath() + 'subContractorProfile/updateOwnership',

  // Certificate
  GET_CERTIFICATE_LIST: CommonUtil.getApiEndPointPath() + 'certificate',
  UPDATE_CERTIFICATE: CommonUtil.getApiEndPointPath() + 'certificate',
  ADD_CERTIFICATE: CommonUtil.getApiEndPointPath() + 'certificate',
  CERTIFICATE_ENABLE: CommonUtil.getApiEndPointPath() + 'certificate/enable/',
  CERTIFICATE_DISABLE: CommonUtil.getApiEndPointPath() + 'certificate/disable/',


  // Region
  GET_REGION: CommonUtil.getApiEndPointPath() + 'region',
  ADD_REGION: CommonUtil.getApiEndPointPath() + 'region',
  UPDATE_REGION: CommonUtil.getApiEndPointPath() + 'region',
  ACTIVE_REGION: CommonUtil.getApiEndPointPath() + 'region/enable/',
  DEACTIVE_REGION: CommonUtil.getApiEndPointPath() + 'region/disable/',
  DEACTIVE_ALL_REGION: CommonUtil.getApiEndPointPath() + 'region/disableAll',
  ACTIVE_ALL_REGION: CommonUtil.getApiEndPointPath() + 'region/enableAll',
  BULK_UPLOAD: CommonUtil.getApiEndPointPath() + 'region/bulkUpload/',

  // state
  GET_STATE: CommonUtil.getApiEndPointPath() + 'state',
  ADD_STATE: CommonUtil.getApiEndPointPath() + 'state/create',
  UPDATE_STATE: CommonUtil.getApiEndPointPath() + 'state/update',
  ENABLE_STATE: CommonUtil.getApiEndPointPath() + 'state/enableById/',
  DISABLE_STATE: CommonUtil.getApiEndPointPath() + 'state/disableById/',
  BULK_UPLOAD_STATE: CommonUtil.getApiEndPointPath() + 'state/bulkUpload/',

  // city
  GET_CITY: CommonUtil.getApiEndPointPath() + 'city',
  GET_CITY_FOR_MASTER: CommonUtil.getApiEndPointPath() + 'city/getAllCities',
  ADD_CITY: CommonUtil.getApiEndPointPath() + 'city/create',
  UPDATE_CITY: CommonUtil.getApiEndPointPath() + 'city/update',
  ENABLE_CITY: CommonUtil.getApiEndPointPath() + 'city/enableById/',
  DISABLE_CITY: CommonUtil.getApiEndPointPath() + 'city/disableById/',
  BULK_UPLOAD_CITY: CommonUtil.getApiEndPointPath() + 'city/bulkUpload/',

  // uom
  GET_UOM: CommonUtil.getApiEndPointPath() + 'unitOfMeasure',
  ADD_UOM: CommonUtil.getApiEndPointPath() + 'unitOfMeasure',
  UPDATE_UOM: CommonUtil.getApiEndPointPath() + 'unitOfMeasure',
  ACTIVE_UOM: CommonUtil.getApiEndPointPath() + 'unitOfMeasure/enable/',
  DEACTIVE_UOM: CommonUtil.getApiEndPointPath() + 'unitOfMeasure/disable/',

  // content MSA
  GET_MSA_CONTENT: CommonUtil.getApiEndPointPath() + 'msaContent',
  ADD_MSA_CONTENT: CommonUtil.getApiEndPointPath() + 'msaContent',
  UPDATE_MSA_CONTENT: CommonUtil.getApiEndPointPath() + 'msaContent',
  ACTIVE_MSA_CONTENT: CommonUtil.getApiEndPointPath() + 'msaContent/activate/',
  DEACTIVE_MSA_CONTENT: CommonUtil.getApiEndPointPath() + 'msaContent/deactivate/',

  // Experience Level
  ADD_EXPERIENCE_LEVEL: CommonUtil.getApiEndPointPath() + 'experienceLevel/create',
  GET_EXPERIENCE_LEVEL_LIST: CommonUtil.getApiEndPointPath() + 'experienceLevel',
  UPDATE_EXPERIENCE_LEVEL: CommonUtil.getApiEndPointPath() + 'experienceLevel/update',
  DISABLE_EXPERIENCE_LEVEL: CommonUtil.getApiEndPointPath() + 'experienceLevel/disableById/',
  ENABLE_EXPERIENCE_LEVEL: CommonUtil.getApiEndPointPath() + 'experienceLevel/enableById/',
  // Industry Type
  ADD_INDUSTRY_TYPE: CommonUtil.getApiEndPointPath() + 'industry',
  GET_INDUSTRY_TYPE_LIST: CommonUtil.getApiEndPointPath() + 'industry',
  DISABLE_INDUSTRY_TYPE: CommonUtil.getApiEndPointPath() + 'industry/disable/',
  ENABLE_INDUSTRY_TYPE: CommonUtil.getApiEndPointPath() + 'industry/enable/',
  UPLOAD_INDUSTRY_LOGO: CommonUtil.getApiEndPointPath() + 'file/uploadFile',
  GET_INDUSTRY_LOGO: CommonUtil.getApiEndPointPath() + 'file/getById',
  UPDATE_INDUSTRY_TYPE: CommonUtil.getApiEndPointPath() + 'industry',
  // Job Title
  ADD_JOB_TITLE: CommonUtil.getApiEndPointPath() + 'JobTitle/create',
  GET_JOB_TITLE_LIST: CommonUtil.getApiEndPointPath() + 'JobTitle',
  UPDATE_JOB_TITLE: CommonUtil.getApiEndPointPath() + 'JobTitle/update',
  DISABLE_JOB_TITLE: CommonUtil.getApiEndPointPath() + 'JobTitle/disableById/',
  ENABLE_JOB_TITLE: CommonUtil.getApiEndPointPath() + 'JobTitle/enableById/',
  JOB_TITLE_BULK_UPLOAD: CommonUtil.getApiEndPointPath() + 'JobTitle/bulkUpload/',
  GET_IC_JOB_TITLE_LIST: CommonUtil.getApiEndPointPath() + 'IcJobTitle',
  DISAPPROVE_IC_JOB_TITLE_LIST: CommonUtil.getApiEndPointPath() + 'IcJobTitle/disApproveById/',
  APPROVE_IC_JOB_TITLE_LIST: CommonUtil.getApiEndPointPath() + 'IcJobTitle/approveById/',

  FORGOT_PASSWORD: CommonUtil.getApiEndPointPath() + 'user/forgotPassword',


  // Client Profiel
  GET_LOGGEDIN_CLIENT_DETAIL: CommonUtil.getApiEndPointPath() + 'clientProfile/findByUser/',
  UPDATE_INVITEE_CONFIGURATION: CommonUtil.getApiEndPointPath() + 'clientProfile/updateInviteeConfiguration',
  UPDATE_CLIENT_PROFILE: CommonUtil.getApiEndPointPath() + 'clientProfile',
  GET_ACTIVE_MSA: CommonUtil.getApiEndPointPath() + 'clientMSA/getActiveMsa/',
  ACCEPT_CLIENT_MSA: CommonUtil.getApiEndPointPath() + 'clientMSA/accept/',
  GET_LATEST_ACCEPTED_CLIENT_MSA: CommonUtil.getApiEndPointPath() + 'clientMSA/getLatestAcceptedMsa/',
  GET_CLIENT_PROFILE_DETAIL: CommonUtil.getApiEndPointPath() + 'clientProfile/viewProfile/',
  CLIENT_PROJECT_JOB_ACCESS: CommonUtil.getApiEndPointPath() + 'clientProfile/projectAndjobAccessRights',

  // Client MSA
  GET_CLIENT_MSA: CommonUtil.getApiEndPointPath() + 'clientMSA',
  ADD_CLIENT_MSA: CommonUtil.getApiEndPointPath() + 'clientMSA',
  UPDATE_CLIENT_MSA: CommonUtil.getApiEndPointPath() + 'clientMSA',
  ACTIVATE_CLIENT_MSA: CommonUtil.getApiEndPointPath() + 'clientMSA/activate/',
  DEACTIVATE_CLIENT_MSA: CommonUtil.getApiEndPointPath() + 'clientMSA/deactivate/',


  // Subcontractor Profile
  GET_LOGGEDIN_SUBCONTRACTOR_DETAIL: CommonUtil.getApiEndPointPath() + 'subContractorProfile/findByUser/',
  UPDATE_SUBCONTRACTOR_PROFILE: CommonUtil.getApiEndPointPath() + 'subContractorProfile',
  GET_SUBCONTRACTOR_PROFILE: CommonUtil.getApiEndPointPath() + 'subContractorProfile',
  GET_SUBCONTRACTOR_PROFILE_DETAIL: CommonUtil.getApiEndPointPath() + 'subContractorProfile/viewProfile/',
  GET_PUBLIC_SUBCONTRACTOR_PROFILE_DETAIL: CommonUtil.getApiEndPointPath() + 'subContractorProfile/viewProfileDetailsPublic/',
  UPDATE_PROJECT_LISTING_CONFIGURATION: CommonUtil.getApiEndPointPath() + 'subContractorProfile/updateListing',

  // Supervisor
  GET_SUPERVISOR_LIST: CommonUtil.getApiEndPointPath() + 'supervisorProfile',
  UPDATE_SUPERVISOR: CommonUtil.getApiEndPointPath() + 'supervisorProfile',
  ACTIVE_SUPERVISOR: CommonUtil.getApiEndPointPath() + 'supervisorProfile/activate/',
  INACTIVE_SUPERVISOR: CommonUtil.getApiEndPointPath() + 'supervisorProfile/deactivate/',
  GET_SUPERVISOR_PROFILE_BY_ID: CommonUtil.getApiEndPointPath() + 'supervisorProfile/activate/',
  GET_SUPERVISOR_PROFILE_BY_SUPERVISOR_ID: CommonUtil.getApiEndPointPath() + 'supervisorProfile/getBySupervisor/',

  // Post-Job
  ADD_JOB: CommonUtil.getApiEndPointPath() + 'JobDetail',
  UPDATE_JOB: CommonUtil.getApiEndPointPath() + 'JobDetail',
  GET_JOB: CommonUtil.getApiEndPointPath() + 'JobDetail/findById/',
  GET_JOB_LIST: CommonUtil.getApiEndPointPath() + 'JobDetail/getDetail',
  GET_JOB_BY_ID: CommonUtil.getApiEndPointPath() + 'JobDetail/findById/',
  GET_DETAIL_BY_ID_PUBLIC: CommonUtil.getApiEndPointPath() + 'JobDetail/getDetailByIdPublic/',
  CHECK_IS_JOB_BIDED: CommonUtil.getApiEndPointPath() + 'jobBidDetail/checkIsJobBided/',
  GET_JOB_LIST_FOR_SIDE_BAR: CommonUtil.getApiEndPointPath() + 'JobDetail/getJobDetailForSidebar',
  DELETE_JOB: CommonUtil.getApiEndPointPath() + 'JobDetail/delete/',

  // BellNotification
  GET_BELL_NOTIFICATION: CommonUtil.getApiEndPointPath() + 'notification',
  MARK_AS_SEEN: CommonUtil.getApiEndPointPath() + 'notification/markAsSeen/',
  GET_UNREAD_NOTIFICATION_COUNT: CommonUtil.getApiEndPointPath() + 'notification/unreadCount/',

  // Jobsite
  GET_JOBSITE_LIST: CommonUtil.getApiEndPointPath() + 'JobsiteDetail',
  GET_JOBSITE_BY_ID: CommonUtil.getApiEndPointPath() + 'JobsiteDetail/getByJobsiteId/',
  UPDATE_COST_OF_JOBSITE: CommonUtil.getApiEndPointPath() + 'JobsiteDetail/updateJobsiteCostById/',
  // project
  GET_PROJECT_BY_USER_ID: CommonUtil.getApiEndPointPath() + 'ProjectDetail',
  GET_PROJECT_BY_USER_ID_FOR_SIDEBAR: CommonUtil.getApiEndPointPath() + 'ProjectDetail/getProjectForSidebar',
  GET_PROJECT_BY_MATCH_MAKING: CommonUtil.getApiEndPointPath() + 'ProjectDetail/getProjectDetailCustom',
  GET_PROJECT_FOR_SUBCONTRACTOR: CommonUtil.getApiEndPointPath() + 'ProjectDetail/getProjectsForSubcontractor',
  GET_SUBMIT_RATING_REVIEW_LIST: CommonUtil.getApiEndPointPath() + 'ProjectDetail/submitReview/',
  GET_JOB_SUBMIT_RATING_REVIEW_LIST: CommonUtil.getApiEndPointPath() + 'JobDetail/submitReview/',
  GET_JOBSITE_SUBMIT_RATING_REVIEW_LIST: CommonUtil.getApiEndPointPath() + 'JobsiteDetail/submitReview/',
  DELETE_JOBSITE_ATTACHEMNT: CommonUtil.getApiEndPointPath() + 'jobSiteAttachment/delete/',
  DOWNLOAD_JOBSITE_ATTACHMNET_ZIP_FILE: CommonUtil.getApiEndPointPath() + 'jobSiteAttachment/downloadDocument/',
  DOWNLOAD_PROJECT_ATTACHMNET_ZIP_FILE: CommonUtil.getApiEndPointPath() + 'projectAttachment/downloadProjectDocument/',
  PUBLIC_GET_PROJECT_BY_PROJECT_ID: CommonUtil.getApiEndPointPath() + 'ProjectDetail/getProjectDetailByIdPublic/',
  DELETE_PROJECT: CommonUtil.getApiEndPointPath() + 'ProjectDetail/delete/',


  // state
  GET_NO_OF_EMPLOYEES: CommonUtil.getApiEndPointPath() + 'numberOfEmployee',
  ADD_NO_OF_EMPLOYEES: CommonUtil.getApiEndPointPath() + 'numberOfEmployee',
  UPDATE_NO_OF_EMPLOYEES: CommonUtil.getApiEndPointPath() + 'numberOfEmployee',
  ENABLE_NO_OF_EMPLOYEES: CommonUtil.getApiEndPointPath() + 'numberOfEmployee/enable/',
  DISABLE_NO_OF_EMPLOYEES: CommonUtil.getApiEndPointPath() + 'numberOfEmployee/disable/',
  // BULK_UPLOAD_NO_OF_EMPLOYEES: CommonUtil.getApiEndPointPath() + 'numberOfEmployee/bulkUpload/',

  ADD_JOB_INVITEE: CommonUtil.getApiEndPointPath() + 'jobInvitee',


  // file Download
  DOWNLOAD_FILE: CommonUtil.getApiEndPointPath() + 'file/downloadFileByIdAndName',


  // emr
  GET_EMR: CommonUtil.getApiEndPointPath() + 'subContractorEMR',
  ADD_EMR: CommonUtil.getApiEndPointPath() + 'subContractorEMR',
  UPDATE_EMR: CommonUtil.getApiEndPointPath() + 'subContractorEMR',
  DELETE_EMR: CommonUtil.getApiEndPointPath() + 'subContractorEMR/delete/',

  // emr
  GET_COI: CommonUtil.getApiEndPointPath() + 'subContractorCOI',
  ADD_COI: CommonUtil.getApiEndPointPath() + 'subContractorCOI',
  UPDATE_COI: CommonUtil.getApiEndPointPath() + 'subContractorCOI',
  DELETE_COI: CommonUtil.getApiEndPointPath() + 'subContractorCOI/delete/',

  // project Bid
  GET_PROJECT_BID_DETAIL: CommonUtil.getApiEndPointPath() + 'ProjectBidDetail',
  CHECK_PROJECT_BID_OR_JOBSITE_BIDDED: CommonUtil.getApiEndPointPath() + 'ProjectBidDetail/checkProjectOrItsJobsiteBided/',
  CHECK_PROJECT_IS_CHANGED: CommonUtil.getApiEndPointPath() + 'ProjectDetail/validateProjectDetailIsChanged/',
  GET_PROJECT_BID_DETAILBY_ID: CommonUtil.getApiEndPointPath() + 'ProjectBidDetail/getDetailByProjectAndSubContractor',
  GET_PROJECT_BID_DETAIL_BY_ID: CommonUtil.getApiEndPointPath() + 'ProjectBidDetail/getAppliedDetailByProjectAndSubContractor',
  ADD_PROJECT_BID_DETAIL: CommonUtil.getApiEndPointPath() + 'ProjectBidDetail/startApply',
  GET_PROJECT_BID_AMOUNT: CommonUtil.getApiEndPointPath() + 'ProjectBidDetail/getTotalProjectBidAmount/',
  PROJECTID: CommonUtil.getApiEndPointPath() + 'ProjectDetail/cloneProject/',

  // UPDATE_PROJECT_BID_DETAIL: CommonUtil.getApiEndPointPath() + 'ProjectBidDetail/applyOnProject',

  // jobsite Bid
  GET_JOBSITE_BID_DETAIL: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail',
  GET_JOBSITE_BID_DETAIL_BY_ID: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/getDetailByJobSiteAndSubContractor',
  ADD_JOBSITE_BID_DETAIL: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/apply',
  SUBMIT_BID_DETAIL: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/submit',
  // UPDATE_JOBSITE_BID_DETAIL: CommonUtil.getApiEndPointPath() + 'ProjectBidDetail/applyOnProject',


  // Award Project
  GET_PROJECT_BID_DETAIL_TO_AWARD: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/allowToAwardProject',
  GET_PO_DETAIL_TO_AWARD: CommonUtil.getApiEndPointPath() + 'poDetail/getByProjectId',
  ADD_PO_DETAIL_TO_AWARD: CommonUtil.getApiEndPointPath() + 'poDetail',
  OFFER_PROJECT: CommonUtil.getApiEndPointPath() + 'ProjectBidDetail/offerProject',

  // Award Jobsite
  OFFER_JOBSITE: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/offerJobSite',

  // PaymentMileStone Bid Detail
  GET_PAYMENT_MILESTONE_BID_DETAIL_BY_JOBSITE_ID: CommonUtil.getApiEndPointPath() + 'paymentMileStoneBidDetail',


  // compliance
  GET_COMPLIANCE: CommonUtil.getApiEndPointPath() + 'subContractorCompliance',
  GET_COMPLIANCE_BY_ID: CommonUtil.getApiEndPointPath() + 'subContractorCompliance/findByUser/',
  ADD_COMPLIANCE: CommonUtil.getApiEndPointPath() + 'subContractorCompliance',
  UPDATE_COMPLIANCE: CommonUtil.getApiEndPointPath() + 'subContractorCompliance',
  DELETE_COMPLIANCE: CommonUtil.getApiEndPointPath() + 'subContractorCompliance/delete/',

  // osha
  GET_OSHA: CommonUtil.getApiEndPointPath() + 'subContractorOSHA',
  GET_OSHA_BY_ID: CommonUtil.getApiEndPointPath() + 'subContractorOSHA/findByUser/',
  ADD_OSHA: CommonUtil.getApiEndPointPath() + 'subContractorOSHA',
  UPDATE_OSHA: CommonUtil.getApiEndPointPath() + 'subContractorOSHA',
  DELETE_OSHA: CommonUtil.getApiEndPointPath() + 'subContractorOSHA/delete/',

  // license
  GET_LICENSE: CommonUtil.getApiEndPointPath() + 'subContractorLicense',
  ADD_LICENSE: CommonUtil.getApiEndPointPath() + 'subContractorLicense',
  UPDATE_LICENSE: CommonUtil.getApiEndPointPath() + 'subContractorLicense',
  DELETE_LICENSE: CommonUtil.getApiEndPointPath() + 'subContractorLicense/delete/',
  DELETE_DOCUMENTS: CommonUtil.getApiEndPointPath() + 'subContractorLicense/deleteDocuments',
  DOWNLOAD_ZIP_FILE: CommonUtil.getApiEndPointPath() + 'subContractorLicense/downloadDocument/',

  // Reference
  GET_REFERENCE: CommonUtil.getApiEndPointPath() + 'subContractorReference',
  GET_REFERENCE_BYID: CommonUtil.getApiEndPointPath() + 'subContractorReference/findByUser/',
  ADD_REFERENCE: CommonUtil.getApiEndPointPath() + 'subContractorReference',
  UPDATE_REFERENCE: CommonUtil.getApiEndPointPath() + 'subContractorReference',

  // Reference
  GET_WORKER_REFERENCE: CommonUtil.getApiEndPointPath() + 'workerReference',
  GET_WORKER_REFERENCE_BYID: CommonUtil.getApiEndPointPath() + 'workerReference/findByUser/',
  ADD_WORKER_REFERENCE: CommonUtil.getApiEndPointPath() + 'workerReference',
  UPDATE_WORKER_REFERENCE: CommonUtil.getApiEndPointPath() + 'workerReference',

  // post-project
  ADD_NEW_PROJECT: CommonUtil.getApiEndPointPath() + 'ProjectDetail/save',
  UPDATE_PROJECT: CommonUtil.getApiEndPointPath() + 'ProjectDetail/updateProject',
  PROJECT_INVITEE: CommonUtil.getApiEndPointPath() + 'ProjectInvitee',
  GET_PROJECT_BY_ID: CommonUtil.getApiEndPointPath() + 'ProjectDetail/findById/',
  GET_PROJECT_BY_PROJECT_ID: CommonUtil.getApiEndPointPath() + 'ProjectDetail/getProjectBy/',
  GET_ATTACHMENT_OF_PROJECT: CommonUtil.getApiEndPointPath() + 'projectAttachment',
  DELETE_ATTACHMENT_OF_PROJECT: CommonUtil.getApiEndPointPath() + 'projectAttachment/delete/',
  CLONE_PROJECT: CommonUtil.getApiEndPointPath() + 'ProjectDetail/cloneProject/',
  GET_PROJECT_DETAIL_BY_ID: CommonUtil.getApiEndPointPath() + 'ProjectDetail/getProjectBy/',
  VALIDATE_CLIENT_PROFILE: CommonUtil.getApiEndPointPath() + 'ProjectDetail/ValidateClient/',


  // Worker Profile
  GET_LOGGEDIN_WORKER_DETAIL: CommonUtil.getApiEndPointPath() + 'workerProfile/findByUser/',
  UPDATE_WORKER_PROFILE: CommonUtil.getApiEndPointPath() + 'workerProfile',
  GET_WORKER_PROFILE: CommonUtil.getApiEndPointPath() + 'workerProfile',
  GET_WORKER_PROFILE_DETAIL: CommonUtil.getApiEndPointPath() + 'workerProfile/viewProfile/',
  GET_WORKER_PROFILE_FOR_PRIVATE_OR_PUBLIC: CommonUtil.getApiEndPointPath() + 'jobBidDetail/getClientWorkerRelationship/',
  GET_SUBCONTRACTOR_PROFILE_FOR_PRIVATE_OR_PUBLIC: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/getClientSubcontractorRelationship/',
  GET_VIEW_DETAILS_BY_USER_ID_PUBLIC: CommonUtil.getApiEndPointPath() + 'workerProfile/viewProfileDetailsPublic/',
  UPDATE_JOB_LISTING_CONFIGURATION: CommonUtil.getApiEndPointPath() + 'workerProfile/updateListingConfiguration',
  // Worker Profile  Work Experience
  // GET_LOGGEDIN_WORKER_DETAIL: CommonUtil.getApiEndPointPath() + 'workerProfile/findByUser/',
  ADD_WORKER_EXP: CommonUtil.getApiEndPointPath() + 'workerExperience',
  UPDATE_WORKER_EXP: CommonUtil.getApiEndPointPath() + 'workerExperience',
  GET_WORKER_EXP: CommonUtil.getApiEndPointPath() + 'workerExperience',
  GET_WORKER_EXP_DISPLAY_DETAIL: CommonUtil.getApiEndPointPath() + 'workerExperience/getDisplayDetailByUser/',

  // Worker Profile Education
  // GET_LOGGEDIN_WORKER_DETAIL: CommonUtil.getApiEndPointPath() + 'workerProfile/findByUser/',
  ADD_WORKER_EDUCATION: CommonUtil.getApiEndPointPath() + 'workerEducation',
  UPDATE_WORKER_EDUCATION: CommonUtil.getApiEndPointPath() + 'workerEducation',
  GET_WORKER_EDUCATION: CommonUtil.getApiEndPointPath() + 'workerEducation',
  GET_WORKER_EDUCATION_DISPLAY_DETAIL: CommonUtil.getApiEndPointPath() + 'workerEducation/getDisplayDetailByUser/',


  MARK_AS_FAVOURITE: CommonUtil.getApiEndPointPath() + 'jobBidDetail/markAsFavourite',
  CHECK_IS_FAVOURITE: CommonUtil.getApiEndPointPath() + 'jobBidDetail/checkFavourite',
  START_BIDDING: CommonUtil.getApiEndPointPath() + 'jobBidDetail/startBid',

  // jobsite
  ADD_NEW_JOBSITE: CommonUtil.getApiEndPointPath() + 'JobsiteDetail/save',
  GET_ALL_JOBSITE: CommonUtil.getApiEndPointPath() + 'JobsiteDetail',
  EDIT_JOBSITE: CommonUtil.getApiEndPointPath() + 'JobsiteDetail/update',
  // line-item
  ADD_NEW_LINE_ITEM: CommonUtil.getApiEndPointPath() + 'lintItem',
  UPDATE_LINE_ITEM: CommonUtil.getApiEndPointPath() + 'lintItem',
  GET_UNASSIGNED_LINE_ITEM: CommonUtil.getApiEndPointPath() + 'lintItem/getUnassignedLineItemByJobsiteId/',
  GET_LINE_ITEM: CommonUtil.getApiEndPointPath() + 'lintItem',
  DELETE_LINE_ITEM: CommonUtil.getApiEndPointPath() + 'JobsiteDetail/deleteLineItemById/',

  // worker certificate
  GET_WORKER_CERTIFICATE_LIST: CommonUtil.getApiEndPointPath() + 'workerCertificate',
  ADD_WORKER_CERTIFICATE: CommonUtil.getApiEndPointPath() + 'workerCertificate',
  UPDATE_WORKER_CERTIFICATE: CommonUtil.getApiEndPointPath() + 'workerCertificate',
  DELETE_WORKER_CERTIFICATE: CommonUtil.getApiEndPointPath() + 'workerCertificate/delete/',
  DELETE_DOCUMENTS_OF_WORKER_CERTIFICATE: CommonUtil.getApiEndPointPath() + 'workerCertificate/deleteDocuments',
  DOWNLOAD_ZIP_FILE_OF_WORKER_CERTIFICATE: CommonUtil.getApiEndPointPath() + 'workerCertificate/downloadDocument/',
  APPROVE_WORKER_CERTIFICATE: CommonUtil.getApiEndPointPath() + 'workerCertificate/approve',
  REJECT_WORKER_CERTIFICATE: CommonUtil.getApiEndPointPath() + 'workerCertificate/reject',

  // filter-left-panel
  GET_WORKER: CommonUtil.getApiEndPointPath() + 'filterData/getWorker',
  GET_WORKER_VIRTUAL_SCROLL: CommonUtil.getApiEndPointPath() + 'filterData/getWorkerVirtualScroll',
  GET_SUBCONTRACTOR: CommonUtil.getApiEndPointPath() + 'filterData/getSubcontractor',
  GET_SUBCONTRACTOR_VIRTUAL_SCROLL: CommonUtil.getApiEndPointPath() + 'filterData/getSubcontractorVirtualScroll',
  GET_CLIENT: CommonUtil.getApiEndPointPath() + 'filterData/getClient',
  GET_CLIENT_BY_CONTACT_NAME: CommonUtil.getApiEndPointPath() + 'filterData/getAllClientContactName',
  GET_JOB_CITY: CommonUtil.getApiEndPointPath() + 'filterData/getCityForJob',
  GET_JOB_STATE: CommonUtil.getApiEndPointPath() + 'filterData/getStateForJob',
  GET_POST_PROJECT_STATE: CommonUtil.getApiEndPointPath() + 'filterData/getStateForPostProject',
  GET_JOB_TITLE_FOR_WORKER: CommonUtil.getApiEndPointPath() + 'filterData/getJobTitleForWorker',
  GET_JOB_TITLE_FOR_CLIENT: CommonUtil.getApiEndPointPath() + 'filterData/getJobTitleForClient',
  GET_JOB_TITLE_FOR_CLIENT_WITHOUT_CANCELLED_COMPLETED: CommonUtil.getApiEndPointPath() + 'filterData/getJobTitleForClientWithoutCancelAndCompleted',
  GET_JOB_TITLE_FOR_CLIENT_WITHOUT_CANCELLED: CommonUtil.getApiEndPointPath() + 'filterData/getJobTitleForClientWithoutCancelled',
  GET_CHANGE_REQUEST_TITLE_FOR_CLIENT: CommonUtil.getApiEndPointPath() + 'filterData/getChangeRequestTitleForUser',
  GET_CHANGE_REQUEST_TITLE_FOR_SUPERVISOR: CommonUtil.getApiEndPointPath() + 'filterData/getChangeRequestForSupervisor',
  GET_PROJECT_TITLE_FOR_CLIENT: CommonUtil.getApiEndPointPath() + 'filterData/getProjectTitleForClient',
  GET_PROJECT_TITLE_FOR_CLIENT_WITHOUT_COMPLETED_CANCELLED: CommonUtil.getApiEndPointPath() + 'filterData/getProjectTitleForClientWithoutCancelledAndCompleted',
  GET_PROJECT_TITLE_FOR_CLIENT_WITHOUT_COMPLETED_CANCELLED_DRAFT: CommonUtil.getApiEndPointPath() + 'filterData/getProjectTitleForClientWithoutCancelledAndCompletedAndDraft',
  GET_PROJECT_TITLE_FOR_SUBCONTRACTOR: CommonUtil.getApiEndPointPath() + 'filterData/getProjectTitleForSubcontractor',
  GET_COMPANY_FOR_PROJECT: CommonUtil.getApiEndPointPath() + 'filterData/getProjectCompanyByName',
  GET_COMPANY_FOR_PROJECT_BY_SUBCONTRACTOR: CommonUtil.getApiEndPointPath() + 'filterData/getProjectCompanyByNameForSubcontractor',
  GET_STATE_FOR_PROJECT: CommonUtil.getApiEndPointPath() + 'filterData/getStateForProject',
  GET_CITY_FOR_PROJECT: CommonUtil.getApiEndPointPath() + 'filterData/getCityForProject',
  GET_INDUSTRY_FOR_PROJECT: CommonUtil.getApiEndPointPath() + 'filterData/getProjectIndustryByName',
  GET_INDUSTRY_FOR_PROJECT_BY_SUBCONTRACTOR: CommonUtil.getApiEndPointPath() + 'filterData/getProjectIndustryByNameForSubcontractor',
  GET_USER_DETAIL_BY_USER_NAME: CommonUtil.getApiEndPointPath() + 'filterData/getWorkerSubcontractorAndClient',
  GET_REGION_FOR_PROJECT: CommonUtil.getApiEndPointPath() + 'filterData/getRegionForProject',
  GET_POSTED_BY_FORpROJECT: CommonUtil.getApiEndPointPath() + 'filterData/getPostedByProjectForSubContractor',
  GET_PROJECT_TITLES_FOR_SUBCONTRACTOR_FOR_BIDED_FAV_AND_GOT_INVITATIONS: CommonUtil.getApiEndPointPath() + 'filterData/getProjectTitlesForSubcontractorForBidedfavAndGotInvitation',
  GET_PROJECT_TITLES_FOR_SUBCONTRACTOR_FOR_ACCEPT_REJECT: CommonUtil.getApiEndPointPath() + 'filterData/getProjectTitlesForSubcontractorForAcceptAndReject',
  GET_PROJECT_TITLES_FOR_SUBCONTRACTOR_FOR_OFFERED_ACCEPTED: CommonUtil.getApiEndPointPath() + 'filterData/getProjectTitlesForSubcontractorForOfferedAndAccepted',
  GET_PROJECT_TITLES_FOR_SUBCONTRACTOR_FOR_OFFERED_ACCEPTED_APPLIED: CommonUtil.getApiEndPointPath() + 'filterData/getProjectTitlesForSubcontractorForOfferedAndAcceptedAndApplied',
  GET_PROJECT_TITLES_FOR_SUBCONTRACTOR_FOR_COMPLETED_CANCELLED: CommonUtil.getApiEndPointPath() + 'filterData/getProjectTitlesForSubcontractorForCompletedCancelled',
  GET_JOBSITE_TITLE_FOR_CLIENT: CommonUtil.getApiEndPointPath() + 'filterData/getJobsiteTitle',
  GET_JOBSITE_TITLE_FOR_CLIENT_WITHOUT_CANCELLED_COMPLETED: CommonUtil.getApiEndPointPath() + 'filterData/getJobsiteTitleWithoutCancelledAndCompleted',

  GET_JOBSITE_TITLE_FOR_SUBCONTRACTOR: CommonUtil.getApiEndPointPath() + 'filterData/getJobsiteTitleForSubContractor',
  GET_CITY_FOR_JOBSITE: CommonUtil.getApiEndPointPath() + 'filterData/getCityForJobsite',
  GET_STATE_FOR_JOBSITE: CommonUtil.getApiEndPointPath() + 'filterData/getStateForJobsite',
  GET_CITY_FOR_PROJECT_JOB: CommonUtil.getApiEndPointPath() + 'filterData/getCity',
  GET_CITY_FOR_POST_PROJECT: CommonUtil.getApiEndPointPath() + 'filterData/getCityForPostProject',
  GET_CERTIFICATES: CommonUtil.getApiEndPointPath() + 'JobCertificate/findByJobId',
  GET_SCREENING_QUESTIONS: CommonUtil.getApiEndPointPath() + 'JobScreeningQuestion',
  APPLY_JOB: CommonUtil.getApiEndPointPath() + 'jobBidDetail/applyForJob',
  GET_JOBS: CommonUtil.getApiEndPointPath() + 'JobDetail',
  CHECK_IF_JOB_DETAILS_CHANGED: CommonUtil.getApiEndPointPath() + 'JobDetail/checkIfJobDetailsChanged/',
  JOBID: CommonUtil.getApiEndPointPath() + 'JobDetail/cloneJob/',

  // milestone
  ADD_NEW_MILESTONE: CommonUtil.getApiEndPointPath() + 'PaymentMileStone',
  UPDATE_PAYMENT_MILESTONE: CommonUtil.getApiEndPointPath() + 'PaymentMileStone',
  DELETE_MILESTONE_BY_ID: CommonUtil.getApiEndPointPath() + 'JobsiteDetail/deletePaymentMileStoneById/',
  GET_MILESTONE: CommonUtil.getApiEndPointPath() + 'PaymentMileStone',

  // Rating and review
  GET_RATING_AND_REVIEW_LIST: CommonUtil.getApiEndPointPath() + 'ratingAndReview',
  UPDATE_RATING_AND_REVIEW: CommonUtil.getApiEndPointPath() + 'ratingAndReview',
  ADD_RATING_AND_REVIEW: CommonUtil.getApiEndPointPath() + 'ratingAndReview',
  GET_RAR_BY_USERID_AND_JOB_ID: CommonUtil.getApiEndPointPath() + 'jobBidDetail/getRarByUserIdAndJobId/',
  GET_RAR_BY_USERID: CommonUtil.getApiEndPointPath() + 'jobBidDetail/getRarByUserIdAndJobId/',
  GET_RAR_BY_USERID_AND_JOBSITE_ID: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/getRarByUserIdAndJobsiteId/',
  GET_JOBSITE_RAR_BY_USERID: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/getRarByUserIdAndJobsiteId/',
  GET_RAR_FOR_SUBCONTRACTOR: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/getRarForSubcontractor/',
  GET_RAR_FOR_SUBCONTRACTOR_BY_JOBSITE_ID: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/getRarForSubcontractor/',
  GET_RAR_BY_USERID_AND_JOB_ID_FOR_WORKER: CommonUtil.getApiEndPointPath() + 'jobBidDetail/getRarByUserIdAndJobIdForWorker/',
  GET_RAR_BY_USERID_FOR_WORKER: CommonUtil.getApiEndPointPath() + 'jobBidDetail/getRarByUserIdAndJobIdForWorker/',
  ACCEPTED_BY_ADMIN: CommonUtil.getApiEndPointPath() + 'ratingAndReview/acceptedByAdmin',
  REJECTED_BY_ADMIN: CommonUtil.getApiEndPointPath() + 'ratingAndReview/rejectedByAdmin',
  GET_RAR_BY_USERID_AND_PROJECT_ID: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/getRarByUserIdAndProjectId/',
  GET_RAR_FOR_SUBCONTRACTOR_BY_PROJECT_ID: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/getRarForSubcontractor/',

  // delete jobsite
  DELETE_JOBSITE_BY_ID: CommonUtil.getApiEndPointPath() + 'ProjectDetail/deletejobsiteById/',

  GET_JOB_BID_DETAIL: CommonUtil.getApiEndPointPath() + 'jobBidDetail',
  GET_JOB_BID_DETAIL_VIEW_ALL: CommonUtil.getApiEndPointPath() + 'jobBidDetail/getOnlyBidData',
  GET_JOB_BID_CERTIFICATE: CommonUtil.getApiEndPointPath() + 'jobBidCertificate',
  GET_JOB_BID_SCREENING_QUESTIONS: CommonUtil.getApiEndPointPath() + 'jobBidScreeningQuestion',
  OFFER_JOB: CommonUtil.getApiEndPointPath() + 'jobBidDetail/offerJob',

  // line-item-template
  GET_TEMPLATE_LIST: CommonUtil.getApiEndPointPath() + 'lineItemTemplate',
  ADD_TEMPLATE: CommonUtil.getApiEndPointPath() + 'lineItemTemplate',
  UPDATE_TEMPLATE: CommonUtil.getApiEndPointPath() + 'lineItemTemplate',
  DELETE_TEMPLATE: CommonUtil.getApiEndPointPath() + 'lineItemTemplate/delete/',

  SET_STATUS: CommonUtil.getApiEndPointPath() + 'JobDetail/changeStatus',
  SET_STATUS_OF_PROJECT: CommonUtil.getApiEndPointPath() + 'ProjectDetail/changeStatus',
  SET_STATUS_OF_JOBSITE: CommonUtil.getApiEndPointPath() + 'JobsiteDetail/changeStatus',

  // update updated Date
  UPDATE_JOB_UPDATED_DATE: CommonUtil.getApiEndPointPath() + 'JobDetail/changeJobUpdatedDate',
  UPDATE_UPDATED_DATE: CommonUtil.getApiEndPointPath() + 'ProjectDetail/changeUpdatedDate',

  // MarkAsFavourite
  ADD_MARK_AS_FAVOURITE_PROJECT: CommonUtil.getApiEndPointPath() + 'ProjectMarkAsFavourite',
  UPDATE_MARK_AS_FAVOURITE_PROJECT: CommonUtil.getApiEndPointPath() + 'ProjectMarkAsFavourite',
  GET_MARK_AS_FAVOURITE_PROJECT: CommonUtil.getApiEndPointPath() + 'ProjectMarkAsFavourite',

  GET_SUPERVISOR_BY_CLIENT: CommonUtil.getApiEndPointPath() + 'user/getSupervisorByClient/',
  ASSIGN_JOB_SUPERVISOR: CommonUtil.getApiEndPointPath() + 'JobDetail/assignSupervisor',
  ASSIGN_PROJECT_SUPERVISOR: CommonUtil.getApiEndPointPath() + 'ProjectDetail/assignSupervisor',
  ASSIGN_JOBSITE_SUPERVISOR: CommonUtil.getApiEndPointPath() + 'JobsiteDetail/assignSupervisor',

  GET_JOB_REGION: CommonUtil.getApiEndPointPath() + 'filterData/getRegionForJob',

  // Change-request
  GET_CHANGE_REQUEST: CommonUtil.getApiEndPointPath() + 'changeRequest',
  GET_CHANGE_REQUEST_ATTACHMENT: CommonUtil.getApiEndPointPath() + 'changeRequestAttachment',
  ADD_CHANGE_REQUEST: CommonUtil.getApiEndPointPath() + 'changeRequest',
  UPDATE_CHANGE_REQUEST: CommonUtil.getApiEndPointPath() + 'changeRequest',
  DELETE_CHANGE_REQUEST: CommonUtil.getApiEndPointPath() + 'changeRequestAttachment/delete/',
  DOWNLOAD_CHANGE_REQUEST_ATTACHMENTS: CommonUtil.getApiEndPointPath() + 'changeRequestAttachment/downloadDocument/',
  REJECT_CHANGE_REQUEST: CommonUtil.getApiEndPointPath() + 'changeRequest/reject',
  APPROVE_CHANGE_REQUEST: CommonUtil.getApiEndPointPath() + 'changeRequest/approve/',

  GET_MASTER_JOB_TITLE_OF_WORKER: CommonUtil.getApiEndPointPath() + 'filterData/getMasterJobTitleOfWorker',
  GET_QUESTION_ANSWER_LIST: CommonUtil.getApiEndPointPath() + 'questionAndAnswer',
  SUBMIT_ANSWER: CommonUtil.getApiEndPointPath() + 'questionAndAnswer',
  SUBMIT_QUESTION: CommonUtil.getApiEndPointPath() + 'questionAndAnswer',
  GET_ANSWER_ATTACHMENT_LIST: CommonUtil.getApiEndPointPath() + 'questionAndAnswerAttachment',
  POST_QUESTION_ANSWER_ATTACHMENT: CommonUtil.getApiEndPointPath() + 'questionAndAnswerAttachment',
  DELETE_ATTACHMENT: CommonUtil.getApiEndPointPath() + 'questionAndAnswerAttachment/delete/',
  EXPORT_TO_EXCEL: CommonUtil.getApiEndPointPath() + 'questionAndAnswer/exportToExcel',
  DOWLOAD_DOCUMENT: CommonUtil.getApiEndPointPath() + 'questionAndAnswerAttachment/downloadDocument/',
  UPLOAD_EXCEL: CommonUtil.getApiEndPointPath() + 'questionAndAnswer/uploadExcel/',
  IMPORT_FROM_EXCEL: CommonUtil.getApiEndPointPath() + 'importData/importFile',

  REPORT_TO_ADMIN: CommonUtil.getApiEndPointPath() + 'ratingAndReview/reportToAdmin',

  GET_DETAIL_BY_JOB_AND_WORKER: CommonUtil.getApiEndPointPath() + 'jobBidDetail/getDetailByJobAndWorker',
  ACCEPT_JOB: CommonUtil.getApiEndPointPath() + 'jobBidDetail/acceptJob',
  REJECT_JOB: CommonUtil.getApiEndPointPath() + 'jobBidDetail/rejectJob',

  // reimbursement
  ADD_REIMBURSEMENT: CommonUtil.getApiEndPointPath() + 'jobReimbursement',
  UPDATE_REIMBURSEMENT: CommonUtil.getApiEndPointPath() + 'jobReimbursement',
  GET_REIMBURSEMENT: CommonUtil.getApiEndPointPath() + 'jobReimbursement',
  DOWNLOAD_REIMBURSEMENT_ATTACHMNET_ZIP_FILE: CommonUtil.getApiEndPointPath() + 'jobReimbursement/downloadDocument/',
  DELETE_REIMBURSEMENT: CommonUtil.getApiEndPointPath() + 'jobReimbursement/delete/',
  GET_REIMBURSEMENT_ATTACHMENT: CommonUtil.getApiEndPointPath() + 'jobReimbursementAttachment',
  DELETE_REIMBURSEMENT_ATTACHMENT: CommonUtil.getApiEndPointPath() + 'jobReimbursementAttachment/delete/',

  GET_ALL_WORKER_PROFILE: CommonUtil.getApiEndPointPath() + 'workerProfile',

  GET_ACCEPTED_JOB_TITLE_FOR_WORKER: CommonUtil.getApiEndPointPath() + 'filterData/getAcceptedJobTitleForWorker',
  GET_OFFERED_JOB_TITLE_FOR_WORKER: CommonUtil.getApiEndPointPath() + 'filterData/getOfferedJobTitleForWorker',
  GET_APPLY_JOB_TITLE_FOR_WORKER: CommonUtil.getApiEndPointPath() + 'filterData/getApplyJobTitleForWorker',
  GET_ALL_CLIENT_AND_COMPANY_NAME: CommonUtil.getApiEndPointPath() + 'filterData/getAllUserAndClientCompanyName',
  GET_COMPLETED_CANCELLED_ACCEPTED_JOB_TITLE_FOR_WORKER: CommonUtil.getApiEndPointPath() + 'filterData/getJobTitleForWorkerCancelledCompletedAccepted',

  // Chat screen
  CREATE_CHAT_MESSAGE: CommonUtil.getApiEndPointPath() + 'chatMessage',
  GET_CHAT_MESSAGE: CommonUtil.getApiEndPointPath() + 'chatMessage',
  GET_USERS_BY_JOB_FOR_MESSAGE: CommonUtil.getApiEndPointPath() + 'chatMessage/getWorker/ApplyOnJob',
  GET_USERS_BY_JOBSITE_FOR_MESSAGE: CommonUtil.getApiEndPointPath() + 'chatMessage/getSubContractor/ApplyOnJobSite',
  GET_USERS_BY_PROJECT_FOR_MESSAGE: CommonUtil.getApiEndPointPath() + 'chatMessage/getSubContractor/ApplyOnProject',
  GET_UNREAD_MESSAGE_COUNT: CommonUtil.getApiEndPointPath() + 'chatMessage/unreadCount/',
  MESSAGE_MARK_AS_SEEN: CommonUtil.getApiEndPointPath() + 'chatMessage/markAsSeen/',
  MESSAGE_MARK_AS_SEEN1: CommonUtil.getApiEndPointPath() + 'chatMessage/markAsSeenByProjectId/',
  MESSAGE_MARK_AS_SEEN2: CommonUtil.getApiEndPointPath() + 'chatMessage/markAsSeenByJobsiteId/',
  MESSAGE_MARK_AS_SEEN3: CommonUtil.getApiEndPointPath() + 'chatMessage/markAsSeenByJobId/',
  MESSAGE_MARK_AS_SEEN4: CommonUtil.getApiEndPointPath() + 'chatMessage/markAsSeenByProjectAndJobsite',

  GET_COMPANY_NAME_FOR_CLIENT_LIST_FOR_ADMIN: CommonUtil.getApiEndPointPath() + 'filterData/getCompanyNameForClientListForAdmin',





  USER_SELECTION: CommonUtil.getApiEndPointPath() + 'userSelection',
  USER_SELECTION_CUSTOM: CommonUtil.getApiEndPointPath() + 'userSelection/getProjectJobInvitee',
  GET_BID_FOR_PROJECT_DATA: CommonUtil.getApiEndPointPath() + 'ProjectBidDetail/getAllBidProjectDataForSubContractorComparision',
  GET_BID_FOR_JOBSITE_DATA: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/getBidComparision',
  GET_BID_FOR_LINE_ITEM_DATA: CommonUtil.getApiEndPointPath() + 'lineItemBidDetail/getBidComparision',

  // Client
  GET_CLIENT_LIST: CommonUtil.getApiEndPointPath() + 'clientProfile',
  ADD_CLIENT: '',
  UPDATE_CLIENT: '',
  DELETE_CLIENT: '',

  // Accept/Reject Project and Jobsite
  ACCEPT_PROJECT: CommonUtil.getApiEndPointPath() + 'ProjectBidDetail/acceptProject',
  REJECT_PROJECT: CommonUtil.getApiEndPointPath() + 'ProjectBidDetail/rejectProject',
  ACCEPT_JOBSITE: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/acceptJobSite',
  REJECT_JOBSITE: CommonUtil.getApiEndPointPath() + 'jobSiteBidDetail/rejectJobSite',
  POST_BID_ACTION:CommonUtil.getApiEndPointPath() + 'ProjectBidDetail/bidAction',

  // closeout package Request
  GET_CLOSEOUT: CommonUtil.getApiEndPointPath() + 'closeOutPackageRequest',
  ADD_SUBMIT_REQUEST: CommonUtil.getApiEndPointPath() + 'closeOutPackageRequest/submitRequest',
  DOWNLOAD_CLOSEOUT_DOCUMENTS: CommonUtil.getApiEndPointPath() + 'closeOutPackageRequestAttachment/downloadDocument/',
  GET_CLOSEOUT_ATTACHMENT: CommonUtil.getApiEndPointPath() + 'closeOutPackageRequestAttachment',
  SAVE_EDIT_CLOSEOUT_ATTACHMENTS: CommonUtil.getApiEndPointPath() + 'closeOutPackageRequest/saveAttachment',
  DELETE_CLOSEOUT_ATTACHMENT: CommonUtil.getApiEndPointPath() + 'closeOutPackageRequestAttachment/delete/',
  APPROVE_CLOSEOUT: CommonUtil.getApiEndPointPath() + 'closeOutPackageRequest/approveRequest',
  REJECT_CLOSEOUT: CommonUtil.getApiEndPointPath() + 'closeOutPackageRequest/rejectRequest',
  GET_REJECT_CLOSEOUT_REASON: CommonUtil.getApiEndPointPath() + 'closeOutPackageRequestRejectReason',
  DOWNLOAD_SUBCONTRACTOR_INVOICE: CommonUtil.getApiEndPointPath() + 'closeOutPackageRequest/downloadInvoice',

  // dashboard
  SUBCONTRACTOR_DASHBOARD_DETAIL: CommonUtil.getApiEndPointPath() + 'dashboard/subcontractorDashboard/',
  WORKER_DASHBOARD_DETAIL: CommonUtil.getApiEndPointPath() + 'dashboard/workerDashboard/',
  DASHBOARD_REVENUE: CommonUtil.getApiEndPointPath() + 'dashboard/dashboardRevenueforAdmin',
  DASHBOARD_CHART_DETAIL_PROJECT_JOB_JOBSITE: CommonUtil.getApiEndPointPath() + 'dashboard/admin/data',
  CLIENT_DASHBOARD_CHART_DETAIL_PROJECT_JOB_JOBSITE: CommonUtil.getApiEndPointPath() + 'dashboard/client/data/',
  CLIENT_DASHBOARD_CHART_DETAIL_CLOSEOUT: CommonUtil.getApiEndPointPath() + 'dashboard/client/closeout/',

  // invoices
  GET_INVOICES: CommonUtil.getApiEndPointPath() + 'invoice',

  // manage references
  GET_REFERENCES_FOR_WORKER: CommonUtil.getApiEndPointPath() + 'workerReference',
  APPROVE_REFERENCE: CommonUtil.getApiEndPointPath() + 'workerReference/approve',
  REJECT_REFERENCE: CommonUtil.getApiEndPointPath() + 'workerReference/reject',
  GET_REFERENCES_FOR_SUBCONTRACOR: CommonUtil.getApiEndPointPath() + 'subContractorReference',
  APPROVE_SUBCONTRACTOR_REFERENCE: CommonUtil.getApiEndPointPath() + 'subContractorReference/approve',
  REJECT_SUBCONTRACTOR_REFERENCE: CommonUtil.getApiEndPointPath() + 'subContractorReference/reject',
  UPDATE_COMMENT_SUBCONTRACTOR: CommonUtil.getApiEndPointPath() + 'subContractorReference/updateComment',
  UPDATE_COMMENT_WORKER: CommonUtil.getApiEndPointPath() + 'workerReference/updateComment',
  GET_SUBCONTRACTOR_REFERENCE_DETAIL: CommonUtil.getApiEndPointPath() + 'subContractorReference/findById/',
  GET_WORKER_REFERENCE_DETAIL: CommonUtil.getApiEndPointPath() + 'workerReference/findById/',

  // margin
  UPDATE_MARGIN: CommonUtil.getApiEndPointPath() + 'subContractorProfile/updateMargin',
  UPDATE_RIPLING_ID: CommonUtil.getApiEndPointPath() + 'subContractorProfile/updateRipplingId',

  UPDATE_RIPPLING_TSHEET_ID_FOR_WORKER: CommonUtil.getApiEndPointPath() + 'workerProfile/updateRipplingAndTsheetId',
  GET_MARGIN_DATA_FOR_PROJECT: CommonUtil.getApiEndPointPath() + 'ProjectBidDetail/getMarginDataForProjectAndJobsite/',
  UPDATE_PROJECT_MARGIN: CommonUtil.getApiEndPointPath() + 'ProjectBidDetail/postMarginDataForProjectAndJobsite',

  // approve-reject EMR
  APPROVE_EMR: CommonUtil.getApiEndPointPath() + 'subContractorEMR/approve',
  REJECT_EMR: CommonUtil.getApiEndPointPath() + 'subContractorEMR/reject',
  CLEAR_EMR: CommonUtil.getApiEndPointPath() + 'subContractorEMR/clearStatus/',

  // approve-reject OSHA
  APPROVE_OSHA: CommonUtil.getApiEndPointPath() + 'subContractorOSHA/approve',
  REJECT_OSHA: CommonUtil.getApiEndPointPath() + 'subContractorOSHA/reject',
  CLEAR_OSHA: CommonUtil.getApiEndPointPath() + 'subContractorOSHA/clearStatus/',

  // approve-reject COI
  APPROVE_COI: CommonUtil.getApiEndPointPath() + 'subContractorCOI/approve',
  REJECT_COI: CommonUtil.getApiEndPointPath() + 'subContractorCOI/reject',
  CLEAR_COI: CommonUtil.getApiEndPointPath() + 'subContractorCOI/clearStatus/',

  // Approve Client
  GET_APPROVE_CLIENT: CommonUtil.getApiEndPointPath() + 'approveClientDetail',
  ADD_APPROVE_CLIENT: CommonUtil.getApiEndPointPath() + 'approveClientDetail',
  UPDATE_APPROVE_CLIENT: CommonUtil.getApiEndPointPath() + 'approveClientDetail',
  GET_APPROVE_CLIENT_BY_CLIENT_ID: CommonUtil.getApiEndPointPath() + 'approveClientDetail/getByClientId/',
  DELETE_APPROVE_CLIENT_ATTACHMENT: CommonUtil.getApiEndPointPath() + 'approveClientAttachments/delete/',
  GET_APPROVE_CLIENT_ATTACHMENT: CommonUtil.getApiEndPointPath() + 'approveClientAttachments',
  DOWNLOAD_APPROVE_CLIENT_ATTACHMENTS: CommonUtil.getApiEndPointPath() + 'approveClientAttachments/downloadDocument/',

  // export to excel Invoice
  EXPORT_TO_EXCEL_INVOICE: CommonUtil.getApiEndPointPath() + 'invoice/exportToExcel',

  // Update Invoice Status
  UPDATE_INVOICE_STATUS: CommonUtil.getApiEndPointPath() + 'invoice/updateStatus',

  // for job margin
  GET_DATA_FOR_JOB_MARGIN: CommonUtil.getApiEndPointPath() + 'JobDetail/getDataForJobMargin/',
  UPDATE_DATA_FOR_JOB_MARGIN: CommonUtil.getApiEndPointPath() + 'JobDetail/updatePayRate',


  // jobRateCard
  GENERATE_JOB_RATE_CARD: CommonUtil.getApiEndPointPath() + 'jobRateCard',
  GET_JOB_RATE_CARD: CommonUtil.getApiEndPointPath() + 'jobRateCard',
  ENABLE_JOB_RATE_CARD: CommonUtil.getApiEndPointPath() + 'jobRateCard/enable',
  DISABLE_JOB_RATE_CARD: CommonUtil.getApiEndPointPath() + 'jobRateCard/disable',
  BULK_UPLOAD_JOB_RATE_CARD: CommonUtil.getApiEndPointPath() + 'jobRateCard/uploadExcel',
  GET_JOB_RATE_CARD_CONFIGURATION: CommonUtil.getApiEndPointPath() + 'jobRateCardConfiguration',

  // Login History
  GET_LOGIN_HISTORY: CommonUtil.getApiEndPointPath() + 'loginHistory',
  GET_LAST_LOGIN_DETAIL: CommonUtil.getApiEndPointPath() + 'loginHistory/getLastLoggedInUserDate/',
  EXPORT_TO_EXCEL_FOR_LOGIN_HISTORY: CommonUtil.getApiEndPointPath() + 'loginHistory/exportToExcel',

  // filter Reference
  GET_ALL_SUB_CONTRACTOR_REFERENCE_NAME: CommonUtil.getApiEndPointPath() + 'filterData/getAllSubContractorReferenceName',
  GET_ALL_WORKER_REFERENCE_NAME: CommonUtil.getApiEndPointPath() + 'filterData/getAllWOrkerReferenceName',

  // timesheet
  GET_TIMESHEET: CommonUtil.getApiEndPointPath() + 'timeSheet',
  GET_PENDING_TIMESHEET_BY_CLIENT_ID: CommonUtil.getApiEndPointPath() + 'timeSheet/getPendingTimesheetByClientId/',
  APPROVE_TIMESHEET: CommonUtil.getApiEndPointPath() + 'timeSheet/approveRequest',
  REJECT_TIMESHEET: CommonUtil.getApiEndPointPath() + 'timeSheet/rejectRequest',
  GET_PENDING_AND_APPROVED_TIMESHEET_BY_WORKER_ID: CommonUtil.getApiEndPointPath() + 'timeSheet/getPendingAndApprovedTimesheetByWorker/',
  DOWNLOAD_WORKER_INVOICE: CommonUtil.getApiEndPointPath() + 'timeSheet/downloadInvoice',

  // file multiple upload
  UPLOAD_MULTIPLE_FILE: CommonUtil.getApiEndPointPath() + 'file/uploadMultipleFile',

  GET_JOB_TITLE_FOR_CLIENT_WITHOUT_CANCEL_AND_COMPLETED_AND_DRAFT: CommonUtil.getApiEndPointPath() + 'filterData/getJobTitleForClientWithoutCancelledAndDraft',
  GET_SUBCONTRACTOR_NAME_FOR_PENDING_CERTIFICATES_FOR_ADMIN: CommonUtil.getApiEndPointPath() + 'filterData/getSubcontractorNameForPendingCertificatesForAdmin',
  GET_WORKER_FOR_PENDING_CERTIFICATE_BY_ADMIN: CommonUtil.getApiEndPointPath() + 'filterData/getWorkerNameForPendingCerificatesForAdmin',
  GET_CONTACT_NAME_FOR_PENDING_APPROVAL_BY_ADMIN: CommonUtil.getApiEndPointPath() + 'filterData/getAllClientContactNameForPendingApprovalForAdmin',
  GET_SUBCONTRACTOR_NAME_FOR_DUE_INVOICES_FOR_ADMIN: CommonUtil.getApiEndPointPath() + 'filterData/getSubcontractorNameForDueInvoicesForAdmin',
  GET_WORKER_NAME_FOR_DUE_INVOICES_FOR_ADMIN: CommonUtil.getApiEndPointPath() + 'filterData/getWorkerNameForDueInvoicesForAdmin',

  GET_PROJECT_TITLES_FOR_ADMIN_FOR_SET_MARGIN: CommonUtil.getApiEndPointPath() + 'filterData/getProjectTitleForAdminForSetMargin',
  GET_JOB_TITLES_FOR_ADMIN_FOR_SET_MARGIN: CommonUtil.getApiEndPointPath() + 'filterData/getJobTitleForAdminForSetMargin',
  GET_JOB_TITLES_FOR_ADMIN_FOR_TIMESHEET: CommonUtil.getApiEndPointPath() + 'filterData/getJobTitleForAdminForTimesheet',

  GET_USER_BY_ID: CommonUtil.getApiEndPointPath() + 'user/findById/',

  GET_ALL_CUSTOM_COMPANY: CommonUtil.getApiEndPointPath() + 'company/getAllCustomCompany',

  GET_ALL_INDUSTRY_FOR_CLIENT: CommonUtil.getApiEndPointPath() + 'filterData/getAllIndustryForClientByName',

  GET_ALL_COMPANY_NAME_FOR_CLIENT: CommonUtil.getApiEndPointPath() + 'filterData/getAllCompanyNameForClient',

  GET_USER_COUNT_BY_ROLES: CommonUtil.getApiEndPointPath() + 'user/adminUsers',

  // Worker Gamification
  GET_WORKER_GAMIFICATION: CommonUtil.getApiEndPointPath() + 'gamificationWorkerConfiguration',
  ADD_WORKER_GAMIFICATION: CommonUtil.getApiEndPointPath() + 'gamificationWorkerConfiguration',
  UPDATE_WORKER_GAMIFICATION: CommonUtil.getApiEndPointPath() + 'gamificationWorkerConfiguration',

  // Subcontractor  Gamification
  GET_SUBCONTRACTOR_GAMIFICATION: CommonUtil.getApiEndPointPath() + 'gamificationSubcontractorConfiguration',
  ADD_SUBCONTRACTOR_GAMIFICATION: CommonUtil.getApiEndPointPath() + 'gamificationSubcontractorConfiguration',
  UPDATE_SUBCONTRACTOR_GAMIFICATION: CommonUtil.getApiEndPointPath() + 'gamificationSubcontractorConfiguration',

  // Client Gamification
  GET_CLIENT_GAMIFICATION: CommonUtil.getApiEndPointPath() + 'gamificationClientConfiguration',
  ADD_CLIENT_GAMIFICATION: CommonUtil.getApiEndPointPath() + 'gamificationClientConfiguration',
  UPDATE_CLIENT_GAMIFICATION: CommonUtil.getApiEndPointPath() + 'gamificationClientConfiguration',

  // Toggle Gamification
  TOGGLE_GAMIFICATION: CommonUtil.getApiEndPointPath() + 'gamificationUrl/toggle/',
  GET_GAMIFICATION_TOGGLE: CommonUtil.getApiEndPointPath() + 'gamificationUrl/getGamificationToggle',

  // leaderboard
  GET_LEADERBOARD: CommonUtil.getApiEndPointPath() + 'leaderBoardUrl',
  GET_TOP_TEN_ALL_TIME_USERS: CommonUtil.getApiEndPointPath() + 'leaderBoardUrl/getAllTimeTopTenUsers/',

  // cumulative points of logged in user
  GET_CUMULATIVE_POINTS_OF_LOGGEDIN_USERS: CommonUtil.getApiEndPointPath() + 'leaderBoardUrl/getPointsByUserId/',
  // get custom job list as per match making
  GET_JOB_DETAIL_CUSTOM: CommonUtil.getApiEndPointPath() + 'JobDetail/getJobDetailCustom',

  GET_SUBCONTRACTOR_FOR_ADMIN_PROJECT_INVOICE: CommonUtil.getApiEndPointPath() + 'filterData/getSubcontractorByNameForAdminProjectInvoice',
  GET_WORKER_FOR_ADMIN_JOB_INVOICE: CommonUtil.getApiEndPointPath() + 'filterData/getWorkerByNameForAdminJobInvoice',
  GET_SUBCONTRACTOR_FOR_ADMIN_CLOSE_OUT_PACKAGE: CommonUtil.getApiEndPointPath() + 'filterData/getSubcontractorByNameForAdminCloseOutPackage'

};

