---
title: 'スタジオページ'
description: 'スタジオ各ページ（目黒7スタジオ・世田谷5スタジオ）のテーマエディタ設定。全スタジオ共通のセクション構造と編集方法'
sidebar:
  order: 4
---

# スタジオページ

![スタジオページ](/images/theme-customize/studio-overview.png)

スタジオページは目黒エリア（7スタジオ）と世田谷エリア（5スタジオ）の各スタジオ詳細ページです。**全12スタジオが同じセクション構造**（`studio-page-content`）を使用しており、編集方法も共通です。

---

## テーマエディタで開くには

1. Shopify管理画面 > **オンラインストア** > **テーマ** > **カスタマイズ**
2. ページセレクターで **ページ** を選択
3. 編集したいスタジオページを選択（例：meguro-church）

---

## スタジオ一覧

### 目黒（MEGURO）エリア

| スタジオ | ページ | 主な特徴 |
|---------|--------|---------|
| PARIS MANSION 301 | `/pages/meguro-paris-mansion301` | パリマンション風のアパートメント |
| GROUND LIBRARY | `/pages/meguro-ground-library` | 吹き抜け本棚の図書館スタイル |
| NY FACTORY | `/pages/meguro-ny-factory` | ニューヨーク風の工場 |
| OLD AVENUE | `/pages/meguro-old-avenue` | 古い通りを再現したストリート |
| E-PARK | `/pages/meguro-e-park` | 屋外オープンスペース |
| PARIS STREET | `/pages/meguro-paris-street` | パリ風ストリート |
| 教会 | `/pages/meguro-church` | オプション：教会セット |

### 世田谷（SETAGAYA）エリア

| スタジオ | ページ | 主な特徴 |
|---------|--------|---------|
| 1F LOUNGE | `/pages/setagaya-1f-lounge` | ラウンジ空間 |
| 3F SALON | `/pages/setagaya-3f-salon` | サロン |
| 4F ATELIER | `/pages/setagaya-4f-atelier` | アトリエ |
| CAFE | `/pages/setagaya-cafe` | カフェスペース |
| ROOFTOP | `/pages/setagaya-roof-top` | 屋上（オプション） |

---

## セクション構成（全スタジオ共通）

スタジオページは1つのセクション `studio-page-content` で構成され、以下のブロックが含まれます：

| ブロック | タイプ | 役割 |
|---------|--------|------|
| ナビゲーション | `nav` | エリア内スタジオ一覧のタブナビ |
| ヒーロー | `hero` | スタジオメイン画像 + 紹介文 + 特徴 |
| スペック | `spec_floor` | 広さ・利用時間・電源等の仕様表 + 平面図 |
| ギャラリー | `gallery` | ギャラリーセクション見出し |
| ギャラリー画像 | `gallery_image` | 各写真（複数枚） |
| 料金 | `price` | 料金表示 + CTAボタン |
| オプション | `option_spaces` | 追加スペース・オプション |
| アクセス | `location` | 住所・交通・Googleマップ |
| お問い合わせ | `contact` | 電話番号・問い合わせフォーム |

---

## 各ブロックの設定項目

### ナビゲーション（nav）

エリア内の全スタジオへのリンクを表示します。現在のスタジオに `nav_X_current: true` を設定します。

| 設定 | 説明 |
|-----|------|
| `area_label` | エリア名（例：目黒 - MEGURO -） |
| `event_badge` | イベント利用バッジテキスト |
| `pricing_label` / `pricing_url` | 料金一覧リンク |
| `nav_1_label` 〜 `nav_8_label` | スタジオ名（8スロット） |
| `nav_1_url` 〜 `nav_8_url` | スタジオページURL |
| `nav_1_current` 〜 `nav_8_current` | 現在のスタジオに `true` |

> ⚠️ **重要:** スタジオを追加・削除した場合、**同じエリアの全スタジオのnavブロックを更新**する必要があります。

---

### ヒーロー（hero）

