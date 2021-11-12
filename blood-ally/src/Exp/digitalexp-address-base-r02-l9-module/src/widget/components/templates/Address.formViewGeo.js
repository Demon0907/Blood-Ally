import React, {Component} from 'react';
import classNames from 'classnames';
import {FormField, FilterSortLibrary, ComboBox} from 'digitalexp-common-components-l9';
import defaultMessages from '../../Address.i18n';
import Validations from '../../utils/Address.formValidations';
import {AddressComponents} from '../../Address.consts';
import AddressFormatter from '../../utils/Address.formatter';

const {MandatoryField, Input, Field} = FormField;
const {AutoCompleteFilter} = FilterSortLibrary;

export default class AddressFormView extends Component {
    constructor(props) {
        super(props);
        this.validations = new Validations(props.configParams, props.intl);
        this.fetchPredictions = this.fetchPredictions.bind(this);
        this.getAddressDetails = this.getAddressDetails.bind(this);
        this.setShowStreetNumber = this.setShowStreetNumber.bind(this);
        this.state = {
            showStreetNumber: false,
            isAddressBad: false,
            value: '',
            errormessage: ''
        };
    }

    componentWillMount() {
        const {addressDetails, initializeFormValues} = this.props;
        if (addressDetails.formattedAddress) {
            this.setState({value: addressDetails.formattedAddress});
            const formValues = AddressFormatter.addressDetails2FormFields(addressDetails, true);
            initializeFormValues(formValues);
        }
    }

    getAddressField(addressComp, key, alternateKey) {
        let value;
        let alternateValue; 
        addressComp.find((comp) => {
            comp.types.find((type) => {
                if (type === key) {
                    value = comp.short_name;
                    return value;
                }
                if (alternateKey && type === alternateKey) {
                    alternateValue = comp.short_name;
                }
                return value;
            });
            return value;
        });
        if (!value && alternateValue) {
            value = alternateValue;
        }
        return value;
    }
    
    getAddressDetails(filter, searchValue) {
        if (typeof this.fetchPredictionsResolve === 'function') {
            this.fetchPredictionsResolve([]);
            clearTimeout(this.onfetchPredictionsHandlerTimeout);
        }
        const {getPlaceDetails, getAddressDetailsReverseGeocode, updateFields, 
            updateFormErrors} = this.props;
        updateFields([
            {name: 'address.streetNumber', value: ''},
            {name: 'address.frazione', value: undefined}
        ], false);
        const that = this;
        getPlaceDetails(searchValue[0]).then((response) => {
            const addressComp = response.address_components;
            const street = this.getAddressField(addressComp, AddressComponents.STREET);
            if (street) {
                updateFormErrors({'address.street': ''});
                this.setState({isAddressBad: false});
                updateFields([
                    {name: 'address.street', value: street.toUpperCase()},
                    {name: 'address.city', 
                        value: (this.getAddressField(addressComp, 
                            AddressComponents.CITY_LOCALITY, AddressComponents.CITY).toUpperCase())},
                    {name: 'address.stateOrProvince', 
                        value: (this.getAddressField(addressComp, AddressComponents.STATE_PROVINCE).toUpperCase())},
                    {name: 'address.fulladdress',
                        value: response.formatted_address
                    }
                ], false);
                
                if (this.checkPostalCodeAndStreetNumber(addressComp)) {
                    updateFields([
                        {name: 'address.postalCode', 
                            value: this.getAddressField(addressComp, AddressComponents.POSTAL_CODE)},
                        {name: 'address.streetNumber', 
                            value: this.getAddressField(addressComp, AddressComponents.STREET_NUMBER)}
                    ], false);
                    this.setState({showStreetNumber: false});
                    this.setShowStreetNumber(false);
                } else {
                    if (!this.getAddressField(addressComp, AddressComponents.STREET_NUMBER)) {
                        this.setState({showStreetNumber: true});
                        this.setShowStreetNumber(true);
                    } else {
                        updateFields([
                            {name: 'address.streetNumber', 
                                value: this.getAddressField(addressComp, AddressComponents.STREET_NUMBER)}
                        ], false);
                    }       
                    const {geometry: {location}} = response;
                    getAddressDetailsReverseGeocode(location.lat(), location.lng()).then((address) => {
                        const postalCode = this.getAddressField(address.address_components
                            , AddressComponents.POSTAL_CODE);
                        const city = (this.getAddressField(address.address_components, 
                            AddressComponents.CITY_LOCALITY, AddressComponents.CITY));
                        const cityToUpperCase = city && city.toUpperCase();
                        updateFields([
                            {name: 'address.postalCode', value: postalCode},
                            {name: 'address.city', value: cityToUpperCase}  
                        ], false);
                    });
                }
            } else {
                const showMessage = {
                    id: 'ADDR_TOO_BROAD',
                    defaultMessage: defaultMessages.address_too_broad
                };
                this.setState({errormessage: defaultMessages.address_too_broad});
                this.setState({isAddressBad: true});
                updateFormErrors({'address.street': [showMessage]});
                this.setState({showStreetNumber: false});
                this.setShowStreetNumber(true);
            }
        });
    } 

