import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

const firestore = getFirestore(firebaseApp);

// Helper function to get a random color for the post-it note
function getRandomColor() {
  const colors = ['yellow', 'blue', 'green', 'pink', 'orange', 'purple'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Firebase Firestore functions
export async function getMessagesFromFirestore() {
  try {
    const messagesCollection = collection(firestore, 'messages');
    const messagesQuery = query(messagesCollection, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(messagesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching messages from Firestore:', error);
    // Return empty array on error so the UI doesn't break
    return [];
  }
}

export async function addMessageToFirestore(name, message) {
  try {
    const messagesCollection = collection(firestore, 'messages');
    
    const newMessage = {
      name: name || 'Anonymous',
      message,
      timestamp: serverTimestamp(),
      color: getRandomColor()
    };
    
    const docRef = await addDoc(messagesCollection, newMessage);
    
    return {
      id: docRef.id,
      ...newMessage,
      timestamp: new Date().toISOString() // For immediate display before the server timestamp is processed
    };
  } catch (error) {
    console.error('Error adding message to Firestore:', error);
    throw error;
  }
}

// Export the functions with simpler names for easier use
export const getAllMessages = getMessagesFromFirestore;
export const addMessage = addMessageToFirestore; 