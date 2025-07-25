import { firestore, auth } from "./firebaseconfig";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDocs, query, collection, where} from "firebase/firestore";



class AuthManager {
    #auth;
    constructor() {
        this.#auth = auth;
    }

    async getUserFirestore(){
        const id = await auth.currentUser?.uid;
        const userId = id ? id : this.getUserSession().uid;


        const usersRef = collection(firestore, "users");

        const q = query(usersRef, where("data.id", "==", userId));
        const querySnapshot = await getDocs(q); 

        console.log(querySnapshot);

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

            console.log(user)

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
