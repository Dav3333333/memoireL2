'use strict';

import { expotateurController } from "./exportateur";
import { cooperativeController } from "./cooperative";

class CustomersController {
    constructor() {
    }

    async init(type_count) {
        try {
            if (type_count === "--expo") {
                await expotateurController.init();
            } else if (type_count === "--coope") {
                await cooperativeController.init();
            } else {
                throw new Error("Invalid type_count provided");
            }
        } catch (error) {
            console.error("Error initializing customers:", error);
        }
    }
}

export const customersController = new CustomersController();