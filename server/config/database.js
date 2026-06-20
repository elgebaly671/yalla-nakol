import { Sequelize } from "sequelize";
import dotenv from "dotenv"

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Required by many cloud databases like Supabase
    }
  }
});
// Test the connection
sequelize.authenticate()
  .then(() => console.log('Successfully connected to Supabase via Sequelize!'))
  .catch(err => console.error('Unable to connect to the database:', err));

export { sequelize };
