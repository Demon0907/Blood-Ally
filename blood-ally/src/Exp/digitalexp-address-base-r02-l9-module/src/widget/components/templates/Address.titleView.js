/**
 * Address title view
 *
 * there are 2 title structures, each element in them is configurable
 * 1. title + icon + information text
 * 2. sub title
 * both may contain actions
 */

import React from 'react';
import {FormTitle as Title} from 'digitalexp-common-components-l9';

export default function addressTitleView({configParams,
                                          title,
                                          getAdditionalActions}) {
    const showMainTitle =
            (configParams.showAddressTitle || configParams.showAddressIcon || configParams.showInformationText);

    if (showMainTitle) {
        return (
            <Title
                config={{
                    titleClassName: 'address-details',
                    showTitle: configParams.showAddressTitle, // flag
                    titleIcon: configParams.showAddressIcon, // flag
                    showTitleText: configParams.showInformationText, // flag for info text
                    titleText: {id: 'info-title', defaultMessage: title.addressInfoTextTitle}, // info text
                    additionalActions: getAdditionalActions()
                }}
                message={{id: 'main-title', defaultMessage: `${title.addressTitlePart1} ${title.addressTitlePart2}`}}
            />
        );
    } else if (configParams.showSubTitle) { // Title component doesn't support sub title structure
        return (
            <div className="ds-title sub-title">
                <h3 className="ds-title--text">{title.addressSubTitle}</h3>
                {getAdditionalActions && getAdditionalActions().props.children}
            </div>
        );
    }
    // don't show actions when title is not displayed
    return <div />;
    /*
    return ( // reusing main title style
        <div className="ds-title main-title">
            {getAdditionalActions && getAdditionalActions().props.children}
        </div>
    );
    */
}
