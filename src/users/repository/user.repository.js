import CrudRepository from "../../../utils/crudClass.js"
import userModel from "../model/user.model.js"

class UserRepository extends CrudRepository{
   constructor(){
        super(userModel)
   }
}
export default UserRepository