`use strict`; 

import { firestore } from "../../../httplibs/firebaseconfig";
import { collection, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
/** * ExportateurController
 * This class manages list of messages and current disctions
 */

class MessagesController {
    #idCuurentUser;
    #typeUser;


    #messagesContainer;
    #mainContainer;

    constructor() {
        this.#idCuurentUser = null;

        this.#typeUser = null;

        this.#messagesContainer = document.createElement("div");
        this.#messagesContainer.classList.add("messages-container");  
        
        this.#mainContainer = document.querySelector("#main-content .content");

    }

    async init(idCurrentUser, typeUser) {
        this.#idCuurentUser = idCurrentUser;
        this.#typeUser = typeUser;
        // await this.#getMessages();
        await this.#getDiscussions()
    }

    async #getDiscussions() {
        let searchedType = null;
        if(this.#typeUser == null){
            return;
        }

        
        if(this.#typeUser == "--coope"){
          searchedType = "--expo";
        }
        
        if(this.#typeUser == "--expo"){
          searchedType = "--coope";
        }
        
        if(searchedType == null){
          return;
        }
        
        console.log(this.#typeUser, searchedType)

        try {
            const discussionsRef = collection(firestore, "users");
            const q = query(discussionsRef, where("type", "==", `${searchedType}`));
            onSnapshot(q, (snapshot) => {
              
              console.log("Nombre de discussions récupérées :", snapshot.size);
              this.#messagesContainer.innerHTML = ""; // Clear previous discussions
              const discussions = [];
              snapshot.forEach((doc) => {
                discussions.push({ id: doc.id, ...doc.data() });
              });
              this.#renderDiscussion(discussions);
            });
        } catch (error) {
            console.error("Error fetching discussions:", error);
        }
    }

    #renderDiscussion(customers) {
        this.#mainContainer.innerHTML = "<h4>Discussions</h4>";
        const container = document.createElement('div');
        container.classList.add("cooperative-list");

        if (customers.length === 0) {
            this.#mainContainer.innerHTML = "<p>Aucune discussion trouvée.</p>";
            return;
        }

        customers.forEach(customer => {
            const nom = customer.data.nom ?? "";
            const ville = customer.data.ville == "Inconnu" ? "" : customer.data.ville;
            const numero = customer.data.numero == "Inconnu" ? "" : customer.data.numero;
            const quartier = customer.data.quartier ?? "";
            const avenu = customer.data.avenu ?? "";
            const geo_loc = customer.data.geo_loc ?? { lat: 0, long: 0 };
            const email = customer.data.contact.mail;
            const phone = customer.data.contact.phone;
            const status = customer.data.status

            const card = `
                <div class="cooperative-card" id="${customer.id}" lat="${geo_loc.lat}" log="${geo_loc.long}" email="${email}" phone="${phone}" nom="${nom}" ville="${ville}" quartier="${quartier}" avenu="${avenu}"  num="${numero}">
                    <div class="cooperative-info">
                        <h3 class="cooperative-info__title">${nom}</h3>
                        <!--<p class="cooperative-info__adress">${ville}, ${quartier} ${avenu} ${numero}</p>-->
                    </div>
                    <div class="cooperative-stock">
                        <!--<strong>Status :</strong>-->
                        <span>${status}</span>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', card);
        });

        this.#mainContainer.appendChild(container);
    }

    async #getMessages() {
        try {
            const messagesRef = collection(firestore, "messages");
            const q = query(messagesRef, where("userId", "==", this.#idCuurentUser));
            onSnapshot(q, (snapshot) => {
                this.#messagesContainer.innerHTML = ""; // Clear previous messages
                snapshot.forEach((doc) => {
                    const messageData = doc.data();
                    this.#renderMessage(messageData);
                });
            });
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }

    #renderMessage(messageData) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.innerHTML = `
            <p><strong>${messageData.sender}:</strong> ${messageData.text}</p>
            <span class="timestamp">${new Date(messageData.timestamp).toLocaleTimeString()}</span>
        `;
        this.#messagesContainer.appendChild(messageElement);
    }

    // messages code sources

    #renderMessageBox(){
        this.#mainContainer.innerHTML = "";
        this.#mainContainer.innerHTML = `<div class="chatbox-container">
  <div class="chatbox-header">
    <div class="chatbox-user-info">
      <h4>Exportateur A</h4>
      <p>En ligne</p>
    </div>
  </div>

  <div class="chatbox-messages" id="messages">
    <div class="chat-message left">
      <div class="message-bubble">
        Bonjour, avez-vous du stock disponible ?
      </div>
    </div>
    <div class="chat-message right">
      <div class="message-bubble">
        Oui, nous avons 2 tonnes prêtes à être expédiées.
      </div>
    </div>

    <div class="chat-message left">
      <div class="message-bubble">
        Bonjour, avez-vous du stock disponible ?
      </div>
    </div>
    <div class="chat-message right">
      <div class="message-bubble">
        Oui, nous avons 2 tonnes prêtes à être expédiées.
      </div>
    </div>

    <div class="chat-message left">
      <div class="message-bubble">
        Bonjour, avez-vous du stock disponible ?
      </div>
    </div>
    <div class="chat-message right">
      <div class="message-bubble">
        Oui, nous avons 2 tonnes prêtes à être expédiées.
      </div>
    </div>

    <div class="chat-message left">
      <div class="message-bubble">
        Bonjour, avez-vous du stock disponible ?
      </div>
    </div>
    <div class="chat-message right">
      <div class="message-bubble">
        Oui, nous avons 2 tonnes prêtes à être expédiées.
      </div>
    </div>
    
  </div>

  <!-- Formulaire d’envoi -->
  <form class="chatbox-input" onsubmit="sendMessage(event)">
    <input type="text" id="messageInput" placeholder="Écrire un message..." required />
    <button type="submit">
      <!-- Icône flèche en papier style WhatsApp -->
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
      </svg>
    </button>
  </form>
</div>`;
    }
}

export const messagesController = new MessagesController();
