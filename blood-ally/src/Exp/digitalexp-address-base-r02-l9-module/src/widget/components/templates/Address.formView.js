import _filter from 'lodash/filter';
import _isEmpty from 'lodash/isEmpty';
import _reduce from 'lodash/reduce';
import _isEqual from 'lodash/isEqual';
import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import {FormField, ComboBox} from 'digitalexp-common-components-l9';
import InputAutoComplete from './Address.inputAutoComplete';
import defaultMessages from '../../Address.i18n';
import {DISPLAY_MODE} from '../../Address.consts';
import Validations from '../../utils/Address.formValidations';
import AddressFormatter from '../../utils/Address.formatter';

const {MandatoryField, Field, Input} = FormField;

// list of form fields included in the autocomplete functionality, by order of appearance
const ADDRESS_FORM_FIELDS_AUTOCOMPLETE = ['addressLine1', 'addressLine2', 'addressLine3', 'city', 'postalCode'];

export default class AddressFormView extends Component {
    constructor(props) {
        super(props);
        this.validations = new Validations(props.configParams, props.intl);
        this.bindMethods();
        this.state = {
            disableCity: true
        };
        this.loadCityHandler = this.loadCityHandler.bind(this);
        this.validations = new Validations(props.configParams, props.intl);
    }

    componentWillMount() {
        const {addressDetails, initializeFormValues, configParams = {}} = this.props;
        const {showFrazione} = configParams;
        const formValues = AddressFormatter.addressDetails2FormFields(addressDetails, !showFrazione);
        initializeFormValues(formValues);
    }

    componentDidMount() {
        const {addressDetails, loadCity} = this.props;
        const {country: countryId, stateOrProvince: stateId} = addressDetails;
        if (stateId && countryId) {
            loadCity({stateId, countryId});
        }
    }
    
    componentWillReceiveProps(nextProps) {
        const {updateFormValues} = this.props;
        const {addressDetails} = nextProps;
        if (!_isEqual(addressDetails, this.props.addressDetails)) {
            const updatedFields = AddressFormatter.addressDetails2FormFields(addressDetails);
            if (updatedFields && updatedFields['address.stateOrProvince'] && updatedFields['address.city']
                && updatedFields['address.country'] &&
                !_isEqual(updatedFields['address.stateOrProvince'], this.props.addressDetails.stateOrProvince) &&
                _isEqual(updatedFields['address.country'], this.props.configParams.defaultCountry)) {
                // load cities in order for the value to be populated.
                this.loadCityHandler({value: updatedFields['address.stateOrProvince']}).then(() => {
                    updateFormValues(updatedFields);
                });
            }
            if (!_isEmpty(updatedFields)) {
                updateFormValues(updatedFields);
            }
        }
    }
    
    bindMethods() { // eslint-disable-line react/sort-comp
        this.validations.getValidationsForField = this.validations.getValidationsForField.bind(this.validations);
        this.onCountrySelectionHandler = this.onCountrySelectionHandler.bind(this);
        this.onStateSelectionHandler = this.onStateSelectionHandler.bind(this);
        this.getAutoCompleteValuesHandler = this.getAutoCompleteValuesHandler.bind(this);
        this.selectAutoCompleteOptionHandler = this.selectAutoCompleteOptionHandler.bind(this);
        this.getUpdatedAutoCompleteTermHandler = this.getUpdatedAutoCompleteTermHandler.bind(this);
        this.getAutoCompleteTimer = this.getAutoCompleteTimer.bind(this);
        this.setAutoCompleteTimer = this.setAutoCompleteTimer.bind(this);
    }

    /**
     * this handler is triggerd via auto complete form field when a search result (address) is selected
     * - parse the selected address and set it in the form fields
     * @param address {object} selected auto complete item
     */
    selectAutoCompleteOptionHandler(address) {
        const {updateFormValues} = this.props;       
        const updatedFields = AddressFormatter.addressDetails2FormFields(address);
        if (!_isEmpty(updatedFields)) {
            updateFormValues(updatedFields);
        }
    }

    parseAutoCompleteAddress(address, config) {
        const {countries, states} = this.props.referenceData;
        return AddressFormatter.parseAutoCompleteAddress(address, countries, states, config);
    }

