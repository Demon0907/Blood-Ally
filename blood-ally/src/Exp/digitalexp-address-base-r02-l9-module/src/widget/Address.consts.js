const DISPLAY_MODE = {
    VIEW: 'View',
    NEW: 'New',
    EDIT: 'Edit',
    NONE: 'None',
    NEW_INSTALLATION_ADDRESS: 'NewInstallationAddress',
    EDIT_INSTALLATION_ADDRESS: 'EditInstallationAddress',
    VIEW_INSTALLATION_ADDRESS: 'ViewInstallationAddress',
    SERVICEABILITY: 'Serviceability'
};

const MODAL_DISPLAY_MODE = {
    SINGLE_ADDRESS: 'SINGLE',
    MULTIPLE_ADDRESS: 'MULTIPLE',
    NO_ADDRESS: 'NONE',
    ENTER_MANUAL_ADDRESS: 'ENTER_MANUAL_ADDRESS',
    MANUAL_VERIFICATION_FAILED: 'MANUAL_VERIFICATION_FAILED',
    SHOW_CTC: 'SHOW_CTC'
};

const ADDRESS_STATUS = {
    VALID: 'valid',               // Same address is found in system (SOLR or External).
    VALIDAMENDED: 'validAmended', // Not same but similar address is not found in system (SOLR or External).
    INVALID: 'invalid',           // No same or matching address is not found in system (SOLR or External).
    UNVALIDATED: 'unvalidated',   // Not applicable for validate.
    OBSOLETE: 'obsolete'          // Not applicable for validate.
};

const GeneralMessageConfiguration = {
    category: 'BUSINESS',
    MISSING_MANDATORY: 'MISSING_MANDATORY',
    FORMAT_VALIDATION: 'FORMAT_VALIDATION'
};

const TagManagement = {
    ADDRESS_POPUP_SUGGEST_SECONDARY_PAGE: 'Personal information:Contact and address:Address suggest',
    ADDRESS_POPUP_SELECT_SECONDARY_PAGE: 'Personal information:Contact and address:Address select',
    INSERT_MANUAL_ADDRESS: 'Privati:Coverage Tool:Insert Address',
    INSERT_MANUAL_ADDRESS_ERROR: 'Privati:Coverage Tool:Insert Address:Error',
    PAGE_ERROR: 'page_error',
    ERROR_TO_TAG: 'Siamo spiacenti,ci servono maggiori informazioni per verificare la tua copertura',
    ATTRIBUTE_PAGE_ERROR: 'pageError'
};

const AddressComponents = {
    POSTAL_CODE: 'postal_code',
    CITY: 'administrative_area_level_3',
    CITY_LOCALITY: 'locality',
    STATE_PROVINCE: 'administrative_area_level_2',
    STREET: 'route',
    STREET_NUMBER: 'street_number'
};

const TRANSFER_NUMBER_RADIO_VALUE = {
    YES: 'transfer',
    NO: 'do_not_transfer'
};

const PAGE_NAME = {
    ORDER_SUMMARY: 'OrderSummary'
};

const DATA_STORE = {
    ADDRESS_MODULE_SERVICEABILITY_MODE: 'addressModuleServiceabilityMode',
    SERVICEABILITY_POP_UP_VISIBILITY: 'serviceabilityPopUpVisibility',
    SERVICEABILITY_FIRST_TIME_BANNER_EXISTED: 'serviceabilityFirstTimeBannerExisted',
    INSTALLATION_POP_UP_VISIBILITY: 'installationAddressPopUpVisibility',
    INSTALLATION_ADDRESS_EDIT_MODE: 'installationAddressEditMode'
};

const SCREEN_SIZE = {
    TABLET: 'TABLET',
    MOBILE: 'MOBILE'
};

const MANUAL_MODALS_TAGGING_PAGES = {
    VALIDATION_MODAL: 'Privati:Shop:Personal information:Contact information:Address validation',
    DELIVERY_VALIDATION_MODAL: 'Privati:Shop:Shipping:Modify:Address validation',
    MODIFY_MODAL: 'Privati:Shop:Shipping:Modify'
};

const MANUAL_MODALS_TAGGING_ACTIONS = {
    CLOSE: ':Close',
    UPDATE: ':Update'
};

export {
    DISPLAY_MODE, // eslint-disable-line import/prefer-default-export
    MODAL_DISPLAY_MODE,
    ADDRESS_STATUS,
    GeneralMessageConfiguration,
    TagManagement,
    AddressComponents,
    TRANSFER_NUMBER_RADIO_VALUE,
    PAGE_NAME,
    DATA_STORE,
    SCREEN_SIZE,
    MANUAL_MODALS_TAGGING_PAGES,
    MANUAL_MODALS_TAGGING_ACTIONS
};
