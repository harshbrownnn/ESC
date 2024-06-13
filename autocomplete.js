document.addEventListener('DOMContentLoaded', function() {
    const inputBox = document.getElementById('input-box');
    const resultBox = document.querySelector('.result-box');
    const searchIcon = document.querySelector('.fa-solid'); // Magnifying glass icon
    let locations = []; // Array to store all locations
    let fuse; // Fuzzy search instance

    // Function to initialize fuzzy search with locations data
    function initializeFuse(data) {
        const options = {
            keys: ['term'],
            includeScore: true,
            threshold: 0.6, // Lower threshold for more tolerance to typos
            distance: 100, // Increase distance for more leniency in string matching
            minMatchCharLength: 2, // Minimum character length to start searching
            findAllMatches: true, // Find all matches, not just the best one
            ignoreLocation: true // Ignore where the matches are in the strings
        };
        fuse = new Fuse(data, options);
    }

    // Function to filter suggestions based on user input using fuzzy search
    function filterSuggestions(query) {
        if (!query || !fuse) {
            return [];
        }

        const results = fuse.search(query);
        const filteredResults = results.map(result => result.item);

        // Reduce number of items displayed as match gets closer
        let displayLimit = 5;
        if (query.length >= 4) {
            displayLimit = 3;
        } else if (query.length >= 2) {
            displayLimit = 4;
        }

        return filteredResults.slice(0, displayLimit);
    }

    // Function to display filtered suggestions in dropdown
    function displaySuggestionsDropdown(suggestions) {
        // Clear previous suggestions
        resultBox.innerHTML = '';

        // Display filtered suggestions in dropdown
        const ul = document.createElement('ul');
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion.term;
            li.setAttribute('data-uid', suggestion.uid); // Store the uid in a data attribute
            li.addEventListener('click', function() {
                inputBox.value = suggestion.term; // Populate the input box with the suggestion term
                console.log('Selected UID:', suggestion.uid);
                hideSuggestionsDropdown(); // Hide the dropdown after selection
            });
            ul.appendChild(li);
        });
        resultBox.appendChild(ul);

        // Show dropdown
        resultBox.style.display = 'block';
    }

    // Function to hide dropdown
    function hideSuggestionsDropdown() {
        resultBox.style.display = 'none';
    }

    // Event listener for keyup on input box
    inputBox.addEventListener('keyup', function(event) {
        const query = event.target.value.trim();
        const suggestions = filterSuggestions(query); // Filter suggestions based on current input

        if (suggestions.length > 0) {
            displaySuggestionsDropdown(suggestions); // Display filtered suggestions in dropdown
        } else {
            hideSuggestionsDropdown(); // Hide dropdown if no suggestions
        }
    });

    // Event listener for click outside of dropdown to hide it
    document.addEventListener('click', function(event) {
        if (!resultBox.contains(event.target) && event.target !== inputBox) {
            hideSuggestionsDropdown(); // Hide dropdown if click is outside of it
        }
    });

    // Event listener for click on the search icon
    searchIcon.addEventListener('click', function() {
        const query = inputBox.value.trim();
        const suggestions = filterSuggestions(query);
        if (suggestions.length > 0) {
            const uid = suggestions[0].uid; // Assuming we take the first suggestion's uid
            console.log('Selected UID:', uid);
        } else {
            console.log('No suggestions found for the current input.');
        }
    });

    // Fetch JSON data and initialize fuse when data is loaded
    fetch('destinations.json')
        .then(response => response.json())
        .then(data => {
            locations = data; // Store JSON data in the locations array
            initializeFuse(locations); // Initialize fuse with locations data
            console.log('Locations loaded:', locations); // Optional: Log loaded locations for debugging
        })
        .catch(error => console.error('Error fetching the locations:', error));
});
