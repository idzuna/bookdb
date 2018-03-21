﻿
import express = require('express');
import path = require('path');
import multer = require('multer');
import * as bookdb from '../bookdb';

let upload = multer({ dest: 'uploads/', 'limits': { 'fileSize': 20 * 1024 * 1024 } });

const router = express.Router();


function expectPositive(value: any)
{
    let n = parseInt(value);
    if (!n || n < 0) {
        throw Error();
    } else {
        return n;
    }
}
function expectString(value: any)
{
    if (typeof value !== 'string') {
        throw Error();
    } else {
        return value;
    }
}
function expectArray(value: any) {
    if (!Array.isArray(value)) {
        throw Error();
    } else {
        return value;
    }
}
async function prepareDB(req: express.Request) {
    let dbname = path.join(__dirname, '..', 'bookdb', '' + (req.user ? req.user.id : 'bookdb') + '.sqlite');
    let db = new bookdb.BookDB(dbname);
    return db;
}

// GET /
router.get('/user', async function (req, res) {
    try {
        let db = await prepareDB(req);
        await db.initializeTables();
        if (req.user) {
            res.status(200).json({
                'id': req.user.id,
                'display_name': req.user.display_name
            });
        } else {
            res.status(200).json({
                'id': '',
                'display_name': 'サンプルユーザー'
            });
        }
    } catch (e) {
        res.status(500).end();
    }
});

// GET /xxx
{
    let proc: { [key: string]: (db: bookdb.BookDB) => Promise<any> } = {
        '/authors': function (db: bookdb.BookDB) { return db.getAuthorList(); },
        '/circles': function (db: bookdb.BookDB) { return db.getCircleList(); },
        '/formats': function (db: bookdb.BookDB) { return db.getFormatList(); },
        '/media': function (db: bookdb.BookDB) { return db.getMediaList(); },
        '/sizes': function (db: bookdb.BookDB) { return db.getSizeList(); },
        '/tags': function (db: bookdb.BookDB) { return db.getTagList(); }
    };
    for (let path in proc) {
        router.get(path, async function (req, res) {
            try {
                let db = await prepareDB(req);
                let list = await proc[path](db);
                res.status(200).json(list);
            } catch (e) {
                res.status(500).end();
            }
        });
    }
}

// GET /xxx/:id
{
    let proc: { [key: string]: (db: bookdb.BookDB, id: number) => Promise<any> } = {
        '/authors/:id': function (db: bookdb.BookDB, id: number) { return db.getAuthor(id); },
        '/circles/:id': function (db: bookdb.BookDB, id: number) { return db.getCircle(id); },
        '/formats/:id': function (db: bookdb.BookDB, id: number) { return db.getFormat(id); },
        '/media/:id': function (db: bookdb.BookDB, id: number) { return db.getMedia(id); },
        '/sizes/:id': function (db: bookdb.BookDB, id: number) { return db.getSize(id); },
        '/tags/:id': function (db: bookdb.BookDB, id: number) { return db.getTag(id); }
    };
    for (let path in proc) {
        router.get(path, async function (req, res) {
            try {
                let id = expectPositive(req.params.id);
                try {
                    let db = await prepareDB(req);
                    let object = await proc[path](db, id);
                    if (object) {
                        res.status(200).json(object);
                    } else {
                        res.status(404).end();
                    }
                } catch (e) {
                    res.status(500).end();
                }
            } catch (e) {
                res.status(400).end();
            }
        });
    }
}

