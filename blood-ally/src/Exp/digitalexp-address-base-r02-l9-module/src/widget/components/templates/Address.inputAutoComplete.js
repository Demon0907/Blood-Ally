import React, {Component} from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import backDropDecorate from './backDropDecorate';

class InputAutoComplete extends Component {

    constructor(props) {
        super(props);

        this.bindMethods();

        const {values = []} = props;

        this.state = {
            // term: '', // the search text used for fetching the auto complete values
            isDisplayOptionsList: false,
            values,
            filteredValues: []
        };
    }

    /**
     * update values when props change
     * assumption: if autoCompleteActiveHandler exists in props then the component is not supposed to manage by itself
     *             the options list display/hide, in this case props should contain values & optionsListActive
     */
    componentWillReceiveProps(nextProps) {
        const {input, fieldName, optionsListActive} = nextProps;
        const {name} = input;
        // const {values} = this.state;
        const nextValues = nextProps.values;

        if (fieldName && fieldName !== name) {
            // data is not relevant for this component
            this.setState({
                values: [],
                isDisplayOptionsList: false
            });
        } else if (fieldName === name && nextValues !== undefined) {
            // data is relevant for this component > update state if handled externally
            const {autoCompleteActiveHandler} = this.props;
            if (typeof autoCompleteActiveHandler === 'function' && optionsListActive !== undefined) {
                this.setState({
                    values: nextValues,
                    isDisplayOptionsList: optionsListActive
                });
            }
        } 
    }

    bindMethods() {
        // this.findDefaultValueObject = this.findDefaultValueObject.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleChangeText = this.handleChangeText.bind(this);
        this.valueSelected = this.valueSelected.bind(this);
        this.onCleanInputValue = this.onCleanInputValue.bind(this);
    }

    /**
     * handler called via the backDrop decorator in order to hide the options list
     */
    onBackDrop() { // eslint-disable-line react/sort-comp
        if (this.state.isDisplayOptionsList) {
            this.setActive(false);
        }
    }

    /**
     * display/hide the options list
     */
    setActive(isActive) {
        const {autoCompleteActiveHandler} = this.props;
        if (typeof autoCompleteActiveHandler === 'function') {
            autoCompleteActiveHandler(isActive);
        } else {
            this.setState({isDisplayOptionsList: isActive});
        }
    }
    

    /**
     * triggerd upon change in input, do one of the following:
     * 1. get values via external handler getValuesHandler (assuming it returns Promise & may update store).
     *    it may return the values already filtered based on the given input,
     *    otherwise the values may be filtered by a second external handler filterValuesHandler.
     *    calls are delayed until minTime passes (in order not to call service too many times).
     * 2. filter the values internally, assuming this component received values via the props.
     * 
     * @param term {string} search text, may be the value of current field or an enhanced value
     */
    onChangeHandler(term) {
        const {
            getValuesHandler, 
            minTime
        } = this.props;
        
        if (typeof getValuesHandler === 'function') {
            this.delayedCallExternalValuesHandler(term, minTime);
        } else {
            const filteredValues = this.filterValues(term);
            this.setState({term});
            this.setActive(filteredValues.length > 0);
        }
    }

    /**
     * defer service call & don't call multiple times.
     * @param term {string} search text
     * @param minTime {timestamp} time to wait before next service call
     */
    delayedCallExternalValuesHandler(term, minTime) {
        const {getAutoCompleteTimer, setAutoCompleteTimer} = this.props;
        let previousTimer;
        if (typeof getAutoCompleteTimer === 'function') {
            previousTimer = getAutoCompleteTimer();
        } else {
            previousTimer = this.autocompleteTimer;
        }
        if (previousTimer) {
            clearTimeout(previousTimer); // cancel prev setTimeout
        }
        
        const {getUpdatedTermHandler, input} = this.props;

        const newTimer = setTimeout(() => {
            // recalculate term
            const origTerm = this.inputView ? this.inputView.value : term;
            let newTerm = origTerm;
            if (typeof getUpdatedTermHandler === 'function') {
                newTerm = getUpdatedTermHandler(origTerm, input.name);
            }
            this.callExternalValuesHandler(newTerm);
        }, minTime);

        if (typeof setAutoCompleteTimer === 'function') {
            setAutoCompleteTimer(newTimer);
        } else {
            this.autocompleteTimer = newTimer;
        }
    }

    /**
     * call service to get list of auto complete options based on given term
     * @param term {string} search text
     */
    callExternalValuesHandler(term) {
        const {getValuesHandler, filterValuesHandler, input} = this.props;
        // this.setState({term});
        getValuesHandler(term, input.name)
            .then((result) => {
                let values = result;
                if (typeof filterValuesHandler === 'function') {
                    values = filterValuesHandler(values, term);
                }
                this.setState({values});
                this.setActive(values.length > 0);
            }).catch((err) => {
                return err;
            });
    }

