// The setup function initializes the application when the page is loaded
function setup() {
  fetchShows()
    .then((allShows) => {
      populateShowDropdown(allShows); // Populate the dropdown with shows
      displayShowListing(allShows); // Display the list of shows
      setupShowSearch(allShows); // Enable search functionality for shows

      const showDropdown = document.getElementById("show-dropdown");
      showDropdown.addEventListener("change", (event) => {
        const selectedShowId = event.target.value;

        const episodeDropdown = document.getElementById("episode-dropdown");
        episodeDropdown.innerHTML = ""; // Clear episode dropdown

        if (selectedShowId === "default") {
          document.getElementById("root").innerHTML = "<p>Please select a show to display episodes.</p>";
          return;
        }

        fetchEpisodes(selectedShowId)
          .then((allEpisodes) => {
            makePageForEpisodes(allEpisodes);
            populateEpisodeDropdown(allEpisodes); // Populate the dropdown with episodes
            setupListeners(allEpisodes);
            toggleSearchBoxes(false); // Show episode search box
            toggleBackToShowButton(true); // Show "Back to Shows" button
          })
          .catch((error) => {
            const rootElem = document.getElementById("root");
            rootElem.innerHTML = "<p>Failed to load episodes. Please try again later.</p>";
            console.error("Error fetching episodes:", error);
          });
      });
    })
    .catch((error) => {
      console.error("Error fetching shows:", error);
      document.getElementById("root").innerHTML = "<p>Failed to load shows. Please try again later.</p>";
    });

  document.getElementById("back-to-shows").addEventListener("click", () => {
    fetchShows()
      .then((allShows) => {
        displayShowListing(allShows); // Show the shows listing
        toggleSearchBoxes(true); // Show show search box
        toggleBackToShowButton(false); // Hide "Back to Shows" button
      })
      .catch((error) => {
        console.error("Error fetching shows:", error);
      });
  });
}

// Fetch the list of shows from the API
function fetchShows() {
  const apiURL = "https://api.tvmaze.com/shows";

  return fetch(apiURL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((shows) => {
      // Sort shows alphabetically, case-insensitive
      return shows.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    });
}

// Fetch episodes from the API
function fetchEpisodes(showId) {
  const apiURL = `https://api.tvmaze.com/shows/${showId}/episodes`;
  return fetch(apiURL).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
}

// Populate the show dropdown with available shows
function populateShowDropdown(shows) {
  const dropdown = document.getElementById("show-dropdown");
  dropdown.innerHTML = '<option value="default">Select a show</option>';

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    dropdown.appendChild(option);
  });
}

// Display the list of shows on the main page
function displayShowListing(shows) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear the root element

  const showContainer = document.createElement("div");

  shows.forEach((show) => {
    const showCard = document.createElement("div");

    showCard.innerHTML = `
      <h2>${show.name}</h2>
      <img src="${show.image?.medium || ""}" alt="${show.name}" />
      <p><strong>Genres:</strong> ${show.genres.join(", ")}</p>
      <p><strong>Status:</strong> ${show.status}</p>
      <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
      <p><strong>Runtime:</strong> ${show.runtime || "N/A"} minutes</p>
      <p>${show.summary}</p>
      <button class="show-details-btn" data-show-id="${show.id}">View Episodes</button>
    `;

    showContainer.appendChild(showCard);
  });

  rootElem.appendChild(showContainer);

  document.querySelectorAll(".show-details-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const selectedShowId = event.target.dataset.showId;
      fetchEpisodes(selectedShowId)
        .then((allEpisodes) => {
          makePageForEpisodes(allEpisodes);
          setupListeners(allEpisodes);
          toggleSearchBoxes(false);
          toggleBackToShowButton(true);
        })
        .catch((error) => {
          console.error("Error fetching episodes:", error);
        });
    });
  });
}

