
import sqlite3 = require('sqlite3');


export class Circle {
    id: number;
    name: string;
    urls: string[];
    author_ids: number[];
}
export class Author {
    id: number;
    name: string;
    urls: string[];
    circle_ids: number[];
}
export class Tag {
    id: number;
    name: string;
    note: string;
}
export class Size {
    id: number;
    name: string;
}
export class Media {
    id: number;
    name: string;
}
export class Format {
    id: number;
    name: string;
}
export class Book {
    id: number;
    name: string;
    is_xrated: boolean;
    format_id: number;
    size_id: number;
    published_on: string;
    bought_on: string;
    location: string;
    note: string;
    author_ids: number[] = [];
    circle_ids: number[] = [];
    media_ids: number[] = [];
    tag_ids: number[] = [];
}

let tableStruct: { [key: string]: string[] } = {
    'authors': ['id', 'name'],
    'authors_circles': ['id', 'author_id', 'circle_id'],
    'authors_urls': ['id', 'author_id', 'url'],
    'books': ['id', 'name', 'format_id', 'size_id', 'is_xrated', 'published_on', 'bought_on', 'location', 'note'],
    'books_authors': ['id', 'book_id', 'author_id'],
    'books_circles': ['id', 'book_id', 'circle_id'],
    'books_media': ['id', 'book_id', 'media_id'],
    'books_tags': ['id', 'book_id', 'tag_id'],
    'circles': ['id', 'name'],
    'circles_urls': ['id', 'circle_id', 'url'],
    'formats': ['id', 'name'],
    'media': ['id', 'name'],
    'sizes': ['id', 'name'],
    'tags': ['id', 'name', 'note']
};

export class BookDB {
    private db: sqlite3.Database;

