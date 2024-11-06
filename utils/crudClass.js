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
            console.log("form the curdrepostioty",error)
            throw new ApiError(400, 'Error creating record', error);
        }
    }

    async findById(id) {
        try {
            const record = await this.model.findByPk(id);
            return record;
        } catch (error) {
            throw new ApiError(400, 'Error fetching record', error.errors);
        }
    }

    async findAll() {
        try {
            const records = await this.model.findAll();
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
