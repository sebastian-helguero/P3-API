import express from 'express';

import "./models/Associations.js"

import { sequelize } from './db.js';
import { PORT } from './config.js';

import productRoutes from './routes/products.routes.js';
import userRoutes from './routes/users.routes.js';
import orderRoutes from './routes/orders.routes.js';



const app = express();
try {
    app.use(express.json());
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
        next();
    })

    app.listen(PORT);
    app.use(productRoutes);
    app.use(userRoutes);
    app.use(orderRoutes);
    console.log(`Server listening in port: ${PORT} `);
    await sequelize.sync();

} catch (error) {
    console.log("There was an error on initialization");
}
