/**
 * Address view for View display mode
 *
 */
 
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import AddressTitleView from './Address.titleView';
import defaultMessages from '../../Address.i18n';
import {DISPLAY_MODE} from '../../Address.consts';

export default class ReviewAddressView extends Component {

    constructor(props) {
        super(props);
        this.bindMethods();
    }

    bindMethods() { // eslint-disable-line react/sort-comp
        this.getActionComponents = this.getActionComponents.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
    }

    /**
     * this handler is triggerd when change link is selected (in View mode)
     * - change from View mode to Edit mode to allow updating the address details
     */
    changeHandler() {
        this.props.handleState({displayMode: DISPLAY_MODE.EDIT}); // same AEM page mode change 
        this.props.setAddressDetails(this.props.addressDetails);
        // if naigation url is present outcome will navigate to new AEM page
        // with widget in EDIT mode 
        // this approach is to handle dual requirement of navigating to new page or not 
        this.props.onChangeClick(); 
    }

    /**
     * components for user actions - change
     */
    getActionComponents() {
        const {configParams} = this.props;
        return (
            <span>
                {
                    configParams.displayMode === DISPLAY_MODE.VIEW &&
                    configParams.showChangeLinkInViewMode &&
                    <a className="ds-btn ds-btn--link address-link-change" onClick={this.changeHandler}>
                        <FormattedMessage {...defaultMessages.address_change_label} />
                    </a>
                }
            </span>
        );
    }

    render() {
        const {
            configParams, 
            addressDetails,
            title
        } = this.props;

        const titleProps = {
            configParams,
            title,
            getAdditionalActions: this.getActionComponents
        };

        return (
            <section className="ds-address-review">
                <AddressTitleView {...titleProps} />
                <div className="ds-text-reg address-formatted-line">
                    {addressDetails.formattedAddress}
                </div>
            </section>
        );
    }
}

ReviewAddressView.PropTypes = {
    actions: PropTypes.object,
    configParams: PropTypes.object,
    displayMode: PropTypes.string,
    title: React.PropTypes.object
    // addressDetails: React.PropTypes.object commented out to avoid warning in test page when string is passed
};
