import knex from 'knex'
import dotenv from 'dotenv';

dotenv.config()

const db = knex({
    client: 'mysql2',
    connection:{
        host : process.env.DB_HOST ||'127.0.0.1',
        user : process.env.DB_USER || 'root',
        password : process.env.DB_PASS || process.env.DB_PASSWORD,
        database : process.env.DB_NAME || 'project',
        port : Number(process.env.DB_PORT) || 3306,
        connectTimeout : 15000,
    },
    pool : {min : 0 , max : 10 , acquireTimeoutMillis : 20000}
})

console.log('[DB-CONFIG]', {
    host : process.env.DB_HOST,
    port: process.env.DB_PORT,
    db: process.env.DB_NAME
})

export default db