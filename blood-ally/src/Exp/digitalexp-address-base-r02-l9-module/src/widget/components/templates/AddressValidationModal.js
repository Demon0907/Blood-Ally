import React, {Component} from 'react';
import {Modal, ModalUtils} from 'digitalexp-common-components-l9';
import {FormattedMessage} from 'react-intl';

import messages from '../../Address.i18n';
import {MODAL_DISPLAY_MODE, MANUAL_MODALS_TAGGING_PAGES, MANUAL_MODALS_TAGGING_ACTIONS} from '../../Address.consts';
import AddressListView from './AddressListView';
import ManualAddressFormView from './Address.manualFormView';
import ManualAddressFailureView from './Address.manualFailureView';
import AddressFormatter from '../../utils/Address.formatter';

const {ModalHeader, ModalBody, ModalFooter} = ModalUtils;

export default class AddressValidationModal extends Component {
    constructor(props) {
        super(props);
        this.getAddressListView = this.getAddressListView.bind(this);
        this.getMainView = this.getMainView.bind(this);
        this.getFooterView = this.getFooterView.bind(this);
        this.getHeaderConfig = this.getHeaderConfig.bind(this);
        this.onClickShowMoreDetailsHandler = this.onClickShowMoreDetailsHandler.bind(this);
        this.onClickAddressRadio = this.onClickAddressRadio.bind(this);
        this.onContinueHandler = this.onContinueHandler.bind(this);
        this.onSelectHandler = this.onSelectHandler.bind(this);
        this.getTitleText = this.getTitleText.bind(this);
        this.state = {
            showMoreDetails: true,
            selectedAddress: null,
            isError: false
        };
    }

    componentWillMount() {
        const {invalidAddress, config} = this.props;
        const {validAddressList = []} = invalidAddress;
        const {minNumberOfAddressResultsToDisplay, 
            ctcUrlForManual} = config;
        const showMoreDetails = validAddressList.length > minNumberOfAddressResultsToDisplay;
        this.setState({
            showMoreDetails
        });
    }

    componentDidMount() {
        this.taggingModalVal(true, false);
    }

    componentWillUnmount() {
        this.props.handleState({showCTCView: false});
    }

    onClickShowMoreDetailsHandler() {
        this.setState({
            showMoreDetails: false
        });
    }

    onClickAddressRadio(selectedIndex) {
        const {invalidAddress} = this.props;
        const {validAddressList = []} = invalidAddress;

        const selectedAddress = (validAddressList.length) ? validAddressList[selectedIndex] : null;
        this.setState({
            selectedAddress
        });
    }

    onSelectHandler() {
        if (this.state.selectedAddress != null) {
            const address = this.state.selectedAddress;
            this.props.onSelect(address);
        }
    }

    onContinueHandler() {
        const {invalidAddress} = this.props;
        const {validAddressList: [validAddress]} = invalidAddress;
        const address = validAddress;
        this.props.onSelect(address); 
    }

    getAddressListView() {
        const {config = {}, invalidAddress = {}, referenceData} = this.props;
        const {countries, states} = referenceData;
        const {minNumberOfAddressResultsToDisplay = 5, maxNumberOfAddressResultsToDisplay = 30} = config;
        const {validAddressList = []} = invalidAddress;
        const buttonLabel = <FormattedMessage {...messages.show_more_options_modal_label} />;

        const addressList = []; 
        validAddressList.forEach((item, index) => {
            if (this.state.showMoreDetails && index < minNumberOfAddressResultsToDisplay) {
                addressList.push(AddressFormatter.formatAddress(item, countries, states, config));
            } else if (!this.state.showMoreDetails && index < maxNumberOfAddressResultsToDisplay) {
                addressList.push(AddressFormatter.formatAddress(item, countries, states, config));
            }
        });

        return (
            <AddressListView 
                showMoreDetails={this.state.showMoreDetails}
                onClickShowMoreDetailsHandler={this.onClickShowMoreDetailsHandler}
                onClickAddressRadio={this.onClickAddressRadio}
                buttonLabel={buttonLabel}
                address={addressList}
            />
        );
    }

    getSingleAddress() {
        const {invalidAddress = {}, referenceData, config} = this.props;
        const {validAddressList: [validAddress]} = invalidAddress;
        const {countries, states} = referenceData;

        return (validAddress) ? 
            AddressFormatter.formatAddress(validAddress, countries, states, config)
            : '';
    }

