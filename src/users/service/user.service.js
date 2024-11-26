
import { ApiError } from '../../../utils/ApiError.js';
import { generateTokensAndSetCookies } from '../../../utils/jwtCookie.js';
import UserRepository from '../repository/user.repository.js';

const userRepository = new UserRepository();

class UserService {
    async registerUser(data) {
        try {
            const {email} = data; 
            const existingUser = await userRepository.findByEmail(email);
            if(existingUser){
                if(existingUser.isActive == false){
                    throw new ApiError(400, `user is Already register but did not verify`,'Service Layer');
                }
                throw new ApiError(400, `user is Already register please Login the user`,'Service Layer');  
            }
            const user = await userRepository.create(data);
            const token = user.getJWTToken();
            return { user, token };
        } catch (error) {
            // console.log("from service layer",error)
            // throw error
            throw new ApiError(400, error.errors[0]?.message ||  error.message || 'Error registering user form service layer','Service Layer',error.errors || error);
        }
    }

    async loginUser(email, password,res) {
        try {
            const user = await userRepository.model.scope('withPassword').findOne({ where: { email ,isActive: true } });
        
        if (!user) {
            throw new ApiError(401, 'Please Register First','Service Layer');
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new ApiError(401,'Invalid Password credentials','Service Layer' );
          }
        const{user1} =generateTokensAndSetCookies(user, res);
        const user2 = user1.toJSON();
        delete user2.password;
        console.log(user2)

        return { user2};
        } catch (error) {
            // console.log(error)
            throw new ApiError(400, error.errors[0]?.message || error?.message || 'Error Login user', 'Error Login user form service layer',error.errors || error);
        }
    }

    async updateUser(id, data) {
        try {
            const userToUpdate = await userRepository.findById(id);
            if (!userToUpdate) {
                throw new ApiError(404, 'User not found', 'Service Layer');
            }
            if (data.email && data.email !== userToUpdate.email) {
                throw new ApiError(403, 'Email cannot be changed', 'Service Layer');
            }
            if (data.account_type && currentUser.role !== 'admin') {
                throw new ApiError(403, 'Only admins can change account type', 'Service Layer');
            }
            const updatedUser = await userRepository.update(id, data);
            return updatedUser;
        } catch (error) {
            // console.log(error)
            throw new ApiError(400, error.errors[0]?.message || error?.message || 'Error updating user',"from service Layer" ,error.errors || error);
        }
    }

    async deleteUser(id) {
        try {
            const response = await userRepository.delete(id);
            return response;
        } catch (error) {
            throw new ApiError(400, error.errors[0]?.message || error?.message || 'Error deleting user', "from the servie layer",error.errors || error );
        }
    }

    async getUserDetails(id) {
        try {
          const user = await userRepository.findById(id,{
            where: { id, isActive: true }, 
            attributes: [
              'name', 
              'email', 
              'address', 
              'mobile_no', 
              'gender', 
              'country', 
              'avatar'
            ], // Include only the specified fields
          });
          
          if (!user) {
            throw new ApiError(404, 'User not found', 'Service Layer');
          }
      
          return user;
        } catch (error) {
            throw new ApiError(400, error.errors[0]?.message || error?.message || 'Error getiing user details', "from the servie layer",error.errors || error );
        }
      }
}

export default new UserService();
