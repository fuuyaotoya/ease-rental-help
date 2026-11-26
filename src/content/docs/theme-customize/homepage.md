---
title: 'トップページ（Homepage）'
description: 'EASE公式サイトのトップページで、画像・ニュース・お問い合わせを変更する方法'
sidebar:
  order: 1
---

# トップページ（Homepage）

![トップページ全体](/images/theme-customize/homepage-overview.png)

トップページには、メイン画像、サービス紹介、ニュース、お問い合わせを表示します。

## テーマエディタで開くには

1. Shopify管理画面の **オンラインストア** > **テーマ** を開きます。
2. **カスタマイズ** を押します。
3. ページセレクターで **ホームページ** を選びます。

## メイン画像を変更する

1. **ヒーローセクション分割**を開きます。
2. 変更したい **ヒーロースライド**を選びます。
3. **スライド画像 / Slide Image**を選び直します。
4. **保存**を押します。

## サービス紹介を変更する

1. **ヒーローセクション分割**を開きます。
2. Rental、Studio、Creativeのうち、変更したい **サービスブロック**を選びます。
3. **説明文 / Description**や**特徴リスト / Features List**を変更します。
4. **保存**を押します。

「特徴リスト / Features List」は「|」で区切ると、別々の項目として表示されます。

## ニュースを変更する

ニュース記事の追加・編集は、Shopify管理画面の **コンテンツ** > **ブログ記事** から行います。

表示するカテゴリを追加するときは、次の手順で操作します。

1. **ニュースセクション**を開きます。
2. **ブロックを追加** > **Category Filter**を選びます。
3. **カテゴリ名 / Category Name**と**カテゴリスラッグ / Category Slug**を入力します。カテゴリスラッグはブログ記事のタグとそろえてください。
4. **保存**を押します。

## 電話番号を変更する

1. **コンタクトセクション**を開きます。
2. 「簡易連絡先設定 / Quick Contact Settings」で、スタジオ・撮影またはレンタルの「電話番号 / Phone Number」を変更します。
3. 必要に応じて、同じ連絡先の「営業時間 / Business Hours」を変更します。
4. **保存**を押します。

## 注意事項

- デスクトップとモバイルで表示を確認してください。
- セクションを並べ替えると、トップページ全体の順番が変わります。
- Rental、Studio、Creativeのサービス紹介は3つで構成されています。

:::dev
セクションは `hero-section-split`、`news-section`、`contact-section` です。主な内部IDは `slide_image`、`block_description`、`block_features`、`category_name`、`category_slug`、`studio_phone_number`、`rental_phone_number` です。
:::
