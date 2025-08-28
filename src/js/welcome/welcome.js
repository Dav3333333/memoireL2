import { dashboardController } from "../controller/dashbord/dashbord";
import { authManager } from "../httplibs/authApp";

class WelcomeController {
    #container;
    #dialog;
    constructor() {
        if(authManager.getUserSession()){
            window.location.href = "home.html";
            return;
        }

        
        this.#dialog = document.querySelector("dialog");

        this.#container = document.querySelector('.auth-container');


        document.querySelector("div").appendChild(this.#container);
    }

    createLeftContent() {
        const left = this.#container.querySelector(".auth-right");

        left.addEventListener("click", (e) => {
            if (e.target.id === "btn-signin") {
                window.location.href = "login.html";
            }
        });
    }

    async init() {
        const right = this.#container.querySelector(".auth-left .container-dashbord");

        await dashboardController.initilizeInComponent(right);

        this.createLeftContent();
    }

    #getMercurail(){
        const mercurialRef = collection(firestore, "prix_mercurial");
        onSnapshot(mercurialRef, (snapshot) => {
            snapshot.forEach((doc) => {
                container.textContent =  doc.data().prix_dollars
                return;
            });
        });
    }
}

export const welcomeController = new WelcomeController();
welcomeController.init();