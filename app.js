var infoWindow;
var initModal;
var map;
var mapContainer
var service;

// var seattle = {lat: 47.657714, lng: -122.3498098};
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

        console.log('place ', place );

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

// Document Ready
$(function () {
    initModal = $('.initModal');
    mapContainer = $('.mapContainer');

    //Event Handlers
    $('#authData').submit(function (e) {
        e.preventDefault();
        var apikey = $('#authData .apikey').val();

        initModal.hide();
        mapContainer.show();
        loadGooglePlaceIdFinder(apikey);
    });
});