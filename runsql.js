const fs = require('fs');
const { db } = require("./connection");

const runSQL = async () => {
    try {
        const data = await fs.promises.readFile('mydb.sql', 'utf8');
        const statements = data.split(';').filter(statement => statement.trim() !== '');

        for (const statement of statements) {
            try {
                await db.promise().query(statement);
                console.log(`[MESSAGE]: SQL ran Successfully.`);
            } catch (error) {
                console.error(`[ERROR]: ${error.message}`);
            }
        }
        return; // Stop the function here
    } catch (err) {
        console.error(`[ERROR]: ${err.message}`);
    }
};

runSQL();
module.exports = runSQL;