    setShowStreetNumber() {
        const {showStreetNumber} = this.state;
        const {setShowStreetNumber} = this.props;
        setShowStreetNumber(showStreetNumber);
    }

    fetchPredictions(event) {
        const {getPlacesPredictions, updateFormErrors, updateFields} = this.props;
        return new Promise((resolve, reject) => {
            updateFormErrors({'address.fulladdress': ''});
            this.setState({isAddressBad: false});
            this.fetchPredictionsResolve = resolve;
            if (event.length > 0) {
                this.onfetchPredictionsHandlerTimeout = setTimeout(() => {
                    getPlacesPredictions(event).then((response) => {
                        resolve(response);
                    }, (error) => {
                        reject(error);
                    });
                }, 200);
            } else {
                const showMessage = {
                    id: 'ADDR_MISSING',
                    defaultMessage: defaultMessages.full_address_validation_presence
                };
                updateFormErrors({'address.fulladdress': [showMessage]});
                this.setState({isAddressBad: true});
                this.setState({errormessage: defaultMessages.full_address_validation_presence});
                updateFields([{name: 'address.fulladdress', value: ''}], false);
            }
        }); 
    }

    checkPostalCodeAndStreetNumber(addressComp) {
        const streetNumber = this.getAddressField(addressComp, AddressComponents.STREET_NUMBER);
        const postalCode = this.getAddressField(addressComp,
             AddressComponents.POSTAL_CODE);
        return !!postalCode && !!streetNumber;
    }
    
    render() {
        const {
            intl,
            configParams
        } = this.props;
        const {showMailbox} = configParams;
        const {showStreetNumber, value, isAddressBad, errormessage} = this.state;
        const streetNameWrapperClass = classNames('col-xs-12', {
            'col-sm-9': showMailbox && !showStreetNumber,
            'col-sm-6': (showMailbox && showStreetNumber) || !showMailbox
        });
        return (
            <div className="ds-address-widget ds-address-geo-view">
                <div className="ds-row">
                    <MandatoryField
                        Component={AutoCompleteFilter}
                        label={intl.formatMessage(defaultMessages.address_details_title_part_2)}
                        name="address.fulladdress"
                        config={{fieldWrapperClassName: streetNameWrapperClass}}
                        constraints={this.validations.getValidationsForField('fulladdress')}
                        highlightResults="true"
                        onChangeHandler={this.fetchPredictions}
                        onFilterChange={this.getAddressDetails}
                        autoComplete="fakeaddressStreet"
                        formInputClassName="ds-form__input"
                        formContainerClassName="autocomplete-form"
                        hideSearchIcon="true"
                        filterCriteria="search"
                        placeholder={intl.formatMessage(defaultMessages.address_placeholder)}
                        value={value}
                        generalError={isAddressBad ? intl.formatMessage(errormessage) : undefined}
                        backTickAllowed="true"
                    />
                    {showStreetNumber && <MandatoryField
                        Component={Input}
                        label={intl.formatMessage(defaultMessages.street_number)}
                        name="address.streetNumber"
                        type="text"
                        config={{fieldWrapperClassName: 'col-xs-12 col-sm-3'}}
                        constraints={this.validations.getValidationsForField('streetNumber')}
                        skipConstraints={['presence']}
                        autoComplete="fakeaddressStreetNumber"
                        usePlaceholder="true"
                        placeholder={intl.formatMessage(defaultMessages.street_number_placeholder)}
                    />}
                    {showMailbox && <Field
                        Component={Input}
                        label={intl.formatMessage(defaultMessages.mail_box)}
                        name="address.mailBox"
                        type="text"
                        usePlaceholder="true"
                        placeholder={intl.formatMessage(defaultMessages.mail_box_placeholder)}
                        constraints={this.validations.getValidationsForField('mailBox')}
                        config={{fieldWrapperClassName: 'col-xs-12 col-sm-3'}}
                    />}
                </div>
            </div>
        );
    }
}
