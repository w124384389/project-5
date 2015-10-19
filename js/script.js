

/*global Google */

//Model: object that store all the location information
var Model = {
    initialPlaces:[
        {
            name:"Broad Ripple Park",
            lat:39.86987,
            lng:-86.13311,
            address:"1550 Broad Ripple Ave, Indianapolis, IN 46220"
        },

        {
            name:"Humane Society of Indianapolis",
            lat:39.89966,
            lng:-86.21649,
            address:"7929 N Michigan Rd, Indianapolis, IN 46268"
        },

        {
            name:"Smock Bark Park",
            lat:39.63974,
            lng:-86.09653,
            address:"4200 E County Line Rd, Indianapolis, IN 46237"
        },

        {
            name:"Club Canine Doggie",
            lat:39.97141,
            lng:-86.12785,
            address:"622 S Rangeline Rd, Carmel, IN 46032"
        },

        {
            name:"Pierson Bark Park",
            lat:39.97904,
            lng:-85.95624,
            address:"11787 E 131st St, Fishers, IN 46038"
        }
    ],
    mapOptions: {
        center: {lat: 39.86987, lng: -86.13311},
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER
        }
    }
};

// var marker;
// Model.initialPlaces.marker = marker;
//initialize the map
// var map;
// function initMap(){
     var map = new google.maps.Map(document.getElementById('map'),Model.mapOptions);
// };



//initialize the markers and info window and animation

var Place = function(data){
    var self = this;
    self.name = ko.observable(data.name);
    self.address = ko.observable(data.address);
    self.lat = ko.observable(data.lat);
    self.lng = ko.observable(data.lng);
    
};


//octopus
var ViewModel = function(){
    var self = this;
    //self.searchList = ko.observableArray(Model.initialPlaces);
    self.query = ko.observable('');
    self.placeList = ko.observableArray();

    //push all locations into ko observableArray
    Model.initialPlaces.forEach(function(place){
        self.placeList.push(new Place(place));
    });

    //the current place is the first one in the list by default
    self.currentPlace = ko.observable(self.placeList()[0]);

    self.infoWindow = ko.observableArray();
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
            if (self.query().toLowerCase() === '' || self.placeList.marker()[i].name.toLowerCase().indexOf(self.query().toLowerCase()) > -1){
                //show marker if match the search
                self.placeList.marker[i].setVisible(true);
            }
            typeof currentInfoWindow !== 'undefined' && currentInfoWindow.close();
            currentInfoWindow = self.infoWindow()[i];
        }
    };

    self.query.subscribe(self.markerSearch);

    //enable markers with infowindow
    ko.computed(function(){
        for (var i = 0; i < Model.initialPlaces.length; i++){
            //markers
            self.placeList.marker[i] = new google.maps.Marker({
                position: {lat:Model.initialPlaces[i].lat, lng:Model.initialPlaces[i].lng},
                title: Model.initialPlaces[i].name,
                map: map,
                draggable: false,
                animation: google.maps.Animation.DROP
        
            });
            self.infoWindow.push(new google.maps.InfoWindow({
                content: Model.initialPlaces[i].name 
            }));
            //click to markers
            (function(i){
                google.maps.event.addListener(self.placeList.marker[i], 'click', function() {
                    mapEvents(i);
                    // set currentPlace to the clicked marker
                    self.setPlace(self.placeList()[i]);
                });
            })(i);
        }
    }, this);

    function mapEvents(i){
        // close prev infowindow
        typeof currentInfoWindow !== 'undefined' && currentInfoWindow.close();
        // show infowindow
        self.infoWindow()[i].open(map, self.placeList.marker[i]);
        // center map to current marker
        //map.panTo(self.markers()[i].getPosition());
        // animate marker
        self.placeList.marker[i].setAnimation(google.maps.Animation.BOUNCE);
        // animate marker only once
        setTimeout(function(){ self.placeList.marker[i].setAnimation(null); }, 750);

        currentInfoWindow = self.infoWindow()[i];
    }

    // set current Sight
    self.setPlace = function(place) {
        self.currentPlace(place);
        // list items click events
        for (var i in self.placeList.marker) {
            if (self.placeList.marker[i].name == place.name()) {
                // add some click marker click logic here
                mapEvents(i);
            }
        }
    };

};

// //helper function: check the viewport
// function windowSize() {
// }

ko.applyBindings(new ViewModel());