// POST /xxx
{
    let proc: { [key: string]: (db: bookdb.BookDB, name: string) => Promise<number> } = {
        '/authors': function (db: bookdb.BookDB, name: string) { return db.createAuthor(name); },
        '/circles': function (db: bookdb.BookDB, name: string) { return db.createCircle(name); },
        '/formats': function (db: bookdb.BookDB, name: string) { return db.createFormat(name); },
        '/media': function (db: bookdb.BookDB, name: string) { return db.createMedia(name); },
        '/sizes': function (db: bookdb.BookDB, name: string) { return db.createSize(name); },
        '/tags': function (db: bookdb.BookDB, name: string) { return db.createTag(name); }
    };
    for (let path in proc) {
        router.post(path, async function (req, res) {
            try {
                let name = expectString(req.body.name);
                try {
                    let db = await prepareDB(req);
                    let id = await proc[path](db, name);
                    if (id) {
                        res.status(200).json({ 'id': id });
                    } else {
                        res.status(500).end();
                    }
                } catch (e) {
                    if (e.code === 'SQLITE_CONSTRAINT') {
                        res.status(409).end();
                    } else {
                        res.status(500).end();
                    }
                }
            } catch (e) {
                res.status(400).end();
            }
        });
    }
}

// DELETE /xxx/:id
{
    let proc: { [key: string]: (db: bookdb.BookDB, id: number) => Promise<boolean> } = {
        '/books/:id': function (db: bookdb.BookDB, id: number) { return db.deleteBook(id); },
        '/authors/:id': function (db: bookdb.BookDB, id: number) { return db.deleteAuthor(id); },
        '/circles/:id': function (db: bookdb.BookDB, id: number) { return db.deleteCircle(id); },
        '/formats/:id': function (db: bookdb.BookDB, id: number) { return db.deleteFormat(id); },
        '/media/:id': function (db: bookdb.BookDB, id: number) { return db.deleteMedia(id); },
        '/sizes/:id': function (db: bookdb.BookDB, id: number) { return db.deleteSize(id); },
        '/tags/:id': function (db: bookdb.BookDB, id: number) { return db.deleteTag(id); }
    };
    for (let path in proc) {
        router.delete(path, async function (req, res) {
            try {
                let id = expectPositive(req.params.id);
                try {
                    let db = await prepareDB(req);
                    let result = await proc[path](db, id);
                    if (result) {
                        res.status(200).end();
                    } else {
                        res.status(404).end();
                    }
                } catch (e) {
                    res.status(500).end();
                }
            } catch (e) {
                res.status(400).end();
            }
        });
    }
}

// PUT /xxx/:id
{
    let proc: { [key: string]: (req: express.Request) => (db: bookdb.BookDB) => Promise<boolean> } = {
        '/books/:id': function (req: express.Request) {
            let object = new bookdb.Book();
            object.id = expectPositive(req.params.id);
            object.name = expectString(req.body.name);
            object.format_id = parseInt(req.body.format_id);
            object.size_id = parseInt(req.body.size_id);
            object.is_xrated = !!req.body.is_xrated;
            object.published_on = expectString(req.body.published_on);
            object.bought_on = expectString(req.body.bought_on);
            object.location = expectString(req.body.location);
            object.note = expectString(req.body.note);
            object.author_ids = expectArray(req.body.author_ids);
            object.circle_ids = expectArray(req.body.circle_ids);
            object.media_ids = expectArray(req.body.media_ids);
            object.tag_ids = expectArray(req.body.tag_ids);
            return function (db: bookdb.BookDB) {
                return db.updateBook(object);
            };
        },
        '/authors/:id': function (req: express.Request) {
            let object = new bookdb.Author();
            object.id = expectPositive(req.params.id);
            object.name = expectString(req.body.name);
            object.urls = expectArray(req.body.urls);
            object.circle_ids = expectArray(req.body.circle_ids);
            return function (db: bookdb.BookDB) {
                return db.updateAuthor(object);
            };
        },
        '/circles/:id': function (req: express.Request) {
            let object = new bookdb.Circle();
            object.id = expectPositive(req.params.id);
            object.name = expectString(req.body.name);
            object.urls = expectArray(req.body.urls);
            object.author_ids = expectArray(req.body.author_ids);
            return function (db: bookdb.BookDB) {
                return db.updateCircle(object);
            };
        },
        '/formats/:id': function (req: express.Request) {
            let object = new bookdb.Format();
            object.id = expectPositive(req.params.id);
            object.name = expectString(req.body.name);
            return function (db: bookdb.BookDB) {
                return db.updateFormat(object);
            };
        },
        '/media/:id': function (req: express.Request) {
            let object = new bookdb.Media();
            object.id = expectPositive(req.params.id);
            object.name = expectString(req.body.name);
            return function (db: bookdb.BookDB) {
                return db.updateMedia(object);
            };
        },
        '/sizes/:id': function (req: express.Request) {
            let object = new bookdb.Size();
            object.id = expectPositive(req.params.id);
            object.name = expectString(req.body.name);
            return function (db: bookdb.BookDB) {
                return db.updateSize(object);
            };
        },
        '/tags/:id': function (req: express.Request) {
            let object = new bookdb.Tag();
            object.id = expectPositive(req.params.id);
            object.name = expectString(req.body.name);
            object.note = expectString(req.body.note)
            return function (db: bookdb.BookDB) {
                return db.updateTag(object);
            };
        },
    };
    for (let path in proc) {
        router.put(path, async function (req, res) {
            try {
                let updater = proc[path](req);
                try {
                    let db = await prepareDB(req);
                    let result = await updater(db);
                    if (result) {
                        res.status(200).end();
                    } else {
                        res.status(404).end();
                    }
                } catch (e) {
                    if (e.code === 'SQLITE_CONSTRAINT') {
                        res.status(409).end();
                    } else {
                        res.status(500).end();
                    }
                }
            } catch (e) {
                res.status(400).end();
            }
        });
    }
}

