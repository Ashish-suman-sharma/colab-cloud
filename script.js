// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

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
const auth = getAuth();
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

// Function to handle Google Sign-In
async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("User signed in: ", user.displayName);
        return user;
    } catch (error) {
        console.error("Error signing in: ", error);
    }
}

// Check if the user is already signed in
onAuthStateChanged(auth, (user) => {
    const profilePic = document.getElementById('profile-pic');
    const userIcon = document.querySelector('.user-icon');
    if (user) {
        profilePic.src = user.photoURL;
        profilePic.style.display = 'block';
        userIcon.style.display = 'none';
        console.log("User is already signed in: ", user.displayName);
    } else {
        profilePic.style.display = 'none';
        userIcon.style.display = 'block';
    }
});

// Function to display folders in the UI
function displayFolders(folders) {
    const folderList = document.querySelector('.folder-list');
    folderList.innerHTML = ''; // Clear existing folders
    if (folders && folders.length > 0) {
        folders.forEach(folder => {
            const folderElement = document.createElement('div');
            folderElement.className = 'folder-item';
            folderElement.textContent = folder.name;
            folderList.appendChild(folderElement);
        });
    } else {
        folderList.textContent = 'No folders found.';
    }
}

// Add event listener to the user icon for login
document.querySelector('.user-icon').addEventListener('click', async () => {
    const user = await signInWithGoogle();
    if (user) {
        console.log("User signed in: ", user.displayName);
    }
});

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
    const user = auth.currentUser;
    if (user) {
        showPopup('Add Folder', 'Enter folder name', async (folderName) => {
            if (folderName) {
                const folderId = await addFolder(folderName);
                if (folderId) {
                    const folderElement = createFolderElement(folderName, folderId);
                    document.querySelector('.sidebar-menu').appendChild(folderElement);
                }
            }
        });
    } else {
        showNotification("Please sign in to create a folder.");
    }
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

// Function to convert Google Drive shareable link to direct download link
function convertToDirectDownload(shareableLink) {
    if (shareableLink.includes("drive.google.com/file/d/")) {
        const fileId = shareableLink.split("/d/")[1].split("/")[0];
        const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
        return downloadLink;
    } else {
        return shareableLink; // Return the original link if it's not a Google Drive link
    }
}

// Function to parse text and identify URLs
function parseText(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map(part => {
        if (part.match(urlRegex)) {
            if (part.includes('drive.google.com')) {
                const downloadLink = convertToDirectDownload(part);
                return `
                    <button class="google-drive-button" onclick="window.location.href='${downloadLink}'">Download</button>
                    <button class="google-drive-view-button" onclick="window.location.href='${part}'">View</button>
                `;
            } else {
                return `<a href="${part}" class="other-url-link">${part}</a>`;
            }
        }
        return part;
    }).join('');
}

// Function to create media item element
function createMediaItemElement(mediaData) {
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item';
    mediaItem.innerHTML = `
        <div class="media-info">
            <span class="media-text">${parseText(mediaData.text)}</span>
            <span class="media-date">${mediaData.date}</span>
            <span class="media-username">Created by: ${mediaData.username}</span>
        </div>
    `;

    // Add file previews if available
    if (mediaData.files && mediaData.files.length > 0) {
        mediaData.files.forEach(file => {
            let filePreview;
            if (file.type.startsWith('image/')) {
                filePreview = `<img src="${file.url}" alt="${file.name}" class="media-thumbnail" onclick="window.location.href='${file.url}'">`;
            } else if (file.type.startsWith('video/')) {
                filePreview = `<video src="${file.url}" controls class="media-thumbnail"></video>`;
            } else {
                filePreview = `<i class="fas fa-file-alt media-thumbnail" onclick="window.location.href='${file.url}'"></i>`;
            }
            mediaItem.innerHTML += filePreview;
        });
    }

    return mediaItem;
}

// Function to save new media item
async function saveMediaItem(folderId, mediaData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            showNotification("Please sign in to add media items.");
            return;
        }

        const mediaItemData = {
            ...mediaData,
            text: convertToDirectDownload(mediaData.text), // Convert Google Drive link before saving
            date: new Date().toLocaleDateString('en-GB', { // Format date as DD/MM/YYYY
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            username: user.displayName // Save the username of the current user
        };

        await addDoc(collection(db, "folders", folderId, "media"), mediaItemData);
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
            text: e.target.value,
            files: Array.from(document.getElementById('file-input').files).map(file => ({
                name: file.name,
                url: URL.createObjectURL(file),
                type: file.type
            }))
        };
        saveMediaItem(folderId, mediaData);
        e.target.value = ''; // Clear input field
        document.getElementById('file-input').value = ''; // Clear file input
    }
});

// Add event listener to the clip icon to open the file manager
document.querySelector('.attach-icon').addEventListener('click', () => {
    document.getElementById('file-input').click();
});

// Handle file selection and upload
document.getElementById('file-input').addEventListener('change', async (event) => {
    const files = event.target.files;
    const folderId = document.querySelector('.header-title').dataset.folderId;

    if (files.length > 0 && folderId) {
        for (const file of files) {
            const fileData = await handleFileUpload(file);
            await saveMediaItem(folderId, { files: [fileData] });
            displayFilePreview(fileData);
        }
    }
});

// Function to handle file upload
async function handleFileUpload(file) {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `uploads/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Show loading bar
        const loadingBarContainer = document.getElementById('loading-bar-container');
        const loadingBar = document.getElementById('loading-bar');
        loadingBarContainer.style.display = 'block';

        // Update loading bar progress
        uploadTask.on('state_changed', (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            loadingBar.style.width = `${progress}%`;
        }, (error) => {
            console.error("Error uploading file: ", error);
            reject(error);
        }, () => {
            // Hide loading bar
            loadingBarContainer.style.display = 'none';
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve({
                    name: file.name,
                    url: downloadURL,
                    type: file.type
                });
            });
        });
    });
}

// Function to display file preview in the media list
function displayFilePreview(fileData) {
    const mediaList = document.querySelector('.media-list');
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item';

    if (fileData.type.startsWith('image/')) {
        mediaItem.innerHTML = `<img src="${fileData.url}" alt="${fileData.name}" class="media-thumbnail" onclick="window.location.href='${fileData.url}'">`;
    } else if (fileData.type.startsWith('video/')) {
        mediaItem.innerHTML = `<video src="${fileData.url}" controls class="media-thumbnail"></video>`;
    } else {
        mediaItem.innerHTML = `<i class="fas fa-file-alt media-thumbnail" onclick="window.location.href='${fileData.url}'"></i>`;
    }

    mediaList.appendChild(mediaItem);
}

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