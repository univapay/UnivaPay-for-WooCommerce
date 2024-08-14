# UnivaPay-for-WooCommerce
WooCommerce用のUnivaPay導入プラグイン

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

[WordPressおよびWooCommerceに関する情報](./UnivaPay-for-WooCommerce/readme.txt)

## 環境

このプロジェクトは開発環境としてDockerを利用しています。

### サービス

- `wp`: 開発用のWordPress
- `db`: 開発用のデータベース
- `wp-cli`: WP-CLI、Composer、およびテストを実行するためのツール

### セットアップ

1. サンプルのDocker Compose設定をコピーします:
    ```sh
    cp docker-compose.sample.yml docker-compose.yml
    ```

2. Dockerコンテナを起動します:
    ```sh
    docker compose up -d
    ```

3. ローカル環境を初期化するために、以下のコマンドを一度実行します（WordPress、WooCommerce、およびUnivapayプラグインのインストール）:
    ```sh
    docker compose run --rm wp-cli composer install
    docker compose run --rm wp-cli composer init-local
    ```

## テスト

`wp-cli`サービスはテストに使用されます。これは一時的な環境をセットアップし、必要なWordPressファイルとプラグインをコピーし、WP-CLIで全てをマウントします。

### テストの実行
テストを実行します:
```sh
docker compose run --rm wp-cli composer test