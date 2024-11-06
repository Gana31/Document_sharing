import CrudRepository from "../../../utils/crudClass.js"
import {ProductModel} from "../index.js"

class ProductRepository extends CrudRepository{
   constructor(){
        super(ProductModel)
   }
}
export default ProductRepository