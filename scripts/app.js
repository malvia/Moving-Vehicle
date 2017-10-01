  var points = [{
      lat: 28.412839,
      lng: 77.041664
  }, {
      lat: 28.421507,
      lng: 77.039018
  }, {
      lat: 28.427017,
      lng: 77.037505
  }, {
      lat: 28.429536,
      lng: 77.040552
  }, {
      lat: 28.432287,
      lng: 77.046930
  }, {
      lat: 28.437011,
      lng: 77.045957
  }, {
      lat: 28.442948,
      lng: 77.038161
  }, {
      lat: 28.448240,
      lng: 77.038023
  }, {
      lat: 28.453622,
      lng: 77.043232
  }, {
      lat: 28.463078,
      lng: 77.052115
  }, {
      lat: 28.489606,
      lng: 77.080004
  }, {
      lat: 28.498286,
      lng: 77.088410
  }, {
      lat: 28.503162,
      lng: 77.088471
  }, {
      lat: 28.506467,
      lng: 77.083922
  }, {
      lat: 28.509734,
      lng: 77.079330
  }];
  var carMarker;
  // dark theme
  var mapStyles = [{
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [{
          "saturation": 36
      }, {
          "color": "#000000"
      }, {
          "lightness": 40
      }]
  }, {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [{
          "visibility": "on"
      }, {
          "color": "#000000"
      }, {
          "lightness": 16
      }]
  }, {
      "featureType": "all",
      "elementType": "labels.icon",
      "stylers": [{
          "visibility": "off"
      }]
  }, {
      "featureType": "administrative",
      "elementType": "geometry.fill",
      "stylers": [{
          "color": "#000000"
      }, {
          "lightness": 20
      }]
  }, {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [{
          "color": "#000000"
      }, {
          "lightness": 17
      }, {
          "weight": 1.2
      }]
  }, {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [{
          "color": "#000000"
      }, {
          "lightness": 20
      }]
  }, {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{
          "color": "#000000"
      }, {
          "lightness": 21
      }]
  }, {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [{
          "color": "#000000"
      }, {
          "lightness": 17
      }]
  }, {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{
          "color": "#000000"
      }, {
          "lightness": 29
      }, {
          "weight": 0.2
      }]
  }, {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [{
          "color": "#000000"
      }, {
          "lightness": 18
      }]
  }, {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [{
          "color": "#000000"
      }, {
          "lightness": 16
      }]
  }, {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [{
          "color": "#000000"
      }, {
          "lightness": 19
      }]
  }, {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{
          "color": "#000000"
      }, {
          "lightness": 17
      }]
  }]
// function to initialize map
  function initMap() {
      var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 12,
          center: {
              lat: 28.463078,
              lng: 77.052115
          },
          mapTypeId: google.maps.MapTypeId.TRANSIT,
          styles: mapStyles
      });
      // make a polyline for given set of points
      var polyline = new google.maps.Polyline({
          path: points,
          geodesic: true,
          strokeColor: '#0000FF',
          strokeOpacity: 2.0,
          strokeWeight: 5
      });
      polyline.setMap(map);
     
      var marker, i;
      // bus marker at given location
      for (i = 0; i < points.length; i++) {
          marker = new google.maps.Marker({
              position: new google.maps.LatLng(points[i]['lat'], points[i]['lng']),
              map: map,
               icon: "icons/bus.png"
          });
          google.maps.event.addListener(marker, 'click', (function(marker, i) {
              return function() {
                  infowindow.open(map, marker);
              }
          })(marker, i));
      }
      // getting current location of car
      var currentLoc = new google.maps.LatLng(points[0].lat, points[0].lng);
      carMarker = new google.maps.Marker({
          position: currentLoc,
          map: map,
          icon: "icons/car2.png"
      });
  }
  // movement of car
  function moveFromAToB(carMarker, targetPosition) {
      var promiseResolve, promiseReject;
      var promise = new Promise(function(resolve, reject) {
          promiseResolve = resolve;
          promiseReject = reject;
      });
      var numDeltas = 100;
      var delay = 10; 
      var i = 0;
      var deltaLat;
      var deltaLng;
      var targetPosition;
      var currentLocPosition = {
          lat: carMarker.position.lat(),
          lng: carMarker.position.lng()
      };
      var done = false;

      function transition(targetPosition) {
          i = 0;
          deltaLat = (targetPosition.lat - currentLocPosition.lat) / numDeltas;
          deltaLng = (targetPosition.lng - currentLocPosition.lng) / numDeltas;
          moveMarker();
      }

      function moveMarker() {
         
          currentLocPosition.lat += deltaLat;
          currentLocPosition.lng += deltaLng;
          var latlng = new google.maps.LatLng(currentLocPosition.lat, currentLocPosition.lng);
          carMarker.setPosition(latlng);
          if (i <= numDeltas) {
              i++;
              setTimeout(moveMarker, delay);
          } else {
              promiseResolve();
          }
      }
      transition(targetPosition);
      return promise;
  }
  initMap();
  setTimeout(function() {
      var funcs = [];
      for (var i = 0; i < points.length; i++) {
          funcs.push(moveFromAToB.bind(null, carMarker, points[i]))
      }
      var promise = funcs[0]();
      for (var i = 1; i < points.length; i++) {
          promise = promise.then(funcs[i])
      }
  }, 2000);