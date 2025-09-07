import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyAISfmXUtURhQg78JjB6duTTluS_yCfV10",
	authDomain: "bb21-portal.firebaseapp.com",
	projectId: "bb21-portal",
	storageBucket: "bb21-portal.firebasestorage.app",
	messagingSenderId: "788369154043",
	appId: "1:788369154043:web:074c564964936c20b6f55e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setPersistence(auth, browserLocalPersistence);

export { auth, db };