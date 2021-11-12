import PropTypes from 'prop-types';
import React from 'react';
import _isEmpty from 'lodash/isEmpty';
import defaultMessages from './Address.i18n';
import AddressFormatter from './utils/Address.formatter';

class PropsProvider {
    constructor(context) {
        this.context = context;
    }

    /**
     * build props for the views
     */
    getComponentProps(props) {
        return {
            ...props,
            intl: props.intl,
            configParams: {...props.config},
            title: this.getTitleProps(props),
            referenceData: this.getRefernceData(props),
            addressDetails: this.getAddressDetailsProps(props)
        };
    }

    getTitleProps(props) {
        const {intl} = props;
        return {
            addressTitlePart1: intl.formatMessage(defaultMessages.address_details_title_part_1),
            addressTitlePart2: intl.formatMessage(defaultMessages.address_details_title_part_2),
            addressSubTitle: intl.formatMessage(defaultMessages.address_details_subtitle_text),
            addressInfoTextTitle: intl.formatMessage(defaultMessages.address_details_information_text)
        };
    }

    getRefernceData(props) {
        return {
            countries: props.countries,
            states: props.states && props.address && props.states[props.address.country],
            citiesList: props && props.citiesList ? props.citiesList : []
        };
    }

    getAddressDetailsProps(props) {
        const {address, validatedAddress} = props;
        const {countries, states} = this.getRefernceData(props);
        // even if address is empty set default country
        // required for address autocomplete REST
        if (_isEmpty(address)) {
            return {country: props.config.defaultCountry};
        }
        return {
            ...address,
            formattedAddress: AddressFormatter.formatAddress(address, countries, states, props.config)
        };
    }

    getPropTypes() {
        return {
            actions: PropTypes.object,
            configParams: PropTypes.object,
            title: React.PropTypes.shape({
                addressTitlePart1: PropTypes.string,
                addressTitlePart2: PropTypes.string,
                addressSubTitle: PropTypes.string,
                addressInfoTextTitle: PropTypes.string
            }),
            /* commented out to avoid warning in test page when string is passed
            addressDetails: React.PropTypes.shape({
                formattedAddress: PropTypes.string,
                addressLine1: PropTypes.string,
                addressLine2: PropTypes.string,
                addressLine3: PropTypes.string,
                city: PropTypes.string,
                country: PropTypes.string,
                state: PropTypes.string,
                postalCode: PropTypes.string
            }),
            */
            formattedAddressForValidation: PropTypes.string,
            addressSuggestions: PropTypes.array,
            referenceData: React.PropTypes.shape({
                countries: PropTypes.array,
                states: PropTypes.array
            }),
            isUserInteractionForInvalidAddress: PropTypes.bool,
            saveAddressFromView: PropTypes.bool,
            saveAddressCallback: PropTypes.func,
            validateForm: PropTypes.bool,
            validateFormCallback: PropTypes.func,
            validateAddressCallback: PropTypes.func
        };
    }
}

export default PropsProvider;
