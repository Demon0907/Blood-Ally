import descriptor from '../../digitalexp-address-base-r02-l9-module.descriptor';

// Import the behaviors from the descriptor
const {behaviorParams} = descriptor;
const descriptorValues = behaviorParams.reduce((map, descriptorBehaviour) => {
    const {itemId, defaultValue} = descriptorBehaviour;
    map[itemId] = defaultValue;

    return map;
}, {});

export default {
    ...descriptorValues,
    inlineLoader: true,
    inlineMessage: true,
    displayMode: 'New',
    showSubmit: true,
    createAddressUponSubmit: false,
    allowInvalidAddress: true,
    showAddressIcon: false,
    showInformationText: false,
    showChangeLinkInViewMode: true,
    showCancelLinkInEditMode: true,
    showSaveLinkInEditMode: true,
    showAddressLine2: true,
    showAddressLine3: true,
    showCountry: true,
    showState: true,
    validateMandatoryCity: true,
    validateMandatoryCountry: true,
    validateMandatoryState: false,
    validateMandatoryPostalCode: true,
    addressLine1MaxChars: 50,
    addressLine2MaxChars: 50,
    addressLine3MaxChars: 50,
    mailBoxChars: 10,
    postalCodeMaxChars: 5,
    addressAutoComplete: false,
    minimumCharsForAutoComplete: 3,
    minimumTimeForAutoCompleteRepeat: 1000,
    defaultCountry: 'IT',
    defaultName: 'Address',
    showAddressTitle: false,
    showSubTitle: false
};
