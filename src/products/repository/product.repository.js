import { sequelize } from "../../../config/databaseconfig.js";
import CrudRepository from "../../../utils/crudClass.js"
import {ProductModel} from "../index.js"

class ProductRepository extends CrudRepository{
   constructor(){
        super(ProductModel)
        this.sequelize = sequelize;
   }
}
export default ProductRepository