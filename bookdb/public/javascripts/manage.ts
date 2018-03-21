
window.onload = function () {
    let exportButton = <HTMLInputElement>document.getElementById('export');
    let importFile = <HTMLInputElement>document.getElementById('import_file');
    let importButton = <HTMLInputElement>document.getElementById('import');
    let clearButton = <HTMLInputElement>document.getElementById('clear');

    (async function () {
        await db.initialize();
        exportButton.disabled = false;
        importFile.disabled = false;
        clearButton.disabled = false;
    })();
    

    exportButton.onclick = async function () {
        exportButton.disabled = true;
        let tables = await db.exportAllTables();
        let blob = new Blob([JSON.stringify(tables)], { type: 'application/json' });
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.innerText = 'ダウンロード';
        a.download = 'bookdb.json';
        exportButton.parentElement.appendChild(a);
    };

    importFile.onchange = function () {
        let file = importFile.files[0];
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function (e) {
            try {
                let tables = JSON.parse(reader.result);
                importButton.onclick = async function () {
                    if (confirm('インポートを実行しますか？')) {
                        importButton.disabled = true;
                        try {
                            await db.importAllTables(tables);
                            alert('データのインポートが完了しました');
                        } catch (e) {
                            alert('データのインポートに失敗しました');
                        }
                    }
                };
                importButton.disabled = false;                
            } catch (e) {
                importButton.disabled = true;
            }
        };
    };

    clearButton.onclick = async function () {
        if (confirm('蔵書リストをクリアしますか？')) {
            clearButton.disabled = true;
            try {
                await db.clearAllTables();
                alert('データのクリアが完了しました');
            } catch (e) {
                alert('データのクリアに失敗しました');
            }
            clearButton.disabled = false;
        }
    };
}
