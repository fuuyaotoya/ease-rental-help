---
title: '展示会ページ'
description: '展示会ページのテーマエディタ設定。ヒーロー・サービス紹介・スタイリングギャラリー・申し込みフォームのカスタマイズ'
sidebar:
  order: 6
---

# 展示会ページ

![展示会ページ](/images/theme-customize/exhibition-overview.png)

展示会ページはEASEの展示会向けレンタルサービスを紹介するページです。サービス内容、スタイリング事例ギャラリー、展示会申し込みフォームを表示します。

---

## テーマエディタで開くには

1. Shopify管理画面 > **オンラインストア** > **テーマ** > **カスタマイズ**
2. ページセレクターで **ページ** を選択
3. **Exhibition**（展示会）ページを選択

---

## セクション構成

ページは1つのセクション `page-exhibition` で構成され、以下のブロックが含まれます：

| ブロックタイプ | 役割 | 状態 |
|-------------|------|------|
| `hero` | 展示会ヒーロー画像 + タイトル + 説明 | 表示 |
| `introduction` | サービス紹介文 + 画像 | 表示 |
| `services` | 提供サービス（家具レンタル / 搬入搬出 / スタイリング） | 表示 |
| `styling_gallery` | スタイリング事例ギャラリー（2つ） | 表示 |
| `application_form` | 展示会申し込み用紙（展示会一覧リンク付き） | 表示 |
| `product_grid` | おすすめ商品 | **非表示** |
| `process` | 展示会フロー（4ステップ） | 表示 |
| `cta` | お問い合わせCTA | 表示 |

---

## 各ブロックの設定項目

### ヒーロー（hero）

| 設定 | 説明 |
|-----|------|
| `background_image` | 背景画像 |
| `subtitle` | サブタイトル（例：EXHIBITION） |
| `title` | タイトル |
| `description` | 説明文（HTML可） |

### サービス（services）

3つのサービス（家具レンタル / 搬入搬出 / スタイリング）を表示します。

| 設定 | 説明 |
|-----|------|
| `service_X_icon` | サービスアイコン（SVG） |
| `service_X_title` | サービスタイトル |
| `service_X_description` | サービス説明文 |

### スタイリングギャラリー（styling_gallery）

コレクションを指定して商品画像をギャラリー表示します。最大20コレクションまで指定可能。

| 設定 | 説明 |
|-----|------|
| `heading` | ギャラリー見出し |
| `collection_1` 〜 `collection_20` | 表示するコレクションのhandle |

### 申し込みフォーム（application_form）

展示会ごとの申し込みリンクを一覧表示します。

| 設定 | 説明 |
|-----|------|
| `heading` / `description` | セクション見出し・説明 |
| `download_label` / `download_link` | 申込書ダウンロードボタン |
| `online_label` / `online_link` | オンライン申し込みボタン |
| `item_count` | 展示会数 |
| `item_X_title` / `item_X_link` / `item_X_image` | 各展示会の情報 |

### プロセス（process）

展示会までの流れをステップ表示します。

| 設定 | 説明 |
|-----|------|
| `heading` / `description` | セクション見出し |
| `step_count` | ステップ数 |
| `step_X_title` / `step_X_body` | 各ステップのタイトル・説明 |

---

## よくある修正パターン

### 展示会を追加する

1. `application_form` ブロックをクリック
2. `item_count` を増やす
3. 新しい `item_X_title`、`item_X_link`、`item_X_image` を入力
4. **保存**

### スタイリング事例を変更する

1. `styling_gallery` ブロックをクリック
2. `collection_X` に表示したいコレクションのhandleを入力
3. 不要なコレクションは空欄にする
4. **保存**

### ヒーローの説明文を変更する

1. `hero` ブロックをクリック
2. `description` を編集（HTMLタグ使用可）
3. **保存**

---

## 注意事項

- スタイリングギャラリーの `collection_X` には**コレクションのhandle**を入力します（コレクション名ではありません）
- `product_grid` ブロックは現在**非表示**になっています。表示するにはブロックの 👁 アイコンをクリックしてください
- 展示会ページ自体は [Shopify管理画面 > ページ](https://admin.shopify.com/store/ease-site/pages) で作成し、テンプレートに `page.exhibition` を割り当てます
