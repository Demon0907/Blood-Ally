/**
 * Address view for New and Edit display modes
 *
 */
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import {Form} from 'digitalexp-common-components-l9';
import AddressFormView from './Address.formView';
import AddressGeoFormView from './Address.formViewGeo';
import defaultMessages from '../../Address.i18n';
import {DISPLAY_MODE} from '../../Address.consts';
import AddressFormatter from '../../utils/Address.formatter';
import AddressValidationModal from './AddressValidationModal';

const {FormContainer} = Form;

@FormContainer({hasDefaults: true})                        
export default class CreateAddressView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showStreetNumber: false
        };
        this.bindMethods();
    }

    /**
     * components for user actions - cancel / save
     * using Form handler
     */
    getActionComponents() {
        const {configParams, displayMode} = this.props;
        return (
            <span>
                {
                    displayMode === DISPLAY_MODE.EDIT &&
                    configParams.showCancelLinkInEditMode &&
                    <a 
                        className="ds-btn ds-btn--link address-link-cancel"
                        onClick={this.revertHandler}>
                        <FormattedMessage {...defaultMessages.address_revert_label} />
                    </a>
                }
                {
                    displayMode === DISPLAY_MODE.EDIT &&
                    configParams.showSaveLinkInEditMode &&
                    <a 
                        className="ds-btn ds-btn--link address-link-save"
                        onClick={() => this.props.handleAction(this.saveHandler, {validateForm: true})}>
                        <FormattedMessage {...defaultMessages.address_save_label} />
                    </a>
                }
            </span>
        );
    }
    
    /**
     * this handler is triggerd via the form's handleAction when submit button is selected (in New or Edit modes)
     *  - verify fields are valid (mandatory fields are populated etc), if not then show inline errors. 
     *    this is already done by form's handleSubmit.
     *  - call validate address service.
     *  - call create address service (via callback after validate).
     *  - publish the new id of the address that was returned from the create address service.
     * @params options {object} passed via the form handler, with form validation flag & form values.
     */
    submitHandler(options) { // eslint-disable-line react/sort-comp
        if (options.isFormValid) {
            const addressToValidate = AddressFormatter.formFields2AddressDetails(options.formData.values);
            this.props.validateAndSaveAddress(addressToValidate);
        }
    }

    submitManualHandler(options) { // eslint-disable-line react/sort-comp
        if (options.isFormValid) {
            const addressToValidate = AddressFormatter.formFields2ManualAddress(options.formData.values);
            this.props.validateAndSaveAddress(addressToValidate);
            this.props.handleState({showManualFormView: false});
        }
    }

    validateAddress(invalidAddressData) {
        this.props.handleState({invalidAddress: invalidAddressData, showInvalidAddressModal: true});  
    }

    isShowStreetNumber() {
        const {showStreetNumber} = this.state;
        return showStreetNumber;
    }
    
    setShowStreetNumber(showStreetNum) {
        this.setState({showStreetNumber: showStreetNum});
    }

    bindMethods() {
        this.getActionComponents = this.getActionComponents.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
        this.submitManualHandler = this.submitManualHandler.bind(this);
        this.setShowStreetNumber = this.setShowStreetNumber.bind(this);
    }

    getFormProps() {
        const {
            displayMode,
            configParams, 
            referenceData, 
            addressDetails,
            intl,
            // via FormContainer:
            initializeFormValues,
            updateFormValues,
            updateFields,
            getFormData,
            handleAction,
            loadAutoCompleteAddress,
            setAddressDetails,
            loadStates,
            loadCity,
            loadReferenceData,
            clear,
            handleState,
            taggingManualInsertForm,
            screenMode,
            isFromDeliverySection,
            taggingManualCloseValidationModal,
            taggingManualUpdateValidationModal 
        } = this.props;

        return {
            displayMode,
            configParams, 
            referenceData,
            handlers: {
                submitHandler: this.submitHandler,
                submitManualHandler: this.submitManualHandler,
                clickToCallFunction: this.props.clickToCallFunction
            },
            addressDetails,
            intl,
            initializeFormValues,
            updateFormValues,
            updateFields,
            getFormData,
            handleAction,
            loadAutoCompleteAddress,
            setAddressDetails,
            loadStates,
            loadCity,
            loadReferenceData,
            clear,
            handleState,
            taggingManualInsertForm,
            screenMode,
            isFromDeliverySection,
            taggingManualCloseValidationModal,
            taggingManualUpdateValidationModal
        };
    }

    getGeoFormProps() {
        const {
            displayMode,
            configParams,
            addressDetails,
            intl,
            updateFormValues,
            updateFields,
            updateFormErrors,
            registerFieldConstraints,
            initializeFormValues,
            getFormData,
            setAddressDetails,
            getPlacesPredictions,
            getPlaceDetails,
            getAddressDetailsReverseGeocode,
            setFormattedAddress
        } = this.props;

        return {
            displayMode,
            configParams,
            addressDetails,
            intl,
            updateFormValues,
            updateFields,
            updateFormErrors,
            registerFieldConstraints,
            initializeFormValues,
            getFormData,
            setAddressDetails,
            getPlacesPredictions,
            getPlaceDetails,
            getAddressDetailsReverseGeocode,
            setFormattedAddress,
            setShowStreetNumber: this.setShowStreetNumber
        };
    }

    getAddressValidationModalPorps() {
        const {modal, referenceData, updateHorizPopup, isFromDeliverySection,
            updateNewAddressTaggingIndicator, taggingValidationModalPageName,
            taggingValidationModalCustomLink} = this.props;
        return {
            referenceData,
            config: this.props.configParams,
            onSelect: modal.onSelect,
            onContinue: modal.onContinue,
            onBack: modal.onBack,
            onBackToManualForm: modal.onBackToManualForm,
            invalidAddress: modal.invalidAddress,
            modalDisplayMode: modal.modalDisplayMode,
            updateHorizPopup,
            isFromDeliverySection,
            updateNewAddressTaggingIndicator,
            taggingValidationModalPageName,
            taggingValidationModalCustomLink
        };
    }


    render() {
        const {modal, useGeoLocation} = this.props;
        const validAdress = modal.invalidAddress === null ? true :
            AddressFormatter.isAddressValid(modal.invalidAddress || {});
        if (useGeoLocation) {
            return (
                <div className="ds-address-services">
                    {(validAdress || (!modal.clickedOnBackToManualButton)) &&
                        <AddressGeoFormView {...this.getGeoFormProps()} />}
                    {!validAdress && modal.clickedOnBackToManualButton && <AddressFormView {...this.getFormProps()} />}
                    {!validAdress && modal.showInvalidAddressModal &&
                        <AddressValidationModal 
                            {...this.getAddressValidationModalPorps()}
                            {...this.getFormProps()} />
                    }
                </div>
            );
        }
        return (
            <div className="ds-address-services">
                <AddressFormView {...this.getFormProps()} />
                {modal.showInvalidAddressModal && 
                    <AddressValidationModal 
                        {...this.getAddressValidationModalPorps()}
                        {...this.getFormProps()} />
                }
            </div>
        );
    }
}

CreateAddressView.PropTypes = {
    configParams: PropTypes.object,
    displayMode: PropTypes.string,
    title: React.PropTypes.object,
    // addressDetails: React.PropTypes.object, commented out to avoid warning in test page when string is passed
    formattedAddressForValidation: PropTypes.string,
    referenceData: React.PropTypes.object,
    addressSuggestions: React.PropTypes.array,
    modal: React.PropTypes.object
};
