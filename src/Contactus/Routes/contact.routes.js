import express from "express"
import contactController from "../Controller/contact.controller.js";


const ContactRouter  = express.Router()

ContactRouter.post("/createContactus",contactController.createContactus);
// ContactRouter.get("/getAllPreviousOrders/:id",authMiddleware,getPreviousOrders);

export default ContactRouter;

