import {connect} from 'react-redux';
import sdk from 'digitalexp-light-sdk-l9';
import GlobalErrorApi from 'digitalexp-global-error-api-l9';
import LoaderApi from 'digitalexp-loader-api-l9';
import AddressManagementApi from 'digitalexp-address-management-api-l9';
import TagManagementApi from 'digitalexp-tag-management-api-l9';
import OfferingServiceabilityApi from 'digitalexp-offering-serviceability-api';
import CategoryApi from 'digitalexp-category-api';
import ScreenSizeApi from 'digitalexp-screen-size-api-l9';
import CustomerApi from 'digitalexp-customer-api';
import CustomerProfileApi from 'digitalexp-customer-profile-api'; 
import CartApi from 'digitalexp-cart-api';
import DataStoreApi from 'digitalexp-datastore-api';
import BundleCartItemApi from 'digitalexp-bundle-cart-item-api';
import ServicabilityApi from 'digitalexp-servicability-api-l9';
import DecoratedComponent from './Address';
import {DATA_STORE, PAGE_NAME, TagManagement, TRANSFER_NUMBER_RADIO_VALUE, MANUAL_MODALS_TAGGING_PAGES} from './Address.consts';


const {getApiInstance} = sdk.getInstance();
const globalErrorApi = getApiInstance(GlobalErrorApi);
const loaderApi = getApiInstance(LoaderApi);
const servicabilityApi = getApiInstance(ServicabilityApi);
const addressManagementApi = getApiInstance(AddressManagementApi);
const tagManagementApi = getApiInstance(TagManagementApi);
const offeringServiceabilityApi = getApiInstance(OfferingServiceabilityApi);
const categoryApi = getApiInstance(CategoryApi);
const customerProfileApi = getApiInstance(CustomerProfileApi);
const customerApi = getApiInstance(CustomerApi);
const cartApi = getApiInstance(CartApi);
const screenSizeApi = getApiInstance(ScreenSizeApi);
const dataStoreApi = getApiInstance(DataStoreApi);
const bundleCartItemApi = getApiInstance(BundleCartItemApi);

const {errorDecorator} = globalErrorApi;
const {loaderDecorator} = loaderApi;

const OUTCOMES = {
    ON_CHANGE_ADDRESS_BTN_CLICK: 'ON_CHANGE_ADDRESS_BTN_CLICK',
    NAVIGATE_ON_CREATE_ADDRESS_SUCCESS: 'NAVIGATE_ON_CREATE_ADDRESS_SUCCESS',
    ON_CART_CLICK: 'ON_CART_CLICK',
    EDIT_INSTALLATION_ADDRESS: 'EDIT_INSTALLATION_ADDRESS',
    INSTALLATION_ADDRESS_EDIT_COMPLETE: 'INSTALLATION_ADDRESS_EDIT_COMPLETE'
};

export const mapStateToProps = (state, ownProps) => {
    const addressManagmentApiInstance = addressManagementApi.getInstance(ownProps.instanceId);
    const currentOfferingType = categoryApi.getOfferingTypeOfCategoryId();
    let addressData = '';
    if (ownProps.addressDetails) {
        addressData = ownProps.addressDetails;
    } else {
        addressData = addressManagmentApiInstance.getAddress() !== undefined
        ? addressManagmentApiInstance.getAddress() : ownProps.servicabilityAddress;
    }
    return {
        countries: addressManagmentApiInstance.selectors.countriesSelector(state),
        states: addressManagmentApiInstance.selectors.statesSelector(state),
        addressSuggestions: addressManagmentApiInstance.selectors.autoCompleteAddressSelector(state),
        validatedAddress: addressManagmentApiInstance.selectors.validateAddressSelector(state),
        serviceableAddress: offeringServiceabilityApi.getServiceabilityAddress(),
        currentCategoryId: (ownProps && ownProps.categoryId) || categoryApi.getCategoryId(),
        serviceabilityStatus: offeringServiceabilityApi.getServiceabilityCheckStatus(),
        screenMode: screenSizeApi.getScreenMode(),
        // gets serviceable offer of current category id
        serviceableOffers: offeringServiceabilityApi.getServiceableOffersByOfferingType(currentOfferingType),
        installationId: cartApi.getCartInstallationAddressId(),
        offeringServiceabilityId: offeringServiceabilityApi.getOfferingServiceabilityId(),
        cartOfferingServiceabilityId: cartApi.getOfferingServiceabilityId(),
        cartId: cartApi.getCartId(),
        getOwningIndividualAddress: customerProfileApi.getOwningIndividualPhysicalAddress(),
        serviceabilityPopUpVisibility: dataStoreApi.get(DATA_STORE.SERVICEABILITY_POP_UP_VISIBILITY),
        selectedOffering: bundleCartItemApi.getSelectedOffering(),
        currentOfferingType,
        installationAddressPopUpVisibility: dataStoreApi.get(DATA_STORE.INSTALLATION_POP_UP_VISIBILITY),
        installationAddressEditMode: dataStoreApi.get(DATA_STORE.INSTALLATION_ADDRESS_EDIT_MODE),
        serviceabilityViewData:
            dataStoreApi.get(DATA_STORE.ADDRESS_MODULE_SERVICEABILITY_MODE),
        citiesList: addressManagmentApiInstance.getCity(),
        address: addressData
    };
};