// GET /tables
router.get('/tables', async function (req, res) {
    try {
        let db = await prepareDB(req);
        let list = await db.exportAllTables();
        res.setHeader('Content-Disposition', 'attachment; filename="bookdb.json"');
        res.status(200).json(list);
    } catch (e) {
        res.status(500).end();
    }
});

// DELETE /tables
router.delete('/tables', async function (req, res) {
    try {
        let db = await prepareDB(req);
        await db.clearAllTables();
        res.status(200).end();
    } catch (e) {
        res.status(500).end();
    }
});

// POST /tables
router.post('/tables', async function (req, res) {
    try {
        let db = await prepareDB(req);
        await db.importAllTables(req.body);
        res.status(200).end();
    } catch (e) {
        res.status(400).end();
    }
});

router.post('/books', async function (req: express.Request, res: express.Response) {
    try {
        let object = new bookdb.Book();
        object.name = expectString(req.body.name);
        object.format_id = parseInt(req.body.format_id);
        object.size_id = parseInt(req.body.size_id);
        object.is_xrated = !!req.body.is_xrated;
        object.published_on = expectString(req.body.published_on);
        object.bought_on = expectString(req.body.bought_on);
        object.location = expectString(req.body.location);
        object.note = expectString(req.body.note);
        object.author_ids = expectArray(req.body.author_ids);
        object.circle_ids = expectArray(req.body.circle_ids);
        object.media_ids = expectArray(req.body.media_ids);
        object.tag_ids = expectArray(req.body.tag_ids);
        try {
            let db = await prepareDB(req);
            let id = await db.createBook(object);
            if (id) {
                res.status(200).json({ 'id': id });
            } else {
                res.status(500).end();
            }
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT') {
                res.status(409).end();
            } else {
                res.status(500).end();
            }
        }
    } catch (e) {
        res.status(400).end();
    }
});

router.get('/books', async function (req, res) {
    let order = req.body.order ? req.body.order : 'id';
    let descending = !!req.body.descending;
    let limit = parseInt(req.body.limit) ? parseInt(req.body.limit) : 100;
    let offset = parseInt(req.body.offset) ? parseInt(req.body.offset) : 0;
    try {
        let db = await prepareDB(req);
        let list = await db.getBookList(order, descending, limit, offset);
        res.status(200).json(list);
    } catch (e) {
        res.status(500).end();
    }
});


export default router;
