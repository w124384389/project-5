/*global Google */

//Model: object that store all the location information
var Model = {
    currentPlace: ko.observable(null),
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
    ]
};


//initialize the map
var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: {lat:39.86987, lng:-86.13311}
});

//initialize the markers and info window and animation
var Place = function(data){
    var self = this;
    self.name = ko.observable(data.name);
    self.address = ko.observable(data.address);
    self.lat = ko.observable(data.lat);
    self.lng = ko.observable(data.lng);
    //self.showList = ko.observable(true);
    
    //pins locations on the map   
    var marker = new google.maps.Marker({
        position: {lat:data.lat, lng:data.lng},
        title: data.name,
        map: map,
        draggable: false,
        animation: google.maps.Animation.DROP
    });


    //show location information when clicked
    var infoWindow = new google.maps.InfoWindow({
      content: data.name 
    });

    //markers bounce and shows inforWindow when clicked once, then stop bouncing and close
    //info windows after another click
    function toggleBounce() {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
            infoWindow.close(map, marker);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            infoWindow.open(map, marker);
        }
    };
    marker.addListener('click', toggleBounce);

};


//octopus
var ViewModel = function(){
    var self = this;
    self.searchList = ko.observableArray(Model.initialPlaces);
    self.query = ko.observable('');
    self.placeList = ko.observableArray([]);
    //search box
    self.search = ko.computed(function(){
        return ko.utils.arrayFilter(self.searchList(), function(place){
            var s = place.name.toLowerCase().indexOf(self.query().toLowerCase());
            return  s>= 0;
            s.toggleBounce();
        });
    });
    //initialize marker
    Model.initialPlaces.forEach(function(place){
        self.placeList.push(new Place(place));
    });

    // //click
    // this.currentPlace = ko.observable(this. placeList()[0]);
    // //this.currentPlace.addListener('click', toggleBounce);
    // this.setPlace = function(clickedPlace){
    //     //self.currentPlace(clickedPlace);
    //     //marker.addListener('click', toggleBounce);
    //     console.log("hi");
    // };
};

//helper function: check the viewport
function windowSize() {
    
}

ko.applyBindings(new ViewModel);
