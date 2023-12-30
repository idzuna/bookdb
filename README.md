# bookdb

## WHAT IS THIS

* 同人誌用の蔵書管理ツールです
* Node.js で Web サーバーとして動作し，ブラウザからアクセスして使用します

## INSTALL

1. Node.js をインストールします（v16.20.2 で動作確認しています）
1. bookdb のソースコードをダウンロードして展開します
1. 設定ファイルをコピーし，必要に応じて編集します
   ```
   cd bookdb
   cp config.ts.txt config.ts
   cp secrets.ts.txt secrets.ts
   ```
1. 依存パッケージをインストールしてビルドします
   ```
   npm install
   npm run build
   ```
1. 起動します
   ```
   node app
   ```
1. ブラウザからアクセスします (http://localhost:3000/)

## LICENSE

* CC BY-NC-SA 4.0 とします
* 商用利用したい場合は別途ご相談下さい

## CONTACT

* Twitter: [@idzuna_tan](https://twitter.com/idzuna_tan)
* Web Site: https://erir.in/

## HISTORY

* Version 1.0.0 2018/03/21
  * 初版公開
* Version 1.1.0 2018/07/14
  * 画像アップロード機能を実装
* Version 1.2.0 2023/12/30
  * Node.js v16.20.2 に対応
  * 依存パッケージのアップデート
  * 応答ヘッダに Cache-Control を追加
