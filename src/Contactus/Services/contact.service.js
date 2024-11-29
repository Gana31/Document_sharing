import { ApiError } from "../../../utils/ApiError.js";
import ContactRepository from "../Respostitory/contact.repostitory.js";

const contactRepository = new ContactRepository();

class ContactService {
  async createContactus(data) {
   
    try {
      const contact = await contactRepository.create(data);
      return contact;
    
    } catch (error) {

      throw new ApiError(400, error.errors[0]?.message || error.message || 'Error creating order', 'Service Layer', error.errors || error);
    }
  }
}

export default new ContactService();