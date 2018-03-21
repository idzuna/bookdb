
// generate は HTMLElement を受け取り子要素を追加する
// create は HTMLElement を生成して返す

let _editing = false;

function setEditing(editing: boolean) {
    _editing = editing;
    let commands = document.getElementsByClassName('command');
    for (let i = 0; i < commands.length; ++i) {
        (<HTMLInputElement>commands[i]).disabled = editing;
    }
}

function getEditting() {
    return _editing;
}

function collectChildSelectsValues(parent: HTMLElement) {
    let elem = parent.firstElementChild;
    let values: number[] = [];
    while (elem) {
        if (elem.tagName === 'SELECT') {
            let value = parseInt((<HTMLSelectElement>elem).value);
            if (value > 0) {
                values.push(value);
            }
        }
        elem = elem.nextElementSibling;
    }
    return values;
}

function collectChildTextInputsValues(parent: HTMLElement) {
    let elem = parent.firstElementChild;
    let values: string[] = [];
    while (elem) {
        if (elem.tagName === 'INPUT' && (<HTMLInputElement>elem).type === 'text') {
            if ((<HTMLSelectElement>elem).value) {
                values.push((<HTMLSelectElement>elem).value);
            }
        }
        elem = elem.nextElementSibling;
    }
    return values;
}


