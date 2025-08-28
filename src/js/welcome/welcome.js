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

        this.#container = document.createElement('div');
        this.#container.classList.add("auth-container");

        this.#container.innerHTML = `
        <div class="auth-left">
            <h1> Bienvenue sur <span>Cacao Connect RDC</span> </h1>
            <p> La plateforme de gestion et d'information sur le cacao </p>
            <div class="container-dashbord">
            </div>
        </div>

        <div class="auth-right">
        </div>
        `;

        console.log(document.querySelector(".main"));
        document.querySelector("div").appendChild(this.#container);
    }

    createRigthContent() {
        const right = this.#container.querySelector(".auth-right");

        right.innerHTML = `
            <div class="container-form">
                <section>
                    <p> Pour acheter ou vendre le cacao, vous devez d'abord vous connecter ou créer un compte si vous n'en avez pas. </p>
                    <p> Cliquez sur le bouton ci-dessous pour commencer. </p>
                </section>
                <button class="btn btn-secondary btn-center-bothside" id="btn-signin"> Acheter Ici</button> 
                <button class="btn btn-secondary btn-center-bothside" id="btn-signin"> Vendre Ici</button>
            </div> 
        `;
        right.addEventListener("click", (e) => {
            if (e.target.id === "btn-signin") {
                window.location.href = "login.html";
            }
        });
    }

    async init() {
        const left = this.#container.querySelector(".auth-left .container-dashbord");

        await dashboardController.initilizeInComponent(left);

        this.createRigthContent();
    }
}

export const welcomeController = new WelcomeController();
welcomeController.init();