    constructor(filename: string) {
        this.db = new sqlite3.Database(filename, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the book database.');
        });
        this.db.on('error', function (err) {
            console.error(err);
        });
    }

    private extractElements(elementName: string, objects: any[]) {
        let arr = [];
        objects.forEach(function (object) {
            arr.push(object[elementName]);
        });
        return arr;
    }
    private promisedAll(sql: string, params: any) {
        let db = this.db;
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
    private promisedGet(sql: string, params: any) {
        let db = this.db;
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
    private promisedRun(sql: string, params: any) {
        let db = this.db;
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
    private promisedExec(sql: string) {
        let db = this.db;
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

    private async _rawInitializeTables() {
        await this.promisedExec('CREATE TABLE IF NOT EXISTS "authors" ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `name` TEXT NOT NULL UNIQUE )');
        await this.promisedExec('CREATE TABLE IF NOT EXISTS `authors_circles` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `author_id` INTEGER NOT NULL, `circle_id` INTEGER NOT NULL )');
        await this.promisedExec('CREATE TABLE IF NOT EXISTS `authors_urls` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `author_id` INTEGER NOT NULL, `url` TEXT NOT NULL )');
        await this.promisedExec('CREATE TABLE IF NOT EXISTS "books" ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `name` TEXT, `format_id` INTEGER, `size_id` INTEGER, `is_xrated` INTEGER, `published_on` TEXT, `bought_on` TEXT, `location` TEXT, `note` TEXT )');
        await this.promisedExec('CREATE TABLE IF NOT EXISTS "books_authors" ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `book_id` INTEGER NOT NULL, `author_id` INTEGER NOT NULL )');
        await this.promisedExec('CREATE TABLE IF NOT EXISTS `books_circles` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `book_id` INTEGER NOT NULL, `circle_id` INTEGER NOT NULL )');
        await this.promisedExec('CREATE TABLE IF NOT EXISTS "books_media" ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `book_id` INTEGER NOT NULL, `media_id` INTEGER NOT NULL )');
        await this.promisedExec('CREATE TABLE IF NOT EXISTS `books_tags` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `book_id` INTEGER NOT NULL, `tag_id` INTEGER NOT NULL )');
        await this.promisedExec('CREATE TABLE IF NOT EXISTS "circles" ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `name` TEXT NOT NULL UNIQUE )');
        await this.promisedExec('CREATE TABLE IF NOT EXISTS `circles_urls` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `circle_id` INTEGER NOT NULL, `url` TEXT NOT NULL )');
        await this.promisedExec('CREATE TABLE IF NOT EXISTS "formats" ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `name` TEXT NOT NULL UNIQUE )');
        await this.promisedExec('CREATE TABLE IF NOT EXISTS "media" ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `name` TEXT NOT NULL UNIQUE )');
        await this.promisedExec('CREATE TABLE IF NOT EXISTS "sizes" ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `name` TEXT NOT NULL UNIQUE )');
        await this.promisedExec('CREATE TABLE IF NOT EXISTS "tags" ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `name` TEXT NOT NULL UNIQUE, `note` TEXT )');
    }

    private async _rawClearAllTables() {
        for (let tableName in tableStruct) {
            await this.promisedExec('DROP TABLE ' + tableName);
        }
    }

    async initializeTables() {
        try {
            await this.promisedExec('BEGIN TRANSACTION');
            await this._rawInitializeTables();
            await this.promisedExec('COMMIT');
        } catch (e) {
            await this.promisedExec('ROLLBACK');
        }
    }

    async clearAllTables() {
        try {
            await this.promisedExec('BEGIN TRANSACTION');
            await this._rawClearAllTables();
            await this.promisedExec('COMMIT');
        } catch (e) {
            await this.promisedExec('ROLLBACK');
        }
    }

    async importAllTables(data: any) {
        if (typeof data !== 'object') {
            throw Error();
        }
        if (data.version === 1) {
            if (typeof data.body !== 'object') {
                throw Error();
            }
            let body: { [key: string]: {}[] } = data.body;
            for (let tableName in tableStruct) {
                if (!Array.isArray(body[tableName])) {
                    throw Error();
                }
            }
            try {
                await this.promisedExec('BEGIN TRANSACTION');
                await this._rawClearAllTables();
                await this._rawInitializeTables();
                for (let tableName in tableStruct) {
                    let sql = 'INSERT INTO ' + tableName + ' (' + tableStruct[tableName].join(',') + ') VALUES (';
                    for (let i = 0; i < tableStruct[tableName].length - 1; ++i) {
                        sql += '?, ';
                    }
                    sql += '?)';
                    let columnNames = tableStruct[tableName];
                    for (let row of body[tableName]) {
                        let params = [];
                        for (let columnName of columnNames) {
                            params.push(row[columnName]);
                        }
                        await this.promisedRun(sql, params);
                    }
                }
                await this.promisedExec('COMMIT');
            } catch (e) {
                await this.promisedExec('ROLLBACK');
            }
        } else {
            throw Error();
        }
    }

    async exportAllTables() {
        let data = {
            'version': 1,
            'body': {}
        };
        for (let tableName in tableStruct) {
            data.body[tableName] = await this.promisedAll('SELECT * FROM ' + tableName, []);
        }
        return data;
    }

    async getBookList(order: string, descending: boolean, limit: number, offset: number): Promise<Book[]> {
        let sql =
            'SELECT id, name, format_id, size_id, is_xrated, published_on, bought_on, location, note FROM books ' +
            'ORDER BY ? ' + (descending ? 'DESC' : 'ASC') + ' LIMIT ? OFFSET ?';
        let books = <Book[]>await this.promisedAll(sql, [order, limit, offset]);
        for (let book of books) {
            book.author_ids = this.extractElements('author_id', await this.promisedAll('SELECT author_id FROM books_authors WHERE book_id=?', [book.id]));
            book.circle_ids = this.extractElements('circle_id', await this.promisedAll('SELECT circle_id FROM books_circles WHERE book_id=?', [book.id]));
            book.media_ids = this.extractElements('media_id', await this.promisedAll('SELECT media_id FROM books_media WHERE book_id=?', [book.id]));
            book.tag_ids = this.extractElements('tag_id', await this.promisedAll('SELECT tag_id FROM books_tags WHERE book_id=?', [book.id]));
        }
        return books;
    }
    getAuthorList(): Promise<Author[]> {
        return this.promisedAll('SELECT id, name FROM authors', []);
    }
    getCircleList(): Promise<Circle[]> {
        return this.promisedAll('SELECT id, name FROM circles', []);
    }
    getFormatList(): Promise<Format[]> {
        return this.promisedAll('SELECT id, name FROM formats', []);
    }
    getMediaList(): Promise<Media[]> {
        return this.promisedAll('SELECT id, name FROM media', []);
    }
    getSizeList(): Promise<Size[]> {
        return this.promisedAll('SELECT id, name FROM sizes', []);
    }
    getTagList(): Promise<Tag[]> {
        return this.promisedAll('SELECT id, name FROM tags', []);
    }

    async getBook(id: number) {
        let book = <Book>await this.promisedGet('SELECT id, name, format_id, size_id, is_xrated, published_on, bought_on, location, note FROM books WHERE id=?', [id]);
        book.author_ids = this.extractElements('author_id', await this.promisedAll('SELECT author_id FROM books_authors WHERE book_id=?', [id]));
        book.circle_ids = this.extractElements('circle_id', await this.promisedAll('SELECT circle_id FROM books_circles WHERE book_id=?', [id]));
        book.media_ids = this.extractElements('media_id', await this.promisedAll('SELECT media_id FROM books_media WHERE book_id=?', [id]));
        book.tag_ids = this.extractElements('tag_id', await this.promisedAll('SELECT tag_id FROM books_tags WHERE book_id=?', [id]));
        return book;
    }
    async getAuthor(id: number) {
        let author = <Author>await this.promisedGet('SELECT * FROM authors WHERE id=?', [id]);
        author.urls = this.extractElements('url', await this.promisedAll('SELECT url FROM authors_urls WHERE author_id=?', [id]));
        author.circle_ids = this.extractElements('circle_id', await this.promisedAll('SELECT circle_id FROM authors_circles WHERE author_id=?', [id]));
        return author;
    }
    async getCircle(id: number) {
        let circle = <Circle>await this.promisedGet('SELECT * FROM circles WHERE id=?', [id]);
        circle.urls = this.extractElements('url', await this.promisedAll('SELECT url FROM circles_urls WHERE circle_id=?', [id]));
        circle.author_ids = this.extractElements('author_id', await this.promisedAll('SELECT author_id FROM authors_circles WHERE circle_id=?', [id]));
        return circle;
    }
    getFormat(id: number): Promise<Format> {
        return this.promisedGet('SELECT * FROM formats WHERE id=?', [id]);
    }
    getMedia(id: number): Promise<Media> {
        return this.promisedGet('SELECT * FROM media WHERE id=?', [id]);
    }
    getSize(id: number): Promise<Size> {
        return this.promisedGet('SELECT * FROM sizes WHERE id=?', [id]);
    }
    getTag(id: number): Promise<Tag> {
        return this.promisedGet('SELECT * FROM tags WHERE id=?', [id]);
    }

    async createBook(book: Book) {
        let sql = `
INSERT INTO books (name, format_id, size_id, is_xrated, published_on, bought_on, location, note)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        let values = [
            book.name,
            book.format_id,
            book.size_id,
            book.is_xrated ? 1 : 0,
            book.published_on,
            book.bought_on,
            book.location,
            book.note
        ];
        let result = await this.promisedRun(sql, values);
        if (result.lastID) {
            let book_id = result.lastID;
            for (let author_id of book.author_ids) {
                await this.promisedRun('INSERT INTO books_authors (book_id,author_id) VALUES (?,?)', [book_id, author_id]);
            }
            for (let circle_id of book.circle_ids) {
                await this.promisedRun('INSERT INTO books_circles (book_id,circle_id) VALUES (?,?)', [book_id, circle_id]);
            }
            for (let media_id of book.media_ids) {
                await this.promisedRun('INSERT INTO books_media (book_id,media_id) VALUES (?,?)', [book_id, media_id]);
            }
            for (let tag_id of book.tag_ids) {
                await this.promisedRun('INSERT INTO books_tags (book_id,tag_id) VALUES (?,?)', [book_id, tag_id]);
            }
        }
        return result.lastID;
    }
    async createAuthor(name: string) {
        let result = await this.promisedRun('INSERT INTO authors (name) VALUES (?)', [name]);
        return result.lastID;
    }
    async createCircle(name: string) {
        let result = await this.promisedRun('INSERT INTO circles (name) VALUES (?)', [name]);
        return result.lastID;
    }
    async createFormat(name: string) {
        let result = await this.promisedRun('INSERT INTO formats (name) VALUES (?)', [name]);
        return result.lastID;
    }
    async createMedia(name: string) {
        let result = await this.promisedRun('INSERT INTO media (name) VALUES (?)', [name]);
        return result.lastID;
    }
    async createSize(name: string) {
        let result = await this.promisedRun('INSERT INTO sizes (name) VALUES (?)', [name]);
        return result.lastID;
    }
    async createTag(name: string) {
        let result = await this.promisedRun('INSERT INTO tags (name) VALUES (?)', [name]);
        return result.lastID;
    }

    async updateBook(book: Book) {
        await this.promisedExec('BEGIN TRANSACTION');
        try {
            let sql = `
UPDATE books
SET
    name=?,
    format_id=?,
    size_id=?,
    is_xrated=?,
    published_on=?,
    bought_on=?,
    location=?,
    note=?
WHERE
    id=?`;
            let values = [
                book.name,
                book.format_id,
                book.size_id,
                book.is_xrated ? 1 : 0,
                book.published_on,
                book.bought_on,
                book.location,
                book.note,
                book.id
            ];
            let result = await this.promisedRun(sql, values);
            if (!result.changes) {
                await this.promisedExec('ROLLBACK');
                return false;
            }
            await this.promisedRun('DELETE FROM books_authors WHERE book_id=?', [book.id]);
            await this.promisedRun('DELETE FROM books_circles WHERE book_id=?', [book.id]);
            await this.promisedRun('DELETE FROM books_media WHERE book_id=?', [book.id]);
            await this.promisedRun('DELETE FROM books_tags WHERE book_id=?', [book.id]);
            for (let author_id of book.author_ids) {
                await this.promisedRun('INSERT INTO books_authors (book_id, author_id) VALUES (?,?)', [book.id, author_id]);
            }
            for (let circle_id of book.circle_ids) {
                await this.promisedRun('INSERT INTO books_circles (book_id, circle_id) VALUES (?,?)', [book.id, circle_id]);
            }
            for (let media_id of book.media_ids) {
                await this.promisedRun('INSERT INTO books_media (book_id, media_id) VALUES (?,?)', [book.id, media_id]);
            }
            for (let tag_id of book.tag_ids) {
                await this.promisedRun('INSERT INTO books_tags (book_id, tag_id) VALUES (?,?)', [book.id, tag_id]);
            }
            await this.promisedExec('COMMIT');
        } catch (e) {
            await this.promisedExec('ROLLBACK');
            throw e;
        }
        return true;
    }
    async updateAuthor(author: Author) {
        await this.promisedExec('BEGIN TRANSACTION');
        try {
            let result = await this.promisedRun('UPDATE authors SET name=? WHERE id=?', [author.name, author.id]);
            if (!result.changes) {
                await this.promisedExec('ROLLBACK');
                return false;
            }
            await this.promisedRun('DELETE FROM authors_urls WHERE author_id=?', [author.id]);
            await this.promisedRun('DELETE FROM authors_circles WHERE author_id=?', [author.id]);
            for (let url of author.urls) {
                await this.promisedRun('INSERT INTO authors_urls (author_id, url) VALUES (?,?)', [author.id, url]);
            }
            for (let circle_id of author.circle_ids) {
                await this.promisedRun('INSERT INTO authors_circles (author_id, circle_id) VALUES (?,?)', [author.id, circle_id]);
            }
            await this.promisedExec('COMMIT');
        } catch (e) {
            await this.promisedExec('ROLLBACK');
            throw e;
        }
        return true;
    }
    async updateCircle(circle: Circle) {
        await this.promisedExec('BEGIN TRANSACTION');
        try {
            let result = await this.promisedRun('UPDATE circles SET name=? WHERE id=?', [circle.name, circle.id]);
            if (!result.changes) {
                await this.promisedExec('ROLLBACK');
                return false;
            }
            await this.promisedRun('DELETE FROM circles_urls WHERE circle_id=?', [circle.id]);
            await this.promisedRun('DELETE FROM authors_circles WHERE circle_id=?', [circle.id]);
            for (let url of circle.urls) {
                await this.promisedRun('INSERT INTO circles_urls (circle_id, url) VALUES (?,?)', [circle.id, url]);
            }
            for (let author_id of circle.author_ids) {
                await this.promisedRun('INSERT INTO authors_circles (author_id, circle_id) VALUES (?,?)', [author_id, circle.id]);
            }
            await this.promisedExec('COMMIT');
        } catch (e) {
            await this.promisedExec('ROLLBACK');
            throw e;
        }
        return true;
    }
    async updateFormat(format: Format) {
        let result = await this.promisedRun('UPDATE formats SET name=? WHERE id=?', [format.name, format.id]);
        return !!result.changes;
    }
    async updateMedia(media: Media) {
        let result = await this.promisedRun('UPDATE media SET name=? WHERE id=?', [media.name, media.id]);
        return !!result.changes;
    }
    async updateSize(size: Size) {
        let result = await this.promisedRun('UPDATE sizes SET name=? WHERE id=?', [size.name, size.id]);
        return !!result.changes;
    }
    async updateTag(tag: Tag) {
        let result = await this.promisedRun('UPDATE tags SET name=?,note=? WHERE id=?', [tag.name, tag.note, tag.id]);
        return !!result.changes;
    }

    async deleteBook(id: number) {
        await this.promisedExec('BEGIN TRANSACTION');
        try {
            let result = await this.promisedRun('DELETE FROM books WHERE id=?', [id]);
            await this.promisedRun('DELETE FROM books_authors WHERE book_id=?', [id]);
            await this.promisedRun('DELETE FROM books_circles WHERE book_id=?', [id]);
            await this.promisedRun('DELETE FROM books_media WHERE book_id=?', [id]);
            await this.promisedRun('DELETE FROM books_tags WHERE book_id=?', [id]);
            await this.promisedExec('COMMIT');
            return !!result.changes;
        } catch (e) {
            await this.promisedExec('ROLLBACK');
            throw e;
        }
    }
    async deleteAuthor(id: number) {
        await this.promisedExec('BEGIN TRANSACTION');
        try {
            let result = await this.promisedRun('DELETE FROM authors WHERE id=?', [id]);
            await this.promisedRun('DELETE FROM authors_urls WHERE author_id=?', [id]);
            await this.promisedRun('DELETE FROM authors_circles WHERE author_id=?', [id]);
            await this.promisedExec('COMMIT');
            return !!result.changes;
        } catch (e) {
            await this.promisedExec('ROLLBACK');
            throw e;
        }
    }
    async deleteCircle(id: number) {
        await this.promisedExec('BEGIN TRANSACTION');
        try {
            let result = await this.promisedRun('DELETE FROM circles WHERE id=?', [id]);
            await this.promisedRun('DELETE FROM circles_urls WHERE circle_id=?', [id]);
            await this.promisedRun('DELETE FROM authors_circles WHERE circle_id=?', [id]);
            await this.promisedExec('COMMIT');
            return !!result.changes;
        } catch (e) {
            await this.promisedExec('ROLLBACK');
            throw e;
        }
    }
    async deleteFormat(id: number) {
        let result = await this.promisedRun('DELETE FROM formats WHERE id=?', [id]);
        return !!result.changes;
    }
    async deleteMedia(id: number) {
        let result = await this.promisedRun('DELETE FROM media WHERE id=?', [id]);
        return !!result.changes;
    }
    async deleteSize(id: number) {
        let result = await this.promisedRun('DELETE FROM sizes WHERE id=?', [id]);
        return !!result.changes;
    }
    async deleteTag(id: number) {
        let result = await this.promisedRun('DELETE FROM tags WHERE id=?', [id]);
        return !!result.changes;
    }

}