function removeAllChildNodes(node: Node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function parallel(funcarray: Array<() => Promise<void>>) {
    let count = funcarray.length;
    return new Promise<void>(function (resolve, reject) {
        funcarray.forEach(function (f) {
            f().then(function () {
                --count;
                if (count == 0) {
                    resolve();
                }
            }).catch(function () {
                reject();
            });
        });
    });
}

function createTd(text: string, className?: string) {
    let td = document.createElement('td');
    td.innerText = text;
    td.className = className;
    return td;
}

function createTh(text: string, className?: string) {
    let th = document.createElement('th');
    th.innerText = text;
    th.className = className;
    return th;
}

function createInput(type: string, value?: string) {
    let input = document.createElement('input');
    input.setAttribute('type', type);
    if (value) {
        input.setAttribute('value', value);
    }
    return input;
}


function generateAuthorsSelectOptions(select: HTMLSelectElement) {
    {
        let option = document.createElement('option');
        option.innerText = '--';
        option.value = '0';
        select.appendChild(option);
    }
    for (let id in db.authors) {
        let option = document.createElement('option');
        option.innerText = db.authors[id].name;
        option.value = id;
        select.appendChild(option);
    }
    {
        let option = document.createElement('option');
        option.innerText = '[新規作成]';
        option.value = '-1';
        select.appendChild(option);
    }
}

function generateCirclesSelectOptions(select: HTMLSelectElement) {
    {
        let option = document.createElement('option');
        option.innerText = '--';
        option.value = '0';
        select.appendChild(option);
    }
    for (let id in db.circles) {
        let option = document.createElement('option');
        option.innerText = db.circles[id].name;
        option.value = id;
        select.appendChild(option);
    }
    {
        let option = document.createElement('option');
        option.innerText = '[新規作成]';
        option.value = '-1';
        select.appendChild(option);
    }
}

function generateFormatsSelectOptions(select: HTMLSelectElement) {
    {
        let option = document.createElement('option');
        option.innerText = '--';
        option.value = '0';
        select.appendChild(option);
    }
    for (let id in db.formats) {
        let option = document.createElement('option');
        option.innerText = db.formats[id].name;
        option.value = id;
        select.appendChild(option);
    }
    {
        let option = document.createElement('option');
        option.innerText = '[新規作成]';
        option.value = '-1';
        select.appendChild(option);
    }
}

function generateMediaSelectOptions(select: HTMLSelectElement) {
    {
        let option = document.createElement('option');
        option.innerText = '--';
        option.value = '0';
        select.appendChild(option);
    }
    for (let id in db.media) {
        let option = document.createElement('option');
        option.innerText = db.media[id].name;
        option.value = id;
        select.appendChild(option);
    }
    {
        let option = document.createElement('option');
        option.innerText = '[新規作成]';
        option.value = '-1';
        select.appendChild(option);
    }
}

function generateSizesSelectOptions(select: HTMLSelectElement) {
    {
        let option = document.createElement('option');
        option.innerText = '--';
        option.value = '0';
        select.appendChild(option);
    }
    for (let id in db.sizes) {
        let option = document.createElement('option');
        option.innerText = db.sizes[id].name;
        option.value = id;
        select.appendChild(option);
    }
    {
        let option = document.createElement('option');
        option.innerText = '[新規作成]';
        option.value = '-1';
        select.appendChild(option);
    }
}

function generateTagsSelectOptions(select: HTMLSelectElement) {
    {
        let option = document.createElement('option');
        option.innerText = '--';
        option.value = '0';
        select.appendChild(option);
    }
    for (let id in db.tags) {
        let option = document.createElement('option');
        option.innerText = db.tags[id].name;
        option.value = id;
        select.appendChild(option);
    }
    {
        let option = document.createElement('option');
        option.innerText = '[新規作成]';
        option.value = '-1';
        select.appendChild(option);
    }
}


function createAuthorsSelect(value?: string) {
    let select = document.createElement('select');
    select.className = 'select_authors';
    generateAuthorsSelectOptions(select);
    let prevValue = select.value = value ? value : '0';
    select.onchange = function (e) {
        if (select.value == '-1') {
            let name = window.prompt('新しい著者名');
            if (name != null && name != '') {
                select.disabled = true;
                let author = new Author();
                author.name = name;
                db.createAuthor(author).then(function (id) {
                    select.disabled = false;
                    let option = document.createElement('option');
                    option.value = '' + id;
                    select.appendChild(option);
                    select.value = '' + id;
                    db.updateAuthors().then(updateAuthorsSelects);
                }).catch(function () {
                    select.disabled = false;
                    window.alert('著者名の新規作成に失敗しました');
                    select.value = prevValue;
                });
            } else {
                select.value = prevValue;
            }
        } else {
            prevValue = select.value;
        }        
    };
    return select;
}

function createCirclesSelect(value?: string) {
    let select = document.createElement('select');
    select.className = 'select_circles';
    generateCirclesSelectOptions(select);
    let prevValue = select.value = value ? value : '0';
    select.onchange = function () {
        if (select.value == '-1') {
            let name = window.prompt('新しいサークル名');
            if (name != null && name != '') {
                select.disabled = true;
                let circle = new Circle();
                circle.name = name;
                db.createCircle(circle).then(function (id) {
                    select.disabled = false;
                    let option = document.createElement('option');
                    option.value = '' + id;
                    select.appendChild(option);
                    select.value = '' + id;
                    db.updateCircles().then(updateCirclesSelects);
                }).catch(function () {
                    select.disabled = false;
                    window.alert('サークル名の新規作成に失敗しました');
                    select.value = prevValue;
                });
            } else {
                select.value = prevValue;
            }
        } else {
            prevValue = select.value;
        }        
    };
    return select;
}

function createFormatsSelect(value?: string) {
    let select = document.createElement('select');
    select.className = 'select_formats';
    generateFormatsSelectOptions(select);
    let prevValue = select.value = value ? value : '0';
    select.onchange = function () {
        if (select.value == '-1') {
            let name = window.prompt('新しい形式名');
            if (name != null && name != '') {
                select.disabled = true;
                let format = new Format();
                format.name = name;
                db.createFormat(format).then(function (id) {
                    select.disabled = false;
                    let option = document.createElement('option');
                    option.value = '' + id;
                    select.appendChild(option);
                    select.value = '' + id;
                    db.updateFormats().then(updateFormatsSelects);
                }).catch(function () {
                    select.disabled = false;
                    window.alert('形式名の新規作成に失敗しました');
                    select.value = prevValue;
                });
            } else {
                select.value = prevValue;
            }
        } else {
            prevValue = select.value;
        }        
    };
    return select;
}

function createMediaSelect(value?: string) {
    let select = document.createElement('select');
    select.className = 'select_media';
    generateMediaSelectOptions(select);
    let prevValue = select.value = value ? value : '0';
    select.onchange = function () {
        if (select.value == '-1') {
            let name = window.prompt('新しい媒体名');
            if (name != null && name != '') {
                select.disabled = true;
                let media = new Media();
                media.name = name;
                db.createMedia(media).then(function (id) {
                    select.disabled = false;
                    let option = document.createElement('option');
                    option.value = '' + id;
                    select.appendChild(option);
                    select.value = '' + id;
                    db.updateMedia().then(updateMediaSelects);
                }).catch(function () {
                    select.disabled = false;
                    window.alert('媒体名の新規作成に失敗しました');
                    select.value = prevValue;
                });
            } else {
                select.value = prevValue;
            }
        } else {
            prevValue = select.value;
        }        
    };
    return select;
}

function createSizesSelect(value?: string) {
    let select = document.createElement('select');
    select.className = 'select_sizes';
    generateSizesSelectOptions(select);
    let prevValue = select.value = value ? value : '0';
    select.onchange = function () {
        if (select.value == '-1') {
            let name = window.prompt('新しいサイズ名');
            if (name != null && name != '') {
                select.disabled = true;
                let size = new Size();
                size.name = name;
                db.createSize(size).then(function (id) {
                    select.disabled = false;
                    let option = document.createElement('option');
                    option.value = '' + id;
                    select.appendChild(option);
                    select.value = '' + id;
                    db.updateSizes().then(updateSizesSelects);
                }).catch(function () {
                    select.disabled = false;
                    window.alert('サイズ名の新規作成に失敗しました');
                    select.value = prevValue;
                });
            } else {
                select.value = prevValue;
            }
        } else {
            prevValue = select.value;
        }        
    };
    return select;
}

function createTagsSelect(value?: string) {
    let select = document.createElement('select');
    select.className = 'select_tags';
    generateTagsSelectOptions(select);
    let prevValue = select.value = value ? value : '0';
    select.onchange = function () {
        if (select.value == '-1') {
            let name = window.prompt('新しいタグ名');
            if (name != null && name != '') {
                select.disabled = true;
                let tag = new Tag();
                tag.name = name;
                db.createTag(tag).then(function (id) {
                    select.disabled = false;
                    let option = document.createElement('option');
                    option.value = '' + id;
                    select.appendChild(option);
                    select.value = '' + id;
                    db.updateTags().then(updateTagsSelects);
                }).catch(function () {
                    select.disabled = false;
                    window.alert('タグ名の新規作成に失敗しました');
                    select.value = prevValue;
                });
            } else {
                select.value = prevValue;
            }
        } else {
            prevValue = select.value;
        }        
    };
    return select;
}


function updateAuthorsSelects() {
    let selects = document.getElementsByClassName('select_authors');
    for (let i = 0; i < selects.length; ++i) {
        let select = <HTMLSelectElement>selects[i];
        let value = select.value;
        removeAllChildNodes(select);
        generateAuthorsSelectOptions(select);
        select.value = value;
    }
}

function updateCirclesSelects() {
    let selects = document.getElementsByClassName('select_circles');
    for (let i = 0; i < selects.length; ++i) {
        let select = <HTMLSelectElement>selects[i];
        let value = select.value;
        removeAllChildNodes(select);
        generateCirclesSelectOptions(select);
        select.value = value;
    }
}

function updateFormatsSelects() {
    let selects = document.getElementsByClassName('select_formats');
    for (let i = 0; i < selects.length; ++i) {
        let select = <HTMLSelectElement>selects[i];
        let value = select.value;
        removeAllChildNodes(select);
        generateFormatsSelectOptions(select);
        select.value = value;
    }
}

function updateMediaSelects() {
    let selects = document.getElementsByClassName('select_media');
    for (let i = 0; i < selects.length; ++i) {
        let select = <HTMLSelectElement>selects[i];
        let value = select.value;
        removeAllChildNodes(select);
        generateMediaSelectOptions(select);
        select.value = value;
    }
}

function updateSizesSelects() {
    let selects = document.getElementsByClassName('select_sizes');
    for (let i = 0; i < selects.length; ++i) {
        let select = <HTMLSelectElement>selects[i];
        let value = select.value;
        removeAllChildNodes(select);
        generateSizesSelectOptions(select);
        select.value = value;
    }
}

function updateTagsSelects() {
    let selects = document.getElementsByClassName('select_tags');
    for (let i = 0; i < selects.length; ++i) {
        let select = <HTMLSelectElement>selects[i];
        let value = select.value;
        removeAllChildNodes(select);
        generateTagsSelectOptions(select);
        select.value = value;
    }
}


function generateAuthorsButtons(parent: HTMLElement, author_ids: number[]) {
    author_ids.forEach(function (author_id) {
        if (author_id in db.authors) {
            if (db.authors[author_id].urls === void (0)) {
                db.updateAuthorDetail(author_id);
            }
            let input = createInput('button', db.authors[author_id].name);
            input.className = 'command';
            input.onclick = function () {
                openAuthorDetailWindow(db.authors[author_id]);
            };
            parent.appendChild(input);
        }
    });
}

function generateCirclesButtons(parent: HTMLElement, circle_ids: number[]) {
    circle_ids.forEach(function (circle_id) {
        if (circle_id in db.circles) {
            if (db.circles[circle_id].urls === void (0)) {
                db.updateCircleDetail(circle_id);
            }
            let input = createInput('button', db.circles[circle_id].name);
            input.className = 'command';
            input.onclick = function () {
                openCircleDetailWindow(db.circles[circle_id]);
            };
            parent.appendChild(input);
        }
    });
}

function generateFormatButtons(parent: HTMLElement, format_ids: number[]) {
    format_ids.forEach(function (format_id) {
        if (format_id in db.formats) {
            let input = createInput('button', db.formats[format_id].name);
            input.className = 'command';
            input.onclick = function () {
                openFormatDetailWindow(db.formats[format_id]);
            };
            parent.appendChild(input);
        }
    });
}

function generateMediaButtons(parent: HTMLElement, media_ids: number[]) {
    media_ids.forEach(function (media_id) {
        if (media_id in db.media) {
            let input = createInput('button', db.media[media_id].name);
            input.className = 'command';
            input.onclick = function () {
                openMediaDetailWindow(db.media[media_id]);
            };
            parent.appendChild(input);
        }
    });
}

function generateSizeButtons(parent: HTMLElement, size_ids: number[]) {
    size_ids.forEach(function (size_id) {
        if (size_id in db.sizes) {
            let input = createInput('button', db.sizes[size_id].name);
            input.className = 'command';
            input.onclick = function () {
                openSizeDetailWindow(db.sizes[size_id]);
            };
            parent.appendChild(input);
        }
    });
}

function generateTagsButtons(parent: HTMLElement, tag_ids: number[]) {
    tag_ids.forEach(function (tag_id) {
        if (tag_id in db.tags) {
            if (db.tags[tag_id].note === void (0)) {
                db.updateTagDetail(tag_id);
            }
            let input = createInput('button', db.tags[tag_id].name);
            input.className = 'command';
            input.onclick = function () {
                openTagDetailWindow(db.tags[tag_id]);
            };
            parent.appendChild(input);
        }
    });
}


function openAuthorDetailWindow(author: Author) {
    removeAllChildNodes(document.getElementById('attribute'));
    if (author.urls === void (0)) {
        return;
    }
    {
        let th = createTh('著者ID');
        let td = createTd('' + author.id);
        td.id = 'author_id';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('著者名');
        let td = createTd(author.name);
        td.id = 'author_name';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('URL');
        let td = document.createElement('td');
        td.id = 'author_urls';
        author.urls.forEach(function (url) {
            let a = document.createElement('a');
            a.innerText = url;
            a.href = url;
            a.target = '_blank';
            td.appendChild(document.createElement('br'));
            td.appendChild(a);
        });
        if (td.firstElementChild) {
            td.removeChild(td.firstElementChild);
        }
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('関連サークル');
        let td = document.createElement('td');
        generateCirclesButtons(td, author.circle_ids);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = document.createElement('th');
        th.id = 'author_commands';
        th.colSpan = 2;
        let input = createInput('button', '編集');
        input.className = 'command';
        input.onclick = function () {
            setEditing(true);
            openAuthorEditWindow(author);
        };
        th.appendChild(input);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        document.getElementById('attribute').appendChild(tr);
    }
}

function openCircleDetailWindow(circle: Circle) {
    removeAllChildNodes(document.getElementById('attribute'));
    if (circle.urls === void (0)) {
        return;
    }
    {
        let th = createTh('サークルID');
        let td = createTd('' + circle.id);
        td.id = 'circle_id';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('サークル名');
        let td = createTd(circle.name);
        td.id = 'circle_name';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('URL');
        let td = document.createElement('td');
        td.id = 'circle_urls';
        circle.urls.forEach(function (url) {
            let a = document.createElement('a');
            a.innerText = url;
            a.href = url;
            a.target = '_blank';
            td.appendChild(document.createElement('br'));
            td.appendChild(a);
        });
        if (td.firstElementChild) {
            td.removeChild(td.firstElementChild);
        }
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('関連著者');
        let td = document.createElement('td');
        generateAuthorsButtons(td, circle.author_ids);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = document.createElement('th');
        th.id = 'circle_commands';
        th.colSpan = 2;
        let input = createInput('button', '編集');
        input.className = 'command';
        input.onclick = function () {
            setEditing(true);
            openCircleEditWindow(circle);
        };
        th.appendChild(input);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        document.getElementById('attribute').appendChild(tr);
    }
}

function openFormatDetailWindow(format: Format) {
    removeAllChildNodes(document.getElementById('attribute'));
    {
        let th = createTh('形式ID');
        let td = createTd('' + format.id);
        td.id = 'format_id';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('形式名');
        let td = createTd(format.name);
        td.id = 'format_name';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = document.createElement('th');
        th.id = 'format_commands';
        th.colSpan = 2;
        let input = createInput('button', '編集');
        input.className = 'command';
        input.onclick = function () {
            setEditing(true);
            openFormatEditWindow(format);
        };
        th.appendChild(input);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        document.getElementById('attribute').appendChild(tr);
    }
}

function openMediaDetailWindow(media: Media) {
    removeAllChildNodes(document.getElementById('attribute'));
    {
        let th = createTh('媒体ID');
        let td = createTd('' + media.id);
        td.id = 'media_id';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('媒体名');
        let td = createTd(media.name);
        td.id = 'media_name';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = document.createElement('th');
        th.id = 'media_commands';
        th.colSpan = 2;
        let input = createInput('button', '編集');
        input.className = 'command';
        input.onclick = function () {
            setEditing(true);
            openMediaEditWindow(media);
        };
        th.appendChild(input);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        document.getElementById('attribute').appendChild(tr);
    }
}

function openSizeDetailWindow(size: Size) {
    removeAllChildNodes(document.getElementById('attribute'));
    {
        let th = createTh('サイズID');
        let td = createTd('' + size.id);
        td.id = 'size_id';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('サイズ名');
        let td = createTd(size.name);
        td.id = 'size_name';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = document.createElement('th');
        th.id = 'size_commands';
        th.colSpan = 2;
        let input = createInput('button', '編集');
        input.className = 'command';
        input.onclick = function () {
            setEditing(true);
            openSizeEditWindow(size);
        };
        th.appendChild(input);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        document.getElementById('attribute').appendChild(tr);
    }
}

function openTagDetailWindow(tag: Tag) {
    removeAllChildNodes(document.getElementById('attribute'));
    if (tag.note === void (0)) {
        return;
    }
    {
        let th = createTh('タグID');
        let td = createTd('' + tag.id);
        td.id = 'tag_id';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('タグ名');
        let td = createTd(tag.name);
        td.id = 'tag_name';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('備考');
        let td = createTd(tag.note);
        td.id = 'tag_note';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = document.createElement('th');
        th.id = 'tag_commands';
        th.colSpan = 2;
        let input = createInput('button', '編集');
        input.className = 'command';
        input.onclick = function () {
            setEditing(true);
            openTagEditWindow(tag);
        };
        th.appendChild(input);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        document.getElementById('attribute').appendChild(tr);
    }
}


function openAuthorEditWindow(author: Author) {
    removeAllChildNodes(document.getElementById('attribute'));
    {
        let th = createTh('著者ID');
        let td = createTd('' + author.id);
        td.id = 'author_id';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('著者名');
        let td = document.createElement('td');
        td.id = 'author_name';
        let input = createInput('text', author.name);
        td.appendChild(input);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('URL');
        let td = document.createElement('td');
        td.id = 'author_urls';
        let input = createInput('button', '欄を追加');
        input.onclick = function () {
            td.appendChild(document.createElement('br'));
            td.appendChild(createInput('text'));
        }
        td.appendChild(input);
        author.urls.forEach(function (url) {
            td.appendChild(document.createElement('br'));
            td.appendChild(createInput('text', url));
        });
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('関連サークル');
        let td = document.createElement('td');
        td.id = 'author_circles';
        let input = createInput('button', '欄を追加');
        input.onclick = function () {
            td.appendChild(document.createElement('br'));
            td.appendChild(createCirclesSelect());
        }
        td.appendChild(input);
        author.circle_ids.forEach(function (author_id) {
            td.appendChild(document.createElement('br'));
            td.appendChild(createCirclesSelect('' + author_id));
        });
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = document.createElement('th');
        th.id = 'author_commands';
        th.colSpan = 2;
        let cancel = createInput('button', 'キャンセル');
        cancel.onclick = function () {
            setEditing(false);
            openAuthorDetailWindow(db.authors[author.id]);
        };
        th.appendChild(cancel);
        let save = createInput('button', '保存');
        save.onclick = function () {
            cancel.disabled = true;
            save.disabled = true;
            let detail = collectAuthorDetail();
            db.putAuthorDetail(detail).then(async function () {
                await db.updateCircles();
                await db.updateAuthors();
                await db.updateAuthorDetail(author.id);
                setEditing(false);
                updateAuthorsSelects();
                openAuthorDetailWindow(db.authors[author.id]);
                bookList.update();
                bookDetailWindow.update();
            }).catch(function () {
                window.alert('保存に失敗しました');
                cancel.disabled = false;
                save.disabled = false;
            });
        };
        th.appendChild(save);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        document.getElementById('attribute').appendChild(tr);
    }
}

function openCircleEditWindow(circle: Circle) {
    removeAllChildNodes(document.getElementById('attribute'));
    {
        let th = createTh('サークルID');
        let td = createTd('' + circle.id);
        td.id = 'circle_id';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('サークル名');
        let td = document.createElement('td');
        td.id = 'circle_name';
        let input = createInput('text', circle.name);
        td.appendChild(input);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('URL');
        let td = document.createElement('td');
        td.id = 'circle_urls';
        let input = createInput('button', '欄を追加');
        input.onclick = function () {
            td.appendChild(document.createElement('br'));
            td.appendChild(createInput('text'));
        }
        td.appendChild(input);
        circle.urls.forEach(function (url) {
            td.appendChild(document.createElement('br'));
            td.appendChild(createInput('text', url));
        });
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('関連著者');
        let td = document.createElement('td');
        td.id = 'circle_authors';
        let input = createInput('button', '欄を追加');
        input.onclick = function () {
            td.appendChild(document.createElement('br'));
            td.appendChild(createAuthorsSelect());
        }
        td.appendChild(input);
        circle.author_ids.forEach(function (author_id) {
            td.appendChild(document.createElement('br'));
            td.appendChild(createAuthorsSelect('' + author_id));
        });
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = document.createElement('th');
        th.id = 'circle_commands';
        th.colSpan = 2;
        let cancel = createInput('button', 'キャンセル');
        cancel.onclick = function () {
            setEditing(false);
            openCircleDetailWindow(db.circles[circle.id]);
        };
        th.appendChild(cancel);
        let save = createInput('button', '保存');
        save.onclick = function () {
            cancel.disabled = true;
            save.disabled = true;
            let detail = collectCircleDetail();
            db.putCircleDetail(detail).then(async function () {
                await db.updateAuthors();
                await db.updateCircles();
                await db.updateCircleDetail(circle.id);
                setEditing(false);
                updateCirclesSelects();
                openCircleDetailWindow(db.circles[circle.id]);
                bookList.update();
                bookDetailWindow.update();
            }).catch(function () {
                window.alert('保存に失敗しました');
                cancel.disabled = false;
                save.disabled = false;
            });
        };
        th.appendChild(save);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        document.getElementById('attribute').appendChild(tr);
    }
}

function openFormatEditWindow(format: Format) {
    removeAllChildNodes(document.getElementById('attribute'));
    {
        let th = createTh('形式ID');
        let td = createTd('' + format.id);
        td.id = 'format_id';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('形式名');
        let td = document.createElement('td');
        td.id = 'format_name';
        let input = createInput('text', format.name);
        td.appendChild(input);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = document.createElement('th');
        th.id = 'format_commands';
        th.colSpan = 2;
        let cancel = createInput('button', 'キャンセル');
        cancel.onclick = function () {
            setEditing(false);
            openFormatDetailWindow(db.formats[format.id]);
        };
        th.appendChild(cancel);
        let save = createInput('button', '保存');
        save.onclick = function () {
            cancel.disabled = true;
            save.disabled = true;
            let detail = collectFormatDetail();
            db.putFormatDetail(detail).then(async function () {
                await db.updateFormats();
                setEditing(false);
                updateFormatsSelects();
                openFormatDetailWindow(db.formats[format.id]);
                bookList.update();
                bookDetailWindow.update();
            }).catch(function () {
                window.alert('保存に失敗しました');
                cancel.disabled = false;
                save.disabled = false;
            });
        };
        th.appendChild(save);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        document.getElementById('attribute').appendChild(tr);
    }
}

function openMediaEditWindow(media: Media) {
    removeAllChildNodes(document.getElementById('attribute'));
    {
        let th = createTh('媒体ID');
        let td = createTd('' + media.id);
        td.id = 'media_id';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('媒体名');
        let td = document.createElement('td');
        td.id = 'media_name';
        let input = createInput('text', media.name);
        td.appendChild(input);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = document.createElement('th');
        th.id = 'media_commands';
        th.colSpan = 2;
        let cancel = createInput('button', 'キャンセル');
        cancel.onclick = function () {
            setEditing(false);
            openMediaDetailWindow(db.media[media.id]);
        };
        th.appendChild(cancel);
        let save = createInput('button', '保存');
        save.onclick = function () {
            cancel.disabled = true;
            save.disabled = true;
            let detail = collectMediaDetail();
            db.putMediaDetail(detail).then(async function () {
                await db.updateMedia();
                setEditing(false);
                updateMediaSelects();
                openMediaDetailWindow(db.media[media.id]);
                bookList.update();
                bookDetailWindow.update();
            }).catch(function () {
                window.alert('保存に失敗しました');
                cancel.disabled = false;
                save.disabled = false;
            });
        };
        th.appendChild(save);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        document.getElementById('attribute').appendChild(tr);
    }
}

function openSizeEditWindow(size: Size) {
    removeAllChildNodes(document.getElementById('attribute'));
    {
        let th = createTh('サイズID');
        let td = createTd('' + size.id);
        td.id = 'size_id';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('サイズ名');
        let td = document.createElement('td');
        td.id = 'size_name';
        let input = createInput('text', size.name);
        td.appendChild(input);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = document.createElement('th');
        th.id = 'size_commands';
        th.colSpan = 2;
        let cancel = createInput('button', 'キャンセル');
        cancel.onclick = function () {
            setEditing(false);
            openSizeDetailWindow(db.sizes[size.id]);
        };
        th.appendChild(cancel);
        let save = createInput('button', '保存');
        save.onclick = function () {
            cancel.disabled = true;
            save.disabled = true;
            let detail = collectSizeDetail();
            db.putSizeDetail(detail).then(async function () {
                await db.updateSizes();
                setEditing(false);
                updateSizesSelects();
                openSizeDetailWindow(db.sizes[size.id]);
                bookList.update();
                bookDetailWindow.update();
            }).catch(function () {
                window.alert('保存に失敗しました');
                cancel.disabled = false;
                save.disabled = false;
            });
        };
        th.appendChild(save);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        document.getElementById('attribute').appendChild(tr);
    }
}

function openTagEditWindow(tag: Tag) {
    removeAllChildNodes(document.getElementById('attribute'));
    {
        let th = createTh('タグID');
        let td = createTd('' + tag.id);
        td.id = 'tag_id';
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('タグ名');
        let td = document.createElement('td');
        td.id = 'tag_name';
        let input = createInput('text', tag.name);
        td.appendChild(input);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = createTh('備考');
        let td = document.createElement('td');
        td.id = 'tag_note';
        let input = createInput('text', tag.note);
        td.appendChild(input);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td);
        document.getElementById('attribute').appendChild(tr);
    }
    {
        let th = document.createElement('th');
        th.id = 'tag_commands';
        th.colSpan = 2;
        let cancel = createInput('button', 'キャンセル');
        cancel.onclick = function () {
            setEditing(false);
            openTagDetailWindow(db.tags[tag.id]);
        };
        th.appendChild(cancel);
        let save = createInput('button', '保存');
        save.onclick = function () {
            cancel.disabled = true;
            save.disabled = true;
            let detail = collectTagDetail();
            db.putTagDetail(detail).then(async function () {
                await db.updateTags();
                await db.updateTagDetail(tag.id);
                setEditing(false);
                updateTagsSelects();
                openTagDetailWindow(db.tags[tag.id]);
                bookList.update();
                bookDetailWindow.update();
            }).catch(function () {
                window.alert('保存に失敗しました');
                cancel.disabled = false;
                save.disabled = false;
            });
        };
        th.appendChild(save);
        let tr = document.createElement('tr');
        tr.appendChild(th);
        document.getElementById('attribute').appendChild(tr);
    }
}


