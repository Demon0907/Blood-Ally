import React, {Component} from 'react';
import _isEqual from 'lodash/isEqual';
import CreateAddressView from './Address.createView';
import AddressFormatter from '../../utils/Address.formatter';
import ReviewAddressView from './Address.reviewView';
import {DISPLAY_MODE, MODAL_DISPLAY_MODE} from '../../Address.consts';
import AddressProps from '../../Address.propsProvider';

export default class AddressMainView extends Component {

    static get propTypes() {
        return new AddressProps().getPropTypes();
    }

    constructor(props, context) {
        super(props, context);
        this.bindMethods();
        this.state = {
            showInvalidAddressModal: false,
            clickedOnBackToManualButton: false,
            invalidAddress: null,
            addressHasChanged: false,
            showManualFormView: false,
            showCTCView: false,
            showSecondView: false
        };
    }

    bindMethods() { // eslint-disable-line react/sort-comp
        this.handleState = this.handleState.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.getFormValidationData = this.getFormValidationData.bind(this);
        this.isShowStreetNumber = this.isShowStreetNumber.bind(this);
    }

    /**
     * validate the address and triggered showInvalidAddressModal
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        const {validatedAddress} = nextProps;
        if (!_isEqual(validatedAddress, this.props.validatedAddress) && validatedAddress) {
            this.setState(
                {
                    invalidAddress: validatedAddress,
                    showInvalidAddressModal: !AddressFormatter.isAddressValid(validatedAddress),
                    addressHasChanged: true
                });
        }
    }

    componentWillUnmount() {
        this.setState({showManualFormView: false, showCTCView: false});
    }

    getModalDisplayMode() {
        let modalDisplayMode = null;
        const {validAddressList = []} = (this.state.invalidAddress) ? this.state.invalidAddress : {};
        const {isMobileFlow, isFromDeliverySection} = this.props;

        if (isMobileFlow || isFromDeliverySection) {
            modalDisplayMode = MODAL_DISPLAY_MODE.NO_ADDRESS;
        } else if (validAddressList && validAddressList.length > 1
            && !this.state.showSecondView) {
            modalDisplayMode = MODAL_DISPLAY_MODE.ENTER_MANUAL_ADDRESS;
        } else if ((!this.state.showSecondView && ((validAddressList && validAddressList.length === 1)
            || validAddressList.length === 0))) {
            modalDisplayMode = MODAL_DISPLAY_MODE.ENTER_MANUAL_ADDRESS;
        } else if (!this.state.showManualFormView && !this.state.showCTCView
            && this.state.showSecondView) {
            modalDisplayMode = MODAL_DISPLAY_MODE.MANUAL_VERIFICATION_FAILED;
        } else if (this.state.showCTCView) {
            modalDisplayMode = MODAL_DISPLAY_MODE.SHOW_CTC;
        } else if (this.state.showManualFormView) {
            modalDisplayMode = MODAL_DISPLAY_MODE.ENTER_MANUAL_ADDRESS;
        } else {
            modalDisplayMode = MODAL_DISPLAY_MODE.ENTER_MANUAL_ADDRESS;
        }
        return modalDisplayMode;
    }

    getFormValidationData() {
        return this.formValidatedData;
    }
    /**
     * validate the form
     * @return object with isValid flag, optionally also with the form validation response
     */
    validateForm() {
        const {configParams: {displayMode}} = this.props;

        if (displayMode === DISPLAY_MODE.NEW || displayMode === DISPLAY_MODE.EDIT) {
            const formData = this.createView && this.createView.validateForm();
            this.formValidatedData = formData;
            return formData && formData.isValid;
        }
        return {isValid: true};
    }

    // using refs to Create Component to get its form data
    getFormData() {
        return this.createView.getFormData();
    }
    /**
     * enrich props
     */
    getCreateViewProps() {
        const {configParams: {displayMode}} = this.props;
        return {
            ...this.props,
            modal: {
                showInvalidAddressModal: this.state.showInvalidAddressModal,
                clickedOnBackToManualButton: this.state.clickedOnBackToManualButton,
                allowInvalidAddress: this.props.configParams.allowInvalidAddress,
                invalidAddress: this.state.invalidAddress,
                modalDisplayMode: this.getModalDisplayMode(),
                onSelect: this.props.onSelect,
                onContinue: this.props.onContinue,
                onBack: this.props.onBack,
                onBackToManualForm: this.props.onBackToManualForm
            },
            handleState: this.handleState,
            displayMode,
            validateAndSaveAddress: this.props.validateAndSaveAddress,
            clickToCallFunction: this.props.clickToCallFunction
        };
    }

    handleState(value) {
        this.setState({...this.state, ...value});
    }

    validateAddress(invalidAddress, callBack) {
        this.parentCallBack = callBack;
        this.createView.getWrappedInstance().validateAddress(invalidAddress);
    }

    isShowStreetNumber() {
        return this.createView.getWrappedInstance().isShowStreetNumber();
    }

    render() {
        const {configParams: {displayMode}} = this.props;

        if (displayMode === DISPLAY_MODE.NEW || displayMode === DISPLAY_MODE.EDIT) {
            return (
                <CreateAddressView
                    {...this.getCreateViewProps()}
                    ref={(instance) => { this.createView = instance; }}
                    handleState={this.handleState} />
            );
        } else if (displayMode === DISPLAY_MODE.VIEW) {
            return <ReviewAddressView {...this.props} handleState={this.handleState} />;
        }
        return null; // displayMode = None
    }
}
