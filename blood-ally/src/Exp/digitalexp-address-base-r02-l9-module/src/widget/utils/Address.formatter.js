/**
 * utility for formatting address details into a single line
 *
 */

import _filter from 'lodash/filter';
import _find from 'lodash/find';
import _includes from 'lodash/includes';
import _isEmpty from 'lodash/isEmpty';
import getConfig from 'digitalexp-runtime-configuration-l9';

/**
 * convert form field values to address details object.
 * @param values - the values of the form fields, keys are field names, i.e., address.addressLine1
 */
function formFields2AddressDetails(values) {
    if (_isEmpty(values)) {
        return {};
    }
    const address = {};
    if (values.address && values.address.street) {
        address.street = values.address.street;
        address.streetNumber = values.address.streetNumber;
        address.city = values.address.city;
        address.stateOrProvince = values.address.stateOrProvince;
        address.postalCode = values.address.postalCode;
        address.mailBox = values.address.mailBox;
        address.displayStateOrProvince = values.address.displayStateOrProvince || values.address.stateOrProvince;
    } else {
        address.street = values['address.street'];
        address.streetNumber = values['address.streetNumber'];
        address.mailBox = values['address.mailBox'];
        address.city = values['address.city'];
        address.stateOrProvince = values['address.stateOrProvince'];
        address.postalCode = values['address.postalCode'];
        address.frazione = values['address.frazione'];
        address.displayStateOrProvince = values['address.displayStateOrProvince'] || values['address.stateOrProvince'];
    }
    if (values.address && values.address.streetNumberManual) {
        address.streetNumber = values.address.streetNumberManual;         
        address.postalCode = values.address.postalCode1;
    }
    return address;
}

/**
 * convert address resource object into object to be used by the form
 * @param addressDetails {object}
 */
function addressDetails2FormFields(addressDetails, removeFrazione) {
    if (removeFrazione) {
        return {
            'address.street': addressDetails.street,
            'address.streetNumber': addressDetails.streetNumber,
            'address.mailBox': addressDetails.mailBox,
            'address.city': addressDetails.city,
            'address.stateOrProvince': addressDetails.stateOrProvince,
            'address.postalCode': addressDetails.postalCode,
            'address.fulladdress': addressDetails.formattedAddress
        };
    }
    return {
        'address.street': addressDetails.street,
        'address.streetNumber': addressDetails.streetNumber,
        'address.mailBox': addressDetails.mailBox,
        'address.city': addressDetails.city,
        'address.stateOrProvince': addressDetails.stateOrProvince,
        'address.postalCode': addressDetails.postalCode,
        'address.frazione': addressDetails.frazione,
        'address.fulladdress': addressDetails.formattedAddress
    };
}

function addressManual2FormFields(addressDetails, removeFrazione) {
    if (removeFrazione) {
        return {
            'address.street': addressDetails.street,
            'address.streetNumber': addressDetails.streetNumberManual,
            'address.mailBox': addressDetails.mailBox,
            'address.city': addressDetails.city,
            'address.stateOrProvince': addressDetails.stateOrProvince,
            'address.postalCode': addressDetails.postalCode,
            'address.fulladdress': addressDetails.formattedAddress
        };
    }
    return {
        'address.street': addressDetails.street,
        'address.streetNumber': addressDetails.streetNumberManual,
        'address.mailBox': addressDetails.mailBox,
        'address.city': addressDetails.city,
        'address.stateOrProvince': addressDetails.stateOrProvince,
        'address.postalCode': addressDetails.postalCode,
        'address.frazione': addressDetails.frazione,
        'address.fulladdress': addressDetails.formattedAddress
    };
}

function formFields2ManualAddress(values) {
    if (_isEmpty(values)) {
        return {};
    }

    const address = {};
    if (values.address && values.address.street) {
        address.street = values.address.street;
        address.streetNumber = values.address.streetNumberManual;
        address.city = values.address.city;
        address.stateOrProvince = values.address.stateOrProvince;
        address.postalCode = values.address.postalCode;
    } else {
        address.street = values['address.street'];
        address.streetNumber = values.address.streetNumberManual;
        address.mailBox = values['address.mailBox'];
        address.city = values['address.city'];
        address.stateOrProvince = values['address.stateOrProvince'];
        address.postalCode = values['address.postalCode'];
        address.frazione = values['address.frazione'];
    }
    return address;
}

function isAddressValid(address) { // eslint-disable-line class-methods-use-this
    return (
        address.errorCode === 0 || address.errorCode === '0'
    );
}

function isSingleNormalizedAddress(address = {}) {
    const {validAddressList = []} = address;
    return (
        (address.errorCode !== 0) && (validAddressList.length === 1)
    );
}