function collectAuthorDetail() {
    let author = new Author();
    author.id = parseInt(document.getElementById('author_id').innerText);
    author.name = (<HTMLInputElement>document.getElementById('author_name').firstElementChild).value;
    author.urls = collectChildTextInputsValues(document.getElementById('author_urls'));
    author.circle_ids = collectChildSelectsValues(document.getElementById('author_circles'));
    return author;
}

function collectCircleDetail() {
    let circle = new Circle();
    circle.id = parseInt(document.getElementById('circle_id').innerText);
    circle.name = (<HTMLInputElement>document.getElementById('circle_name').firstElementChild).value;
    circle.urls = collectChildTextInputsValues(document.getElementById('circle_urls'));
    circle.author_ids = collectChildSelectsValues(document.getElementById('circle_authors'));
    return circle;
}

function collectFormatDetail() {
    let format = new Format();
    format.id = parseInt(document.getElementById('format_id').innerText);
    format.name = (<HTMLInputElement>document.getElementById('format_name').firstElementChild).value;
    return format;
}

function collectMediaDetail() {
    let media = new Media();
    media.id = parseInt(document.getElementById('media_id').innerText);
    media.name = (<HTMLInputElement>document.getElementById('media_name').firstElementChild).value;
    return media;
}

function collectSizeDetail() {
    let size = new Size();
    size.id = parseInt(document.getElementById('size_id').innerText);
    size.name = (<HTMLInputElement>document.getElementById('size_name').firstElementChild).value;
    return size;
}

