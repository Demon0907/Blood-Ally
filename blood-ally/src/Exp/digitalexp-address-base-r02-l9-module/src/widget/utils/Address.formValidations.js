import Messages from '../Address.i18n';
import {GeneralMessageConfiguration, DISPLAY_MODE} from '../Address.consts';

export default class AddressFormValidationsL9 {

    /**
     * @param config {object} configuration flags related to validations, like mandatory flag for a field.
     * @param intl {react-intl object}
     */
    constructor(config, intl) {
        this.intl = intl;
        this.setValidations(config);
    }

    /**
     * build validations for the address form.
     * consist of static validations & dynamic validations per widget's behavior parameters.
     * @param config {object} same as passed to constructor.
     */
    setValidations(config) {
        const basicValidations = this.getBasicValidations(config);
        const dynamicValidations = this.getAdditionalValidations(config);
        this.validations = {...basicValidations, ...dynamicValidations};
    }

    /**
     * pre-defined validations
     * @param config {object} same as passed to constructor
     */
    getBasicValidations(config) {
        const validations = {
            addressLine1: {
                presence: {message: {
                    ...Messages.address_line_1_validation_presence,
                    ...{fieldLabel: this.intl.formatMessage(Messages.address_line_1_label),
                        errorCategory: GeneralMessageConfiguration.MISSING_MANDATORY}
                }},
                length: {
                    maximum: config.addressLine1MaxChars,
                    tooLong: {
                        ...Messages.address_line_1_validation_max_length,
                        ...{defaultMessage:
                            this.intl.formatMessage(Messages.address_line_1_validation_max_length,
                                {maxLength: config.addressLine1MaxChars})},
                        ...{fieldLabel: this.intl.formatMessage(Messages.address_line_1_label),
                            errorCategory: GeneralMessageConfiguration.FORMAT_VALIDATION}
                    }
                }
            },
            addressLine2: {
                length: {
                    maximum: config.addressLine2MaxChars,
                    tooLong: {
                        ...Messages.address_line_2_validation_max_length,
                        ...{defaultMessage:
                            this.intl.formatMessage(Messages.address_line_2_validation_max_length,
                                {maxLength: config.addressLine2MaxChars})},
                        ...{fieldLabel: Messages.address_line_2_label.defaultMessage,
                            errorCategory: GeneralMessageConfiguration.FORMAT_VALIDATION}
                    }
                }
            },
            addressLine3: {
                length: {
                    maximum: config.addressLine3MaxChars,
                    tooLong: {
                        ...Messages.address_line_3_validation_max_length,
                        ...{defaultMessage:
                            this.intl.formatMessage(Messages.address_line_3_validation_max_length,
                                {maxLength: config.addressLine3MaxChars})},
                        ...{fieldLabel: Messages.address_line_3_label.defaultMessage,
                            errorCategory: GeneralMessageConfiguration.FORMAT_VALIDATION}
                    }
                }
            },
            addressLineManual: {
                presence: {message: {
                    ...Messages.address_line_1_validation_presence,
                    ...{fieldLabel: this.intl.formatMessage(Messages.road_street_other),
                        errorCategory: GeneralMessageConfiguration.MISSING_MANDATORY}
                }},
                length: {
                    maximum: config.addressLine1MaxChars,
                    tooLong: {
                        ...Messages.address_line_1_validation_max_length,
                        ...{Messages:
                            this.intl.formatMessage(Messages.address_line_1_validation_max_length,
                                {maxLength: config.addressLine1MaxChars})},
                        ...{fieldLabel: this.intl.formatMessage(Messages.road_street_other),
                            errorCategory: GeneralMessageConfiguration.FORMAT_VALIDATION}
                    }
                }
            },
            streetNumber: {
                presence: {
                    message: {
                        ...Messages.street_number_validation_presence,
                        ...{fieldLabel: this.intl.formatMessage(Messages.street_number),
                            errorCategory: GeneralMessageConfiguration.MISSING_MANDATORY}
                    }
                },
                length: {
                    maximum: 20,
                    tooLong: {
                        ...Messages.street_number_validation_length,
                        ...{fieldLabel: this.intl.formatMessage(Messages.street_number),
                            errorCategory: GeneralMessageConfiguration.FORMAT_VALIDATION}
                    }
                }
            },
            streetNumberManual: {
                presence: {
                    message: {
                        ...Messages.street_number_validation_presence,
                        ...{fieldLabel: this.intl.formatMessage(Messages.street_number_manual),
                            errorCategory: GeneralMessageConfiguration.MISSING_MANDATORY}
                    }
                },
                length: {
                    maximum: 20,
                    tooLong: {
                        ...Messages.street_number_validation_length,
                        ...{fieldLabel: this.intl.formatMessage(Messages.street_number_manual),
                            errorCategory: GeneralMessageConfiguration.FORMAT_VALIDATION}
                    }
                }
            },
            fulladdress: {
                presence: {
                    message: {
                        ...Messages.full_address_validation_presence,
                        ...{fieldLabel: this.intl.formatMessage(Messages.address_details_title_part_2),
                            errorCategory: GeneralMessageConfiguration.MISSING_MANDATORY}
                    }
                }
            },
            province: {
                presence: {
                    message: {
                        ...Messages.province_validation_presence,
                        ...{fieldLabel: this.intl.formatMessage(Messages.province),
                            errorCategory: GeneralMessageConfiguration.MISSING_MANDATORY}
                    }
                }
            },
            cityL9: {
                presence: {
                    message: {
                        ...Messages.city_validation_presence,
                        ...{fieldLabel: this.intl.formatMessage(Messages.city),
                            errorCategory: GeneralMessageConfiguration.MISSING_MANDATORY}
                    }
                }
            },
            postalCodeL9: {
                presence: {
                    message: {
                        ...Messages.postal_code_validation_presence,
                        ...{fieldLabel: this.intl.formatMessage(Messages.postal_code),
                            errorCategory: GeneralMessageConfiguration.MISSING_MANDATORY}
                    }
                },
                length: {
                    maximum: config.postalCodeMaxChars,
                    minimum: config.postalCodeMaxChars,
                    tooLong: {
                        ...Messages.postal_code_validation_max_length,
                        ...{defaultMessage:
                            this.intl.formatMessage(Messages.postal_code_validation_max_length,
                                {maxLength: config.postalCodeMaxChars})},
                        ...{fieldLabel: this.intl.formatMessage(Messages.address_postalCode_label),
                            errorCategory: GeneralMessageConfiguration.FORMAT_VALIDATION
                        }
                    },
                    tooShort: {
                        ...Messages.postal_code_validation_max_length,
                        ...{defaultMessage:
                            this.intl.formatMessage(Messages.postal_code_validation_max_length,
                                {maxLength: config.postalCodeMaxChars})},
                        ...{fieldLabel: this.intl.formatMessage(Messages.address_postalCode_label),
                            errorCategory: GeneralMessageConfiguration.FORMAT_VALIDATION
                        }
                    }
                }
            },
            mailBox: {
                length: {
                    maximum: config.mailBoxChars,
                    tooLong: {
                        ...Messages.mail_box_validation_max_length,
                        ...{defaultMessage:
                            this.intl.formatMessage(Messages.mail_box_validation_max_length,
                                {maxLength: config.mailBoxChars})},
                        ...{fieldLabel: this.intl.formatMessage(Messages.mail_box),
                            errorCategory: GeneralMessageConfiguration.FORMAT_VALIDATION}
                    }
                }
            }
        };
        return validations;
    }

