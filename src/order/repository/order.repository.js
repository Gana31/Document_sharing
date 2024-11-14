import CrudRepository from "../../../utils/crudClass";


class OrderRepository extends CrudRepository{
   constructor(){
        super(CategoryModel)
   }

 
}
export default OrderRepository