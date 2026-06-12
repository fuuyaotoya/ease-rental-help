---
title: 'カートページ'
description: 'カートページの構成概要。レンタル専用カートセクション（main-cart-rental）の開発者向け情報'
sidebar:
  order: 9
---

# カートページ

![カートページ](/images/theme-customize/cart-overview.png)

カートページはレンタル専用のカスタムセクション（`main-cart-rental`）で構成されています。通常のShopifyカートではなく、レンタル期間選択・配送先設定・展示会モードなどレンタル業務に特化した機能を含みます。

---

## テーマエディタで開くには

1. Shopify管理画面 > **オンラインストア** > **テーマ** > **カスタマイズ**
2. ページセレクターで **カート** を選択

---

## セクション構成

| セクション | セクション名（type） | 役割 |
|-----------|---------------------|------|
| レンタルカート | `main-cart-rental` | レンタル専用カートUI |
| スペーサー | `spacer` | 余白 |

---

## main-cart-rental の主な機能

- カート内商品の一覧表示
- レンタル期間の選択・変更
- 配送先（搬入・搬出）住所の設定
- 展示会モードの切替
- 顧客タイプの切替（法人 / 個人）
- 合計金額の表示
- チェックアウトへの遷移ボタン

> ⚠️ **注意:** カートページの機能の多くはJavaScript（Custom Elements）で動的に制御されています。テーマエディタで変更できる設定項目は限定的です。大きな変更には開発者のサポートが必要です。

---

## 開発者向け情報

:::dev
カートページのテンプレートは `templates/cart.json` です。`main-cart-rental` セクションのJSは `assets/cart-rental-main.js` 等にあります。

在庫ガード（inventory-guard）機能により、カート追加前に在庫チェックが行われます。詳細は [inventory-guard ルール](/theme-customize/product/) を参照してください。

カート関連の主要JSファイル：
- `cart-rental-main.js` — カート全体のロジック
- `cart-variant-manager.js` — カート内バリアント切替
- `bulk-cart-add.js` — 一括カート追加
:::

---

## 関連ページ

- [商品ページ](/theme-customize/product/) — カートに追加する元のページ
- [コレクションページ](/theme-customize/collection/) — 一括カート追加機能
