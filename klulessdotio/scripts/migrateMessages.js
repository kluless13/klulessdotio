// Script to migrate messages from JSON file to Firebase
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

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

async function migrateMessages() {
  try {
    console.log('Starting migration...');
    console.log('Firebase Project ID:', firebaseConfig.projectId);
    
    // Read messages from JSON file
    const filePath = path.join(process.cwd(), 'data', 'messages.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileData);
    const messages = data.messages;
    
    console.log(`Found ${messages.length} messages to migrate`);
    
    // Initialize Firebase
    console.log('Initializing Firebase...');
    const firebaseApp = initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);
    const messagesCollection = collection(firestore, 'messages');
    
    // Check if we can access Firestore
    try {
      console.log('Testing Firestore connection...');
      await getDocs(messagesCollection);
      console.log('Firestore connection successful!');
    } catch (error) {
      console.error('Error connecting to Firestore:', error);
      console.log('\nIMPORTANT: You need to enable Firestore in your Firebase project.');
      console.log('1. Go to https://console.firebase.google.com/project/' + firebaseConfig.projectId + '/firestore');
      console.log('2. Click "Create database"');
      console.log('3. Choose "Start in production mode" and select a location close to your users');
      console.log('4. Wait for the database to be created (this may take a minute)');
      console.log('5. Run this script again\n');
      process.exit(1);
    }
    
    // Migrate to Firebase
    console.log('Migrating to Firebase...');
    let firebaseSuccess = 0;
    for (const message of messages) {
      try {
        await addDoc(messagesCollection, {
          name: message.name,
          message: message.message,
          timestamp: new Date(message.timestamp),
          color: message.color
        });
        firebaseSuccess++;
        console.log(`Migrated message: ${message.name} - ${message.message.substring(0, 30)}...`);
      } catch (error) {
        console.error(`Error adding message from ${message.name}:`, error);
      }
    }
    console.log(`Firebase migration complete: ${firebaseSuccess}/${messages.length} messages migrated`);
    
    if (firebaseSuccess === messages.length) {
      console.log('All messages successfully migrated to Firestore!');
    } else {
      console.log(`Warning: Only ${firebaseSuccess} out of ${messages.length} messages were migrated.`);
    }
    
    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateMessages(); 