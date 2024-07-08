document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/rooms')
    .then(response => response.json())
    .then(data => {
      if (!Array.isArray(data.rooms)) {
        console.error('API response is not an array', data);
        return;
      }

      const roomsContainer = document.getElementById('rooms-container');
      data.rooms.forEach(room => {
        const roomElement = document.createElement('div');
        roomElement.classList.add('room');

        const roomTitle = document.createElement('h2');
        roomTitle.textContent = room.roomNormalizedDescription;
        roomElement.appendChild(roomTitle);

        const roomDetails = document.createElement('div');
        roomDetails.classList.add('room-details');
        roomDetails.innerHTML = `
          <p><strong>Free Cancellation:</strong> ${room.free_cancellation ? 'Yes' : 'No'}</p>
          <p>${room.long_description}</p>
          <p><strong>Price:</strong> ${room.price}</p>
          <p><strong>Market Rates:</strong> ${room.market_rates.map(rate => rate.supplier + ': ' + rate.rate).join(', ')}</p>
          <div class="amenities"><strong>Amenities:</strong> ${room.amenities.map(amenity => `<div>${amenity}</div>`).join('')}</div>
          <div>
            ${room.images.map(image => `<img src="${image.url}" alt="${room.roomNormalizedDescription}">`).join('')}
          </div>
        `;
        roomElement.appendChild(roomDetails);

        roomsContainer.appendChild(roomElement);

        roomTitle.addEventListener('click', () => {
          roomElement.classList.toggle('active');
        });
      });
    })
    .catch(error => {
      console.error('Error fetching room data:', error);
    });
});