// This function dynamically generates the HTML structure for the episodes and displays them
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root"); // Get the root element from the DOM
  rootElem.innerHTML = ""; // Clear the root element to avoid duplicating content
 
  // Create a container for all episode cards
  const episodesContainer = document.createElement("div");

  // Iterate over each episode in the list
  episodeList.forEach((episode) => {
     // Create a card for the episode
     const episodeCard = document.createElement("div");

     // Create a reference button
     const referenceBtn = document.createElement("button");

     // Generate the episode code in a simpler way
     const episodeCode = `S${episode.season.toString().padStart(2, "0")}E${episode.number.toString().padStart(2, "0")}`;

     // Populate the episode card with content, including the title, image, and summary
     episodeCard.innerHTML = `
      <h2>${episode.name} (${episodeCode})</h2>
      <img src="${episode.image.medium}" alt="${episode.name}">
      <p>${episode.summary}</p>
    `;
     // When clicked, it opens the episode's detailed page in a new browser tab
     referenceBtn.textContent = "Reference";
     referenceBtn.addEventListener("click", () => {
        window.open(episode.url, "_blank"); // Open the episode URL in a new tab
     });

     // Append the reference button to the episode card
     episodeCard.appendChild(referenceBtn);

     // Append the episode card to the container
     episodesContainer.appendChild(episodeCard);
  });

  // Append the container with all episode cards to the root element
  rootElem.appendChild(episodesContainer);
}

// Function to filter shows based on the search term
function filterShows(shows, searchTerm) {
  const lowerCaseTerm = searchTerm.toLowerCase();
  return shows.filter((show) => {
    const nameMatch = show.name.toLowerCase().includes(lowerCaseTerm);
    const genreMatch = show.genres.some((genre) =>
      genre.toLowerCase().includes(lowerCaseTerm)
    );
    const summaryMatch = show.summary
      ? show.summary.toLowerCase().includes(lowerCaseTerm)
      : false;

    return nameMatch || genreMatch || summaryMatch;
  });
}

// Add search functionality for shows
function setupShowSearch(shows) {
  const searchBox = document.getElementById("show-search-box");
  searchBox.addEventListener("input", (event) => {
    const searchTerm = event.target.value;
    const filteredShows = filterShows(shows, searchTerm);
    displayShowListing(filteredShows);
  });
}

// Show and episode search box toggle
function toggleSearchBoxes(isShowSearchVisible) {
  document.getElementById("show-search-box").style.display = isShowSearchVisible ? "block" : "none";
  document.getElementById("search-box").style.display = isShowSearchVisible ? "none" : "block";
}

// Back to shows button toggle
function toggleBackToShowButton(isVisible) {
  const backToShowsButton = document.getElementById("back-to-shows");
  backToShowsButton.style.display = isVisible ? "block" : "none";
}

// Function to filter episodes based on the search term
function filterEpisodes(episodes, searchTerm) {
  const lowerCaseTerm = searchTerm.toLowerCase();
  return episodes.filter((episode) => {
    const summary = episode.summary ? episode.summary.toLowerCase() : ""; 
    return (
      episode.name.toLowerCase().includes(lowerCaseTerm) ||
      summary.includes(lowerCaseTerm)
    );
  });
}

// Function to update how many episodes are displayed
function updateEpisodeCount(filteredCount, totalCount) {
  const countElement = document.getElementById("episode-count");
  countElement.textContent = `Displaying ${filteredCount}/${totalCount} episodes.`;
}

// Function to populate the dropdown with episodes
function populateEpisodeDropdown(episodes) {
  const dropdown = document.getElementById("episode-dropdown");
  dropdown.innerHTML = "<option value='all'>Show All Episodes</option>"; // Default option

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")} - ${episode.name}`;
    dropdown.appendChild(option);
  });
}

// Function to handle dropdown selection
function handleDropdownSelection(episodes) {
  const dropdown = document.getElementById("episode-dropdown");
  dropdown.addEventListener("change", (event) => {
    const selectedValue = event.target.value;

    if (selectedValue === "all") {
      makePageForEpisodes(episodes);
      updateEpisodeCount(episodes.length, episodes.length);
    } else {
      const selectedEpisode = episodes.find((episode) => episode.id == selectedValue);
      makePageForEpisodes([selectedEpisode]);
      updateEpisodeCount(1, episodes.length);
    }
  });
}

// Set up search and episode dropdown listeners
function setupListeners(allEpisodes) {
  document.getElementById("search-box").addEventListener("input", (event) => {
    const searchTerm = event.target.value;
    const filteredEpisodes = filterEpisodes(allEpisodes, searchTerm);
    makePageForEpisodes(filteredEpisodes);
    updateEpisodeCount(filteredEpisodes.length, allEpisodes.length);
  });

  handleDropdownSelection(allEpisodes);
}

// Run the setup function when the window finishes loading
window.onload = setup;