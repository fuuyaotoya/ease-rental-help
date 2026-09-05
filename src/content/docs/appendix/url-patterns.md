---
title: 'URL直接アクセスパターン集'
description: 'URL直接アクセスパターン集の操作方法と画面説明'
sidebar:
  order: 103
---


> **付録:** C
> **主題:** よく使うURLパターンとクエリパラメータ

---

## 概要

EASE Rentalシステムでよく使用されるURLパターンをまとめています。ブックマーク登録や、他システムからの直接リンク作成に活用してください。

---

## 業務フロー別URL

### 受注・伝票作成

| URL                              | 説明                     | 使用場面             |
| -------------------------------- | ------------------------ | -------------------- |
| `/booking-compact`               | 新規伝票作成（初期状態） | 通常の伝票作成開始   |
| `/booking-compact?product={sku}` | 商品を指定して伝票作成   | 商品ページからの遷移 |
| `/booking-compact?customer={id}` | 顧客を指定して伝票作成   | 顧客ページからの遷移 |
| `/booking-compact?id={id}` | 既存伝票を編集モードで開く | 伝票詳細からの直接遷移・旧URL `/bookings/{id}` からのリダイレクト |

### 伝票検索

| URL                            | 説明                 | 使用場面           |
| ------------------------------ | -------------------- | ------------------ |
| `/slip-search`                 | 伝票検索（初期状態） | 全伝票から検索     |
| `/slip-search?status={status}` | ステータスでフィルタ | 特定状態の伝票一覧 |
| `/slip-search?customer={name}` | 顧客名でフィルタ     | 特定顧客の伝票検索 |

### 予約確認

| URL                                            | 説明               | 使用場面           |
| ---------------------------------------------- | ------------------ | ------------------ |

### 出荷・配送

| URL                                | 説明                 | 使用場面             |
| ---------------------------------- | -------------------- | -------------------- |
| `/picking-delivery`                | ピッキング・出荷登録 | 出荷作業             |
| `/picking-delivery?status=pending` | ピッキング待ち一覧   | 優先出荷確認         |
| `/delivery-list`                   | 配送一覧             | 配送スケジュール確認 |
| `/delivery-list?date={yyyy-mm-dd}` | 特定日の配送一覧     | 当日配送確認         |

### 返却・金額確定

| URL                                  | 説明           | 使用場面         |
| ------------------------------------ | -------------- | ---------------- |
| `/bookings-return`                   | 返却処理トップ | 返却作業開始     |
| `/bookings-return?status=in_transit` | 返却待ち一覧   | 返却予定伝票確認 |

### 請求・入金

| URL                                  | 説明                 | 使用場面         |
| ------------------------------------ | -------------------- | ---------------- |
| `/invoice/create-new`                | 新規請求書作成       | 個別請求書作成   |
| `/invoice/create-new?booking={id}`   | 伝票指定で請求書作成 | 特定伝票の請求書 |
| `/invoices-list`                     | 請求書一覧           | 請求管理         |
| `/invoices-list?status=sent`         | 未入金請求書一覧     | 入金催促対象確認 |
| `/payment-management`                | 未入金一覧           | 入金処理         |
| `/payment-management?status=overdue` | 延滞一覧             | 延滞対応         |
| `/bulk-invoices`                     | 一括請求処理         | 月次処理         |

---

## レポート・集計

| URL                              | 説明             | 使用場面     |
| -------------------------------- | ---------------- | ------------ |
| `/aggregate-report`              | 集計表出力トップ | レポート作成 |
| `/aggregate-report?type=sales`   | 売上集計         | 月次売上確認 |
| `/aggregate-report?type=product` | 商品別集計       | 人気商品分析 |

---

## マスタ管理

| URL                                | 説明             | 使用場面       |
| ---------------------------------- | ---------------- | -------------- |
| `/customer-management`             | 顧客管理         | 顧客情報編集   |
| `/customer-management?q={keyword}` | 顧客検索         | 特定顧客の検索 |
| `/products`                        | 商品管理         | 商品マスタ編集 |
| `/products?sku={sku}`              | SKUで商品検索    | 特定商品の編集 |
| `/master-data`                     | マスタ管理トップ | 各種マスタ編集 |

---

## システム管理

| URL                       | 説明              | 対象ユーザー |
| ------------------------- | ----------------- | ------------ |
| `/products`               | 商品管理          | 管理者       |
| `/webhook-receiving`      | Webhook受信ログ   | 管理者       |
| `/my-page`                | マイページ        | 全ユーザー   |

:::dev
##### 開発者向け（Shopifyデータ管理）

| URL                       | 説明              |
| ------------------------- | ----------------- |
| `/shopify-data`           | Shopifyデータ管理 |
| `/shopify-data/customers` | Shopify顧客データ |
| `/shopify-data/orders`    | Shopify注文データ |
:::

---

## URLパターンの詳細

:::dev
##### ステータス値

URLパラメータで使用するステータス値の一覧です。

###### BookingStatus

```
PROCESSING, BILLING_PENDING, PAYMENT_PENDING, COMPLETED, CANCELLED
```

###### PaymentStatus

```
UNPAID, PARTIAL, PAID, REFUNDED, CANCELLED
```

###### InvoiceStatus

```
DRAFT, CONFIRMED, SENT, PAID, REFUNDED, CANCELLED
```

###### ShippingStatus

```
PENDING, PREPARING, IN_TRANSIT, DELIVERED, CANCELLED
```

##### 日付フォーマット

日付パラメータは ISO 8601 形式（YYYY-MM-DD）を使用します。

```
正: ?date=2026-02-21
誤: ?date=2026/02/21
誤: ?date=02-21-2026
```

##### 複数値の指定

カンマ区切りで複数の値を指定できる場合があります。

```
?skus=SKU001,SKU002,SKU003
?status=PROCESSING,BILLING_PENDING
```
:::

---

## ブックマーク推奨URL

日常業務で頻繁に使用するURLのブックマーク推奨リストです。

### 業務担当者向け

1. `/booking-compact` - 伝票作成
2. `/slip-search` - 伝票検索
3. `/picking-delivery` - ピッキング・出荷
4. `/bookings-return` - 返却処理
5. `/payment-management` - 入金処理

### 管理者向け

1. `/` - ダッシュボード（⚠️ 現在非表示）
2. `/bulk-invoices` - 一括請求処理
3. `/aggregate-report` - 集計レポート（⚠️ 現在非表示）
4. `/invoices-list` - 請求書一覧

---

## 関連資料

- [ステータス遷移図](appendix_a_status-flow.md)
- [延長料金計算ルール](appendix_b_fee-calculation.md)
- [マニュアル目次](00_index.md)
