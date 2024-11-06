
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
                    throw new ApiError(400, `user is Already register but did not verify`);
                }
                throw new ApiError(400, `user is Already register please Login the user`);  
            }
            const user = await userRepository.create(data);
            const token = user.getJWTToken();
            return { user, token };
        } catch (error) {
            // console.log("from service layer",error)
            throw new ApiError(400, error.message || 'Error registering user form service layer', 'Error registering user form service layer');
        }
    }

    async loginUser(email, password,res) {
        try {
            const user = await userRepository.model.scope('withPassword').findOne({ where: { email ,isActive: true } });
        
        if (!user || !(await user.comparePassword(password))) {
            throw new ApiError(401, 'Invalid email or password');
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new ApiError(401,'Invalid credentials' );
          }
        const{user1,accessToken,refreshToken} =generateTokensAndSetCookies(user, res);

        return { user1, accessToken,refreshToken};
        } catch (error) {
            console.log(error)
            throw new ApiError(400, error.message || 'Error Login user form service layer', 'Error Login user form service layer');
        }
    }

    async updateUser(id, data) {
        try {
            const userToUpdate = await userRepository.findById(id);
            if (!userToUpdate) {
                throw new ApiError(404, 'User not found');
            }
            if (data.email && data.email !== userToUpdate.email) {
                throw new ApiError(403, 'Email cannot be changed');
            }
            if (data.account_type && currentUser.role !== 'admin') {
                throw new ApiError(403, 'Only admins can change account type');
            }
            const updatedUser = await userRepository.update(id, data);
            return updatedUser;
        } catch (error) {
            console.log(error)
            throw new ApiError(400, 'Error updating user', error.errors);
        }
    }

    async deleteUser(id) {
        try {
            const response = await userRepository.delete(id);
            return response;
        } catch (error) {
            throw new ApiError(400, 'Error deleting user', error.errors);
        }
    }
}

export default new UserService();
