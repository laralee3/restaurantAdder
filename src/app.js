let addRestaurantButton;
let apikey;
let authorizeButton;
let defaultZoom = 13;
let existingRestaurantNames;
let map;
let mapContainer;
let modalWrapper;
let newRestaurant = {};
let oauthclientid;
let place;
let sheetHeaders;
let sheetId;
let sheetName = 'Restaurants_Formatted';
let signoutButton;

let foodTypes = [
    'bakery',
    'bar',
    'cafe',
    'food',
    'meal_delivery',
    'meal_takeaway',
    'restaurant'
];

let seattleCoord = {
    lat: 47.657714,
    lng: -122.3498098
};

// TODO: Move this out and implement webpack/rollout/babel
let mapStyles = [
            {
                'featureType': 'landscape',
                'stylers': [
                    {
                        'hue': '#FFBB00'
                    },
                    {
                        'saturation': 43.400000000000006
                    },
                    {
                        'lightness': 37.599999999999994
                    },
                    {
                        'gamma': 1
                    }
                ]
            },
            {
                'featureType': 'road.highway',
                'stylers': [
                    {
                        'hue': '#FFC200'
                    },
                    {
                        'saturation': -61.8
                    },
                    {
                        'lightness': 45.599999999999994
                    },
                    {
                        'gamma': 1
                    }
                ]
            },
            {
                'featureType': 'road.arterial',
                'stylers': [
                    {
                        'hue': '#FF0300'
                    },
                    {
                        'saturation': -100
                    },
                    {
                        'lightness': 51.19999999999999
                    },
                    {
                        'gamma': 1
                    }
                ]
            },
            {
                'featureType': 'road.local',
                'stylers': [
                    {
                        'hue': '#FF0300'
                    },
                    {
                        'saturation': -100
                    },
                    {
                        'lightness': 52
                    },
                    {
                        'gamma': 1
                    }
                ]
            },
            {
                'featureType': 'water',
                'stylers': [
                    {
                        'hue': '#0078FF'
                    },
                    {
                        'saturation': -13.200000000000003
                    },
                    {
                        'lightness': 2.4000000000000057
                    },
                    {
                        'gamma': 1
                    }
                ]
            },
            {
                'featureType': 'poi',
                'stylers': [
                    {
                        'hue': '#00FF6A'
                    },
                    {
                        'saturation': -1.0989010989011234
                    },
                    {
                        'lightness': 11.200000000000017
                    },
                    {
                        'gamma': 1
                    }
                ]
            }
        ];

// /////////////////////////////////////////////////////////////////////////////
// Google Api
// /////////////////////////////////////////////////////////////////////////////

let DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
let SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: oauthclientid,
        scope: SCOPES
    }).then(function() {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.click(handleAuthClick);
        signoutButton.click(handleSignoutClick);
    });
}

function updateSigninStatus(isSignedIn) {
    // TODO - Disallow interaction until post authentication
    if (isSignedIn) {
        authorizeButton.hide();
        signoutButton.show();
        getSheetHeaders();
    } else {
        addRestaurantButton.hide();
        authorizeButton.show();
        signoutButton.hide();
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: seattleCoord,
        zoom: defaultZoom,
        mapTypeControl: false,
        zoomControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: mapStyles
    });

    google.maps.event.addListenerOnce(map, 'idle', function() {
        modalWrapper.hide();
    });

    let input = document.getElementById('pac-input');

    let autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    let marker = new google.maps.Marker({
        map: map
    });

    autocomplete.addListener('place_changed', function() {
        place = autocomplete.getPlace();
        addRestaurantButton.show();

        if (!place.geometry) {
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

        marker.setPlace({
            placeId: place.place_id,
            location: place.geometry.location
        });
        marker.setVisible(true);

        if (!isFoodPlace(place.types)) {
            disableAddButton('Place type: ' + place.types[0]);
            return;
        }

        if (isAlreadyAdded(place.name) !== -1) {
            disableAddButton(place.name + ' already added');
            return;
        }

        handleNewRestaurant(place);
    });
}

// /////////////////////////////////////////////////////////////////////////////
// Utility
// /////////////////////////////////////////////////////////////////////////////

function appendToSheet() {
    disableAddButton();

    let appendData = buildAppendValues();

    let request = {
        spreadsheetId: sheetId,
        range: sheetName,
        valueInputOption: 'RAW',

        resource: appendData
    };

    gapi.client.sheets.spreadsheets.values.append(request).then(function(response) {
        if (response.status === 200) {
            existingRestaurantNames.push(place.name);
        }

        disableAddButton('Added!');
    });
}

