let dotenv =  require('dotenv');
dotenv.config('.env');
module.exports = {
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    database : process.env.DB_NAME,
    user : process.env.DB_USER,
    password : process.env.DB_PWD,
};