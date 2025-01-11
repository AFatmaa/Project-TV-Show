//You can edit ALL of the code here
// The setup function initializes the application when the page is loaded
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
  populateEpisodeDropdown(allEpisodes); // Populate the dropdown with episodes

  // Add event listener for live search input
  const searchInput = document.getElementById("search-box");
  searchInput.addEventListener("input", (event) => {
     const searchTerm = event.target.value;
     const filteredEpisodes = filterEpisodes(allEpisodes, searchTerm);
     makePageForEpisodes(filteredEpisodes);
     updateEpisodeCount(filteredEpisodes.length, allEpisodes.length);
  });

  // Add event listener for dropdown selection
  handleDropdownSelection(allEpisodes);

}

// This function dynamically generates the HTML structure for the episodes and displays them
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root"); // Get the root element from the DOM
  rootElem.innerHTML = ""; // Clear the root element to avoid duplicating content
 
  // Create a container for all episode cards
  const episodesContainer = document.createElement("div");
  episodesContainer.className = "episodes-container"; // Add a class for styling purposes

  // Iterate over each episode in the list
  episodeList.forEach((episode) => {
     // Create a card for the episode
     const episodeCard = document.createElement("div");
     episodeCard.className = "episode-card"; // Add a class for individual episode cards

     // Create a reference button
     const referenceBtn = document.createElement("button");
     referenceBtn.className = "reference-button"; // Add a class for styling purposes

     // Generate the episode code in the format SXXEXX
     //const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;

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

// Run the setup function when the window finishes loading
window.onload = setup;
