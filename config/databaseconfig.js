

import { Sequelize } from 'sequelize';
import ServerConfig from './ServerConfig.js';
const sequelize = new Sequelize(ServerConfig.DB_NAME, ServerConfig.DB_USER, ServerConfig.DB_PASSWORD, {
    host: ServerConfig.DB_HOST,
    dialect: 'postgres',
  });

 const connectDatabase = async()=>{
    try {
        await sequelize.sync(); 
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
       
        console.log('All models were synchronized successfully.');

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export {connectDatabase,sequelize}