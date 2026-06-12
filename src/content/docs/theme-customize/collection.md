---
title: 'コレクションページ'
description: 'コレクション（商品一覧）ページのテーマエディタ設定。見出し・フィルター・商品グリッドのカスタマイズ'
sidebar:
  order: 2
---

# コレクションページ

![コレクションページ](/images/theme-customize/collection-overview.png)

コレクションページは商品を一覧表示するページです。フィルター機能でサイズ・在庫数などで絞り込みができます。

---

## テーマエディタで開くには

1. Shopify管理画面 > **オンラインストア** > **テーマ** > **カスタマイズ**
2. ページセレクターで **コレクション** を選択
3. 編集したいコレクション（例：All）を選択

> 💡 **ヒント:** コレクションごとにテンプレートが異なる場合があります。現在以下のテンプレートがあります：
> - `collection.json` — 標準コレクション
> - `collection.rental-display.json` — レンタル展示用
> - `collection.exhibition-styling.json` — 展示会スタイリング用
> - `collection.props.json` — 小道具用

---

## セクション構成

| セクション | セクション名（type） | 役割 |
|-----------|---------------------|------|
| ページ見出し | `collection-page-heading` | コレクション名の表示 |
| レンタル期間フィルター | `apps`（app block） | 日付でレンタル可能商品を絞り込み（現在無効） |
| 商品グリッド | `main-collection-product-grid` | 商品一覧表示 + フィルターサイドバー |

---

## 各セクションの設定項目

### ページ見出し（collection-page-heading）

コレクション名の表示位置や余白を設定します。

| 設定 | 説明 | 現在の値 |
|-----|------|---------|
| `position` | 見出しの配置 | products_grid_width |
| `default_desktop_title` | デスクトップ表示 | title（コレクション名） |
| `default_mobile_title` | モバイル表示 | title |
| `margins_for_columns` | カラム間余白 | none |
| `disable_column_paddings` | カラムパディング無効 | オフ |

---

### 商品グリッド（main-collection-product-grid）

商品一覧の表示方法と、サイドバーのフィルターを設定します。

#### ブロック一覧（フィルター）

| ブロックタイプ | 設定項目 | 説明 |
|-------------|---------|------|
| `collections` | `title` / `menu` | コレクション一覧（リンクメニュー） |
| `current_filters` | `title` | 現在使用中のフィルター表示 |
| `filters` | `default_state` / `layout` | 標準フィルター（価格・色等） |
| `size_range_filter` | `title` / `default_state` | サイズ範囲フィルター |
| `inventory_filter` | `title` / `default_state` | 在庫数フィルター |

#### セクション共通設定

| 設定 | 説明 | 現在の値 |
|-----|------|---------|
| `products_per_page` | 1ページあたりの商品数 | 12 |
| `default_view_grid_xl` | XL画面の列数 | 3 |
| `default_view_grid_md` | 中画面の列数 | 3 |
| `default_view_grid_sm` | 小画面の列数 | 2 |
| `sort_by_visibility` | 並び替え表示 | デスクトップのみ |
| `enable_grid_tooltip` | グリッドツールチップ | オン |

---

## よくある修正パターン

### 1ページあたりの商品数を変更する

1. テーマエディタで **商品グリッド** セクションをクリック
2. `products_per_page` を変更（例：12 → 24）
3. **保存**

### フィルターの初期状態を変更する

1. テーマエディタで **商品グリッド** セクションをクリック
2. 変更したいフィルターブロック（例：`size_range_filter`）をクリック
3. `default_state` を `open`（展開）または `close`（折りたたみ）に変更
4. **保存**

### コレクション一覧のメニューを変更する

1. テーマエディタで **商品グリッド** セクションをクリック
2. `collections` ブロックをクリック
3. `menu` で使用するリンクメニューを選択
   - メニュー自体は [Shopify管理画面 > オンラインストア > メニュー](https://admin.shopify.com/store/ease-site/menus) で作成します
4. **保存**

---

## 注意事項

- **レンタル期間フィルター**（日付指定）は現在**無効**になっています。有効にするには `apps` セクションを選択し、「セクションを有効にする」をオンにしてください
- 商品自体の登録・編集は [Shopify管理画面 > 商品](https://admin.shopify.com/store/ease-site/products) から行います
- フィルターの選択肢（色・サイズなど）は商品のバリアントオプションやメタフィールドに基づいて自動生成されます
- コレクションの並び順は [Shopify管理画面 > 商品 > コレクション](https://admin.shopify.com/store/ease-site/collections) で設定できます
