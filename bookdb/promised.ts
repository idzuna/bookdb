
import sqlite3 = require('sqlite3');

export function all(db: sqlite3.Database, sql: string, params: any) {
    return new Promise<any[]>(function (resolve, reject) {
        db.all(sql, params, function (err, rows) {
            if (err) {
                console.error(err.message);
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}
export function get(db: sqlite3.Database, sql: string, params: any) {
    return new Promise<any>(function (resolve, reject) {
        db.get(sql, params, function (err, row) {
            if (err) {
                console.error(err.message);
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}
export function run(db: sqlite3.Database, sql: string, params: any) {
    return new Promise<sqlite3.RunResult>(function (resolve, reject) {
        db.run(sql, params, function (err) {
            if (err) {
                console.error(err.message);
                reject(err);
                return;
            }
            resolve(this);
        });
    });
}
export function exec(db: sqlite3.Database, sql: string) {
    return new Promise(function (resolve, reject) {
        db.exec(sql, function (err) {
            if (err) {
                console.error(err.message);
                reject(err);
                return;
            }
            resolve();
        });
    });
}

