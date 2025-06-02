import { Sequelize } from "sequelize";


export const sequelize = new Sequelize("ecommerce_tpi", 'root', '********', {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306, 
});

  