function collectTagDetail() {
    let tag = new Tag();
    tag.id = parseInt(document.getElementById('tag_id').innerText);
    tag.name = (<HTMLInputElement>document.getElementById('tag_name').firstElementChild).value;
    tag.note = (<HTMLInputElement>document.getElementById('tag_note').firstElementChild).value;
    return tag;
}


let bookDetailWindow = new class {

    private openningBook: Book;

    close() {
        (<HTMLInputElement>document.getElementById('book_set_default')).disabled = true;
        removeAllChildNodes(document.getElementById('book_id'));
        removeAllChildNodes(document.getElementById('book_name'));
        removeAllChildNodes(document.getElementById('book_is_xrated'));
        removeAllChildNodes(document.getElementById('book_format'));
        removeAllChildNodes(document.getElementById('book_size'));
        removeAllChildNodes(document.getElementById('book_published_on'));
        removeAllChildNodes(document.getElementById('book_bought_on'));
        removeAllChildNodes(document.getElementById('book_location'));
        removeAllChildNodes(document.getElementById('book_note'));
        removeAllChildNodes(document.getElementById('book_authors'));
        removeAllChildNodes(document.getElementById('book_circles'));
        removeAllChildNodes(document.getElementById('book_media'));
        removeAllChildNodes(document.getElementById('book_tags'));
        removeAllChildNodes(document.getElementById('book_commands'));
        bookDetailWindow.openningBook = null;
    }

    open(book: Book) {

        bookDetailWindow.close();

        let format = book.format_id ? db.formats[book.format_id].name : '';
        let size = book.size_id ? db.sizes[book.size_id].name : '';
        document.getElementById('book_id').innerText = '' + book.id;
        document.getElementById('book_name').innerText = book.name;
        document.getElementById('book_is_xrated').innerText = book.is_xrated ? 'はい' : 'いいえ';
        generateFormatButtons(document.getElementById('book_format'), [book.format_id]);
        generateSizeButtons(document.getElementById('book_size'), [book.size_id]);
        document.getElementById('book_published_on').innerText = book.published_on;
        document.getElementById('book_bought_on').innerText = book.bought_on;
        document.getElementById('book_location').innerText = book.location;
        document.getElementById('book_note').innerText = book.note;
        generateCirclesButtons(document.getElementById('book_circles'), book.circle_ids);
        generateAuthorsButtons(document.getElementById('book_authors'), book.author_ids);
        generateMediaButtons(document.getElementById('book_media'), book.media_ids);
        generateTagsButtons(document.getElementById('book_tags'), book.tag_ids);
        {
            let input = createInput('button', '編集');
            input.id = 'book_commands_edit';
            input.className = 'command';
            input.onclick = function () {
                setEditing(true);
                bookDetailWindow.edit(book);
            }
            document.getElementById('book_commands').appendChild(input);
        }
        {
            let input = createInput('button', 'ひな形にして新規作成');
            input.id = 'book_commands_copy';
            input.className = 'command';
            input.onclick = function () {
                setEditing(true);
                bookDetailWindow.edit(book, true);
                bookList.deselect();
            };
            document.getElementById('book_commands').appendChild(input);
        }
        {
            let input = createInput('button', '削除');
            input.id = 'book_commands_delete';
            input.className = 'command';
            input.onclick = function () {
                if (window.confirm('削除してもよろしいですか？')) {
                    setEditing(true);
                    db.deleteBook(book.id).then(async function () {
                        await db.updateBooks();
                        bookList.update();
                        bookDetailWindow.close();
                        setEditing(false);
                    }).catch(function () {
                        window.alert('削除に失敗しました');
                        setEditing(false);
                    });
                    bookDetailWindow.edit(book, true);
                    bookList.deselect();
                }
            };
            document.getElementById('book_commands').appendChild(input);
        }

        bookDetailWindow.openningBook = book;
    }

    update() {
        if (bookDetailWindow.openningBook) {
            bookDetailWindow.open(bookDetailWindow.openningBook);
        } else {
            bookDetailWindow.close();
        }
    }

    edit(book: Book, isNew: boolean = false) {

        bookDetailWindow.close();
        (<HTMLInputElement>document.getElementById('book_set_default')).disabled = false;
        (<HTMLInputElement>document.getElementById('book_set_default')).onclick = function () {
            localStorage.setItem('default_book_info', JSON.stringify(bookDetailWindow.collect()));
        };

        document.getElementById('book_id').innerText = isNew ? '新規' : '' + book.id;
        document.getElementById('book_name').appendChild(createInput('text', book.name));
        {
            let checkbox = createInput('checkbox');
            checkbox.checked = book.is_xrated;
            document.getElementById('book_is_xrated').appendChild(checkbox);
        }
        document.getElementById('book_format').appendChild(createFormatsSelect('' + book.format_id));
        document.getElementById('book_size').appendChild(createSizesSelect('' + book.size_id));
        document.getElementById('book_published_on').appendChild(createInput('text', book.published_on));
        document.getElementById('book_bought_on').appendChild(createInput('text', book.bought_on));
        document.getElementById('book_location').appendChild(createInput('text', book.location));
        document.getElementById('book_note').appendChild(createInput('text', book.note));
        {
            let input = createInput('button', '欄を追加');
            input.onclick = function () {
                document.getElementById('book_circles').appendChild(document.createElement('br'));
                document.getElementById('book_circles').appendChild(createCirclesSelect());
            }
            document.getElementById('book_circles').appendChild(input);
            book.circle_ids.forEach(function (circle_id) {
                document.getElementById('book_circles').appendChild(document.createElement('br'));
                document.getElementById('book_circles').appendChild(createCirclesSelect('' + circle_id));
            });
        }
        {
            let input = createInput('button', '欄を追加');
            input.onclick = function () {
                document.getElementById('book_authors').appendChild(document.createElement('br'));
                document.getElementById('book_authors').appendChild(createAuthorsSelect());
            }
            document.getElementById('book_authors').appendChild(input);
            book.author_ids.forEach(function (author_id) {
                document.getElementById('book_authors').appendChild(document.createElement('br'));
                document.getElementById('book_authors').appendChild(createAuthorsSelect('' + author_id));
            });
        }
        {
            let input = createInput('button', '欄を追加');
            input.onclick = function () {
                document.getElementById('book_media').appendChild(document.createElement('br'));
                document.getElementById('book_media').appendChild(createMediaSelect());
            }
            document.getElementById('book_media').appendChild(input);
            book.media_ids.forEach(function (media_id) {
                document.getElementById('book_media').appendChild(document.createElement('br'));
                document.getElementById('book_media').appendChild(createMediaSelect('' + media_id));
            });
        }
        {
            let input = createInput('button', '欄を追加');
            input.onclick = function () {
                document.getElementById('book_tags').appendChild(document.createElement('br'));
                document.getElementById('book_tags').appendChild(createTagsSelect());
            }
            document.getElementById('book_tags').appendChild(input);
            book.tag_ids.forEach(function (tag_id) {
                document.getElementById('book_tags').appendChild(document.createElement('br'));
                document.getElementById('book_tags').appendChild(createTagsSelect('' + tag_id));
            });
        }

        if (isNew) {
            let cancel = createInput('button', 'キャンセル');
            let register = createInput('button', '続けて登録');
            let done = createInput('button', '登録');
            cancel.className = 'command';
            register.className = 'command';
            done.className = 'command';
            cancel.onclick = function () {
                setEditing(false);
                bookDetailWindow.close();
            }
            register.onclick = function () {
                cancel.disabled = true;
                register.disabled = true;
                done.disabled = true;
                db.createBook(bookDetailWindow.collect()).then(async function (id) {
                    await db.updateBooks();
                    bookList.update();
                    cancel.disabled = false;
                    register.disabled = false;
                    done.disabled = false;
                }).catch(function () {
                    window.alert('登録に失敗しました');
                    cancel.disabled = false;
                    register.disabled = false;
                    done.disabled = false;
                });
            };
            done.onclick = function () {
                cancel.disabled = true;
                register.disabled = true;
                done.disabled = true;
                db.createBook(bookDetailWindow.collect()).then(async function (id) {
                    await db.updateBooks();
                    setEditing(false);
                    bookList.update();
                    bookList.select(id);
                    bookDetailWindow.open(db.books[id]);
                }).catch(function () {
                    window.alert('登録に失敗しました');
                    cancel.disabled = false;
                    register.disabled = false;
                    done.disabled = false;
                });
            }
            document.getElementById('book_commands').appendChild(cancel);
            document.getElementById('book_commands').appendChild(register);
            document.getElementById('book_commands').appendChild(done);
        } else {
            let cancel = createInput('button', 'キャンセル');
            let register = createInput('button', '登録');
            cancel.className = 'command';
            register.className = 'command';
            cancel.onclick = function () {
                setEditing(false);
                bookList.select(book.id);
                bookDetailWindow.open(db.books[book.id]);
            }
            register.onclick = function () {
                cancel.disabled = true;
                register.disabled = true;
                db.putBookDetail(bookDetailWindow.collect()).then(async function () {
                    await db.updateBooks();
                    setEditing(false);
                    bookList.update();
                    bookList.select(book.id);
                    bookDetailWindow.open(db.books[book.id]);
                }).catch(function () {
                    window.alert('登録に失敗しました');
                    cancel.disabled = false;
                    register.disabled = false;
                });
            }
            document.getElementById('book_commands').appendChild(cancel);
            document.getElementById('book_commands').appendChild(register);
        }
    }

    collect() {
        let book = new Book();
        book.id = parseInt(document.getElementById('book_id').innerText);
        book.name = (<HTMLInputElement>document.getElementById('book_name').firstElementChild).value;
        book.is_xrated = (<HTMLInputElement>document.getElementById('book_is_xrated').firstElementChild).checked;
        book.format_id = parseInt((<HTMLSelectElement>document.getElementById('book_format').firstElementChild).value);
        book.size_id = parseInt((<HTMLSelectElement>document.getElementById('book_size').firstElementChild).value);
        book.published_on = (<HTMLInputElement>document.getElementById('book_published_on').firstElementChild).value;
        book.bought_on = (<HTMLInputElement>document.getElementById('book_bought_on').firstElementChild).value;
        book.location = (<HTMLInputElement>document.getElementById('book_location').firstElementChild).value;
        book.note = (<HTMLInputElement>document.getElementById('book_note').firstElementChild).value;
        book.author_ids = [];
        book.circle_ids = [];
        book.media_ids = [];
        book.tag_ids = [];
        book.author_ids = collectChildSelectsValues(document.getElementById('book_authors'));
        book.circle_ids = collectChildSelectsValues(document.getElementById('book_circles'));
        book.media_ids = collectChildSelectsValues(document.getElementById('book_media'));
        book.tag_ids = collectChildSelectsValues(document.getElementById('book_tags'));
        return book;
    }
    
    getDefault() {
        let storage = localStorage.getItem('default_book_info');
        let book = storage ? JSON.parse(storage) : {
            'id': '',
            'name': '',
            'is_xrated': '0',
            'format_id': '0',
            'size_id': '0',
            'published_on': '',
            'bought_on': '',
            'location': '',
            'note': '',
            'author_ids': [],
            'circle_ids': [],
            'media_ids': [],
            'tag_ids': []
        };
        return <Book>book;
    }
}


