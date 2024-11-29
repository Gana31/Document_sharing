import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asynchandler.js";
import contactService from "../Services/contact.service.js";

class ContactController {

    createContactus = asyncHandler(async (req, res, next) => {
        try {
            const { firstname, lastname, email, phoneNo, countrycode, message } = req.body;
            if (!firstname || !lastname || !email || !phoneNo || !countrycode || !message) {
                throw new ApiError(400, "all Fields Are Required for contact", "Controller layer")
            }
            const contact = await contactService.createContactus(req.body);

            res.status(201).json(new ApiResponse(201, 'Response send successfully'));
        } catch (error) {
            next(new ApiError(400, error.errors[0]?.message || error.message || 'Error creating product', "From Controller Layer", error.errors || error));

        }
    });

}

export default new ContactController();
