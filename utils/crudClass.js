import { ApiError } from "./ApiError.js";

class CrudRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        try {
            const createdRecord = await this.model.create(data);
            return createdRecord;
        } catch (error) {
            // console.log("from the curdddd",errrr)
            // console.log("form the curdrepostioty",error.errors[0].message)
            throw new ApiError(400, error.errors[0].message ||  error.message  || 'Error creating record',"From Base Layer",error.errors || error);
        }
    }

    async findById(id,options = {}) {
        try {
            const record = await this.model.findByPk(id,options);
            return record;
        } catch (error) {
            console.log(error)
            throw new ApiError(400, error.errors.message ||  error.message  || 'Error fetching record', error.errors);
        }
    }

    async findAll(options = {}) {
        try {
            const records = await this.model.findAll(options);
            return records;
        } catch (error) {
            throw new ApiError(400, 'Error fetching records', error.errors);
        }
    }
    async update(id, data) {
        try {
            const [updated] = await this.model.update(data, { where: { id } });
            return await this.findById(id);
        } catch (error) {
            console.log(error)
            throw new ApiError(400, 'Error updating record', error.errors);
        }
    }

    async delete(id) {
        try {
            const deleted = await this.model.destroy({ where: { id } });
            return { message: 'Record deleted successfully',deleted };
        } catch (error) {
            throw new ApiError(400, 'Error deleting record', error.errors);
        }
    }

    async findByEmail(email) {
        try {
            const record = await this.model.findOne({ where: { email } });
            return record;
        } catch (error) {
            console.log("error form the curdclass",error)
            throw new ApiError(400, 'Error fetching user by email', error.errors);
        }
    }

    async findByRelation(relationship, where) {
        try {
            const record = await this.model.findOne({
                where,
                include: relationship,
            });
            return record;
        } catch (error) {
            throw new ApiError(400, 'Error fetching records with relation', error.errors);
        }
    }
}

export default CrudRepository;