| 設定 | 説明 |
|-----|------|
| `title` | タイトル（空の場合あり） |
| `lead` | スタジオ紹介文 |
| `image` | メイン画像 |
| `feature_1` 〜 `feature_5` | 特徴テキスト（最大5つ） |

---

### スペック（spec_floor）

| 設定 | 説明 |
|-----|------|
| `spec_1_label` / `spec_1_value` 〜 `spec_10` | スペック項目（最大10組） |
| `floor_map` | 平面図画像 |
| `floor_map_url` | 平面図のリンク先 |
| `floor_map_alt` | 平面図のaltテキスト |

---

### ギャラリー画像（gallery_image）

ギャラリーブロック（見出し）の後に、`gallery_image` ブロックを必要な枚数だけ追加します。

| 設定 | 説明 |
|-----|------|
| `image` | ギャラリー画像 |
| `image_url` | 画像クリック時のリンク（拡大表示用） |
| `alt` | 代替テキスト |

---

### 料金（price）

| 設定 | 説明 |
|-----|------|
| `lead` | 料金の前提条件テキスト |
| `price_text` | メイン料金表示 |
| `options` | 料金オプション（`|` 区切りで `プラン名|料金` 形式） |
| `note` | 注記 |
| `cta_1_label` / `cta_1_url` / `cta_1_style` | CTAボタン1（primary/secondary） |
| `cta_2_label` / `cta_2_url` / `cta_2_style` | CTAボタン2 |

> 💡 **ヒント:** `options` の形式は `プラン名|料金` を `\n` 区切りで入力します。例：`単体：通常| ¥16,500/H\n単体：時間外| ¥19,800/H`

---

### アクセス（location）

| 設定 | 説明 |
|-----|------|
| `address` | 住所（改行OK） |
| `train_title` / `train_text` | 電車でのアクセス |
| `car_title` / `car_text` | 車でのアクセス |
| `map_url` | Googleマップ埋め込みURL |

---

### お問い合わせ（contact）

| 設定 | 説明 |
|-----|------|
| `anchor_id` | ページ内リンク用ID（例：contact） |
| `description` | 問い合わせ説明文 |
| `phone_label` / `phone_link` | 電話番号 |
| `inquiry_label` / `inquiry_link` | お問い合わせフォーム |
| `note` | 受付時間等の注記 |

---

## よくある修正パターン

### スタジオの紹介文を変更する

1. テーマエディタで該当スタジオページを開く
2. `studio-page-content` セクション内の **hero** ブロックをクリック
3. `lead` を編集
4. **保存**

### ギャラリー画像を追加する

1. テーマエディタで該当スタジオページを開く
2. `studio-page-content` セクションで **ブロックを追加** > `gallery_image` を選択
3. `image` に画像をアップロード
4. `image_url` にも同じ画像を設定（ライトボックス用）
5. `alt` に説明テキストを入力
6. ブロックをドラッグして適切な位置に移動
7. **保存**

### 料金を変更する

1. テーマエディタで該当スタジオページを開く
2. `studio-page-content` セクション内の **price** ブロックをクリック
3. `price_text` や `options` を変更
4. **保存**

### 新しいスタジオを追加する

1. [Shopify管理画面 > ページ](https://admin.shopify.com/store/ease-site/pages) で新規ページを作成
2. ページテンプレートに既存スタジオと同じテンプレート（例：`page.meguro-studio-church`）を割り当てる
3. テーマエディタで各ブロック（nav, hero, spec_floor 等）の内容を新スタジオ用に変更
4. **同じエリアの他スタジオのnavブロックにも新スタジオを追加**する
5. [スタジオ料金一覧](/theme-customize/studio-pricing/) ページにも追加

---

## 注意事項

- 全スタジオが**同じセクションタイプ**（`studio-page-content`）を使っています。ブロック構成は同じでも、各スタジオで設定値が異なります
- **navブロックの相互リンク**は手動で管理されています。新しいスタジオを追加したら、同じエリアの全スタジオのnavを更新してください
- ギャラリー画像は**高解像度**（推奨2000px以上の幅）でアップロードしてください
- `spec_floor` のスペック項目は使わない行は空欄にしてください
