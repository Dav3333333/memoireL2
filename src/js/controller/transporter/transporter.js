class Transporters {
    #principalContainer;

    constructor() {
        this.#principalContainer = document.querySelector("#main-content .content");
        this.#principalContainer.innerHTML = "";
    }

    init() {
        this.#principalContainer.innerHTML = `
            <h3>Transporteurs</h3>
            <div class="cooperative-list">
                <div class="cooperative-card">
                    <div class="cooperative-info">
                        <h3 class="cooperative-info__title">TMK</h3>
                    </div>
                </div>

                <div class="cooperative-card">
                    <div class="cooperative-info">
                        <h3 class="cooperative-info__title">TMK</h3>
                    </div>
                </div>

                <div class="cooperative-card">
                    <div class="cooperative-info">
                        <h3 class="cooperative-info__title">TMK</h3>
                    </div>
                </div>
            </div>
        `;
    }
}

export const transporters = new Transporters();