    /**
     * filter the values list based on given input.
     * @param term {string} search text provided by user in input field.
     */
    filterValues(term) {
        const {filterValuesHandler} = this.props;
        let filteredValues;

        if (typeof filterValuesHandler === 'function') {
            filteredValues = filterValuesHandler(this.props.values, term);
        } else {
            // default implementation
            const {values = [], valueFieldName} = this.props;
            filteredValues = (term === '') ? [] : values.filter((val) => {
                return val[valueFieldName].toUpperCase().includes(term.toUpperCase());
            });
        }
        this.setState({filteredValues});
        return filteredValues;
    }

    /**
     * in case values list is provided, we may need to pre-select a default value.
     * defaultValue may be object or singular
     */
    /* 
    findDefaultValueObject() {
        const {defaultValue, values = [], codeFieldName} = this.props;
        let defaultValueObject;
        if (values.length > 0) {
            let defaultCode;
            if (defaultValue === Object(defaultValue)) {
                defaultCode = defaultValue[codeFieldName];
            } else {
                defaultCode = defaultValue;
            }

            defaultValueObject = values.find((valObj) => { return valObj[codeFieldName] === defaultCode; });
        }
        return defaultValueObject;
    }
    */

    /**
     * upon focus - by default don't trigger the auto complete functionality
     * onFocusHandler, getUpdatedTermHandler - optional external handlers
     */
    handleFocus(e) {
        const origTerm = e.target.value;
        let term = origTerm;
        const {onFocusHandler, getUpdatedTermHandler, input/* , minLength */} = this.props;
        if (typeof onFocusHandler === 'function') {
            if (typeof getUpdatedTermHandler === 'function') {
                term = getUpdatedTermHandler(origTerm, input.name);
            }
            onFocusHandler(term);
            this.setActive(true);
        } 
        /*
        else {
            // default implementation
            // if values exist & term is the same -> show the values
            // if term has changed -> filter/fetch again the values
            const {filteredValues, term: prevTerm} = this.state;
            if (term === prevTerm) {
                this.setState({isDisplayOptionsList: filteredValues.length > 0 && term.length >= minLength});
            } else {
                this.handleChangeText(term, true);
            }
        }
        */
    }

    /**
     * triggerd upon change in input.
     * getUpdatedTermHandler - optional external handler to update the term, for example concatenate values from 
     *                         other fields in the form.
     * @param event {object}
     * @param isUpdatedTerm {boolean} if true then don't call external handler to get updated search term.
     */
    handleChangeText(event, isUpdatedTerm = false) {
        const origTerm = event.target.value;
        const {onChangeHandler, getUpdatedTermHandler, input, minLength} = this.props;
        
        input.onChange(event); // default handler of Field component

        let term = origTerm;
        if (!isUpdatedTerm && typeof getUpdatedTermHandler === 'function') {
            term = getUpdatedTermHandler(origTerm, input.name);
        }

        if (term.length >= minLength) {
            if (typeof onChangeHandler === 'function') {
                onChangeHandler(term);
            } else {
                this.onChangeHandler(term);
            }
        } else {
            this.setActive(false);
        }
    }

    /**
     * upon selection of a value from the list
     */
    valueSelected(val) {
        this.setActive(false);
        const {onSelectHandler} = this.props;

        if (typeof onSelectHandler === 'function') {
            onSelectHandler(val);
        }
    }

    /**
     * highlight the search term inside the value.
     * note that if the filtering is external, this may not highlight the search term correctly.
     * @param label {string} the displayed value to be styled
     * @param value {string} the search term
     */
    highlightLabel(label, value, className = 'ds-search__highlight') { // eslint-disable-line class-methods-use-this
        if (!value) {
            return label;
        }
        return (<span>
            { 
                label.split(value)
                    .reduce((accumulator, current, index) => {
                        if (!index) {
                            return [current];
                        }
                        return accumulator.concat(
                            <span className={className} key={value + current}>{ value }</span>, current);
                    }, [])
            }
        </span>);
    }

    /**
     * upon clicking the [x] icon, clean the input value.
     * should be bound to onMouseDown in order to trigger it before the input field looses focus and the icon is hidden
     */
    onCleanInputValue() {
        const {cleanInputHandler, clearField} = this.props;
        
        clearField(); // default handler of Field component

        this.setActive(false);
        
        if (typeof cleanInputHandler === 'function') {
            cleanInputHandler();
        }
    }

