var addRestaurantButton;
var apikey;
var authorizeButton;
var infoWindow;
var initModal;
var map;
var mapContainer
var newRestaurant = {};
var oauthclientid;
var service;
var sheetId;
var signoutButton;

// Ruby Server Start
// ruby -rwebrick -e'WEBrick::HTTPServer.new(:Port => 8000, :DocumentRoot => Dir.pwd).start' 


// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

function handleClientLoad() {
    console.log('handleClientLoad');
    gapi.load('client:auth2', initClient);
}

function initClient() {
    console.log('initClient sheets');
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

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.hide();
        signoutButton.show();
    } else {
        authorizeButton.show();
        signoutButton.hide();
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    console.log('handleAuthClick');

    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    console.log('handleSignoutClick');

    gapi.auth2.getAuthInstance().signOut();
}

// TODO: Revamp and move this someplace else
function appendToSheet() {
    console.log('appendToSheet fire');

    var appendData = {
        "values": [
            [newRestaurant.name,
                newRestaurant.cuisineType,
                newRestaurant.address,
                newRestaurant.city,
                newRestaurant.state,
                newRestaurant.zip,
                newRestaurant.website,
                newRestaurant.rating
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
        console.log('response after append call ', response);
    });
}


function initMap() {
    console.log('initMap');

    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 47.657714,
            lng: -122.3498098
        },
        zoom: 13
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

        // Set the position of the marker using the place ID and location.
        marker.setPlace({
            placeId: place.place_id,
            location: place.geometry.location
        });
        marker.setVisible(true);




        /////////////////////////////////

        // TODO: Separate out all this logic, don't run it every time a place is updated
        // TODO: Pull from individual address components instead of formmatted

        console.log('place ', place);
        console.log('place name ', place.name);
        addRestaurantButton.text('Add ' + place.name);

        newRestaurant.name = place.name;
        newRestaurant.cuisineType = 'N/A';

        //601 Queen Anne Ave N, Seattle, WA 98109, USA

        var tempAddress = place.formatted_address.split(','); // TEMP ONLY, NOT ROBUST
        newRestaurant.address = tempAddress[0];
        newRestaurant.city = tempAddress[1];
        newRestaurant.state = tempAddress[2].split(' ')[1];
        newRestaurant.zip = tempAddress[2].split(' ')[2];
        newRestaurant.website = place.website;
        newRestaurant.rating = place.rating;


        /////////////////////////////////



        infowindowContent.children['place-name'].textContent = place.name;
        infowindowContent.children['place-id'].textContent = place.place_id;
        infowindowContent.children['place-address'].textContent =
            place.formatted_address;
        infowindow.open(map, marker);
    });
}

function loadGooglePlaceIdFinder(apikey) {
    var target = 'https://maps.googleapis.com/maps/api/js?key=' + apikey + '&libraries=places';

    console.log('target ', target);

    $.getScript(target, function (data, textStatus, jqxhr) {
        initMap();
    });
}

function loadGoogleApi(apikey) {
    var target = 'https://apis.google.com/js/api.js';

    console.log('target ', target);

    $.getScript(target, function (data, textStatus, jqxhr) {
        handleClientLoad();
    });
}

// Document Ready
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