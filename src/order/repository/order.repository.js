import {OrderModel} from '../../dbrelation.js'
import CrudRepository from '../../../utils/crudClass.js'

class OrderRepository extends CrudRepository{
   constructor(){
        super(OrderModel)
   }

 
}
export default OrderRepository