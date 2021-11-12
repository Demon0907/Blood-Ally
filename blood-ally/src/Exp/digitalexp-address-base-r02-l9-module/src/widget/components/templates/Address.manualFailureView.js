import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import defaultMessages from '../../Address.i18n';

export default class ManualAddressFailureView extends Component {

    render() {
        return (
            <div className="ds-address-widget">
                <div className="ds-row ds-coverage-html">
                    <FormattedMessage {...defaultMessages.manualAddressFailedHTML} />
                </div>
            </div>
        );
    }
}
