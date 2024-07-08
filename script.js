const apiUrl = 'http://localhost:3000/api/hotels?destination_id=RsBU';

let map;
let hotelMarkers = []; // For hotel markers
let searchMarkers = []; // For search location markers
let allHotels = []; // To store all hotel data

fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Data from API:', data);
    allHotels = data; // Store all hotel data

    displayHotels(allHotels);

    document.getElementById('show-map-btn').addEventListener('click', () => {
      document.getElementById('hotel-list').style.display = 'none'; // Hide the hotel list
      document.getElementById('map').style.display = 'block'; // Show the map container
      document.getElementById('show-map-btn').style.display = 'none'; // Hide the "Show On Map" button
      document.getElementById('back-btn').style.display = 'block'; // Show the "Back" button
      initMap(allHotels); // Initialize the map with hotel markers
    });

    document.getElementById('back-btn').addEventListener('click', () => {
      document.getElementById('map').style.display = 'none'; // Hide the map container
      document.getElementById('hotel-list').style.display = 'block'; // Show the hotel list
      document.getElementById('show-map-btn').style.display = 'block'; // Show the "Show On Map" button
      document.getElementById('back-btn').style.display = 'none'; // Hide the "Back" button
    });

    document.getElementById('rating-filter').addEventListener('change', () => {
      const filteredHotels = filterHotelsByRating();
      displayHotels(filteredHotels);
      updateMapMarkers(filteredHotels); // Update map markers based on filtered hotels
    });
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStars = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;

  return (
    '<span class="stars">' +
    '<i class="fa fa-star" style="color: gold;"></i>'.repeat(fullStars) +
    '<i class="fa fa-star-half-alt" style="color: gold;"></i>'.repeat(halfStars) +
    '<i class="fa fa-star-o" style="color: gold;"></i>'.repeat(emptyStars) +
    '</span>'
  );
}

function displayHotels(hotels) {
  const hotelListElement = document.getElementById('hotel-list');
  hotelListElement.innerHTML = ''; // Clear existing list

  hotels.forEach(hotel => {
    const li = document.createElement('li');

    const nameHeading = document.createElement('h2');
    nameHeading.textContent = hotel.name;

    // Add image element for each hotel
    const imageElement = document.createElement('img');
    imageElement.src = `https://d2ey9sqrvkqdfs.cloudfront.net/${hotel.id}/0`;
    imageElement.alt = hotel.name;
    imageElement.style.width = '100px'; // Adjust width as needed
    imageElement.style.height = 'auto'; // Maintain aspect ratio

    const addressParagraph = document.createElement('p');
    addressParagraph.textContent = `Address: ${hotel.address}`;

    const distanceParagraph = document.createElement('p');
    distanceParagraph.textContent = `Distance from Airport: ${hotel.distance_from_airport || 'Unknown'} miles`; // Handle undefined distance

    const ratingParagraph = document.createElement('p');
    ratingParagraph.innerHTML = `Overall Rating: ${generateStars(hotel.rating)}`;

    const showOnMapBtn = document.createElement('button');
    showOnMapBtn.textContent = 'Show On Map';
    showOnMapBtn.addEventListener('click', () => {
      showHotelOnMap(hotel);
    });

    li.appendChild(nameHeading);
    li.appendChild(imageElement); // Append image element
    li.appendChild(addressParagraph);
    li.appendChild(distanceParagraph);
    li.appendChild(ratingParagraph);
    li.appendChild(showOnMapBtn);

    hotelListElement.appendChild(li);
  });
}

function initMap(hotels) {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: parseFloat(hotels[0].latitude), lng: parseFloat(hotels[0].longitude) },
    zoom: 12
  });

  // Add hotel markers
  updateMapMarkers(hotels);

  // Add search box functionality
  const input = document.createElement('input');
  input.setAttribute('placeholder', 'Search for a location');
  input.setAttribute('id', 'search-input');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  const searchBox = new google.maps.places.SearchBox(input);

  searchBox.addListener('places_changed', () => {
    const places = searchBox.getPlaces();

    if (places.length === 0) {
      return;
    }

    // Clear previous search markers
    searchMarkers.forEach(marker => marker.setMap(null));
    searchMarkers = [];

    const bounds = new google.maps.LatLngBounds();
    places.forEach(place => {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }

      const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" // Custom color marker for search locations
        }
      });

      const placeInfoWindow = new google.maps.InfoWindow({
        content: `<h3>${place.name}</h3>`
      });

      marker.addListener('click', () => {
        if (currentInfoWindow) {
          currentInfoWindow.close();
        }
        placeInfoWindow.open(map, marker);
        currentInfoWindow = placeInfoWindow;
      });

      searchMarkers.push(marker);

      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });

    map.fitBounds(bounds);
  });
}

function filterHotelsByRating() {
  const rating = document.getElementById('rating-filter').value;
  let filteredHotels;

  if (rating === 'all') {
    filteredHotels = allHotels;
  } else {
    filteredHotels = allHotels.filter(hotel => Math.floor(hotel.rating) === parseInt(rating));
  }

  return filteredHotels;
}

function updateMapMarkers(hotels) {
  // Clear existing hotel markers
  hotelMarkers.forEach(marker => marker.setMap(null));
  hotelMarkers = [];

  // Add new hotel markers based on filtered hotels
  hotelMarkers = hotels.map(hotel => {
    const marker = new google.maps.Marker({
      position: { lat: parseFloat(hotel.latitude), lng: parseFloat(hotel.longitude) },
      map: map,
      title: hotel.name
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<h3>${hotel.name}</h3>
                <p>Address: ${hotel.address}</p>
                <p>Distance from Airport: ${hotel.distance_from_airport} miles</p>`
    });

    marker.addListener('click', () => {
      if (currentInfoWindow) {
        currentInfoWindow.close();
      }
      infoWindow.open(map, marker);
      currentInfoWindow = infoWindow;
    });

    return marker;
  });
}

function showHotelOnMap(hotel) {
  map.setCenter({ lat: parseFloat(hotel.latitude), lng: parseFloat(hotel.longitude) });
  map.setZoom(15);

  // Create marker for the selected hotel
  const marker = new google.maps.Marker({
    position: { lat: parseFloat(hotel.latitude), lng: parseFloat(hotel.longitude) },
    map: map,
    title: hotel.name
  });

  // Open info window for the selected hotel
  const infoWindow = new google.maps.InfoWindow({
    content: `<h3>${hotel.name}</h3>
              <p>Address: ${hotel.address}</p>
              <p>Distance from Airport: ${hotel.distance_from_airport} miles</p>`
  });

  infoWindow.open(map, marker);

  // Close any existing info window
  let currentInfoWindow = infoWindow;

  marker.addListener('click', () => {
    if (currentInfoWindow) {
      currentInfoWindow.close();
    }
    infoWindow.open(map, marker);
    currentInfoWindow = infoWindow;
  });
}