/**
 * get code and return display value from a list.
 * @param code {string} code that needs to be decoded.
 * @param list {array} list to use for decoding, assuming each item in the list contains both the code and the decode.
 * @param codeFieldName {string} field name in the list item containing the code.
 * @param decodeFieldName {string} field name in the list item containing the decode.
 */
function getDisplayValueFromList(code, list, codeFieldName = 'name', decodeFieldName = 'displayName') {
    const item = _find(list, i => i[codeFieldName] === code);
    const decode = item && item[decodeFieldName];
    return _isEmpty(decode) ? code : decode;
}

/**
 * format address details into a single line
 * - fields are presented separated by configurable separator ("," by default).
 * - fields order: Address line 1, Address line 2, Address line 3, City, State, Postal code, Country.
 * - Parameters that are configured not to be displayed will not be concatenated in the address line.
 * - If a field is empty it will not be concatenated in the address line.
 * @param address {object}
 * @param countries {array} ref data, format: [ {name, displayName}, ... ]
 * @param states {object} ref data, format: { countryId1: [ {name, displayName}, ...], countryId2: [...], ... }
 * @param config {object} with show flags, e.g, showCountry (show + FieldName). field is displayed unless its flag=false
 */
function formatAddress(address, countries = [], states = {}, config) {
    if (_isEmpty(address) || (address && !address.street)) {
        return '';
    }
    const separator = getConfig().addressDetailsSeparator;
    const {
        streetNumber,
        street,
        city,
        stateOrProvince,
        postalCode
    } = address;

    // currently displayStateOrProvince & displayCountry are not used even if populated,
    // instead, we decode based on ref lists
    const {
        showCity,
        showState,
        showPostalCode,
        showCountry,
        defaultCountry
    } = config;

    let addressLine;
    
    if (!_isEmpty(street)) {
        addressLine = `${street}`;
    }
    if (!_isEmpty(streetNumber)) {
        addressLine += `${separator} ${streetNumber}`;
    }
    if (!_isEmpty(postalCode) && showPostalCode !== false) {
        addressLine += `${separator} ${postalCode}`;
    }
    if (!_isEmpty(city) && showCity !== false) {
        addressLine += `${separator} ${city}`;
    }
    if (!_isEmpty(stateOrProvince) && showState !== false) {
        const stateVal = this.getDisplayValueFromList(stateOrProvince, states);
        addressLine += `${separator} ${stateVal}`;
    }
    if (!_isEmpty(defaultCountry) && showCountry !== false) {
        const countryVal = this.getDisplayValueFromList(defaultCountry, countries, 'id');
        addressLine += `${separator} ${countryVal}`;
    }
    return addressLine;
}

/**
 * split address between to lines 1-3.
 * the implementation is naive, and splits the address fields according to no. of fields and no. of displayed lines.
 * @param address {object}
 * @param fields {array} remaining fields that should be split between lines 1-3
 * @param config {object} with conditional flags like showAddressLine2 and constaints params like addressLine1MaxChars
 * @param separator {string}
 */
function splitLines(address, fields, config, separator) {
    const {
        addressLine1MaxChars, addressLine2MaxChars, addressLine3MaxChars,
        showAddressLine2, showAddressLine3
    } = config;

    const str = fields.join(separator);

    // only line 1 is displayed -> nop
    if (!showAddressLine2 && !showAddressLine3) {
        address.formattedAddress1 = str;
        return address;
    }

    // remaining line is short -> nop
    // if (str.length < addressLine1MaxChars / 2) {
    //     address.formattedAddress1 = str;
    //     return address;
    // }

    let maxLength;
    let split;

    if (showAddressLine2 && !showAddressLine3) { // only lines 1,2 are displayed
        maxLength = addressLine1MaxChars + addressLine2MaxChars;
        // remaining line is too long -> nop
        if (str.length > maxLength) {
            address.formattedAddress1 = str;
            return address;
        }
        split = 2;
    } if (!showAddressLine2 && showAddressLine3) { // only lines 1,3 are displayed
        maxLength = addressLine1MaxChars + addressLine3MaxChars;
        // remaining line is too long -> nop
        if (str.length > maxLength) {
            address.formattedAddress1 = str;
            return address;
        }
        split = 2;
    } else if (showAddressLine2 && showAddressLine3) { // lines 1,2,3 are displayed
        maxLength = addressLine1MaxChars + addressLine2MaxChars + addressLine3MaxChars;
        // remaining line is too long -> nop
        if (str.length > maxLength) {
            address.formattedAddress1 = str;
            return address;
        }
        split = 3;
    }

    // line 1
    const size1 = Math.ceil(fields.length / split);
    for (let i = 0; i < size1; i += 1) {
        address.formattedAddress1 += fields[i];
        if (i + 1 < size1) {
            address.formattedAddress1 += separator;
        }
    }
    if (split === 2) {
        // line 2 or 3
        let line = '';
        for (let i = size1; i < fields.length; i += 1) {
            line += fields[i];
            if (i + 1 < fields.length) {
                line += separator;
            }
        }
        if (showAddressLine2) {
            address.formattedAddress2 = line;
        } else {
            address.formattedAddress3 = line;
        }
    } else {
        // line 2
        const size2 = size1 + Math.ceil((fields.length - size1) / split);
        for (let i = size1; i < size2; i += 1) {
            address.formattedAddress2 += fields[i];
            if (i + 1 < size2) {
                address.formattedAddress2 += separator;
            }
        }
        // line 3
        for (let i = size2; i < fields.length; i += 1) {
            address.formattedAddress3 += fields[i];
            if (i + 1 < fields.length) {
                address.formattedAddress3 += separator;
            }
        }
    }

    return address;
}

