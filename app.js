var addRestaurantButton;
var apikey;
var authorizeButton;
var defaultZoom = 13;
var infoWindow;
var initModal;
var map;
var mapContainer
var newRestaurant = {};
var oauthclientid;
var service;
var sheetId;
var signoutButton;
var und = 'undefined';

var newRestaurantDefault = {
    cuisineType: und,
    coordinates: {}
};

var seattleCoord = {
    lat: 47.657714,
    lng: -122.3498098
};

// Ruby Server Start
// ruby -rwebrick -e'WEBrick::HTTPServer.new(:Port => 8000, :DocumentRoot => Dir.pwd).start' 

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Google Api
/////////////////////////////////////////////////////////////////////////////////////////////////////

var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: oauthclientid,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.click(handleAuthClick);
        signoutButton.click(handleSignoutClick);
    });
}

function updateSigninStatus(isSignedIn) {
    console.log('updateSignedInStatus isSignedIn ', isSignedIn);
    if (isSignedIn) {
        addRestaurantButton.show();
        authorizeButton.hide();
        signoutButton.show();
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
    var map = new google.maps.Map(document.getElementById('map'), {
        center: seattleCoord,
        zoom: defaultZoom
    });

    var input = document.getElementById('pac-input');

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var infowindow = new google.maps.InfoWindow();
    var infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);
    var marker = new google.maps.Marker({
        map: map
    });

    marker.addListener('click', function () {
        infowindow.open(map, marker);
    });

    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        var place = autocomplete.getPlace();
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

        infowindowContent.children['place-name'].textContent = place.name;
        infowindowContent.children['place-id'].textContent = place.place_id;
        infowindowContent.children['place-address'].textContent = place.formatted_address;
        infowindow.open(map, marker);

        handleNewPlace(place);
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Utility
/////////////////////////////////////////////////////////////////////////////////////////////////////

function appendToSheet() {
    var appendData = {
        "values": [
            [newRestaurant.name,
                newRestaurant.cuisineType,
                newRestaurant.address,
                newRestaurant.city,
                newRestaurant.state,
                newRestaurant.zip,
                newRestaurant.website,
                newRestaurant.rating,
                null,
                null,
                null,
                null,
                null,
                newRestaurant.coordinates.lat,
                newRestaurant.coordinates.lng
            ]
        ]
    };

    var request = {
        spreadsheetId: sheetId,
        range: 'Restaurants',
        valueInputOption: 'RAW',

        resource: appendData
    };

    gapi.client.sheets.spreadsheets.values.append(request).then(function (response) {
        // TODO: Response handler?
    });
}

function handleNewPlace(place) {
    newRestaurant = newRestaurantDefault;

    addRestaurantButton.text('Add ' + place.name);

    newRestaurant.name = place.name || und;
    newRestaurant.website = place.website || und;
    newRestaurant.rating = place.rating || und;
    newRestaurant.coordinates.lat = place.geometry.location.lat() || und;
    newRestaurant.coordinates.lng = place.geometry.location.lng() || und;

    parseAddressComponents(place.address_components);
}

function loadGoogleApi(apikey) {
    var target = 'https://apis.google.com/js/api.js';

    $.getScript(target, function (data, textStatus, jqxhr) {
        handleClientLoad();
    });
}

function loadGooglePlaceIdFinder(apikey) {
    var target = 'https://maps.googleapis.com/maps/api/js?key=' + apikey + '&libraries=places';

    $.getScript(target, function (data, textStatus, jqxhr) {
        initMap();
    });
}

function parseAddressComponents(components) {
    components.forEach(function (component) {
        component.types.forEach(function (type) {
            var shortName = component.short_name;

            if (type === 'street_number') {
                newRestaurant.address = shortName;
                return;
            }

            if (type === 'route') {
                // TODO: Handle street_number and route better for cases where they don't exist
                newRestaurant.address += ' ';
                newRestaurant.address += shortName;
                return;
            }

            if (type === 'locality') {
                newRestaurant.city = shortName;
                return;
            }

            if (type === 'administrative_area_level_1') {
                newRestaurant.state = shortName;
                return;
            }

            if (type === 'postal_code') {
                newRestaurant.zip = parseInt(shortName);
                return;
            }
        })
    })
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Document Ready / Init
/////////////////////////////////////////////////////////////////////////////////////////////////////
$(function () {
    initModal = $('.initModal');
    mapContainer = $('.mapContainer');
    authorizeButton = $('#authorize-button');
    signoutButton = $('#signout-button');
    addRestaurantButton = $('#add-restaurant');

    addRestaurantButton.click(appendToSheet);

    var urlParams = new URLSearchParams(window.location.search);

    var tempApiKey = urlParams.get('apiKey');
    var tempOathId = urlParams.get('oathId');
    var tempSheetId = urlParams.get('sheetId');

    if (tempApiKey) {
        $('#authData .apikey').val(tempApiKey);
    }

    if (tempOathId) {
        $('#authData .oauthclientid').val(tempOathId);
    }

    if (tempSheetId) {
        $('#authData .sheetId').val(tempSheetId);
    }

    //Event Handlers
    $('#authData').submit(function (e) {
        e.preventDefault();
        apikey = $('#authData .apikey').val();
        oauthclientid = $('#authData .oauthclientid').val();
        sheetId = $('#authData .sheetId').val();

        initModal.hide();
        mapContainer.show();
        loadGooglePlaceIdFinder(apikey);
        loadGoogleApi();
    });
});