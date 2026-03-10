
const Database = require('better-sqlite3');
const db = new Database('blockchain_ledger.db');
const users = db.prepare('SELECT username, role, created_at FROM users').all();
console.log(JSON.stringify(users, null, 2));
