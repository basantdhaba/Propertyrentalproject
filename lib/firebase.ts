import { initializeApp, getApps } from "firebase/app"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { getFunctions, httpsCallable } from "firebase/functions"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
let app
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
}

const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const functions = getFunctions(app)
const googleProvider = new GoogleAuthProvider()

export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL
export const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Update the signInWithGoogle function to handle authentication properly
export const signInWithGoogle = async () => {
  try {
    // Force popup method to avoid redirect issues
    googleProvider.setCustomParameters({
      prompt: "select_account",
    })

    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user

    // Check if user document exists
    const userDoc = await getDoc(doc(db, "users", user.uid))

    // If user doesn't exist in Firestore, create a new document
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        role: user.email === ADMIN_EMAIL ? "admin" : "user",
        createdAt: serverTimestamp(),
      })
    }

    return { user, error: null }
  } catch (error: any) {
    console.error("Google sign-in error:", error)

    // Handle specific Firebase auth errors
    if (error.code === "auth/popup-closed-by-user") {
      return { user: null, error: "Sign-in was cancelled. Please try again." }
    } else if (error.code === "auth/popup-blocked") {
      return { user: null, error: "Pop-up was blocked by your browser. Please allow pop-ups for this site." }
    }

    return { user: null, error: error.message }
  }
}

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: userCredential.user.email,
      role: email === ADMIN_EMAIL ? "admin" : "user",
    })
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    return { url: downloadURL, error: null }
  } catch (error: any) {
    return { url: null, error: error.message }
  }
}

// Document creation function - provide both names for compatibility
export const createDocument = async (collectionName: string, data: any, id?: string) => {
  try {
    const docRef = id ? doc(db, collectionName, id) : doc(collection(db, collectionName))
    await setDoc(docRef, { ...data, createdAt: serverTimestamp() })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

// Add alias for addDocument that points to the same implementation
export const addDocument = createDocument

export const getDocument = async (collectionName: string, id: string) => {
  try {
    console.log(`Fetching document from ${collectionName} with ID: ${id}`)
    const docRef = doc(db, collectionName, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      // Convert any Firestore timestamps to JavaScript dates
      const data = docSnap.data()
      const processedData = { id: docSnap.id, ...data }

      // Process timestamps
      Object.keys(processedData).forEach((key) => {
        if (processedData[key] && typeof processedData[key] === "object" && processedData[key].seconds) {
          processedData[key] = new Date(processedData[key].seconds * 1000)
        }
      })

      console.log(`Document found:`, processedData)
      return { data: processedData, error: null }
    } else {
      console.log(`No document found with ID: ${id}`)
      return { data: null, error: "Document not found" }
    }
  } catch (error: any) {
    console.error(`Error fetching document:`, error)
    return { data: null, error: error.message }
  }
}

export const getDocumentsByField = async (collectionName: string, fieldName: string, fieldValue: any) => {
  try {
    const q = query(collection(db, collectionName), where(fieldName, "==", fieldValue))
    const querySnapshot = await getDocs(q)
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return { data, error: null }
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}

// Add this new function after the getDocumentsByField function

export const getDocumentsByDateRange = async (
  collectionName: string,
  dateField: string,
  startDate: Date,
  endDate: Date,
) => {
  try {
    // Get all documents from the collection
    const querySnapshot = await getDocs(collection(db, collectionName))

    // Filter documents by date range manually
    // This is necessary because Firestore doesn't support direct date range queries in the client SDK
    const filteredDocs = querySnapshot.docs.filter((doc) => {
      const data = doc.data()
      let docDate

      // Handle different date formats
      if (data[dateField] && typeof data[dateField] === "object" && data[dateField].seconds) {
        // Firestore timestamp
        docDate = new Date(data[dateField].seconds * 1000)
      } else if (data[dateField] instanceof Date) {
        // JavaScript Date object
        docDate = data[dateField]
      } else if (typeof data[dateField] === "string") {
        // ISO string or other date string
        docDate = new Date(data[dateField])
      } else {
        // No valid date field
        return false
      }

      // Check if date is within range
      return docDate >= startDate && docDate <= endDate
    })

    // Map to include document ID
    const data = filteredDocs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return { data, error: null }
  } catch (error: any) {
    console.error("Error fetching documents by date range:", error)
    return { data: [], error: error.message }
  }
}

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id)
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id)
    await deleteDoc(docRef)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const getAllProperties = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "properties"))
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return { data, error: null }
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}

export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"))
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return { data, error: null }
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}

export const getInterestedUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "interests"))
    const data = querySnapshot.docs.map((doc) => {
      const docData = doc.data()

      // Process timestamps
      const processedData = { id: doc.id, ...docData }
      Object.keys(processedData).forEach((key) => {
        if (processedData[key] && typeof processedData[key] === "object" && processedData[key].seconds) {
          processedData[key] = new Date(processedData[key].seconds * 1000)
        }
      })

      return processedData
    })

    return { data, error: null }
  } catch (error: any) {
    console.error("Error fetching interested users:", error)
    return { data: [], error: error.message }
  }
}

export const updateAdminSettings = async (settings: any) => {
  try {
    await setDoc(doc(db, "settings", "admin"), settings)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const getAdminSettings = async () => {
  try {
    const docRef = doc(db, "settings", "admin")
    const docSnap = await getDoc(docRef)
    return { data: docSnap.exists() ? docSnap.data() : null, error: null }
  } catch (error: any) {
    console.error("Error fetching admin settings:", error)
    return { data: null, error: error.message }
  }
}

export const setAdminRole = async (email: string) => {
  try {
    const setAdminRoleFunction = httpsCallable(functions, "setAdminRole")
    const result = await setAdminRoleFunction({ email })
    return { success: true, data: result.data, error: null }
  } catch (error: any) {
    return { success: false, data: null, error: error.message }
  }
}

export const checkAdminStatus = async (user: any) => {
  try {
    const idTokenResult = await user.getIdTokenResult(true)
    return idTokenResult.claims.admin === true
  } catch (error: any) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export const getAllMessages = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "messages"))
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return { data, error: null }
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}

export { auth, onAuthStateChanged, db, collection, getDocs, query, where, serverTimestamp, Timestamp, googleProvider }

