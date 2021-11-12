import {exportGlobal} from 'digitalexp-light-framework';

import Widget from './widget/Address';
import ConnectedWidget from './widget/Address.connect';
import descriptor from '../digitalexp-address-base-r02-l9-module.descriptor';

const widgetObj = {
    Widget,
    ConnectedWidget,
    descriptor,
    id: descriptor.widgetId
};


export default widgetObj;

exportGlobal(`amdocs.widgets.${widgetObj.id}`, widgetObj);