    /**
     * delay timer before triggering the autocomplete service,
     * having it here in form level instead of field level enables support for multiple autocomplete fields.
     * @param isActive {boolean}
     */
    getAutoCompleteTimer() {
        return this.autoCompleteTimer;
    }
    setAutoCompleteTimer(timer) {
        this.autoCompleteTimer = timer;
    }

    /**
     * upon country value change -> save selection, update the states list
     * @param event {object} name & value of the changed form field
     */
    onCountrySelectionHandler(event) { // eslint-disable-line react/sort-comp
        const countryId = event.value;
        this.props.setAddressDetails({country: countryId});
        this.props.loadStates(countryId);
    }

    /**
     * upon state value change -> save selection
     * @param event {object} name & value of the changed form field
     */
    onStateSelectionHandler(event) {
        const stateId = event.value;
        this.props.setAddressDetails({stateOrProvince: stateId});
    }

    /**
     * this handler is triggerd via auto complete form field, in order to fetch suggested values per given input.
     * - remove the wrapper object from the response & filter empty items.
     * @param term {string} search text
     * @param fieldName {string} the current field the user updated, in order to support display of multiple 
     *                  autocomplete components that use the same store.
     */
    getAutoCompleteValuesHandler(term) {
        return new Promise((resolve, reject) => {
            const {addressDetails} = this.props;
            const country = addressDetails && addressDetails.country;
            if (!_isEmpty(country) && !_isEmpty(term)) {
                this.props.loadAutoCompleteAddress(term, country, undefined, true)
                    .then((response) => {
                        const addressSuggestions = _filter(response, (obj) => { return !_isEmpty(obj); });
                        resolve(addressSuggestions);
                    }).catch((err) => {
                        reject(err);
                    });
            }  
        });
    }

    /**
     * - if auto-complete is triggered when the user types in some field, then the input characters to auto-complete 
     *   will be a concatenation of the characters in previous fields + current field.
     * - the order of the fields to concatenate: 
     *   address line 1, address line 2, address line 3, city, postalCode
     *
     * @param origTerm {string} the term of current field
     * @param fieldName {string} the current field the user updated
     * @param separator {string} separator between the fields values
     */
    getUpdatedAutoCompleteTermHandler(origTerm, fieldName, separator = ' ') {
        const {getFormData, i} = this.props;
        const formValues = getFormData().values;

        let earlyExit = false;

        const newTerm = _reduce(ADDRESS_FORM_FIELDS_AUTOCOMPLETE, (term, _field) => {
            const field = `address.${_field}`;
            if (earlyExit) {
                return term; // no more additions
            }
            if (fieldName === field) {
                earlyExit = true;
                return term + (_isEmpty(term) ? '' : separator) + origTerm;
                // prev fields + current field (term is now ready)
            }
            const newfield = formValues[field];
            return term +
                (_isEmpty(newfield) ? ''
                                    : ((_isEmpty(term) ? '' : separator) + newfield)); // add current field
        }, '');

        return newTerm;
    }

    getInputAutoCompleteProps() {
        const {
            configParams
        } = this.props;

        return {
            minLength: configParams.minimumCharsForAutoComplete,
            minTime: configParams.minimumTimeForAutoCompleteRepeat,
            getValuesHandler: this.getAutoCompleteValuesHandler,
            onSelectHandler: this.selectAutoCompleteOptionHandler,
            getUpdatedTermHandler: this.getUpdatedAutoCompleteTermHandler,
            getAutoCompleteTimer: this.getAutoCompleteTimer,
            setAutoCompleteTimer: this.setAutoCompleteTimer,
            codeFieldName: 'id',
            valueFieldName: 'formattedAddress'
        };
    }

    loadCityHandler(event) {
        let stateId = '';
        if (event.keyCode === 9) {
            stateId = event.value ? event.value : 
                this.props.getFormData().values['address.stateOrProvince'];
        } else {
            stateId = event.value;
        }
        const {configParams, loadCity, updateFields} = this.props;
        const countryId = configParams.defaultCountry;
        this.setState({
            disableCity: false
        });
        updateFields([{name: 'address.stateOrProvince', value: stateId},
        {name: 'address.city', value: ''}], false);
        return loadCity({stateId, countryId});
    }

