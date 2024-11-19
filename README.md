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

2. 初期設定を行います:
```sh
docker compose exec wp /bin/bash -c "cd /var/www/html/wp-content/plugins/UnivaPay-for-WooCommerce && composer init:local"
```

3. ホットリロードモジュールを起動したい場合:
```sh
docker compose exec wp bash
cd /var/www/html/wp-content/plugins/UnivaPay-for-WooCommerce
npm run start
```

### テスト

#### ユニットテスト

事前準備：
- 開発環境のセットアップの2番目の手順を実行終了後

テストを実行するコマンド:

```sh
docker compose exec wp /bin/bash -c "cd /var/www/html/wp-content/plugins/UnivaPay-for-WooCommerce && composer test"
```

#### E2Eテスト

事前準備：
- 開発環境のセットアップの2番目の手順を実行終了後
- Univapayのステージングアカウントを設定し、[.env](./.env.e2e)ファイルを参照してホスト環境にエクスポートし、以下のコマンドを実行します

テストを実行するコマンド:

```sh
# for block checkout
docker compose exec wp /bin/bash -c "cd /var/www/html/wp-content/plugins/UnivaPay-for-WooCommerce && composer init:e2e && npm run test:e2e:block"
# for classic checkout
docker compose exec wp /bin/bash -c "cd /var/www/html/wp-content/plugins/UnivaPay-for-WooCommerce && composer init:e2e && ./bin/wc-checkout-change-layout.sh && npm run test:e2e:classic"
```
