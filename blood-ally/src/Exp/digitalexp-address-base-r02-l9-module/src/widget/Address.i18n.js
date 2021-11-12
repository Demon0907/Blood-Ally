import {defineMessages} from 'react-intl';
import descriptor from '../../digitalexp-address-base-r02-l9-module.descriptor';

// Import the content from the descriptor
const {content} = descriptor;
const descriptorMessages = content.reduce((map, descriptorMessage) => {
    const {itemId, defaultValue} = descriptorMessage;
    map[itemId] = {
        id: itemId,
        defaultMessage: defaultValue
    };
    return map;
}, {});

export default defineMessages({
    ...descriptorMessages
    /* 
    =====================================================================
        Note: this JS imports all message contents from the descriptor
        please define all messages in the descriptor exclusively !
    =====================================================================
     */
});