export const mapDispatchToProps = (dispatch, ownProps) => {
    const addressManagmentApiInstance = addressManagementApi.getInstance(ownProps.instanceId);
    const dispatchAction = (type, payload) => {
        dispatch({type, payload});
    };
    const tagVerifiedAddress = (address, transferDetails) => {
        const {
            streetNumber,
            street,
            city,
            postalCode,
            stateOrProvince: province,
            displayCountry
        } = address;
        const {toBeTransferred} = transferDetails;
        const formattedAddress = [streetNumber, street, city, displayCountry].join(' ');
        const attributes = {
            address: formattedAddress,
            province,
            postalCode,
            userSegment: 'Prospect',
            userActivationType: (toBeTransferred === TRANSFER_NUMBER_RADIO_VALUE.YES) ? 'GNP' : 'GA'
        };
        tagManagementApi.setComponent(TagManagement.COVERAGE_TOOL_SECONDARY_PAGE, attributes);
    };
    return {
        loadStates: (countryId) => {
            return addressManagmentApiInstance.loadStates(countryId);
        },
        validateAddressWithoutLoader: (addressEntity) => {
            return addressManagmentApiInstance.validateAddress(addressEntity);
        },
        loadAddressDetails: (addressId) => {
            return addressManagmentApiInstance.loadAddressDetails(addressId);
        },
        setAddressDetails: (address) => {
            addressManagmentApiInstance.setAddressDetails(address);
        },
        onChangeClick: () => {
            dispatchAction(OUTCOMES.ON_CHANGE_ADDRESS_BTN_CLICK);
        },
        updateAddress: (addressEntity) => {
            return addressManagmentApiInstance.updateAddress(addressEntity);
        },
        finishInstallationAddressEdit: () => {
            dispatchAction(OUTCOMES.INSTALLATION_ADDRESS_EDIT_COMPLETE);
        },
        deleteInstallationAddressEditModeKey: () => {
            dataStoreApi.remove(DATA_STORE.INSTALLATION_ADDRESS_EDIT_MODE);
        },
        onInstallationAddressEditClick: (widgetName) => {
            if (widgetName === PAGE_NAME.ORDER_SUMMARY) {
                dataStoreApi.set(DATA_STORE.INSTALLATION_ADDRESS_EDIT_MODE, true);
                dispatchAction(OUTCOMES.EDIT_INSTALLATION_ADDRESS);
            }
        },
        onCartClick: () => {
            dispatchAction(OUTCOMES.ON_CART_CLICK);
        },
        getServiceabilityForCategory: (categoryId) => {
            return categoryApi.getServiceabilityForCategory(categoryId);
        },
        checkOfferingServiceability: async (addressEntity) => {
            return offeringServiceabilityApi.checkOfferingServiceability(addressEntity);
        },
        retreiveOfferingServiceability: (offeringServiceabilityId) => {
            return offeringServiceabilityApi.retreiveOfferingServiceability(offeringServiceabilityId);
        },
        getOwningIndividualPhysicalAddress: async () => {
            const owningIndividualPhysicalAddress = customerProfileApi.getOwningIndividualPhysicalAddress();
            const customerId = customerApi.getCustomerId();
            if (!owningIndividualPhysicalAddress && customerId) {
                await customerProfileApi.loadCustomerWithIndividuals({customerId});
                return customerProfileApi.getOwningIndividualPhysicalAddress();
            }
            return owningIndividualPhysicalAddress;
        },
        setServiceabilityCheckStatus: (status) => {
            offeringServiceabilityApi.setServiceabilityCheckStatus(status);
        },
        loadCart: (cartId) => {
            cartApi.loadCart(cartId);
        },
        initializeDataStore: (key, data) => {
            dataStoreApi.set(key, data);
        },
        resetSelectedOffering: () => {
            bundleCartItemApi.setSelectedOffering({});
        },

        @errorDecorator
        @loaderDecorator
        loadCountries: () => {
            return addressManagmentApiInstance.loadCountries();
        },
        @errorDecorator
        @loaderDecorator
        loadCity: (reqParam) => {
            return addressManagmentApiInstance.loadCity(reqParam);
        },
        @loaderDecorator
        createAddress: (addressEntity) => {
            return addressManagmentApiInstance.createAddress(addressEntity);
        },
        @loaderDecorator
        @errorDecorator
        validateAddress: (addressEntity) => {
            return addressManagmentApiInstance.validateAddress(addressEntity);
        },
        @loaderDecorator
        reverseGeolocation: (coords, geocodingKey, reverseGeocodeAdditionalParams) => {
            return addressManagmentApiInstance.reverseGeolocation(coords, geocodingKey, reverseGeocodeAdditionalParams);
        },
        @loaderDecorator
        getGeolocationAddress: (coords, geocodingKey, reverseGeocodeAdditionalParams) => {
            return addressManagmentApiInstance.getGeolocationAddress(coords, geocodingKey,
                reverseGeocodeAdditionalParams);
        },
        onAddressSuggestPopupPageTagging: () => { 
            tagManagementApi.setCustomLink(TagManagement.ADDRESS_POPUP_SUGGEST_SECONDARY_PAGE);
            tagManagementApi.tag(tagManagementApi.tagTypes.LINK);
        },
        onAddressSelectPopupPageTagging: () => { 
            tagManagementApi.setCustomLink(TagManagement.ADDRESS_POPUP_SELECT_SECONDARY_PAGE); 
            tagManagementApi.tag(tagManagementApi.tagTypes.LINK);
        },
        createGoogleClient: () => {
            addressManagementApi.createGoogleClient();
        },
        getPlacesPredictions: (input) => {
            return addressManagementApi.getPlacesPredictions(input);
        },
        getPlaceDetails: (placeid) => {
            return addressManagementApi.getPlaceDetails(placeid);
        },
        getAddressDetailsReverseGeocode: (lat, lag) => {
            return addressManagementApi.getAddressDetailsReverseGeocode(lat, lag);
        },
        taggingManualInsertForm: () => {
            tagManagementApi.setPageName(tagManagementApi.paths.PAGENAME, 
                undefined, TagManagement.INSERT_MANUAL_ADDRESS, true);
            tagManagementApi.tag(tagManagementApi.tagTypes.VIEW);
        },
        taggingErrorManualForm: () => {
            tagManagementApi.setPageName(tagManagementApi.paths.PAGENAME, 
                undefined, TagManagement.INSERT_MANUAL_ADDRESS_ERROR, true);
            tagManagementApi.setPageAttribute(TagManagement.ATTRIBUTE_PAGE_ERROR, 
                TagManagement.ERROR_TO_TAG);
            tagManagementApi.setEvent(TagManagement.PAGE_ERROR, 
                tagManagementApi.eventCategories.ERROR, true);
            tagManagementApi.tag(tagManagementApi.tagTypes.VIEW);
        },
        taggingValidationModalPageName: (pageName) => {
            tagManagementApi.setPageName(tagManagementApi.paths.PAGENAME, undefined, pageName);
            tagManagementApi.tag(tagManagementApi.tagTypes.VIEW);
            cartApi.setDataInContext(window.digitalData);
        },
        taggingValidationModalCustomLink: (customLink) => {
            tagManagementApi.setData(tagManagementApi.paths.CUSTOM_LINK, customLink);
            tagManagementApi.tag(tagManagementApi.tagTypes.VIEW);
            cartApi.setDataInContext(window.digitalData);
        },
        @errorDecorator
        @loaderDecorator
        verifyAvailability: (address, transferDetails = {}) => {
            tagVerifiedAddress(address, transferDetails);
            tagManagementApi.setData(tagManagementApi.paths.PRODUCT, []);
            tagManagementApi.resetTagCount();
            const {toBeTransferred} = transferDetails;
            const portInData = {
                portInInfo: (toBeTransferred === TRANSFER_NUMBER_RADIO_VALUE.YES) ? 'GNP' : 'GA'
            };
            tagManagementApi.setMappedData(
                tagManagementApi.paths.CART,
                tagManagementApi.mappers.portInData2transaction,
                portInData
            );
            return servicabilityApi.fetchServicability(address);
        }
    };
};

const ConnectedLoaderWidget = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {withRef: true}
)(DecoratedComponent);

export default ConnectedLoaderWidget;
