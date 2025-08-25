"use strict";

import { firestore } from "../../../httplibs/firebaseconfig";
import {
    collection,
    onSnapshot,
    query,
    where,
    addDoc,
    serverTimestamp,
    orderBy
} from "firebase/firestore";

class MessagesController {
    #idCurrentUser;
    #typeUser;
    #mainContainer;
    #principalContainer;

    constructor() {
        this.#idCurrentUser = null;
        this.#typeUser = null;
        
        this.#principalContainer = document.querySelector("#main-content .content");
        this.#mainContainer = document.createElement("div");
        this.#principalContainer.innerHTML = "";
        this.#principalContainer.appendChild(this.#mainContainer);
    }

    async init(idCurrentUser, typeUser) {
        this.#idCurrentUser = idCurrentUser;
        this.#typeUser = typeUser;
        await this.#loadDiscussions();
    }

    async #loadDiscussions() {
        if (!this.#typeUser) return;

        const searchedType = this.#typeUser === "--coope" ? "--expo"
            : this.#typeUser === "--expo" ? "--coope"
            : null;
        if (!searchedType) return;

        try {
            const usersRef = collection(firestore, "users");
            const q = query(usersRef, where("type", "==", searchedType));
            onSnapshot(q, (snapshot) => {
                const users = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                this.#renderDiscussions(users);
            });
        } catch (error) {
            console.error("Erreur lors du chargement des discussions :", error);
        }
    }

    #renderDiscussions(users) {
        this.#mainContainer.innerHTML = "<h4>Discussions</h4>";
        const container = document.createElement("div");
        container.className = "cooperative-list";

        if (users.length === 0) {
            this.#mainContainer.innerHTML += "<p>Aucune discussion trouvée.</p>";
            return;
        }

        users.forEach(user => {
            const card = document.createElement("div");
            card.className = "cooperative-card";
            card.dataset.id = user.data.id;
            card.dataset.name = user.data.nom;

            card.innerHTML = `
                <div class="cooperative-info">
                    <h3 class="cooperative-info__title">${user.data.nom ?? "Sans nom"}</h3>
                </div>
                <div class="cooperative-stock">
                    <span>${user.status ?? ""}</span>
                </div>
            `;

            container.appendChild(card);
        });

        container.addEventListener("click", this.#handleCardClick.bind(this));
        this.#mainContainer.appendChild(container);
        this.#principalContainer.innerHTML = "";
        this.#principalContainer.appendChild(this.#mainContainer);
    }

    #handleCardClick(event) {
        const card = event.target.closest(".cooperative-card");
        if (!card) return;

        const userId = card.dataset.id;
        const userName = card.dataset.name;

        if (userId && userName) {
            this.#renderChat(userId, userName);
        }
    }

    #renderChat(targetId, targetName) {
        this.#mainContainer.innerHTML = `
            <div class="chatbox-container">
                <div class="chatbox-header">
                    <button id="btn-back">←</button>
                    <div class="chatbox-user-info">
                        <h4>${targetName}</h4>
                        <p>En ligne</p>
                    </div>
                </div>
                <div class="chatbox-messages" id="messages"><div class="loader-green"></div> <span>Chargement...</span></div>
                <form class="chatbox-input" id="chat-form">
                    <input type="text" id="messageInput" placeholder="Écrire un message..." required autocomplete="off" />
                    <button type="submit" aria-label="Envoyer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </form>
            </div>
        `;

        document.querySelector("#btn-back").addEventListener("click", () => {
            this.#loadDiscussions();
        });

        document.querySelector("#chat-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const input = document.getElementById("messageInput");
            const text = input.value.trim();
            if (text) {
                this.#sendMessage(targetId, text);
                input.value = "";
            }
        });

        this.#listenMessages(targetId);
    }

    #getConversationId(user1, user2) {
        // ID conversation stable (ordre alphabétique)
        return user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;
    }

    #listenMessages(targetId) {
        const conversationId = this.#getConversationId(this.#idCurrentUser, targetId);
        const threadRef = collection(firestore, "messages", conversationId, "threads");
        const q = query(threadRef, orderBy("timestamp"));

        onSnapshot(q, (snapshot) => {
            const messagesBox = document.getElementById("messages");
            if (!messagesBox) return;

            messagesBox.innerHTML = "";

            if (snapshot.empty) {
                messagesBox.innerHTML = "<p>Aucun message trouvé.</p>";
                return;
            }

            snapshot.forEach(doc => {
                const msg = doc.data();
                const isSender = msg.senderId === this.#idCurrentUser;
                const side = isSender ? "right" : "left";

                const messageDiv = document.createElement("div");
                messageDiv.className = `chat-message ${side}`;

                const bubble = document.createElement("div");
                bubble.className = "message-bubble";
                bubble.textContent = msg.content;

                messageDiv.appendChild(bubble);
                messagesBox.appendChild(messageDiv);
            });

            // Scroll en bas à chaque mise à jour
            messagesBox.scrollTop = messagesBox.scrollHeight;
        });
    }

    async #sendMessage(receiverId, content) {
        const conversationId = this.#getConversationId(this.#idCurrentUser, receiverId);
        const threadRef = collection(firestore, "messages", conversationId, "threads");

        const newMessage = {
            senderId: this.#idCurrentUser,
            receiverId: receiverId,
            content: content,
            timestamp: serverTimestamp(),
        };

        try {
            await addDoc(threadRef, newMessage);
        } catch (error) {
            console.error("Erreur envoi message :", error);
        }
    }
}

export const messagesController = new MessagesController();
