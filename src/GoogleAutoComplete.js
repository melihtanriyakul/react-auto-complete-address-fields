import "babel-polyfill";

import React, { PropTypes }from 'react';
import Script from 'react-load-script';
import './GoogleAutoComplete.css';
var clone = require('clone');

export default class GoogleAutoComplete extends React.Component{
    constructor( props ) {
        super( props );
        this.autocomplete = null;
        this.state = {
            scriptError: false,
            scriptLoaded: false,
            fieldsForState: {
                streetAddress: '',
                streetAddress2: '',
                locality: '',
                cityOrState: '',
                postalcode: '',
                country: '',
                searchField: '',
            },
            labels: {
                streetAddress: "Street Address",
                streetAddress2: "Street Address Line 2",
                locality: "City",
                postalcode: "Postal / Zip Code",
                cityOrState: "State / Province",
                country: "Country"
            },
            showResult: false,
        };
        this.baseFields = clone(this.state.fieldsForState);
        this.handleMapChange = this.handleMapChange.bind(this);
        this.renderFields = this.renderFields.bind(this);
        this.handleSearchClear = this.handleSearchClear.bind(this);
    }


    shouldComponentUpdate( nextProps, nextState ) {
        if ( ( this.state.scriptLoaded !== nextState.scriptLoaded ) && ( this.autocomplete === null ) ) {
            this.autocomplete = new window.google.maps.places.Autocomplete((this.searchInput));
            this.autocomplete.addListener('place_changed', this.handleMapChange );
        }
        return true;
    }


    renderFields(){
        return Object.keys(this.props.fields).map((key) => {
            return (
                <div className={`address-field address-${key}`}>
                    <input type="text" id="this" value= {this.state.fieldsForState[key]}/>
                    <label htmlFor="this" >{this.state.labels[key]}</label>
                </div>
                )
            }
        )
    }


    handleSearchClear(searchText) {
        if(searchText.target.type === "search"){
            if(searchText.target.value === ""){
                const { fieldsForState } = this.state;
                Object.keys(fieldsForState).map((key) => {
                    fieldsForState[key] = "";
                })
                this.setState ( { fieldsForState } );
            }
        }
    }

    handleMapChange() {
        this.place = this.autocomplete.getPlace();
        this.props.callbackFunction(this.place);
        const fieldsForState = { ...this.state.fieldsForState, ...this.baseFields };
        if( this.place.address_components ){
            const addrComps = this.place.address_components;
            var matchForStreet1 = this.place.adr_address ? this.place.adr_address.match(/<span class="street-address">(.*?)<\/span>/) : false;
            if( matchForStreet1 && matchForStreet1[1]) fields.streetAddress = matchForStreet1[1];
            const { fields } = this.props;
            Object.keys(addrComps).map((index) => {
                const addrType = addrComps[index].types[0];
                switch (addrType) {
                    case fields.locality: fieldsForState.locality = addrComps[index].long_name;
                    break;

                    case fields.cityOrState: fieldsForState.cityOrState = addrComps[index].long_name;
                    break;

                    case fields.country: fieldsForState.country = addrComps[index].long_name;
                    break;

                    case fields.postalcode: fieldsForState.postalcode = addrComps[index].long_name;
                    break;

                    default:
                }
            });
            this.setState( {fieldsForState, showResult: true });
        }
        else{
            console.log("It is not okay.")
        }
    }


    handleScriptCreate() {
        this.setState({ scriptLoaded: false })
    }


    handleScriptError() {
        this.setState({ scriptError: true })
    }


    handleScriptLoad() {
        this.setState({ scriptLoaded: true })
    }



    render(){
        const { scriptLoaded } = this.state;
        const { apiKey, id, placeholder, label } = this.props;
        return(
            [!scriptLoaded && <Script
            url= {`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
            onCreate={this.handleScriptCreate.bind(this)}
            onError={this.handleScriptError.bind(this)}
            onLoad={this.handleScriptLoad.bind(this)}
            />,
            <div className={`address ${this.state.showResult ? "showFields" : ""}`}>
                <div className= "addressInput">
                    <input type="search" id={ id } placeholder={ placeholder } ref={ele=> {
                        this.searchInput = ele;
                        (ele||{}).onsearch=this.handleSearchClear}}/>
                </div>
                <div className="addressFields">
                {this.renderFields()}
                </div>
            </div>
            ]
        )
    }
}
GoogleAutoComplete.defaultProps = {
    fields: {
        streetAddress: "route",
        streetAddress2: "administrative_level_4",
        locality: "locality",
        cityOrState: "administrative_area_level_1",
        postalcode: "postal_code",
        country: "country",
    },
    callbackFunction: f => f
}