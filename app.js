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
var sheetHeaders;
var sheetId;
var sheetName = 'Restaurants_Formatted';
var signoutButton;

var seattleCoord = {
    lat: 47.657714,
    lng: -122.3498098
};

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
        addRestaurantButton.show(); // TODO: Inefficient, do this only once someplace else
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
    var appendData = buildAppendValues();

    var request = {
        spreadsheetId: sheetId,
        range: sheetName,
        valueInputOption: 'RAW',

        resource: appendData
    };

    gapi.client.sheets.spreadsheets.values.append(request).then(function (response) {
        console.log('Append response: ', response);
    });
}

function buildAppendValues() {
    var tempArray = [];

    for (var i = 0; i < sheetHeaders.length; i++) {
        var headerId = sheetHeaders[i].toLowerCase().replace(/\s+|\//g, '');
        tempArray[i] = newRestaurant.hasOwnProperty(headerId) ? newRestaurant[headerId] : null;
    }

    return {values: [tempArray]};
}

function getSheetHeaders() {
    var request = {
        spreadsheetId: sheetId,
        range: sheetName + '!1:1'
    };

    gapi.client.sheets.spreadsheets.values.get(request).then(function (response) {
        console.log('Get header values response: ', response);
        sheetHeaders = response.result.values[0];
    });
}

function handleNewPlace(place) {
    newRestaurant = {};

    addRestaurantButton.text('Add ' + place.name);

    newRestaurant.name = place.name;
    newRestaurant.website = place.website;
    newRestaurant.googlerating = place.rating;
    newRestaurant.lat = place.geometry.location.lat();
    newRestaurant.long = place.geometry.location.lng();

    // Strip country from the end
    newRestaurant.address_formatted = place.formatted_address.substring(0, place.formatted_address.lastIndexOf(',')); 

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

            if (type === 'administrative_area_level_1') {
                newRestaurant.stateprovince = shortName;
                return;
            }

            if (type === 'country') {
                newRestaurant.country = shortName;
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