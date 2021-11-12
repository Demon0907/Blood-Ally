import React from 'react';

export default function AddressListView(props) {
    return (
        <form className="ds-form">
            <fieldset>
                <div className="ds-form__fieldset">
                    { props.address.map((item, index) => {
                        return (
                            <section key={item} className="ds-radio">
                                <label className="ds-form__radio" htmlFor={index} >
                                    <input 
                                        type="radio" 
                                        name="radio" 
                                        id={index} 
                                        onClick={() => props.onClickAddressRadio(index)}
                                    />
                                    <span className="ds-form__design" />
                                    <span className="ds-form__text">{item}</span>
                                </label>
                            </section>
                        ); 
                    })
                    }
                    {props.showMoreDetails && 
                        <button className="ds-btn ds-btn--link" onClick={props.onClickShowMoreDetailsHandler}>
                            {props.buttonLabel}
                        </button>}
                </div>
            </fieldset>
        </form>
    );
}