    /**
     * build the list of options
     */
    renderValues() {
        const {
            limitResults,
            highlightResults,
            codeFieldName,
            valueFieldName
        } = this.props;

        const {term, values = []} = this.state;

        let options = this.state.filteredValues.length === 0 ? [...values] : [...this.state.filteredValues];
        
        if (options.length === 0) {
            return [];
        }

        if (limitResults > 0) {
            options = options.slice(0, limitResults);
        }

        const valuesList = options.map((val, i) => {
            /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
            /* eslint-disable react/no-array-index-key */
            const itemValue = highlightResults ? this.highlightLabel(val[valueFieldName], term) : val[valueFieldName];
            return (
                <li
                    className="generic-item"
                    value={val[codeFieldName]}
                    key={i}
                    onClick={() => this.valueSelected(val)}>
                    <div className="ds-item">
                        {itemValue}
                    </div>
                </li>
            );
        });

        return valuesList;
    }

    render() {
        const valuesList = this.renderValues();

        const {isDisplayOptionsList} = this.state;

        const {
            input, 
            label, 
            type = 'text',
            usePlaceholder, 
            meta: {error},
            fieldIconClassName, 
            fieldWrapperClassName,
            optionsListTitle,
            optionsListTitleActive
        } = this.props;

        let {fieldClassName = 'ds-text'} = this.props;

        const {name} = input;

        fieldClassName = classNames('ds-form__input', {
            // 'autocomplete-input': true,
            [fieldClassName]: fieldClassName,
            [fieldWrapperClassName]: Boolean(fieldWrapperClassName)
        });

        const wrapperClassName = classNames('ds-form__input--wrapper ds-autocomplete', {
            // 'autocomplete-container': true,
            active: isDisplayOptionsList && valuesList.length > 0,
            [fieldWrapperClassName]: Boolean(fieldWrapperClassName)
        });

        const valuesClass = classNames({
            'autocomplete-values': true,
            'ds-search__options': true
        });

        return (
            <div className={wrapperClassName}>
                <input
                    ref={(instance) => { this.inputView = instance; }}
                    id={name}
                    {...input}
                    onChange={this.handleChangeText}
                    // onFocus={this.handleFocus}
                    placeholder={usePlaceholder ? label : ''}
                    type={type}
                    className={fieldClassName}
                    autoComplete="off"
                />
                <button
                    className="ds-form__icon ds-form__icon--close"
                    onMouseDown={this.onCleanInputValue}
                    tabIndex="-1" />
                {fieldIconClassName && <div className={`ds-form__icon ${fieldIconClassName}`} />}
                {error && <div className="ds-notification__error--text">{error}</div>}
                {valuesList.length > 0 && this.state.isDisplayOptionsList &&
                <div className={valuesClass} >
                    {optionsListTitle && optionsListTitleActive &&
                    <div className="ds-title">
                        <div className="ds-title--text">{optionsListTitle}</div>
                    </div>
                    }
                    <ul className="values-list generic-list">{valuesList}</ul>
                </div>
                }
            </div>
        );
    }
}

InputAutoComplete.propTypes = {
    // values: PropTypes.array,
    // input
    label: PropTypes.string,
    type: PropTypes.string,
    usePlaceholder: PropTypes.bool,
    // meta
    fieldIconClassName: PropTypes.string,
    fieldWrapperClassName: PropTypes.string,
    onChangeHandler: PropTypes.func,
    getValuesHandler: PropTypes.func,
    getUpdatedTermHandler: PropTypes.func,
    filterValuesHandler: PropTypes.func,
    cleanInputHandler: PropTypes.func,
    onFocusHandler: PropTypes.func,
    onSelectHandler: PropTypes.func,
    autoCompleteActiveHandler: PropTypes.func,
    getAutoCompleteTimer: PropTypes.func,
    setAutoCompleteTimer: PropTypes.func,
    codeFieldName: PropTypes.string.isRequired, // field name of the code in the options list
    valueFieldName: PropTypes.string.isRequired, // field name of the value in the options list
    minLength: PropTypes.number,
    minTime: PropTypes.number,
    limitResults: PropTypes.number,
    highlightResults: PropTypes.bool,
    optionsListActive: PropTypes.bool,
    optionsListTitle: PropTypes.string,
    optionsListTitleActive: PropTypes.bool,
    fieldName: PropTypes.string
};

InputAutoComplete.defaultProps = {
    label: undefined,
    type: undefined,
    usePlaceholder: undefined,
    fieldIconClassName: undefined,
    fieldWrapperClassName: undefined,
    onChangeHandler: undefined,
    getValuesHandler: undefined,
    getUpdatedTermHandler: undefined,
    filterValuesHandler: undefined,
    cleanInputHandler: undefined,
    onFocusHandler: undefined,
    onSelectHandler: undefined,
    autoCompleteActiveHandler: undefined,
    getAutoCompleteTimer: undefined,
    setAutoCompleteTimer: undefined,
    codeFieldName: 'code',
    valueFieldName: 'value',
    minLength: 1,
    minTime: 0,
    limitResults: 0,
    highlightResults: false, // should be false when values are filtered externally
    optionsListActive: false,
    optionsListTitle: undefined,
    optionsListTitleActive: false,
    fieldName: ''
};

export default backDropDecorate(InputAutoComplete);
