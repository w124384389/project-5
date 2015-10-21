/*global Google */
'use strict';
//Model: object that store all the location information
var Model = {
    initialPlaces:[
        {
            name: "Hanover College",
            lat:38.719250,
            lng:-85.462368,
            address:"484 Ball Dr, Hanover",
            viewUrl:"https://maps.googleapis.com/maps/api/streetview?size=200x100&location=517 Ball Drive, Hanover&key=AIzaSyAgmhMYBxzru1KhHyjcLzlajGq0awnBDr4"
        },

        {
            name: "Harrison College",
            lat:39.926824,
            lng:-86.264909,
            address:"1378 IN-46, Terre Haute",
            viewUrl:"https://maps.googleapis.com/maps/api/streetview?size=200x100&location=1378 IN-46, Terre Haute&key=AIzaSyAgmhMYBxzru1KhHyjcLzlajGq0awnBDr4"
        },

        {
            name: "Ball State University",
            lat:40.197237,
            lng:-85.408841,
            address:"2000 W University Ave, Muncie",
            viewUrl:"https://maps.googleapis.com/maps/api/streetview?size=200x100&location=2000 W University Ave, Muncie&key=AIzaSyAgmhMYBxzru1KhHyjcLzlajGq0awnBDr4"
        },

        {
            name: "Butler University",
            lat:39.839601,
            lng:-86.169720,
            address:"4600 Sunset Ave, Indianapolis",
            viewUrl:"https://maps.googleapis.com/maps/api/streetview?size=200x100&location=4600 Sunset Ave, Indianapolis&key=AIzaSyAgmhMYBxzru1KhHyjcLzlajGq0awnBDr4"
        },

        {
            name: "Franklin College",
            lat:39.478646,
            lng:-86.045479,
            address:"101 Branigin Blvd, Franklin",
            viewUrl:"https://maps.googleapis.com/maps/api/streetview?size=200x100&location=101 Branigin Blvd, Franklin&key=AIzaSyAgmhMYBxzru1KhHyjcLzlajGq0awnBDr4"
        }
    ],

};

//initialize the map
var map;
function initMap(){
    var mapOptions = {
        zoom: 7,
        center: new google.maps.LatLng(39.478646, -86.045479),
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER
        }
    }
    map = new google.maps.Map(document.getElementById('map'),mapOptions);
}; 

//bind necessary information
var Place = function(data){
    var self = this;
    self.name = ko.observable(data.name);
    self.address = ko.observable(data.address);
    self.lat = ko.observable(data.lat);
    self.lng = ko.observable(data.lng);
    //self.url = ko.observable(data.viewUrl); 
    //wiki info API
    //https://www.udacity.com/course/viewer#!/c-ud110/l-3310298553/e-3162128589/m-3162128591
    this.wikiInfo = ko.observable();
    this.wikiHeading = ko.observable('Wiki Info About ');
    var wikiRequesttimeout = setTimeout(function(){
        self.wikiHeading("Failed to get wikipedia information.");
    }, 5000);
    ko.computed(function() {
        $.ajax({
            url: 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + data.name + '&format=json&callback=wikiCallback',
            dataType: 'jsonp',
            success: function(response){
                self.wikiInfo(response[2]);
                clearTimeout(wikiRequesttimeout);
            }
        });
    }, this); 
};


//octopus
var ViewModel = function(){
    var self = this;
    self.query = ko.observable('');
    self.placeList = ko.observableArray();

    //push all locations into ko observableArray
    Model.initialPlaces.forEach(function(place){
        self.placeList.push(new Place(place));
    });

    //the current place is the first one in the list by default
    self.currentPlace = ko.observable(self.placeList()[0]);

    self.infoWindow = ko.observableArray();
    //make marker a property of place
    var marker = [];
    self.placeList.marker = marker;

    //search box, filter places
    self.search = ko.computed(function(){
        if (!self.query()){
            return self.placeList();
        } else {
        return ko.utils.arrayFilter(self.placeList(), function(place){
            return place.name().toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
        });
        }
    });

    var currentInfoWindow;
    //filter the markers and show the related marker info window
    this.markerSearch = function(){
        for (var i = 0; i < self.placeList.marker.length; i++){
            //hide all markers at first
            self.placeList.marker[i].setVisible(false);
            if (self.query().toLowerCase() === '' || self.placeList.marker[i].title.toLowerCase().indexOf(self.query().toLowerCase()) > -1){
                //show marker if match the search
                self.placeList.marker[i].setVisible(true);
            }
            typeof currentInfoWindow !== 'undefined' && currentInfoWindow.close();
            currentInfoWindow = self.infoWindow()[i];
        }
    };

    //https://www.devbridge.com/articles/knockout-a-real-world-example/
    self.query.subscribe(self.markerSearch);

    //enable markers with infowindow
    ko.computed(function(){
        var bounds = new google.maps.LatLngBounds();
        var lat = Model.initialPlaces[i].lat;
        var lng = Model.initialPlaces[i].lng;
        var myLatLng = new google.maps.LatLng(lat, lng);
        for (var i = 0; i < Model.initialPlaces.length; i++){
            //markers
            self.placeList.marker[i] = new google.maps.Marker({
                position: new google.maps.LatLng(Model.initialPlaces[i].lat, Model.initialPlaces[i].lng),
                title: Model.initialPlaces[i].name,
                map: map,
                draggable: false,
                animation: google.maps.Animation.DROP
            });
            bounds.extend(myLatLng);
            self.contentString =  Model.initialPlaces[i].name + '<br/>' + Model.initialPlaces[i].address;
            //push the infowindow in the observable array
            self.infoWindow.push(new google.maps.InfoWindow({
                content: self.contentString 
            }));
            //set the clicked markers to current place
            (function(i){
                google.maps.event.addListener(self.placeList.marker[i], 'click', function() {
                    mapEvents(i);
                    // set currentPlace to the clicked marker
                    self.setPlace(self.placeList()[i]);
                });
            })(i);    
        }
        map.fitBounds(bounds);
    }, this);

    function mapEvents(i){
        // close prev infowindow
        typeof currentInfoWindow !== 'undefined' && currentInfoWindow.close();
        // show infowindow
        self.infoWindow()[i].open(map, self.placeList.marker[i]);
        //https://developers.google.com/maps/documentation/javascript/reference?hl=en
        //change the center of the map to the given location
        map.panTo(self.placeList.marker[i].getPosition());
        // animate marker
        self.placeList.marker[i].setAnimation(google.maps.Animation.BOUNCE);
        // animate marker only once
        setTimeout(function(){ self.placeList.marker[i].setAnimation(null); }, 800);

        currentInfoWindow = self.infoWindow()[i];
    }

    // set current Place
    self.setPlace = function(place) {
        self.currentPlace(place);
        // list items click events
        for (var i in self.placeList.marker) {
            if (self.placeList.marker[i].title == place.name()) {
                mapEvents(i);
            }
        }
    };

};


function run() {
    initMap();
    ko.applyBindings(new ViewModel());
}
