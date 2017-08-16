console.log("JS connected");

// $('#clear').click(function() {
// 	$('#location-form').val('');
// });

var coords;
var meetupAPIKey = '146579577b6656f135f5d5f2179e51';
var map;

function initMap() {
	var uluru = {
		lat: 8.6195,
		lng: 0.8248,
	};

	//
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 4,
		center: uluru
	});


	//Add marker function
	function addMarker(coords, meetup) {

		// Info Window marker
		var infowindow = new google.maps.InfoWindow({
			content: meetup.name,
		});

		var marker = new google.maps.Marker({
			position: coords,
			map: map,
			meetup: meetup,
		});
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.open(map, marker);
			console.log(meetup);
		});
	}

	// Get location form
	var locationForm = $('#location-form');

	//fnd meetups function
	var findMeetups = function(lng, lat) {
		var apiUrl = "https://api.meetup.com/find/groups?key=c56f774e271f556c37795f55707b1&format=json&lon=" + lng + "&lat=" + lat;

		$.ajax({
			type: "GET", // GET = requesting data
			url: apiUrl,
			dataType: 'jsonp',
			success: function(data) {
				//console.log('Meetups', data);
				var meetups = data.data;
				var meetupsList = "";
				meetups.forEach(function(meetup) {

					//Add list html
					var meetupsItem =
						// `
						// <li class="list-group-item">
						//   <div>Name: ${meetup.name}</div>
						//   <div>City: ${meetup.city}</div>
						// </li>`;
						//<div class="card col-sm-6" style="width: 20rem;">

						`<div class="card" style="width: 20rem;">
                <div class="card">
                  <div class="card-block">
                    <h5 class="card-header">${meetup.name}</h5>
                      <span>${meetup.localized_location}</span>
                      <p class="card-text"><strong>Category:</strong> ${meetup.category.name}.</p>
                      <a target="blank" href="${meetup.link}" class="btn btn-primary">More Info</a>
                    </div>
                  </div>
              </div>`
					// console.log("City", meetup.city);
					// console.log("lat >", meetup.lat);
					// console.log("long >", meetup.lon);

					addMarker({
							"lat": meetup.lat,
							"lng": meetup.lon
						},
						meetup
					)
					meetupsList += meetupsItem;
				});

				$('#address-components').html(meetupsList);
			},
			error: function() {}
		});
	}

	var geocode = function(e) {
		// Prevent actual submit
		console.log("geocode");
		e.preventDefault();

		var location = $('#location-input').val();
		var zip;

		axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
				params: {
					address: location,
					key: 'AIzaSyBO59mo6rMe4ChzmBqEQ8gz9QmWjg_X38c'
				}
			})
			.then(function(response) {
				// Log full responsess
				console.log('Response', response);

				// Formatted Address
				var formattedAddress = response.data.results[0].formatted_address;
				var formattedAddressOutput =
					` <ul class="list-group">
          <li class="list-group-item">${formattedAddress}</li>
        		</ul>  `;

				// Address Components
				var addressComponents = response.data.results[0].address_components;

				console.log(response.data.results[0].address_components[7]);

				var addressComponentsOutput = '<ul class="list-group">';
				for (var i = 0; i < addressComponents.length; i++) {
					addressComponentsOutput +=
						` <li class="list-group-item"><strong>${addressComponents[i].types[0]}</strong>: ${addressComponents[i].long_name}</li> `;
				}
				addressComponentsOutput += '</ul>';

				// Geometry
				var lat = response.data.results[0].geometry.location.lat;
				var lng = response.data.results[0].geometry.location.lng;

				// creating marker for the search location
				var myLocationMarker = new google.maps.Marker({
					position: new google.maps.LatLng(lat, lng),
					title: formattedAddress,
					map: map
				});

				// moving map from default center to search center
				map.panTo(myLocationMarker.getPosition());
				map.setZoom(10);

				var geometryOutput =
					` <ul class="list-group">
          <li class="list-group-item"><strong>Latitude</strong>: ${lat}</li>
          <li class="list-group-item"><strong>Longitude</strong>: ${lng}</li>
        </ul>  `;
				var coords = {
					lat: response.data.results[0].geometry.location.lat,
					lng: response.data.results[0].geometry.location.lng,
				};
				//console.log(coords);

				// Output to app
				$('#formatted-address').html(formattedAddressOutput);
				//$('#address-components').html(addressComponentsOutput);
				//$('#geometry').html(geometryOutput);

				findMeetups(lng, lat);
			})
			.catch(function(error) {
				console.log(error);
			});
	}

	$('#submitBtn').click(geocode);
	//Clear form input function
	$('#clear').click(function() {
		$('#location-input').val('');
	});
}
