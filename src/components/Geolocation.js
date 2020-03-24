import React from "react";
import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng
} from "react-places-autocomplete";


export default function Geolocation() {

   
    const [address, setAddress] = React.useState("");
    const [coordinates, setCoordinates] = React.useState({
        lat: null,
        lng: null
    })

 
    const handleSelect = async value => {
        const results = await geocodeByAddress(value);
        const latLng = await getLatLng(results[0]);
        setAddress(value);
        setCoordinates(latLng);
    };

    function detectLocation(e) {
        e.preventDefault();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getCoordinates);
            } else { 
            alert("Geolocation is not supported by this browser.");
        }
      }

    function getCoordinates(position) {
        console.log(position.coords.latitude);     
        
        setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
        }) 
    }


    return (
        <div>
            <PlacesAutocomplete 
                value={address} 
                onChange={setAddress} 
                onSelect={handleSelect}
            >
            {({getInputProps, suggestions, getSuggestionItemProps, loading}) => 
                <div>
                    <button
                    onClick={detectLocation}
                    >DETECT</button>
                    <p>Latitude: {coordinates.lat}</p>
                    <p>Longitude: {coordinates.lng}</p>

                    <input {...getInputProps({placeholder: "Type address"})}/>

                    <div>
                        {loading ? <div>...loading</div> : null}

                        {suggestions.map(suggestion => {
                            const style = {
                                backgroundColor: suggestion.active ? "#41b6e6" : "#fff"
                            }
                            return (<div {...getSuggestionItemProps(suggestion, {style})}>{suggestion.description}</div>
                            );
                        })}
                    </div>
                </div>
            }
            </PlacesAutocomplete>
        </div>
        );    
}