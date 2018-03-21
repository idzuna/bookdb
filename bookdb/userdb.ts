
import sqlite3 = require('sqlite3');
import * as promised from './promised';

export class User {
    id: string;
    display_name: string;
}

export class UserDB {
    private db: sqlite3.Database;

    constructor(filename: string) {
        this.db = new sqlite3.Database(filename, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the user database.');
        });
        this.db.on('error', function (err) {
            console.error(err);
        });
    }

    initializeTables() {
        return promised.exec(this.db, 'CREATE TABLE IF NOT EXISTS "users" ( `id` TEXT NOT NULL UNIQUE, `display_name` TEXT )');
    }

    set(user: User) {
        let sql = 'INSERT OR REPLACE INTO users (id, display_name) VALUES (?, ?)';
        let params = [user.id, user.display_name];
        return promised.run(this.db, sql, params);
    }

    async get(id: string) {
        let sql = 'SELECT display_name FROM users WHERE id=?';
        let row = await promised.get(this.db, sql, [id]);
        if (row) {
            let user = new User();
            user.id = id;
            user.display_name = row['display_name'];
            return user;
        } else {
            return null;
        }
    }
}