let bookList = new class {

    selected: number = 0;

    deselect() {
        let elem = document.getElementById('booklist').firstElementChild;
        while (elem) {
            elem.className = '';
            elem = elem.nextElementSibling;
        }
        bookList.selected = 0;
    }

    select(id: number) {
        bookList.deselect();
        if (document.getElementById('book' + id)) {
            document.getElementById('book' + id).className = 'active';
            bookList.selected = id;
        }
    }

    update() {
        removeAllChildNodes(document.getElementById('booklist'));
        for (let id in db.books) {
            let format = db.books[id].format_id ? db.formats[db.books[id].format_id].name : '';
            let size = db.books[id].size_id ? db.sizes[db.books[id].size_id].name : '';
            let tr = document.createElement('tr');
            tr.id = 'book' + id;
            tr.appendChild(createTd(id, 'books_id'));
            tr.appendChild(createTd(db.books[id].name, 'books_name'));
            tr.appendChild(createTd(db.books[id].is_xrated ? 'はい' : 'いいえ', 'books_is_xrated'));
            {
                let count = 0;
                let text = '';
                for (let circle_id of db.books[id].circle_ids) {
                    if (circle_id > 0 && db.circles[circle_id]) {
                        if (count === 1) {
                            text += '...';
                            break;
                        }
                        text += '[' + db.circles[circle_id].name + ']';
                        ++count;
                    }
                }
                tr.appendChild(createTd(text, 'books_circles'));
            }
            {
                let count = 0;
                let text = '';
                for (let author_id of db.books[id].author_ids) {
                    if (author_id > 0 && db.authors[author_id]) {
                        if (count === 1) {
                            text += '...';
                            break;
                        }
                        text += '[' + db.authors[author_id].name + ']';
                        ++count;
                    }
                }
                tr.appendChild(createTd(text, 'books_authors'));
            }
            tr.appendChild(createTd(format, 'books_format'));
            tr.appendChild(createTd(size, 'books_size'));
            tr.appendChild(createTd(db.books[id].published_on, 'books_published_on'));
            tr.appendChild(createTd(db.books[id].bought_on, 'books_bought_on'));
            tr.appendChild(createTd(db.books[id].location, 'books_location'));
            {
                let count = 0;
                let text = '';
                for (let media_id of db.books[id].media_ids) {
                    if (media_id > 0 && db.media[media_id]) {
                        if (count === 1) {
                            text += '...';
                            break;
                        }
                        text += '[' + db.media[media_id].name + ']';
                        ++count;
                    }
                }
                tr.appendChild(createTd(text, 'books_media'));
            }
            {
                let count = 0;
                let text = '';
                for (let tag_id of db.books[id].tag_ids) {
                    if (tag_id > 0 && db.tags[tag_id]) {
                        if (count === 3) {
                            text += '...';
                            break;
                        }
                        text += '[' + db.tags[tag_id].name + ']';
                        ++count;
                    }
                }
                tr.appendChild(createTd(text, 'books_tags'));
            }
            tr.appendChild(createTd(db.books[id].note, 'books_note'));
        
            tr.onclick = function () {
                if (!getEditting()) {
                    bookList.select(parseInt(id));
                    bookDetailWindow.open(db.books[id]);
                }
            }
            document.getElementById('booklist').appendChild(tr);
        }
        bookList.select(bookList.selected);
    }
}


