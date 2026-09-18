import { Sequelize } from 'sequelize';
import './env.js';

let orm;

if (process.env.DATABASE_URL) {
    orm = new Sequelize(process.env.DATABASE_URL, {
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: process.env.NODE_ENV === 'development' ? false : false,
        dialectOptions: process.env.DB_SSL === 'true' ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {}
    });
} else {
    orm = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            dialect: process.env.DB_DIALECT || 'mysql',
            logging: process.env.NODE_ENV === 'development' ? false : false,
            dialectOptions: process.env.DB_SSL === 'true' ? {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            } : {}
        }
    );
}

export default orm;