    /**
     * additional mandatory validations based on behavior parameters
     * @param config {object} same as passed to constructor
     */
    getAdditionalValidations(config) { // eslint-disable-line class-methods-use-this
        let validations = {};

        if (config.validateMandatoryCity) {
            validations = {...validations,
                city: {
                    presence: {message: {
                        ...Messages.city_validation_presence,
                        ...{fieldLabel: Messages.address_city_label.defaultMessage,
                            errorCategory: GeneralMessageConfiguration.MISSING_MANDATORY}
                    }}
                }
            };
        }
        if (config.validateMandatoryCountry) {
            validations = {...validations,
                country: {
                    presence: {message: {
                        ...Messages.country_validation_presence,
                        ...{fieldLabel: Messages.address_country_label.defaultMessage,
                            errorCategory: GeneralMessageConfiguration.MISSING_MANDATORY}
                    }}
                }
            };
        }
        if (config.validateMandatoryState) {
            validations = {...validations,
                state: {
                    presence: {message: {
                        ...Messages.state_validation_presence,
                        ...{fieldLabel: Messages.address_state_label.defaultMessage,
                            errorCategory: GeneralMessageConfiguration.MISSING_MANDATORY}
                    }}
                }
            };
        }
        if (config.validateMandatoryPostalCode) {
            validations = {...validations,
                postalCode: {
                    presence: {message: {
                        ...Messages.postalCode_validation_presence,
                        ...{fieldLabel: Messages.address_postalCode_label.defaultMessage,
                            errorCategory: GeneralMessageConfiguration.MISSING_MANDATORY}
                    }}
                }
            };
        }

        if (config.displayMode === DISPLAY_MODE.SERVICEABILITY
            || config.displayMode === DISPLAY_MODE.NEW_INSTALLATION_ADDRESS) {
            validations = {...validations,
                postalCode: {
                    length: {
                        is: config.postalCodeLengthForValidation,
                        wrongLength: {
                            ...Messages.postal_code_validation_length,
                            ...{defaultMessage:
                                this.intl.formatMessage(Messages.postal_code_validation_length,
                                    {length: config.postalCodeLengthForValidation})},
                            ...{fieldLabel: Messages.postal_code_validation_length.defaultMessage,
                                errorCategory: GeneralMessageConfiguration.FORMAT_VALIDATION}
                        }
                    }
                }
            };
        }
        return validations;
    }

    /**
     * return the validations for a given field
     * @param fieldName {string} name of form field
     */
    getValidationsForField(fieldName) {
        return this.validations[fieldName];
    }
}
