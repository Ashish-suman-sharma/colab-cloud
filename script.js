// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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
    menuItem.setAttribute('data-folder-id', folderId); // Store folder ID for later use
    menuItem.innerHTML = `
        <i class="far fa-folder menu-icon"></i>
        <span>${folderName}</span>
        <i class="fas fa-ellipsis-v menu-icon"></i>
    `;

    // Handle 3-dot click to open full sidebar
    menuItem.querySelector('.fa-ellipsis-v').addEventListener('click', (e) => {
        toggleFullSidebar(folderName, folderId);
    });

    return menuItem;
}

// Function to toggle the sidebar form with animation
function toggleFullSidebar(folderName, folderId) {
    const sidebarForm = document.getElementById('full-sidebar');
    const folderNameInput = document.getElementById('folder-name-input');
    sidebarForm.classList.toggle('open'); // Toggle the sidebar open/close
    folderNameInput.value = folderName; // Set the folder name in input

    // Change folder name button logic
    document.getElementById('change-folder-name-btn').onclick = async () => {
        const newFolderName = folderNameInput.value;
        if (newFolderName) {
            const folderDocRef = doc(db, "folders", folderId);
            await updateDoc(folderDocRef, { name: newFolderName });
            alert("Folder name changed!");
            sidebarForm.classList.remove('open');
            location.reload(); // Refresh the page to update the folder list
        }
    };

    // Delete folder button logic
    document.getElementById('delete-folder-btn').onclick = async () => {
        const confirmation = confirm("Are you sure you want to delete this folder?");
        if (confirmation) {
            await deleteDoc(doc(db, "folders", folderId));
            alert("Folder deleted!");
            sidebarForm.classList.remove('open');
            location.reload(); // Refresh the page to update the folder list
        }
    };

    // Back arrow click event to close the sidebar
    document.getElementById('back-arrow').onclick = () => {
        sidebarForm.classList.remove('open');
    };
}

// Add folder button click event
document.getElementById('add-folder-btn').addEventListener('click', async () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
        const folderId = await addFolder(folderName);
        if (folderId) {
            const folderElement = createFolderElement(folderName, folderId);
            document.querySelector('.sidebar-menu').appendChild(folderElement);
        }
    }
});

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