function buildAppendValues() {
    let tempArray = [];

    for (let i = 0; i < sheetHeaders.length; i++) {
        let headerId = sheetHeaders[i].toLowerCase().replace(/\s+|\//g, '');
        tempArray[i] = newRestaurant.hasOwnProperty(headerId) ? newRestaurant[headerId] : null;
    }

    return {values: [tempArray]};
}

function isAlreadyAdded(placeName) {
    return existingRestaurantNames.findIndex(function(restaurant) {
        return restaurant === placeName;
    });
}

function disableAddButton(buttonText) {
    if (buttonText) {
        addRestaurantButton.text(buttonText);
    }

    addRestaurantButton.prop('disabled', true);
    addRestaurantButton.css('opacity', 0.5);
}

function isFoodPlace(placeTypes) {
    let isFood = false;

    for (let i = 0, len = placeTypes.length; i < len; i++) {
        let foodIndex = foodTypes.findIndex(function(foodType) {
            return foodType === placeTypes[i];
        });

        if (foodIndex > -1) {
            isFood = true;
            break;
        }
    }

    return isFood;
}

function getSheetHeaders() {
    let request = {
        spreadsheetId: sheetId,
        range: sheetName + '!1:1'
    };

    gapi.client.sheets.spreadsheets.values.get(request).then(function(response) {
        sheetHeaders = response.result.values[0];

        let nameIndex = sheetHeaders.findIndex(function(sheetHeader) {
            return sheetHeader.toLowerCase() === 'name';
        });

        getExistingRestaurantNames(nameIndex);
    });
}

function getExistingRestaurantNames(nameIndex) {
    // Only works within 26 columns, but it would be crazy to have that many
    let column = String.fromCharCode(65 + nameIndex);
    let request = {
        spreadsheetId: sheetId,
        range: sheetName + '!' + column + '2:' + column,
        majorDimension: 'COLUMNS'
    };

    gapi.client.sheets.spreadsheets.values.get(request).then(function(response) {
        existingRestaurantNames = response.result.values[0];
    });
}

function handleNewRestaurant(place) {
    newRestaurant = {};

    addRestaurantButton.prop('disabled', false);
    addRestaurantButton.css('opacity', 1);
    addRestaurantButton.text('Add ' + place.name);

    newRestaurant.name = place.name;
    newRestaurant.website = place.website;
    newRestaurant.googlerating = place.rating;
    newRestaurant.lat = place.geometry.location.lat();
    newRestaurant.long = place.geometry.location.lng();

    // Strip country from the end
    /* eslint-disable camelcase */
    newRestaurant.address_formatted = place.formatted_address.substring(0, place.formatted_address.lastIndexOf(','));
    /* eslint-enable */

    parseAddressComponents(place.address_components);
}

function loadGoogleApi(apikey) {
    let target = 'https://apis.google.com/js/api.js';

    $.getScript(target, function(data, textStatus, jqxhr) {
        handleClientLoad();
    });
}

function loadGooglePlaceIdFinder(apikey) {
    let target = 'https://maps.googleapis.com/maps/api/js?key=' + apikey + '&libraries=places';

    $.getScript(target, function(data, textStatus, jqxhr) {
        initMap();
    });
}

function parseAddressComponents(components) {
    components.forEach(function(component) {
        component.types.forEach(function(type) {
            let shortName = component.short_name;

            if (type === 'administrative_area_level_1') {
                newRestaurant.stateprovince = shortName;
                return;
            }

            if (type === 'country') {
                newRestaurant.country = shortName;
                return;
            }
        });
    });
}

// /////////////////////////////////////////////////////////////////////////////
// Document Ready / Init
// /////////////////////////////////////////////////////////////////////////////

$(function() {
    modalWrapper = $('.modalWrapper');
    mapContainer = $('.mapContainer');
    authorizeButton = $('#authorize-button');
    signoutButton = $('#signout-button');
    addRestaurantButton = $('#add-restaurant');

    addRestaurantButton.click(appendToSheet);

    let urlParams = new URLSearchParams(window.location.search);

    let tempApiKey = urlParams.get('apiKey');
    let tempOathId = urlParams.get('oathId');
    let tempSheetId = urlParams.get('sheetId');

    if (tempApiKey) {
        $('#authData .apikey').val(tempApiKey);
    }

    if (tempOathId) {
        $('#authData .oauthclientid').val(tempOathId);
    }

    if (tempSheetId) {
        $('#authData .sheetId').val(tempSheetId);
    }

    // Event Handlers
    $('#authData').submit(function(e) {
        e.preventDefault();
        apikey = $('#authData .apikey').val();
        oauthclientid = $('#authData .oauthclientid').val();
        sheetId = $('#authData .sheetId').val();

        mapContainer.show();
        loadGooglePlaceIdFinder(apikey);
        loadGoogleApi();
    });
});