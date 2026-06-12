---
title: 'About / 会社情報'
description: 'About会社情報ページのテーマエディタ設定。フィロソフィー・ストーリー・事業内容・データ・会社概要セクション'
sidebar:
  order: 7
---

# About / 会社情報

![Aboutページ](/images/theme-customize/about-overview.png)

会社情報ページはEASEの企業紹介ページです。8つのセクションで構成されています。

---

## テーマエディタで開くには

1. Shopify管理画面 > **オンラインストア** > **テーマ** > **カスタマイズ**
2. ページセレクターで **ページ** を選択
3. **About** ページを選択

---

## セクション構成

| セクション | セクション名（type） | 役割 | 状態 |
|-----------|---------------------|------|------|
| ヒーロー | `about-hero` | メインビジュアル + タグライン | **非表示** |
| フィロソフィー | `about-philosophy` | We connect. 理念 | 表示 |
| ストーリー | `about-story` | Props / Space / Creative 3つのコラム | 表示 |
| 事業内容 | `about-features` | 6つの事業カテゴリ | 表示 |
| EASEデータ | `about-ease-data` | 会社の数字データ（3グループ） | 表示 |
| エリアコネクト | `about-area-connect` | 地域連携イベント | **非表示** |
| スペース紹介 | `about-spaces` | 6つの空間紹介 | **非表示** |
| 会社概要 | `about-company` | 2社の会社情報 | 表示 |
| CTA | `ease-creative-cta` | お問い合わせCTA | 表示 |

---

## 各セクションの設定項目

### フィロソフィー（about-philosophy）

| 設定 | 説明 | 現在の値 |
|-----|------|---------|
| `label` | ラベル | PHILOSOPHY |
| `title` | タイトル | We connect. |
| `text` | 説明文 | 私たちは撮影スタジオの運営… |
| `highlight` | ハイライトテキスト | （空） |
| `image` | 背景画像 | DSC_8380Aaa.jpg |

### ストーリー（about-story）

3つのコラム（Props / Space / Creative）を表示します。

| 設定 | 説明 |
|-----|------|
| `section_title` | セクション見出し |
| `story_X_year` / `story_X_title` / `story_X_text` | 各コラムの年・タイトル・テキスト |
| `story_X_image_1` / `image_2` / `image_3` | 各コラムの画像（3枚ずつ） |

### 事業内容（about-features）

6つの事業カテゴリを表示します。

| 設定 | 説明 |
|-----|------|
| `section_title` / `section_subtitle` | セクション見出し |
| `feature_X_icon` | アイコン名（Material Icons） |
| `feature_X_title` | 事業名 |
| `feature_X_description` | 説明文 |

### EASEデータ（about-ease-data）

統計データをグループ表示します。`stat_group` ブロックで構成されます。

| ブロック設定 | 説明 |
|------------|------|
| `group_title` | グループ名 |
| `stat_count` | 項目数 |
| `stat_X_number` / `stat_X_suffix` / `stat_X_label` | 各数字データ |

### 会社概要（about-company）

| 設定 | 説明 |
|-----|------|
| `company_1_name` 〜 `company_1_business` | 会社1の情報 |
| `company_2_name` 〜 `company_2_business` | 会社2の情報 |
| `common_gender_ratio` / `common_vacation` / `common_parental_leave` | 共通情報 |
| `map_embed_code` | Googleマップ埋め込みコード |

---

## よくある修正パターン

### 会社の電話番号・住所を変更する

1. **会社概要** セクションをクリック
2. `company_X_phone` や `company_X_address` を変更
3. **保存**

### 事業内容を変更する

1. **事業内容** セクションをクリック
2. `feature_X_title` や `feature_X_description` を変更
3. **保存**

### 統計データを更新する

1. **EASEデータ** セクションをクリック
2. 該当する `stat_group` ブロックをクリック
3. `stat_X_number` 等を変更
4. **保存**

---

## 注意事項

- **ヒーロー**、**エリアコネクト**、**スペース紹介** セクションは現在**非表示**です。表示するには 👁 アイコンをクリックしてください
- EASEデータの `stat_count` は表示する項目数です。それ以下の項目は空欄にしてください
- 会社概要は2社（ペンコミュニケーション・ピーセス）の情報を表示します
