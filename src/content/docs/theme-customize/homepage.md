---
title: 'トップページ（Homepage）'
description: 'EASE公式サイトのトップページをテーマエディタで編集する方法。ヒーロー・ニュース・お問い合わせセクションの設定'
sidebar:
  order: 1
---

# トップページ（Homepage）

![トップページ全体](/images/theme-customize/homepage-overview.png)

トップページは3つのセクションで構成されています：
- **ヒーローセクション** — スライド画像 + 3つのサービスブロック（Rental / Studio / Creative）
- **ニュースセクション** — ニュース記事一覧（カテゴリフィルター付き）
- **お問い合わせセクション** — 3つの問い合わせカード + 電話番号・SNSリンク

---

## テーマエディタで開くには

1. Shopify管理画面 > **オンラインストア** > **テーマ** > **カスタマイズ**
2. ページセレクターで **ホームページ** を選択

---

## セクション構成

| セクション | セクション名（type） | 役割 |
|-----------|---------------------|------|
| ヒーローセクション分割 | `hero-section-split` | メインビジュアルのスライド + 3サービス紹介 |
| ニュース | `news-section` | News記事一覧（STUDIO / RENTAL / EVENT） |
| お問い合わせ | `contact-section` | 3つの連絡先カード + 電話番号・SNS |

---

## 各セクションの設定項目

### ヒーローセクション分割（hero-section-split）

全画面のスライドショーと、3つのサービス紹介ブロックを表示します。

#### ブロック一覧

| ブロックタイプ | 設定項目 | 説明 |
|-------------|---------|------|
| `hero_slide` | `slide_image` | スライド画像（4枚） |
| `service_block` | `block_title` | サービス名（Rental / Studio / Creative） |
| | `block_description` | サービスの説明文 |
| | `block_features` | 特徴を `|` 区切りで入力 |
| | `block_bg_image` | ブロック背景画像 |
| | `block_link` | ブロッククリック時のリンク先 |
| | `block_cta_text` | CTAボタンテキスト |

#### セクション共通設定

| 設定 | 説明 | 現在の値 |
|-----|------|---------|
| `autoplay` | スライド自動再生 | オン |
| `slide_interval` | スライド間隔（ミリ秒） | 5000 |
| `brand_logo` | ブランドロゴ画像 | creative-logo02.svg |
| `brand_tagline` | ブランドタグライン | we connect. |

---

### ニュースセクション（news-section）

ブログ「news-1」から記事を一覧表示します。

#### ブロック一覧（カテゴリフィルター）

| ブロックタイプ | 設定項目 | 説明 |
|-------------|---------|------|
| `category_filter` | `category_name` | カテゴリ表示名（例：STUDIO） |
| | `category_slug` | カテゴリslug（例：studio） |

#### セクション共通設定

| 設定 | 説明 | 現在の値 |
|-----|------|---------|
| `heading` | セクション見出し | News |
| `subheading` | セクション小見出し | 最新情報をお届けします |
| `blog` | 表示元ブログ | news-1 |
| `article_limit` | 表示記事数 | 6 |
| `empty_state_text` | 記事がない場合のテキスト | 記事がありません / No articles found |
| `show_view_all` | 「View All」リンク表示 | オン |
| `view_all_text` | 「View All」のテキスト | View All News |
| `padding_top` / `padding_bottom` | 上下余白 | 80px |
| `section_background` | 背景色 | #ffffff |
| `section_text_color` | テキスト色 | #000000 |

---

### お問い合わせセクション（contact-section）

3つの問い合わせカードと、電話番号・SNS情報を表示します。

#### ブロック一覧（問い合わせカード）

| ブロックタイプ | 設定項目 | 説明 |
|-------------|---------|------|
| `contact_card` | `block_title` | カードタイトル（レンタル利用 / スタジオ見学・予約 / 撮影・スタイリング依頼） |
| | `block_description` | カード説明文 |
| | `block_show_details` | 詳細表示 | オン |
| | `block_detail_primary` | 詳細テキスト1 |
| | `block_detail_secondary` | 詳細テキスト2 |
| | `block_cta_text` / `block_cta_link` | メインCTA |
| | `block_cta_text_2` / `block_cta_link_2` | サブCTA |

#### セクション共通設定

| 設定 | 説明 |
|-----|------|
| `show_phone_numbers` | 電話番号表示 |
| `studio_phone_number` | スタジオ電話番号 |
| `studio_phone_hours` | スタジオ受付時間 |
| `rental_phone_number` | レンタル電話番号 |
| `rental_phone_hours` | レンタル受付時間 |
| `instagram_handle` | Instagramハンドル名 |
| `section_background` 〜 `focus_color` | 各種カラー設定 |

---

## よくある修正パターン

### スライド画像を変更する

1. テーマエディタ左サイドバーで **ヒーローセクション分割** をクリック
2. 変更したい `hero_slide` ブロックをクリック
3. `slide_image` の画像を選び直す
4. **保存** をクリック

### サービスブロックの説明文を変更する

1. テーマエディタ左サイドバーで **ヒーローセクション分割** をクリック
2. 変更したい `service_block`（Rental / Studio / Creative）をクリック
3. `block_description` や `block_features` を編集
4. **保存** をクリック

> 💡 **ヒント:** `block_features` は `|` で区切ると別々の特徴として表示されます。例：`ヴィンテージ家具|撮影用小道具|展示会装飾`

### ニュースのカテゴリを追加する

1. テーマエディタ左サイドバーで **ニュース** セクションをクリック
2. **ブロックを追加** > `category_filter` を選択
3. `category_name` と `category_slug` を入力
4. **保存** をクリック

### 電話番号を変更する

1. テーマエディタ左サイドバーで **お問い合わせ** セクションをクリック
2. セクション設定を開く（ブロックではなくセクション自体）
3. `studio_phone_number` や `rental_phone_number` を変更
4. **保存** をクリック

---

## 注意事項

- スライド画像は**高解像度（推奨1920×1080px以上）**でアップロードしてください
- セクションの順序を変えるには、サイドバーの **☰** をドラッグ＆ドロップします
- サービスブロック（Rental / Studio / Creative）は**3つセット**で表示されます。削除しないでください
- ニュース記事自体の作成は [Shopify管理画面 > コンテンツ > ブログ記事](https://admin.shopify.com/store/ease-site/blog_articles) から行います
