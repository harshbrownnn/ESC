document.addEventListener('DOMContentLoaded', function() {
    const inputBox = document.getElementById('input-box');
    const resultBox = document.getElementById('result-box');
    let locations = []; // Array to store all locations
    let fuse; // Fuzzy search instance

    // Function to initialize fuzzy search with locations data
    function initializeFuse(data) {
        const options = {
            keys: ['term'],
            includeScore: true,
            threshold: 0.4,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
        };
        fuse = new Fuse(data, options);
    }

    // Function to fetch data from GitHub hosted JSON file
    async function fetchData() {
        try {
            const response = await fetch('https://cdn.jsdelivr.net/gh/elankumuthan/ESC@master/destinations.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            locations = data; // Store JSON data in the locations array
            initializeFuse(locations); // Initialize fuse with locations data
            console.log('Locations loaded:', locations); // Optional: Log loaded locations for debugging
        } catch (error) {
            console.error('Error fetching the locations:', error);
        }
    }

    // Function to filter suggestions based on user input using fuzzy search
    function filterSuggestions(query) {
        if (!query.trim()) {
            return [];
        }

        const results = fuse.search(query);
        const filteredResults = results.map(result => result.item);

        // Limit number of suggestions based on query length
        let displayLimit = 5;

        console.log('Filtered Results:', filteredResults); // Log filtered results for debugging

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
            li.textContent = suggestion.term; // Display the 'term' property in suggestion
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

    // Fetch data initially when the document is loaded
    fetchData();
});