    getMainView() {        
        switch (this.props.modalDisplayMode) {

        case MODAL_DISPLAY_MODE.SINGLE_ADDRESS: 
            return [
                <div key="MAIN_SINGLE_1" className="ds-text-bold">
                    <FormattedMessage {...messages.minor_correction_address_modal_label} />
                </div>,
                <div key="MAIN_SINGLE_2">
                    <FormattedMessage {...messages.confirm_address_modal_label} />
                </div>,
                <div key="MAIN_SINGLE_3" className="ds-text-details">{this.getSingleAddress()}</div>
            ];
        case MODAL_DISPLAY_MODE.MULTIPLE_ADDRESS:
            return [
                <div key="MAIN_MULTI_1" className="ds-text-bold">
                    <FormattedMessage {...messages.address_not_found_modal_message_text} />
                </div>,
                <div key="MAIN_MULTI_2" className="ds-text-light">
                    <FormattedMessage {...messages.select_address_modal_label} />
                </div>,
                <div key="MAIN_MULTI_3" className="ds-text-details">{this.getAddressListView()}</div>
            ];
        case MODAL_DISPLAY_MODE.ENTER_MANUAL_ADDRESS:
            return [
                <div className="ds-manual-address">
                    <ManualAddressFormView
                        ref={(instance) => { this.manualAddressIssue = instance; }}
                        setError={this.setError}
                        isError={this.state.isError}
                        {...this.props} />
                </div>
            ];
        case MODAL_DISPLAY_MODE.MANUAL_VERIFICATION_FAILED:
            return [
                <div className="ds-manual-address ds-manual-failure">
                    <ManualAddressFailureView
                        {...this.props} />
                </div>
            ];
        case MODAL_DISPLAY_MODE.SHOW_CTC:
            return [
                <div className="ds-ctc-container">
                    <iframe
                        className="ds-click-to-call"
                        title={messages.manual_address_title_label}
                        frameBorder="0"
                        vspace="0"
                        hspace="0"
                        webkitallowfullscreen=""
                        mozallowfullscreen=""
                        allowFullScreen=""
                        scrolling="auto"
                        src={this.props.config.ctcUrlForManual} 
                    />
                </div>
            ];
        default: 
            return [
                <div key="MAIN_MULTI_1">
                    <FormattedMessage {...messages.address_not_found_modal_message_text} />
                </div>,
                <div key="MAIN_NONE_2">
                    <FormattedMessage {...messages.please_try_different_address_modal_label} />
                </div>,
                <div key="MAIN_NONE_3" className="ds-text-details" />,
                <div key="MAIN_NONE_4" className="ds-text-details ds-text-details--update-manual">
                    <button
                        key="FOOT_MULTI_2"
                        className="ds-btn ds-btn--large ds-btn--primary"
                        onClick={() => {
                            const {onBackToManualForm} = this.props;
                            this.taggingModalVal(false, true, MANUAL_MODALS_TAGGING_ACTIONS.UPDATE);
                            if (onBackToManualForm) {
                                onBackToManualForm();
                            }
                        }}
                        >
                        <FormattedMessage {...messages.update_address_manually} />
                    </button>
                </div>
            ];
        }
    }

    getFooterView() {
        const {handlers} = this.props;       
        switch (this.props.modalDisplayMode) {

        case MODAL_DISPLAY_MODE.SINGLE_ADDRESS:
            return [
                <button
                    key="FOOT_SINGLE_1"
                    className="ds-btn ds-btn--large ds-btn--secondary"
                    onClick={this.props.onBack}
                    >
                    <FormattedMessage {...messages.edit_my_address_label} />
                </button>,
                <button
                    key="FOOT_SINGLE_2"
                    className="ds-btn ds-btn--large ds-btn--primary"
                    onClick={this.onContinueHandler}
                    >
                    <FormattedMessage {...messages.confirm_and_continue_label} />
                </button>
            ];
        case MODAL_DISPLAY_MODE.MULTIPLE_ADDRESS:
            return [
                <button
                    key="FOOT_MULTI_1"
                    className="ds-btn ds-btn--large ds-btn--secondary"
                    onClick={this.props.onBack}
                    >
                    <FormattedMessage {...messages.back_button_label} />
                </button>,
                <button
                    key="FOOT_MULTI_2"
                    className="ds-btn ds-btn--large ds-btn--primary"
                    onClick={this.onSelectHandler}
                    >
                    <FormattedMessage {...messages.select_button_label} />
                </button>
            ];
        case MODAL_DISPLAY_MODE.MANUAL_VERIFICATION_FAILED:
            return [
                <div className="ds-manual-footer-container">
                    <button
                        key="FOOT_MULTI_1"
                        className="ds-btn ds-btn--large ds-btn--secondary"
                        onClick={() => this.props.handleState({
                            showManualFormView: true,
                            showSecondView: false
                        })}
                        >
                        <FormattedMessage
                            {...messages.manual_address_modifica_button} />
                    </button>
                    <button
                        key="FOOT_MULTI_2"
                        className="ds-btn ds-btn--large ds-btn--primary"
                        onClick={() => this.props.handleState({showCTCView: true})}
                        >
                        <FormattedMessage {...messages.manual_address_ctc_button} />
                    </button>
                </div>
            ];
        case MODAL_DISPLAY_MODE.ENTER_MANUAL_ADDRESS:
            return [
                this.props.config.newHorizontalDesign ?
                    <span
                        className={`col-xs-9 ds-text-muted ds-tracker__info ds-breadcrumbs pdl0 
                        ${this.state.isError ? 'error' : ''}`}>
                        <FormattedMessage {...messages.campi_obbligatori} />
                    </span> : null,
                <button 
                    className="col-xs-12 ds-btn ds-btn--large ds-btn--primary" 
                    onClick={() => this.props.handleAction(handlers.submitManualHandler, {validateForm: true})}>
                    <FormattedMessage {...messages.manual_address_submit_label} />
                </button>
            ];
        default: 
            return (
                <div className="hide">
                    <p>Empty content</p>
                </div>
            );
        }
    }

