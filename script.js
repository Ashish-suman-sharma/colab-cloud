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

    // Add event listener to update header title when folder is clicked
    menuItem.addEventListener('click', () => {
        document.querySelector('.header-title').textContent = folderName;
        document.querySelector('.header-title').dataset.folderId = folderId;
        loadMediaItems(folderId); // Load media items for the selected folder
        localStorage.setItem('lastOpenedFolderId', folderId); // Save last opened folder ID to local storage
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
            showNotification("Folder name changed!");
            sidebarForm.classList.remove('open');
            location.reload(); // Refresh the page to update the folder list
        }
    };

    // Delete folder button logic
    document.getElementById('delete-folder-btn').onclick = async () => {
        showPopup('Delete Folder', 'Enter password', async (password) => {
            if (password === '915566') {
                await deleteDoc(doc(db, "folders", folderId));
                showNotification("Folder deleted!");
                sidebarForm.classList.remove('open');
                location.reload(); // Refresh the page to update the folder list
            } else {
                showNotification("Incorrect password!");
            }
        }, () => {
            // Cancel action
        });
    };

    // Back arrow click event to close the sidebar
    document.getElementById('back-arrow').onclick = () => {
        sidebarForm.classList.remove('open');
    };
}

// Function to show popup
function showPopup(title, inputPlaceholder, onOk, onCancel) {
    const popup = document.getElementById('popup');
    const popupTitle = document.getElementById('popup-title');
    const popupInput = document.getElementById('popup-input');
    const popupOk = document.getElementById('popup-ok');
    const popupCancel = document.getElementById('popup-cancel');
    const popupClose = document.getElementById('popup-close');

    popupTitle.textContent = title;
    popupInput.placeholder = inputPlaceholder;
    popupInput.value = '';

    popupOk.onclick = () => {
        onOk(popupInput.value);
        popup.style.display = 'none';
    };

    popupCancel.onclick = () => {
        if (onCancel) onCancel();
        popup.style.display = 'none';
    };

    popupClose.onclick = () => {
        if (onCancel) onCancel();
        popup.style.display = 'none';
    };

    popup.style.display = 'flex';
}

// Add folder button click event
document.getElementById('add-folder-btn').addEventListener('click', async () => {
    showPopup('Add Folder', 'Enter folder name', async (folderName) => {
        if (folderName) {
            const folderId = await addFolder(folderName);
            if (folderId) {
                const folderElement = createFolderElement(folderName, folderId);
                document.querySelector('.sidebar-menu').appendChild(folderElement);
            }
        }
    });
});

// Function to load folders from Firebase
async function loadFolders() {
    try {
        const querySnapshot = await getDocs(collection(db, "folders"));
        const folders = [];
        querySnapshot.forEach((doc) => {
            const folderName = doc.data().name;
            const folderElement = createFolderElement(folderName, doc.id);
            document.querySelector('.sidebar-menu').appendChild(folderElement);
            folders.push({ id: doc.id, name: folderName });
        });

        // Check local storage for last opened folder ID
        const lastOpenedFolderId = localStorage.getItem('lastOpenedFolderId');
        if (lastOpenedFolderId) {
            const lastOpenedFolder = folders.find(folder => folder.id === lastOpenedFolderId);
            if (lastOpenedFolder) {
                document.querySelector('.header-title').textContent = lastOpenedFolder.name;
                document.querySelector('.header-title').dataset.folderId = lastOpenedFolder.id;
                loadMediaItems(lastOpenedFolder.id); // Load media items for the last opened folder
            } else if (folders.length > 0) {
                // If the last opened folder is not found, open the first folder
                document.querySelector('.header-title').textContent = folders[0].name;
                document.querySelector('.header-title').dataset.folderId = folders[0].id;
                loadMediaItems(folders[0].id); // Load media items for the first folder
            }
        } else if (folders.length > 0) {
            // If no last opened folder ID in local storage, open the first folder
            document.querySelector('.header-title').textContent = folders[0].name;
            document.querySelector('.header-title').dataset.folderId = folders[0].id;
            loadMediaItems(folders[0].id); // Load media items for the first folder
        }
    } catch (e) {
        console.error("Error loading folders: ", e);
    }
}

// Function to load media items for a folder
async function loadMediaItems(folderId) {
    const mediaList = document.querySelector('.media-list');
    mediaList.innerHTML = ''; // Clear existing media items

    try {
        const querySnapshot = await getDocs(collection(db, "folders", folderId, "media"));
        querySnapshot.forEach((doc) => {
            const mediaData = doc.data();
            const mediaItem = createMediaItemElement(mediaData);
            mediaList.appendChild(mediaItem);
        });
    } catch (e) {
        console.error("Error loading media items: ", e);
    }
}

// Function to create media item element
function createMediaItemElement(mediaData) {
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item';
    mediaItem.innerHTML = `
        <div class="media-info">
            <span class="media-text">${mediaData.text}</span>
            <span class="media-date">${mediaData.date}</span>
        </div>
    `;
    return mediaItem;
}

// Function to save new media item
async function saveMediaItem(folderId, mediaData) {
    try {
        await addDoc(collection(db, "folders", folderId, "media"), mediaData);
        showNotification("Media item added!");
        loadMediaItems(folderId); // Reload media items
    } catch (e) {
        console.error("Error adding media item: ", e);
    }
}

// Add event listener to input field to save media item on Enter
document.querySelector('.input-text').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const folderId = document.querySelector('.header-title').dataset.folderId;
        const mediaData = {
            date: new Date().toLocaleString(), // Save the current date and time
            text: e.target.value
        };
        saveMediaItem(folderId, mediaData);
        e.target.value = ''; // Clear input field
    }
});

// Function to show notification
function showNotification(message) {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    // Remove notification after animation ends
    notification.addEventListener('animationend', () => {
        notificationContainer.removeChild(notification);
    });
}

// Call loadFolders when the page loads
window.addEventListener('load', loadFolders);