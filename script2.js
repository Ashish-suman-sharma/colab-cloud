const readline = require('readline');

// Function to convert Google Drive shareable link to direct download link
function convertToDirectDownload(shareableLink) {
  if (shareableLink.includes("drive.google.com/file/d/")) {
    const fileId = shareableLink.split("/d/")[1].split("/")[0];
    const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
    return downloadLink;
  } else {
    return "Invalid Google Drive link";
  }
}

// Create an interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for input
rl.question("Please enter the Google Drive shareable link: ", function(shareableLink) {
  const downloadLink = convertToDirectDownload(shareableLink);
  console.log("Direct download link:", downloadLink);
  
  // Close the input stream
  rl.close();
});