    getTitleText() {
        switch (this.props.modalDisplayMode) {
        case MODAL_DISPLAY_MODE.MANUAL_VERIFICATION_FAILED:
        case MODAL_DISPLAY_MODE.ENTER_MANUAL_ADDRESS:
            return <FormattedMessage {...messages.manual_address_title_label} />;
        case MODAL_DISPLAY_MODE.SINGLE_ADDRESS:
            return <FormattedMessage {...messages.single_address_title_label} />;
        default:
            return <FormattedMessage {...messages.address_not_found_modal_title} />;
        }
    }

    getHeaderConfig() {
        return {
            showCloseButton: true,
            closeButtonClass: 'ds-modal--close',
            showTitle: true,
            titleText: this.getTitleText()
        };
    }

    setError = isError => this.setState({isError});
    
    isManualAddressModal = () => this.props.modalDisplayMode === MODAL_DISPLAY_MODE.ENTER_MANUAL_ADDRESS;

    isTagPageNameOrCustomLink = (isTagPageName, pageNameVal, customLinkVal) => {
        const {taggingValidationModalPageName, taggingValidationModalCustomLink} = this.props;
        if (isTagPageName) {
            taggingValidationModalPageName(pageNameVal);
        } else {
            taggingValidationModalCustomLink(`${pageNameVal}${customLinkVal}`);
        }
    }

    taggingModalVal = (isTagPageName, isManualPopUp, customLinkVal) => {
        const {isFromDeliverySection, updateNewAddressTaggingIndicator, config} = this.props;
        const {DELIVERY_VALIDATION_MODAL, VALIDATION_MODAL} = MANUAL_MODALS_TAGGING_PAGES;
        if (isFromDeliverySection) {
            this.isTagPageNameOrCustomLink(isTagPageName, DELIVERY_VALIDATION_MODAL, customLinkVal);
            if (isManualPopUp) {
                updateNewAddressTaggingIndicator(true);
            }
        } else if (config && config.isPersonalSection) {
            this.isTagPageNameOrCustomLink(isTagPageName, VALIDATION_MODAL, customLinkVal);
        }
    } 

    render() {
        const config = {
            showOverLay: true,
            modalClass: this.props.config.newHorizontalDesign && this.isManualAddressModal()
                ? 'ds-horizontall-modal' : null,
            dialogBoxClass: this.props.config.newHorizontalDesign && this.isManualAddressModal() ?
                'ds-horizontall-modal--wrapper' : 'ds-modal--wrapper__medium ds-modal--address'
        };
        return (
            <Modal config={config}>
                { this.props.config.newHorizontalDesign && this.isManualAddressModal() ? null
                    : <ModalHeader
                        config={this.getHeaderConfig()}
                        handleButtonClick={() => {
                            this.props.onBack();
                            this.taggingModalVal(false, false, MANUAL_MODALS_TAGGING_ACTIONS.CLOSE);
                            if (this.props.isFromDeliverySection) {
                                this.isTagPageNameOrCustomLink(true, MANUAL_MODALS_TAGGING_PAGES.MODIFY_MODAL);
                            }
                        }} />}
                <ModalBody>
                    {this.getMainView()}
                </ModalBody>
                <ModalFooter>
                    {this.getFooterView()}
                </ModalFooter>
            </Modal>
        );
    }
}