    render() {
        const {
            configParams,
            referenceData,
            handlers,
            intl,
            displayMode
        } = this.props;
        const {states, citiesList} = referenceData;

        let DynamicInput = Input;

        if (configParams.addressAutoComplete) {
            DynamicInput = InputAutoComplete;
        }
       
        return (
            <div className="ds-address-widget">
                <div className="ds-row">
                    <MandatoryField
                        Component={DynamicInput}
                        label={intl.formatMessage(defaultMessages.road_street_other)}
                        name="address.street"
                        type="text"
                        config={{fieldWrapperClassName: 'col-xs-12 col-sm-6'}}
                        constraints={this.validations.getValidationsForField('addressLine1')}
                        skipConstraints={['presence']}
                        autoComplete="fakeaddressStreet"
                        placeholder={intl.formatMessage(defaultMessages.enter_your_street_name)}
                        usePlaceholder="true"
                    />
                    <MandatoryField
                        Component={DynamicInput}
                        label={intl.formatMessage(defaultMessages.street_number)}
                        name="address.streetNumber"
                        type="text"
                        config={{fieldWrapperClassName: 'col-xs-12 col-sm-3'}}
                        constraints={this.validations.getValidationsForField('streetNumber')}
                        skipConstraints={['presence']}
                        autoComplete="fakeaddressStreetNumber"
                        placeholder={intl.formatMessage(defaultMessages.street_number_placeholder)}
                        usePlaceholder="true"
                    />
                    {configParams.showMailbox && <Field
                        Component={DynamicInput}
                        label={intl.formatMessage(defaultMessages.mail_box)}
                        name="address.mailBox"
                        type="text"
                        config={{fieldWrapperClassName: 'col-xs-12 col-sm-3'}}
                        constraints={this.validations.getValidationsForField('mailBox')}
                        placeholder={intl.formatMessage(defaultMessages.mail_box_placeholder)}
                        usePlaceholder="true"
                    />}
                </div>
                <div className="ds-row">
                    <MandatoryField
                        Component={ComboBox}
                        label={intl.formatMessage(defaultMessages.province)}
                        name="address.stateOrProvince"
                        items={states}
                        allowItemAdd="true"
                        displayField="displayName"
                        placeholder={intl.formatMessage(defaultMessages.selectLabel)}
                        searchable="true"
                        config={{hasIcon: true,
                            fieldWrapperClassName: 'col-xs-12 col-sm-3'}}
                        constraints={this.validations.getValidationsForField('province')}
                        skipConstraints={['presence']}
                        onSelectHandler={this.loadCityHandler}
                        autoComplete="fakeState"
                    />
                    <MandatoryField
                        Component={ComboBox}
                        label={intl.formatMessage(defaultMessages.city)}
                        name="address.city"
                        items={citiesList}
                        allowItemAdd="true"
                        displayField="displayName"
                        placeholder={intl.formatMessage(defaultMessages.selectLabel)}
                        searchable="true"
                        config={{hasIcon: true,
                            fieldWrapperClassName: 'col-xs-12 col-sm-3'}}
                        constraints={this.validations.getValidationsForField('cityL9')}
                        skipConstraints={['presence']} 
                        autoComplete="fakeCity"                       
                    />
                    <MandatoryField
                        Component={DynamicInput}
                        label={intl.formatMessage(defaultMessages.postal_code)}
                        name="address.postalCode"
                        type="number"
                        config={{fieldWrapperClassName: 'col-xs-12 col-sm-3 postal'}}
                        constraints={
                            this.validations.getValidationsForField('postalCodeL9')
                        }
                        skipConstraints={['presence']}
                        autoComplete="fakePostalCode"
                        placeholder={intl.formatMessage(defaultMessages.postal_code_placeholder)}
                        usePlaceholder="true"
                    />
                </div>
                {   // submit button
                    displayMode === DISPLAY_MODE.NEW &&
                    configParams.showSubmit &&
                    <button 
                        type="submit" 
                        className="ds-btn ds-btn--primary"
                        onClick={() => this.props.handleAction(handlers.submitHandler, {validateForm: true})}>
                        <FormattedMessage {...defaultMessages.address_submit_label} />
                    </button>
                }
            </div>
        );
    }
}
