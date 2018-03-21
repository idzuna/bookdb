
class Circle {
    id: number;
    name: string;
    urls: string[];
    author_ids: number[];
}
class Author {
    id: number;
    name: string;
    urls: string[];
    circle_ids: number[];
}
class Tag {
    id: number;
    name: string;
    note: string;
}
class Size {
    id: number;
    name: string;
}
class Media {
    id: number;
    name: string;
}
class Format {
    id: number;
    name: string;
}
class Book {
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
class User {
    id: string;
    display_name: string;
}

let db = new class {

    authors: { [key: number]: Author } = { };
    circles: { [key: number]: Circle } = { };
    tags: { [key: number]: Tag } = { };
    media: { [key: number]: Media } = { };
    sizes: { [key: number]: Size } = { };
    formats: { [key: number]: Format } = { };
    books: { [key: number]: Book } = {};
    user = new User();
    session = '';
    valid = false;
    
    private getCookie(key: string) {
        let cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            let pair = cookie.split('=');
            if (pair[0] === key) {
                return pair[1];
            }
        }
        return '';
    }

    private sendJSON(method: string, url: string, data: any) {
        return new Promise<any>(function (resolve, reject) {
            if (!db.valid) {
                return;
            }
            if (db.session && db.session !== db.getCookie('bookdbsession')) {
                alert('複数ウィンドウを開くことはできません\nページを再読み込みしてください');
                db.valid = false;
                reject();
                return;
            }
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status === 200 || this.status === 304) {
                        if (this.response) {
                            resolve(JSON.parse(xhr.responseText));
                        } else {
                            resolve();
                        }
                    } else {
                        reject();
                    }
                }
            }
            xhr.open(method, 'api/' + url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(data ? JSON.stringify(data) : null);
        });
    }

    private getJSON(url: string) {
        return this.sendJSON('GET', url, null);
    }

    async initialize() {
        db.valid = true;
        db.user = await db.getJSON('user');
        db.session = db.getCookie('bookdbsession');
    }

    async updateAuthors() {
        let items = await db.getJSON('authors');
        db.authors = {};
        items.forEach(function (item) {
            let object = new Author();
            object.id = parseInt(item['id']);
            object.name = item['name'];
            db.authors[object.id] = object;
        });
    }

    async updateCircles() {
        let items = await db.getJSON('circles');
        db.circles = {};
        items.forEach(function (item) {
            let object = new Circle();
            object.id = parseInt(item['id']);
            object.name = item['name'];
            db.circles[object.id] = object;
        });
    }

    async updateFormats() {
        let items = await db.getJSON('formats');
        db.formats = {};
        items.forEach(function (item) {
            let object = new Format();
            object.id = parseInt(item['id']);
            object.name = item['name'];
            db.formats[object.id] = object;
        });
    }

    async updateMedia() {
        let items = await db.getJSON('media');
        db.media = {};
        items.forEach(function (item) {
            let object = new Media();
            object.id = parseInt(item['id']);
            object.name = item['name'];
            db.media[object.id] = object;
        });
    }

    async updateSizes() {
        let items = await db.getJSON('sizes');
        db.sizes = {};
        items.forEach(function (item) {
            let object = new Size();
            object.id = parseInt(item['id']);
            object.name = item['name'];
            db.sizes[object.id] = object;
        });
    }

    async updateTags() {
        let items = await db.getJSON('tags');
        db.tags = {};
        items.forEach(function (item) {
            let object = new Tag();
            object.id = parseInt(item['id']);
            object.name = item['name'];
            db.tags[object.id] = object;
        });
    }

    async updateBooks() {
        let items = await db.getJSON('books');
        db.books = {};
        items.forEach(function (item) {
            let object = new Book();
            object.id = parseInt(item['id']);
            object.name = item['name'];
            object.is_xrated = (parseInt(item['is_xrated']) != 0);
            object.format_id = parseInt(item['format_id']);
            object.size_id = parseInt(item['size_id']);
            object.published_on = item['published_on'];
            object.bought_on = item['bought_on'];
            object.location = item['location'];
            object.note = item['note'];
            item['author_ids'].forEach(function (id) {
                object.author_ids.push(parseInt(id));
            });
            item['circle_ids'].forEach(function (id) {
                object.circle_ids.push(parseInt(id));
            });
            item['media_ids'].forEach(function (id) {
                object.media_ids.push(parseInt(id));
            });
            item['tag_ids'].forEach(function (id) {
                object.tag_ids.push(parseInt(id));
            });
            db.books[object.id] = object;
        });
    }


    async updateAuthorDetail(id: number) {
        let item = await db.getJSON('authors/' + id);
        db.authors[id].name = item['name'];
        db.authors[id].urls = item['urls'];
        db.authors[id].circle_ids = item['circle_ids'];
    }

    async updateCircleDetail(id: number) {
        let item = await db.getJSON('circles/' + id);
        db.circles[id].name = item['name'];
        db.circles[id].urls = item['urls'];
        db.circles[id].author_ids = item['author_ids'];
    }

    async updateTagDetail(id: number) {
        let item = await db.getJSON('tags/' + id);
        db.tags[id].name = item['name'];
        db.tags[id].note = item['note'];
    }


    async putAuthorDetail(author: Author) {
        await db.sendJSON('PUT', 'authors/' + author.id, author);
    }

    async putCircleDetail(circle: Circle) {
        await db.sendJSON('PUT', 'circles/' + circle.id, circle);
    }

    async putFormatDetail(format: Format) {
        await db.sendJSON('PUT', 'formats/' + format.id, format);
    }

    async putMediaDetail(media: Media) {
        await db.sendJSON('PUT', 'media/' + media.id, media);
    }

    async putSizeDetail(size: Size) {
        await db.sendJSON('PUT', 'sizes/' + size.id, size);
    }

    async putTagDetail(tag: Tag) {
        await db.sendJSON('PUT', 'tags/' + tag.id, tag);
    }

    async putBookDetail(book: Book) {
        await db.sendJSON('PUT', 'books/' + book.id, book);
    }


    async createAuthor(author: Author) {
        let json = await db.sendJSON('POST', 'authors', author);
        if (json && 'id' in json && parseInt(json.id) > 0) {
            return parseInt(json.id);
        } else {
            throw Error();
        }
    }

    async createCircle(circle: Circle) {
        let json = await db.sendJSON('POST', 'circles', circle);
        if (json && 'id' in json && parseInt(json.id) > 0) {
            return parseInt(json.id);
        } else {
            throw Error();
        }
    }

    async createFormat(format: Format) {
        let json = await db.sendJSON('POST', 'formats', format);
        if (json && 'id' in json && parseInt(json.id) > 0) {
            return parseInt(json.id);
        } else {
            throw Error();
        }
    }

    async createMedia(media: Media) {
        let json = await db.sendJSON('POST', 'media', media);
        if (json && 'id' in json && parseInt(json.id) > 0) {
            return parseInt(json.id);
        } else {
            throw Error();
        }
    }

    async createSize(size: Size) {
        let json = await db.sendJSON('POST', 'sizes', size);
        if (json && 'id' in json && parseInt(json.id) > 0) {
            return parseInt(json.id);
        } else {
            throw Error();
        }
    }

    async createTag(tag: Tag) {
        let json = await db.sendJSON('POST', 'tags', tag);
        if (json && 'id' in json && parseInt(json.id) > 0) {
            return parseInt(json.id);
        } else {
            throw Error();
        }
    }

    async createBook(book: Book) {
        let json = await db.sendJSON('POST', 'books', book);
        if (json && 'id' in json && parseInt(json.id) > 0) {
            return parseInt(json.id);
        } else {
            throw Error();
        }
    }


    async deleteAuthor(id: number) {
        await db.sendJSON('DELETE', 'authors/' + id, null);
    }

    async deleteCircle(id: number) {
        await db.sendJSON('DELETE', 'circles/' + id, null);
    }

    async deleteFormat(id: number) {
        await db.sendJSON('DELETE', 'formats/' + id, null);
    }

    async deleteMedia(id: number) {
        await db.sendJSON('DELETE', 'media/' + id, null);
    }

    async deleteSize(id: number) {
        await db.sendJSON('DELETE', 'sizes/' + id, null);
    }

    async deleteTag(id: number) {
        await db.sendJSON('DELETE', 'tags/' + id, null);
    }

    async deleteBook(id: number) {
        await db.sendJSON('DELETE', 'books/' + id, null);
    }


    clearAllTables() {
        return db.sendJSON('DELETE', 'tables', null);
    }
    exportAllTables() {
        return db.getJSON('tables');
    }

    importAllTables(tables: any) {
        return db.sendJSON('POST', 'tables', tables);
    }
}