/**
 * get address returned from auto-complete service and return address object with the address details split into the
 * relevant fields.
 *
 * The logic for splitting address into the address fields:
 * - Address elements of types Postal Code, City, StateOrProvince and Country are mapped to the Postal Code, City,
 *   State and Country (if displayed) fields on the screen, respectively.
 * - Other parts of the address are split between Address Line 1-3 fields, in the order in which they appear
 *   in the formattedAddress line as returned from auto-complete service.
 * - If Address Line 2 and Address Line 3 fields are not displayed (by setup of behavior parameters), the other
 *   parts of the address will be displayed in Address Line 1 field.
 * - If Address Line 3 field is not displayed (by setup of behavior parameter), the other parts of the address will
 *   be split between Address Line 1 and Address Line 2 fields.
 *
 * Example:
 * The address line returned from auto-complete is: 514 S. Magnolia St.,Orlando, FL, 32806
 * Address elements are:
 *   514 S. Magnolia St.(Element Type = Street)
 *   Orlando (Element Type = City)
 *   FL (Element Type = State)
 *   32806 (Element Type = Postal Code)
 *
 * In the Address form in UI:
 *   Orlando will be mapped to City field
 *   FL will be mapped to State field
 *   32806 will be mapped to Postal Code field
 * The remaining part of the address line (after removing City, State and Postal Code elements) is: 514 S. Magnolia St.
 * This part will be mapped to Address Line 1 field.
 *
 * @param address {object}
 * @param countries {array} ref data, format: [ {name, displayName}, ... ]
 * @param states {object} ref data, format: { countryId1: [ {name, displayName}, ...], countryId2: [...], ... }
 * @param config {object} with conditional flags like showAddressLine2 and constaints params like addressLine1MaxChars
 */
function parseAutoCompleteAddress(address, countries, states, config) { // eslint-disable-line class-methods-use-this
    let separator = getConfig().addressDetailsSeparator;
    separator += ' ';

    const {formattedAddress} = address; // formattedAddress field should contain the entire address

    let parsedAddress = {
        formattedAddress1: '',
        formattedAddress2: '',
        formattedAddress3: '',
        city: address.city,
        stateOrProvince: address.stateOrProvince,
        postalCode: address.postalCode,
        country: address.country
    };

    const fields = Object.values(parsedAddress);

    // find the fields other than city, state, country, postal code
    // these will be populated into lines 1-3
    let remainingFieldsArray = formattedAddress.split(separator);
    remainingFieldsArray = _filter(remainingFieldsArray, (val) => {
        return !_includes(fields, val);
    });

    parsedAddress = splitLines(parsedAddress, remainingFieldsArray, config, separator);

    // keep any original fields that were returnd from autoComplete REST and are not managed here
    parsedAddress = {...address, ...parsedAddress};

    return parsedAddress;
}

function isEqualAddress(address, addressInput) {
    if (address && address.city === addressInput.city &&
    address.frazione === addressInput.frazione &&
    address.streetNumber === addressInput.streetNumber &&
    address.mailBox === addressInput.mailBox &&
    address.postalCode === addressInput.postalCode &&
    address.stateOrProvince === addressInput.stateOrProvince &&
    address.street === addressInput.street &&
    address.externalId === addressInput.externalId
    ) {
        return true;
    }
    return false;
}

export default {
    formFields2AddressDetails,
    addressDetails2FormFields,
    isAddressValid,
    getDisplayValueFromList,
    formatAddress,
    parseAutoCompleteAddress,
    isSingleNormalizedAddress,
    isEqualAddress,
    formFields2ManualAddress,
    addressManual2FormFields
};
