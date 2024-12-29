//You can edit ALL of the code here
// The setup function initializes the application when the page is loaded
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
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

    // Generate the episode code in the format SXXEXX
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;

    // Populate the episode card with content, including the title, image, and summary
    episodeCard.innerHTML = `
      <h2>${episode.name} (${episodeCode})</h2>
      <img src="${episode.image.medium}" alt="${episode.name}">
      <p>${episode.summary}</p>
    `;

    // Append the episode card to the container
    episodesContainer.appendChild(episodeCard);
  });

  // Append the container with all episode cards to the root element
  rootElem.appendChild(episodesContainer);
}

// Run the setup function when the window finishes loading
window.onload = setup;
