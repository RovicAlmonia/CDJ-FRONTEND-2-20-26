import * as actionTypes from "./actions";

const getBorderRadiusFromLocalStorage = () => {
  const storedBorderRadius = localStorage.getItem("borderRadius");
  return storedBorderRadius ? parseInt(storedBorderRadius, 10) : 4;
};

export const initialState = {
  isOpen: [],
  defaultId: "default",
  borderRadius: getBorderRadiusFromLocalStorage(),
  opened: false,
  openNotif: false,
  openSidebarMobile: false,

  //Batching Module
  openBatchingDar: false,
  colorBatchingDar: false,
  openManagement: false,
  openManagementHR201: false,
  openManagementPayroll: false,
  openManagementLeaves: false,
  openManagementSavings: false,
  openManagement13Pay: false,
  openManagementAdministrative: false,
  openManagementTest: false,
  openManagementReports: false,

  // masterfile
  openAddEmployeeModal: false,
  openEmployeerateDeductions: false,
  openEducation: false,
  openTrainingsSeminars: false,
  openSeminarList: false,
  openBranchList: false,
  openTrainingsSeminarsSearch: false,
  openAffilliation: false,
  openLicenses: false,
  openFamilySiblings: false,
  openPreemploymentRequirements: false,
  openPreemploymentRequirementsModal: false,
  openWorkExperience: false,
  openViolationsSanctions: false,
  openPhysicalExam: false,
  openEmpDTR: false,
  openLoanLedger: false,
  openEmployeeStatus: false,
  openEmployeeStatusHistory: false,
  openAddLoan: false,

  // empData
  empData: {},
  dtrData: {},
  payrollData: {},
  loanData: {},
  bloodData: {},
  selectedSeminar: null,
  selectedCompany: null,
  openOTModal: false,
  openODModal: false,
  openBPModal: false,
  openSCAPModal: false,
  openPLModal: false,
  openULModal: false,
  openOOSModal: false,
  OTInfo: {},
  ODInfo: {},
  BPInfo: {},
  SCAPInfo: {},
  PLInfo: {},
  ULInfo: {},
  OOSInfo: {},

  // common
  openPayrollData: false,
  openSavings: false,
  openInsurance: false,
  confirmDelete: false,
  confirmDelete2: false,
  swalConfirmation: false,
  isUpdateForm: false,
  isCreateForm: false,
  isUpdateHeaderForm: false,
  openDarReport: false,
  openImportData: false,
  openBatchingDar: false,
  openConfirm: false,
  openDisapprove: false,
  transferData: {},
  empID: "",

  openUploadDocs: false,
  openDocumentType: false,
};