function initializeDragBar() {
    let rightColumnWidth = 300;
    let lowerBlockHeight = 300;
    let vertical = document.getElementById('vertical_bar');
    let horizontal = document.getElementById('horizontal_bar');

    let reshape = function () {
        let contentHeight = document.body.clientHeight - document.getElementById('navigation').offsetHeight;
        document.getElementById('content').style.height = '' + contentHeight + 'px';
        document.getElementById('left_column').style.width = '' + (document.body.clientWidth - rightColumnWidth - 1) + 'px';
        document.getElementById('right_column').style.width = '' + rightColumnWidth + 'px';
        document.getElementById('upper_block').style.height = '' + (contentHeight - lowerBlockHeight - horizontal.offsetHeight) + 'px';
        document.getElementById('lower_block').style.height = '' + lowerBlockHeight + 'px';
    }
    window.onresize = reshape;
    reshape();

    let dragbarDragging = false;
    let horizonDragging = false;
    let dragStartX: number;
    let dragStartY: number;
    let dragStartWidth: number;
    let dragStartHeight: number;

    vertical.onmousedown = function (e) {
        dragbarDragging = true;
        dragStartX = e.clientX;
        dragStartWidth = rightColumnWidth;
    };
    horizontal.onmousedown = function (e) {
        horizonDragging = true;
        dragStartY = e.clientY;
        dragStartHeight = lowerBlockHeight;
    };
    window.onmouseup = function () {
        dragbarDragging = false;
        horizonDragging = false;
    };
    window.onmousemove = function (e) {
        if (dragbarDragging) {
            let dx = e.clientX - dragStartX;
            rightColumnWidth = Math.max(10, dragStartWidth - dx);
            reshape();
        }
        if (horizonDragging) {
            let dy = e.clientY - dragStartY;
            lowerBlockHeight = Math.max(10, dragStartHeight - dy);
            reshape();
        }
    };
}

window.onload = function () {

    initializeDragBar();

    (async function () {
        await db.initialize();
        await parallel([
            db.updateAuthors.bind(db),
            db.updateCircles.bind(db),
            db.updateFormats.bind(db),
            db.updateMedia.bind(db),
            db.updateSizes.bind(db),
            db.updateTags.bind(db)
        ]);
        await db.updateBooks();
        bookList.update();
        setEditing(false);
        document.getElementById('book_new').onclick = function (e) {
            setEditing(true);
            bookList.deselect();
            let book = bookDetailWindow.getDefault();
            bookDetailWindow.edit(book, true);
        };
    })().catch(function () {
        window.alert('サーバーとの通信に失敗しました\nページを再読み込みしてください');
    });
}
