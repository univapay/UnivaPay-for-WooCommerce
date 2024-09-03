# UnivaPay-for-WooCommerce
WooCommerce用のUnivaPay導入プラグイン

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

[WordPressおよびWooCommerceに関する情報](./UnivaPay-for-WooCommerce/readme.txt)

## 環境

このプロジェクトは開発環境としてDockerを利用しています。

### 開発環境のセットアップ

1. Dockerコンテナを起動します:
    ```sh
    docker compose up -d
    ```

2. コンテナに入ります:
    ```sh
    docker compose exec wp bash
    ```

3. 初期設定を行います:
    ```sh
    cd /var/www/html/wp-content/plugins/UnivaPay-for-WooCommerce
    composer init-local
    npm run start
    ```

### テスト

テストを実行する方法:
```sh
composer test
```
