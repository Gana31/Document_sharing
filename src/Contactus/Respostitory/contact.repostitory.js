import CrudRepository from "../../../utils/crudClass.js"
import ContactModel from "../Model/Contactus.model.js"

class ContactRepository extends CrudRepository{
   constructor(){
        super(ContactModel)
   }

 
}
export default ContactRepository