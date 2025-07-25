'use strict';

import { firestore } from "../../httplibs/firebaseconfig";
import { collection, onSnapshot , query, where} from "firebase/firestore";


/** * CooperativeController
 * This controller manages a list of customers in a cooperative.
 * It allows adding, retrieving, finding by ID, and removing customers.
 */

class CooperativeController {
    #customers;
    constructor() {
        this.#customers = [];
    }

    async init(){
        const colRef = collection(firestore, "users");
        const q = query(colRef, where("type", "==", "--expo"));
        onSnapshot(q, (snapshot)=>{
            snapshot.forEach((doc)=>{
                console.log(doc.id, doc.data())
            });
        });
    }

    addCustomer(customer) {
        this.customers.push(customer);
    }

    getCustomers() {
        return this.customers;
    }

    findCustomerById(id) {
        return this.customers.find(customer => customer.id === id);
    }

    removeCustomer(id) {
        this.customers = this.customers.filter(customer => customer.id !== id);
    }
}

export const cooperativeController = new CooperativeController(); 