const customizationReducer = (state = initialState, action) => {
  let id;
  switch (action.type) {
    case actionTypes.MENU_OPEN:
      id = action.id;
      return {
        ...state,
        isOpen: [id],
      };

    case actionTypes.SET_MENU:
      return {
        ...state,
        opened: action.opened,
      };
    case actionTypes.OPEN_SAVINGS:
      return {
        ...state,
        openSavings: action.openSavings,
      };
    case actionTypes.OPEN_UPLOAD_DOCS:
      return {
        ...state,
        openUploadDocs: action.openUploadDocs,
      };
    case actionTypes.OPEN_DOCUMENT_TYPE:
      return {
        ...state,
        openDocumentType: action.openDocumentType,
      };
    case actionTypes.OPEN_INSURANCE:
      return {
        ...state,
        openInsurance: action.openInsurance,
      };

    case actionTypes.OPEN_OT_MODAL:
      return {
        ...state,
        openOTModal: action.openOTModal,
      };
    case actionTypes.OPEN_OD_MODAL:
      return {
        ...state,
        openODModal: action.openODModal,
      };
    case actionTypes.OPEN_BP_MODAL:
      return {
        ...state,
        openBPModal: action.openBPModal,
      };
    case actionTypes.OPEN_SCAP_MODAL:
      return {
        ...state,
        openSCAPModal: action.openSCAPModal,
      };
    case actionTypes.OPEN_PL_MODAL:
      return {
        ...state,
        openPLModal: action.openPLModal,
      };
    case actionTypes.OPEN_UL_MODAL:
      return {
        ...state,
        openULModal: action.openULModal,
      };
    case actionTypes.OPEN_OOS_MODAL:
      return {
        ...state,
        openOOSModal: action.openOOSModal,
      };
    case actionTypes.SET_OD_INFO:
      return {
        ...state,
        ODInfo: action.ODInfo,
      };
    case actionTypes.SET_BP_INFO:
      return {
        ...state,
        BPInfo: action.BPInfo,
      };
    case actionTypes.SET_SCAP_INFO:
      return {
        ...state,
        SCAPInfo: action.SCAPInfo,
      };
    case actionTypes.SET_PL_INFO:
      return {
        ...state,
        PLInfo: action.PLInfo,
      };
    case actionTypes.SET_UL_INFO:
      return {
        ...state,
        ULInfo: action.ULInfo,
      };
    case actionTypes.SET_OOS_INFO:
      return {
        ...state,
        OOSInfo: action.OOSInfo,
      };

    case actionTypes.SET_OT_INFO:
      return {
        ...state,
        OTInfo: action.OTInfo,
      };
    case actionTypes.OPEN_ADD_LOAN:
      return {
        ...state,
        openAddLoan: action.openAddLoan,
      };
    case actionTypes.OPEN_NOTIF:
      return {
        ...state,
        openNotif: action.openNotif,
      };
    case actionTypes.EMP_ID:
      return {
        ...state,
        empID: action.empID,
      };
    case actionTypes.OPEN_DISAPPROVE:
      return {
        ...state,
        openDisapprove: action.openDisapprove,
      };
    case actionTypes.TRANSFER_DATA:
      return {
        ...state,
        transferData: action.transferData,
      };
    case actionTypes.OPEN_SIDEBAR_MOBILE:
      return {
        ...state,
        openSidebarMobile: action.openSidebarMobile,
      };
    case actionTypes.OPEN_BATCHING_DAR:
      return {
        ...state,
        openBatchingDar: action.openBatchingDar,
      };
    case actionTypes.OPEN_DELETESWAL:
      return {
        ...state,
        confirmDelete: action.confirmDelete,
      };
    case actionTypes.PRE_REGISTER_DAR:
      return {
        ...state,
        openPreRegisterDar: action.openPreRegisterDar,
      };
    case actionTypes.SET_FONT_FAMILY:
      return {
        ...state,
        fontFamily: action.fontFamily,
      };
    case actionTypes.SET_BORDER_RADIUS:
      return {
        ...state,
        borderRadius: action.borderRadius,
      };
    case actionTypes.SET_SELECTED_SEMINAR:
      return {
        ...state,
        selectedSeminar: action.selectedSeminar,
      };
    case actionTypes.SET_SELECTED_COMPANY:
      return {
        ...state,
        selectedCompany: action.selectedCompany,
      };
    case actionTypes.SET_OPEN_NEWCASH_VOUCHER:
      return {
        ...state,
        openNewCashVoucher: action.openNewCashVoucher,
      };
    // FOR OPENING AND CLOSING COLLAPSE BUTTONS

    case actionTypes.OPEN_HR201_OPTIONS:
      return {
        ...state,
        openManagementHR201: action.openManagementHR201,
      };

    case actionTypes.OPEN_PAYROLL_OPTIONS:
      return {
        ...state,
        openManagementPayroll: action.openManagementPayroll,
      };

    case actionTypes.OPEN_LEAVES_OPTIONS:
      return {
        ...state,
        openManagementLeaves: action.openManagementLeaves,
      };

    case actionTypes.OPEN_SAVINGS_OPTIONS:
      return {
        ...state,
        openManagementSavings: action.openManagementSavings,
      };

    case actionTypes.OPEN_13PAY_OPTIONS:
      return {
        ...state,
        openManagement13Pay: action.openManagement13Pay,
      };

    case actionTypes.OPEN_ADMINISTRATIVE:
      return {
        ...state,
        openManagementAdministrative: action.openManagementAdministrative,
      };
    case actionTypes.OPEN_TEST:
      return {
        ...state,
        openManagementTest: action.openManagementTest,
      };
    case actionTypes.OPEN_REPORTS_OPTIONS:
      return {
        ...state,
        openManagementReports: action.openManagementReports,
      };

    case actionTypes.OPEN_EMP_LEDGER:
      return {
        ...state,
        openLoanLedger: action.openLoanLedger,
      };

    case actionTypes.OPEN_MANAGEMENT_OPTIONS:
      return {
        ...state,
        openManagement: action.openManagement,
      };
    case actionTypes.OPEN_EMPLOYEE_STATUS:
      return {
        ...state,
        openEmployeeStatus: action.openEmployeeStatus,
      };
    case actionTypes.OPEN_EMPLOYEE_STATUS_HISTORY:
      return {
        ...state,
        openEmployeeStatusHistory: action.openEmployeeStatusHistory,
      };

    // ENDS HERE

    //CHANGING COLLPASE BUTTON CCOLOR
    case actionTypes.COLOR_DAR_OPTIONS:
      return {
        ...state,
        colorBatchingDar: action.colorBatchingDar,
      };

    case actionTypes.OPEN_CONFIRM:
      return {
        ...state,
        openConfirm: action.openConfirm,
      };

    // ENDS HERE

    // MASTERFILE
    case actionTypes.OPEN_ADD_EMPLOYEE_MODAL:
      return {
        ...state,
        openAddEmployeeModal: action.openAddEmployeeModal,
      };

    case actionTypes.OPEN_EMPLOYEERATE_DEDUCTIONS:
      return {
        ...state,
        openEmployeerateDeductions: action.openEmployeerateDeductions,
      };

    case actionTypes.OPEN_EMP_DTR:
      return {
        ...state,
        openEmpDTR: action.openEmpDTR,
      };

    case actionTypes.OPEN_EDUCATION:
      return {
        ...state,
        openEducation: action.openEducation,
      };

    case actionTypes.OPEN_TRAININGS_SEMINARS:
      return {
        ...state,
        openTrainingsSeminars: action.openTrainingsSeminars,
      };
    case actionTypes.OPEN_TRAININGS_SEMINARS_SEARCH:
      return {
        ...state,
        openTrainingsSeminarsSearch: action.openTrainingsSeminarsSearch,
      };
    case actionTypes.OPEN_SEMINAR_LIST:
      return {
        ...state,
        openSeminarList: action.openSeminarList,
      };
    case actionTypes.OPEN_BRANCH_LIST:
      return {
        ...state,
        openBranchList: action.openBranchList,
      };
    case actionTypes.OPEN_AFFILLIATION:
      return {
        ...state,
        openAffilliation: action.openAffilliation,
      };

    case actionTypes.OPEN_LICENSES:
      return {
        ...state,
        openLicenses: action.openLicenses,
      };

    case actionTypes.OPEN_FAMILY_SIBLINGS:
      return {
        ...state,
        openFamilySiblings: action.openFamilySiblings,
      };

    case actionTypes.OPEN_PREEMPLOYMENT_REQUIREMENTS:
      return {
        ...state,
        openPreemploymentRequirements: action.openPreemploymentRequirements,
      };

    case actionTypes.OPEN_PREEMPLOYMENT_REQUIREMENTS_MODAL:
      return {
        ...state,
        openPreemploymentRequirementsModal:
          action.openPreemploymentRequirementsModal,
      };

    case actionTypes.OPEN_WORK_EXPERIENCE:
      return {
        ...state,
        openWorkExperience: action.openWorkExperience,
      };

    case actionTypes.OPEN_VIOLATIONS_SANCTIONS:
      return {
        ...state,
        openViolationsSanctions: action.openViolationsSanctions,
      };

    case actionTypes.OPEN_PHYSICAL_EXAM:
      return {
        ...state,
        openPhysicalExam: action.openPhysicalExam,
      };

    case actionTypes.OPEN_EMP_EDIT_MODAL:
      return {
        ...state,
        openEmpEditModal: action.openEmpEditModal,
      };
    case actionTypes.OPEN_PENDING_MODAL:
      return {
        ...state,
        openPendingModal: action.openPendingModal,
      };
    case actionTypes.OPEN_CREATE_BATCH:
      return {
        ...state,
        openCreateManualBatch: action.openCreateManualBatch,
      };
    case actionTypes.OPEN_ADD_PERSON:
      return {
        ...state,
        openAddPerson: action.openAddPerson,
      };
    case actionTypes.FORM_DATA:
      return {
        ...state,
        formData: action.formData,
      };
    case actionTypes.EMP_DATA:
      return {
        ...state,
        empData: action.empData,
      };
    case actionTypes.DTR_DATA:
      return {
        ...state,
        dtrData: action.dtrData,
      };
    case actionTypes.PAYROLL_DATA:
      return {
        ...state,
        payrollData: action.payrollData,
      };
    case actionTypes.LOAN_DATA:
      return {
        ...state,
        loanData: action.loanData,
      };
    case actionTypes.BLOOD_DATA:
      return {
        ...state,
        bloodData: action.empData,
      };
    case actionTypes.OPEN_CUSTOM_HEADER_MODAL:
      return {
        ...state,
        openCustomHeaderModal: action.openCustomHeaderModal,
      };
    case actionTypes.FORM_HEADER_DATA:
      return {
        ...state,
        formHeaderData: action.formHeaderData,
      };
    case actionTypes.OPEN_CUSTOM_SEARCH_MODAL:
      return {
        ...state,
        openCustomSearchModal: action.openCustomSearchModal,
      };
    case actionTypes.SEARCH_SELECTED_DATA:
      return {
        ...state,
        searchSelectedData: action.searchSelectedData,
      };
    case actionTypes.OPEN_PAYROLL_DATA:
      return {
        ...state,
        openPayrollData: action.openPayrollData,
      };

    // COMMON

    default:
      return state;
  }
};

export default customizationReducer;
