---
title: 'レンタルトップ'
description: 'レンタルトップページのテーマエディタ設定。スライダー・カテゴリ別商品グリッド・おすすめ商品カルーセルのカスタマイズ'
sidebar:
  order: 8
---

# レンタルトップ

![レンタルトップ](/images/theme-customize/rental-top-overview.png)

レンタルトップページは `/pages/rental-top` に表示される、レンタルサービスの専用トップページです。`home-builder` セクションを使った柔軟なレイアウト構成が特徴です。

---

## テーマエディタで開くには

1. Shopify管理画面 > **オンラインストア** > **テーマ** > **カスタマイズ**
2. ページセレクターで **ページ** を選択
3. **レンタルトップ** ページを選択

---

## セクション構成

このページは `home-builder` セクションを中心に構成されています。

| セクション | セクション名（type） | 役割 |
|-----------|---------------------|------|
| メインビルダー | `home-builder` | スライダー + カテゴリグリッド + 検索フォーム等 |
| レンタルカテゴリ | `rental-categories` | カテゴリ別商品表示 |
| レンタル展示グリッド | `rental-display-grid` | 展示用商品グリッド |
| おすすめ商品 | `carousel-recommend` | おすすめ商品カルーセル |
| 記事カルーセル | `carousel-articles` | 関連記事カルーセル |
| スペーサー | `spacer` | セクション間の余白 |

---

## home-builder セクション

`home-builder` は複数のブロックを組み合わせて自由にレイアウトできるセクションです。

### 主なブロックタイプ

| ブロックタイプ | 役割 |
|-------------|------|
| `slick_slider` | スライダーコンテナ（設定：高さ・幅・速度等） |
| `slick_slide` | スライド1枚（画像・テキスト・ボタン・動画） |
| `category` | カテゴリタブ（フィルター用） |
| `display_item` | 表示アイテム |
| `brand` | ブランドバナー |

### スライド（slick_slide）の主な設定

| 設定 | 説明 |
|-----|------|
| `image` / `image_mobile` | PC用・モバイル用画像 |
| `text_line_1` / `text_line_2` / `text_line_3` | テキスト行 |
| `button_1` / `button_1_url` | ボタン1 |
| `video_external_url` / `video_mp4_url` | 動画（外部URL or MP4） |
| `style` | スライドスタイル |
| `content_position` / `content_align` | コンテンツ配置 |

---

## レンタルカテゴリセクション（rental-categories）

カテゴリ別に商品をタブ表示します。

---

## おすすめ商品（carousel-recommend）

関連商品をカルーセル表示します。

| 設定 | 説明 | 現在の値 |
|-----|------|---------|
| `type` | 取得方法 | recommendations |
| `size_of_columns` | 列数 | 4 |
| `max_count` | 最大表示数 | 6 |
| `autoplay` / `speed` | 自動スライド | オン / 5秒 |

---

## よくある修正パターン

### スライド画像を変更する

1. `home-builder` セクション内の該当 `slick_slide` ブロックをクリック
2. `image`（PC用）と `image_mobile`（モバイル用）を変更
3. **保存**

### カテゴリを追加・変更する

1. `home-builder` セクション内の `category` ブロックを確認
2. カテゴリ名や紐付けを変更
3. **保存**

### おすすめ商品の表示数を変更する

1. `carousel-recommend` セクションをクリック
2. `max_count` を変更
3. **保存**

---

## 注意事項

- `home-builder` セクションは**最もブロック数が多い**テンプレートです。ブロックの追加・削除・並べ替えで大きく見た目が変わるため、慎重に操作してください
- スライド画像は**PC用とモバイル用で別々に設定**できます。両方アップロードすることを推奨します
- レンタルカテゴリに表示する商品は、[Shopify管理画面 > 商品](https://admin.shopify.com/store/ease-site/products) でコレクションに属するように設定します
