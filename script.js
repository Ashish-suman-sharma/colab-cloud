// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAXw5fRNWu-c27P9WaiZ8McYOu2gAD92Qk",
    authDomain: "own-cloud-fcfcf.firebaseapp.com",
    projectId: "own-cloud-fcfcf",
    storageBucket: "own-cloud-fcfcf.appspot.com",
    messagingSenderId: "197231291216",
    appId: "1:197231291216:web:ccee79fb507c8786f89a55",
    measurementId: "G-812M5XM3KQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to add a folder
async function addFolder(folderName) {
    try {
        const docRef = await addDoc(collection(db, "folders"), {
            name: folderName
        });
        console.log("Folder added with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding folder: ", e);
    }
}

// Function to create folder UI element
function createFolderElement(folderName, folderId) {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.innerHTML = `<i class="far fa-folder menu-icon"></i><span>${folderName}</span><i class="fas fa-ellipsis-v menu-icon"></i>`;
    menuItem.addEventListener('click', function () {
        document.querySelector('.header-title').textContent = folderName;
    });
    return menuItem;
}

// Make addFolderClickHandler available globally
window.addFolderClickHandler = async function() {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
        const folderId = await addFolder(folderName);
        if (folderId) {
            const folderElement = createFolderElement(folderName, folderId);
            document.querySelector('.sidebar-menu').appendChild(folderElement);
        }
    }
};

// Add folder button click event
document.getElementById('add-folder-btn').addEventListener('click', window.addFolderClickHandler);

// Function to load folders from Firebase
async function loadFolders() {
    try {
        const querySnapshot = await getDocs(collection(db, "folders"));
        querySnapshot.forEach((doc) => {
            const folderName = doc.data().name;
            const folderElement = createFolderElement(folderName, doc.id);
            document.querySelector('.sidebar-menu').appendChild(folderElement);
        });
    } catch (e) {
        console.error("Error loading folders: ", e);
    }
}



// Call loadFolders when the page loads
window.addEventListener('load', loadFolders);

// Export the loadFolders function
export { loadFolders };