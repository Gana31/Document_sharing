import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import ErrorHandler from './utils/ErrorHandler.js';
import { connectDatabase } from './config/databaseconfig.js';
import ServerConfig from './config/ServerConfig.js';
import { UserRouter } from './src/users/index.js';
import { CategoryRouter } from './src/category/index.js';
import { ProductRouter } from './src/products/index.js';
const app = express();
const PORT = ServerConfig.PORT || 8082;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ServerConfig.ORIGIN,
    methods:["GET","POST","DELETE","UPDATE","PUT","PATCH"],
    credentials: true,
  }));
app.use(cookieParser());

app.use("/api/v1", UserRouter,CategoryRouter,ProductRouter);

app.get("/", (req, res) => {
   
    return res.json({
        success: true,
        message: 'Your server is up and running....'
    });
});

app.use(ErrorHandler);

const startServer = async () => {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(ServerConfig.ORIGIN)
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();