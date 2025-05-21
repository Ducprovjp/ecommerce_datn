// backend/runSuggestionsSync.js
require("dotenv").config({ path: "config/.env" });

const syncSuggestionsToAlgolia = require("./scripts/syncSuggestionsToAlgolia");

syncSuggestionsToAlgolia()
  .then(() => {
    console.log("Suggestions sync completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to sync suggestions:", error.message);
    process.exit(1);
  });

// node runSuggestionsSync.js