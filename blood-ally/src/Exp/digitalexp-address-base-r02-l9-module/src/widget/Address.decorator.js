import PropTypes from 'prop-types';
import React from 'react';
import {Container} from 'digitalexp-common-components-l9';
import defaultConfig from './Address.config';

const ContainerDecorator = Container({
    config: {
        ...defaultConfig
    },
    propTypes: {
        config: React.PropTypes.shape({
            displayMode: PropTypes.string,
            showSubmit: PropTypes.bool,
            createAddressUponSubmit: PropTypes.bool,
            allowInvalidAddress: PropTypes.bool,
            showAddressTitle: PropTypes.bool,
            showAddressIcon: PropTypes.bool,
            showInformationText: PropTypes.bool,
            showSubTitle: PropTypes.bool,
            showChangeLinkInViewMode: PropTypes.bool,
            showCancelLinkInEditMode: PropTypes.bool,
            showSaveLinkInEditMode: PropTypes.bool,
            showAddressLine2: PropTypes.bool,
            showAddressLine3: PropTypes.bool,
            showCountry: PropTypes.bool,
            showState: PropTypes.bool,
            validateMandatoryCity: PropTypes.bool,
            validateMandatoryCountry: PropTypes.bool,
            validateMandatoryState: PropTypes.bool,
            validateMandatoryPostalCode: PropTypes.bool,
            addressLine1MaxChars: PropTypes.number,
            addressLine2MaxChars: PropTypes.number,
            addressLine3MaxChars: PropTypes.number,
            addressAutoComplete: PropTypes.bool,
            minimumCharsForAutoComplete: PropTypes.number,
            minimumTimeForAutoCompleteRepeat: PropTypes.number
        }),
        addressId: PropTypes.string // eslint-disable-line react/no-unused-prop-types
        /* commented out to avoid warning in test page when string is passed
        addressDetails: React.PropTypes.shape({ // eslint-disable-line react/no-unused-prop-types
            formattedAddress1: PropTypes.string,
            formattedAddress2: PropTypes.string,
            formattedAddress3: PropTypes.string,
            city: PropTypes.string,
            stateOrProvince: PropTypes.string,
            postalCode: PropTypes.string,
            country: PropTypes.string
        }),
        */
    }
});

export default ContainerDecorator;
