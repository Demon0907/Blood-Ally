import React, {Component} from 'react';
import _isEqual from 'lodash/isEqual';
import {DISPLAY_MODE} from './Address.consts';
import AddressMainView from './components/templates/Address.mainView';
import AddressProps from './Address.propsProvider';
import AddressFormatter from './utils/Address.formatter';

class AddressComponent extends Component {

    constructor(props) {
        super(props);
        this.componentProps = null;
        this.propsProvider = new AddressProps();
        this.getDefaultCountry = this.getDefaultCountry.bind(this);
        this.loadReferenceData = this.loadReferenceData.bind(this);
        this.validateAndSaveAddress = this.validateAndSaveAddress.bind(this);
        this.validateAddress = this.validateAddress.bind(this);
        this.onClickContinueHandlerForModal = this.onClickContinueHandlerForModal.bind(this);
        this.onClickSelectHandlerForModal = this.onClickSelectHandlerForModal.bind(this);
        this.onClickCancelHandlerForModal = this.onClickCancelHandlerForModal.bind(this);
        this.onClickBackToManualHandlerForModal = this.onClickBackToManualHandlerForModal.bind(this);
        this.isShowStreetNumber = this.isShowStreetNumber.bind(this);
        
        this.waitForPromise = new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
        });
    }

    componentDidMount() {
        const {loadAddressDetails, addressId, config, addressDetails, setAddressDetails,
            getGeolocationAddress, useGeoLocation, createGoogleClient} = this.props;
        const {displayMode, enableGeolocation, geocodingKey, reverseGeocodeAdditionalParams,
            enableGeolocationAemIntegration} = config;

        if (useGeoLocation) {
            createGoogleClient();
            this.loadReferenceData(displayMode);
        } else {
            this.loadReferenceData(displayMode);
        }

        if (displayMode === DISPLAY_MODE.VIEW || displayMode === DISPLAY_MODE.EDIT) {
            // address obj not passed in prop so getting address from addressId passed
            if (addressId) {
                loadAddressDetails(addressId);
            } else if (addressDetails) {
                setAddressDetails(addressDetails);
            }
        } else if (enableGeolocation && displayMode === DISPLAY_MODE.NEW) {
            getGeolocationAddress(enableGeolocationAemIntegration, geocodingKey, reverseGeocodeAdditionalParams)
                .then((addresses) => {
                    console.debug('Geolocation Address', addresses);
                    if (addresses) {
                        setAddressDetails(addresses);
                    }
                })
                .catch((error) => {
                    console.error(error.message);
                });
        }
    }

    /**
     * support change in address details received as input to the widget
     */
    componentWillReceiveProps(nextProps) {
        const {setAddressDetails, addressDetails} = this.props;

        if (!_isEqual(addressDetails, nextProps.addressDetails)) {
            setAddressDetails(nextProps.addressDetails);
        }
    }

    /**
     * ----------------------------------START------------------------------------------------------------
     * Address Validation MOdal Handlers
     */

    onClickSelectHandlerForModal(address) {
        const {config, createAddress, onCreateAddressCallback, validateAddress, setAddressDetails} = this.props;
        const {createAddressUponSubmit} = config;
        const addressInput = this.getFormData();
        const {mailBox} = AddressFormatter.formFields2AddressDetails(addressInput.values);
        validateAddress(address).then((validatedAddress = {}) => {
            const {validAddressList: [validAddress]} = validatedAddress;
            const addressRequest = {...validAddress, mailBox};
            if (createAddressUponSubmit) {
                createAddress(addressRequest).then((response) => {
                    this.addressMainView.handleState({showInvalidAddressModal: false});
                    if (typeof onCreateAddressCallback === 'function') {
                        onCreateAddressCallback(response);
                    }
                });
            } else {
                setAddressDetails(addressRequest);
                this.addressMainView.handleState({showInvalidAddressModal: false});
            }
            this.resolvePromise(addressRequest);
        });
    }

    onClickContinueHandlerForModal(address) {
        const {config: {createAddressUponSubmit}, createAddress,
         onCreateAddressCallback, setAddressDetails} = this.props;
        const addressInput = this.getFormData();
        const {mailBox} = AddressFormatter.formFields2AddressDetails(addressInput.values);
        const addressRequest = {...address, mailBox};
        if (createAddressUponSubmit) {
            createAddress(addressRequest).then((response) => {
                this.addressMainView.handleState({showInvalidAddressModal: false});
                if (typeof onCreateAddressCallback === 'function') {
                    onCreateAddressCallback(response);
                }
            });
        } else {
            setAddressDetails(addressRequest);
            this.addressMainView.handleState({showInvalidAddressModal: false});
        }
        this.resolvePromise(addressRequest);
    }

    onClickCancelHandlerForModal() {
        this.addressMainView.handleState({showInvalidAddressModal: false, clickedOnBackToManualButton: false});
        this.rejectPromise();
    }

    onClickBackToManualHandlerForModal() {
        this.addressMainView.handleState({showInvalidAddressModal: false, clickedOnBackToManualButton: true});
        this.rejectPromise();
    }

    /**
     *  --------------------------END-------------------------------------------------
     */

    getDefaultCountry() {
        const {config} = this.props;    // module level config for default country(removed from appConfiguration)
        return config.defaultCountry;
    }

    // this method is refering to AddressMainView's getFormData method
    // this method is added to get form data from parent widget of this address widget
    getFormData() {
        return this.addressMainView.getFormData();
    }

    // this method exposes display mode of Address Widget
    getDisplayMode() {
        const {config} = this.props;
        return config.displayMode;
    }

    // check address has changed or not
    // default value of addressHasChanged is false
    getAddressHasChanged() {
        return this.addressMainView.state.addressHasChanged;
    }

    /**
     * allow widget consumer to save address and switch display mode from edit to view.
     * to be used when user interaction is external to the address widget
     */
    saveAddress(address) {
        this.props.setAddressDetails(address);
    }

    loadReferenceData(displayMode) {
        const {loadCountries, loadStates, setAddressDetails} = this.props;

        loadCountries();

        const defaultCountry = this.getDefaultCountry();
        if (displayMode === DISPLAY_MODE.NEW) {
            setAddressDetails({country: defaultCountry});
        }
        loadStates(defaultCountry);
    }

    showInValidateAddressPopup(invalidAddress, callBack) {
        this.addressMainView.validateAddress(invalidAddress, callBack);
    }

    // this method is refering to AddressMainView's validateForm method
    // this method is added to expose validateForm method when address-module is a child widget so
    // we can validate address form outside of this module.
    validateForm() {
        return this.addressMainView.validateForm();
    }

    /*
     * -----------------------------------------------------------------------------------------
     * ValidateAddress Method to be called from Create-customer
    */
    validateAddress() {
        const {validateAddress, setAddressDetails, address,
            config: {forceValidate, newHorizontalDesign}, updateHorizPopup} = this.props;
        const addressInput = this.getFormData();
        const addressToValidate = AddressFormatter.formFields2AddressDetails(addressInput.values);
        if (AddressFormatter.isEqualAddress(address, addressToValidate) && !forceValidate) {
            return Promise.resolve(address);
        }

        return validateAddress(addressToValidate).then((validatedAddress) => {
            if (AddressFormatter.isAddressValid(validatedAddress)) {
                const {validAddressList: [validAddress]} = validatedAddress;
                const addressRequest = {...validAddress, mailBox: addressToValidate.mailBox};
                setAddressDetails(addressRequest);
                return Promise.resolve(addressRequest);
            }
            if (newHorizontalDesign) {
                updateHorizPopup(true);
            }
            this.addressMainView.handleState({invalidAddress: validatedAddress, showInvalidAddressModal: true});
            return this.waitForPromise;
        });
    }

    /**
     * -----------------------------------------------------------------------------------------
     * Validate Address to be called  from shipping and delivery
     * @param address
    */
    validateAndSaveAddress(addressInput = AddressFormatter.formFields2AddressDetails(this.getFormData().values)) {
        const {validateAddress, createAddress, onCreateAddressCallback, 
            address, onCheckAvailabilty} = this.props;
        if (!AddressFormatter.isEqualAddress(address, addressInput)) {
            validateAddress(addressInput).then((validatedAddress) => {
                if (AddressFormatter.isAddressValid(validatedAddress)) {
                    const {validAddressList: [validAddress]} = validatedAddress;
                    const addressRequest = {...validAddress, mailBox: addressInput.mailBox};
                    createAddress(addressRequest).then((response) => {
                        if (typeof onCreateAddressCallback === 'function') {
                            onCreateAddressCallback(response);
                        }
                        onCheckAvailabilty();
                    });
                } else {
                    this.addressMainView.handleState({
                        invalidAddress: validatedAddress, 
                        showInvalidAddressModal: true, 
                        showSecondView: true});
                    if (!this.props.isFromDeliverySection) {
                        this.props.taggingErrorManualForm();   
                    }
                }
            });
        } else if (onCreateAddressCallback) {
            onCreateAddressCallback(addressInput);
        }
    }

    isShowStreetNumber() {
        return this.addressMainView.isShowStreetNumber();
    }
    
    /**
     * ----------------------------------------------------------------------------------------
    */

    render() {
        this.componentProps = this.propsProvider.getComponentProps(this.props);
        return (<AddressMainView
            {...this.componentProps}
            validateAndSaveAddress={this.validateAndSaveAddress}
            onSelect={this.onClickSelectHandlerForModal}
            onContinue={this.onClickContinueHandlerForModal}
            onBack={this.onClickCancelHandlerForModal}
            onBackToManualForm={this.onClickBackToManualHandlerForModal}
            loadReferenceData={this.loadReferenceData}
            ref={(instance) => { this.addressMainView = instance; }} />);
    }
}

export default AddressComponent;
