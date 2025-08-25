import { firestore, auth } from "./firebaseconfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification} from "firebase/auth";
import { getDocs, query, collection, where, doc, updateDoc, serverTimestamp} from "firebase/firestore";


class AuthManager {
    #auth;
    constructor() {
        this.#auth = auth;
        // this.initAuthListener();
    }

    initAuthListener() {
        onAuthStateChanged(this.#auth, (user) => {
            if (user) {
                const userRef = doc(firestore, "users", user.uid);

                // En ligne à la connexion
                updateDoc(userRef, {
                    status: "online",
                    lastSeen: serverTimestamp()
                });

                // Déconnexion fermeture onglet
                window.addEventListener("beforeunload", async () => {
                    try {
                        await updateDoc(userRef, {
                            status: "offline",
                            lastSeen: serverTimestamp()
                        });
                    } catch (err) {
                        console.error("Erreur beforeunload :", err);
                    }
                });

                // Réseau offline
                window.addEventListener("offline", async () => {
                    try {
                        await updateDoc(userRef, {
                            status: "offline",
                            lastSeen: serverTimestamp()
                        });
                    } catch (err) {
                        console.error("Erreur offline :", err);
                    }
                });

                // Réseau online
                window.addEventListener("online", async () => {
                    try {
                        await updateDoc(userRef, {
                            status: "online",
                            lastSeen: serverTimestamp()
                        });
                    } catch (err) {
                        console.error("Erreur online :", err);
                    }
                });

            } else {
                console.log("Utilisateur non connecté");
            }
        });
    }

    async getUserFirestore(){
        const id = await auth.currentUser?.uid;
        const userId = id ? id : this.getUserSession().uid;


        const usersRef = collection(firestore, "users");

        const q = query(usersRef, where("data.id", "==", userId));
        const querySnapshot = await getDocs(q); 

        if (!querySnapshot.empty) {
            if (!querySnapshot.empty) {
                for (const doc of querySnapshot.docs) {
                    return { docId: doc.id, data: doc.data() };
                }
            }
        } else {
            console.log("Aucun utilisateur trouvé avec cet email.");
            return null;
        }
    }

    getUserSession() {
        const userSession = localStorage.getItem("userSession");
        localStorage.cacaoUser? localStorage.removeItem("cacaoUser") : null;

        return userSession ? JSON.parse(userSession) : null;
    }

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.#auth, email, password);
            const user = userCredential.user;
            console.log("user", user);

            localStorage.setItem("userSession", JSON.stringify(user));
            return user; // ou return userCredential si tu veux plus d'infos
        } catch (error) {
            console.log("erreur", error.message);
            throw error; // optionnel : relancer l'erreur pour traitement ailleurs
        }
    }
    
    async signUp(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.#auth, email, password);
            const user = userCredential.user;

            console.log(user);

            // Envoie l'email de vérification
            await sendEmailVerification(user);

            alert("Email de vérification envoyé à:", email);

            // Enregistrer l'utilisateur dans localStorage
            localStorage.setItem("userSession", JSON.stringify(user));

            return userCredential;
        } catch (error) {
            console.log("erreur", error.message);
            throw error;
        }
    }
    
    async isConnected() {
        return new Promise((resolve, reject) => {
            const auth = this.#auth;
            auth.onAuthStateChanged((user) => {
                if (user) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, (error) => {
                reject(error);
            });
        });
    }

    async isOnline(){
        if(navigator.onLine){
            try {
                const rep = await fetch("https://www.google.com/favicon.ico", {method:"HEAD", mode:"no-cors"}); 
                return true;
            } catch (error) {
                return false
            }

        }else{
            return false;
        }
    }
}


export const authManager = new AuthManager();
