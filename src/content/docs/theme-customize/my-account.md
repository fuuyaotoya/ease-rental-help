---
title: 'マイアカウント'
description: 'マイアカウントページの構成概要。開発者向けの標準Shopifyテンプレート情報'
sidebar:
  order: 10
---

# マイアカウント

![マイアカウント](/images/theme-customize/my-account-overview.png)

マイアカウントページはShopifyの標準顧客アカウントテンプレートを使用しています。注文履歴、住所管理、アカウント設定などの機能を提供します。

---

## テーマエディタで開くには

1. Shopify管理画面 > **オンラインストア** > **テーマ** > **カスタマイズ**
2. ページセレクターで **その他** > **顧客アカウント** 配下のページを選択

---

## ページ一覧

| ページ | テンプレート | 役割 |
|--------|------------|------|
| アカウント画面 | `customers/account.json` | 6タブ構成（貸出予定 / 未払い / 全履歴 / 配送先管理 / 請求先管理 / アカウント詳細・Issue #605） |
| 注文詳細 | `customers/order.json` | 個別注文の詳細 |
| 住所一覧 | `customers/addresses.json` | 住所管理（1件制・実住所≥1件で追加ボタンと新規フォーム非表示・「住所の登録は1件までです」の案内）。※配送先(5件)・請求先(15件)は別系統で対象外 |
| ログイン | `customers/login.json` | ログインフォーム |
| 新規登録 | `customers/register.json` | アカウント登録 |
| パスワードリセット | `customers/reset.json` | パスワード再設定 |

---

## 使用セクション

| セクション | 説明 |
|-----------|------|
| `main-account` | アカウント画面（6タブ構成・Issue #605）。タブ内で各 snippet を `render`: `customer-rental-bookings`（貸出予定/全履歴）・`customer-unpaid-fees`（未払い）・`customer-account-shipping`（配送先管理）・`customer-account-billing`（請求先管理）・`customer-account-profile`（アカウント詳細）※これらは snippet であり section ではない |
| `main-order` | 注文詳細 |
| `main-addresses` | 住所管理 |
| `main-login` | ログインフォーム |
| `main-register` | 新規登録フォーム |
| `main-rental-edit` | レンタル予約内容の変更（商品の期間変更・削除・キャンセル料試算・Issue #2259 / Theme #569） |

---

## 開発者向け情報

:::dev
マイアカウントページはShopifyの標準Dawnテンプレートをベースにしています。レンタル予約状況の表示など、カスタム機能はLiquidとJavaScriptで追加実装されています。

予約ステータスの表示条件：
- アカウント画面は6タブ構成（貸出予定 / 未払い / 全履歴 / 配送先管理 / 請求先管理 / アカウント詳細・Issue #605）
- 各伝票にはステータスバッジを付与（Issue #609）。実装の `STATUS_LABELS_S075` は7状態: 仮予約 / 予約確定 / レンタル中 / 返却済み（精算中） / お支払い待ち / 完了 / キャンセル（`PROCESSING` を貸出開始日で「予約確定/レンタル中」に2分割）
- 詳細はテーマの `sections/main-account.liquid` および `snippets/customer-rental-bookings.liquid`（`STATUS_LABELS_S075` / `getStatusClass`）を参照

**レンタル予約の編集機能（Issue #2259 / Theme #569）:**

決済前のレンタル予約については、顧客がマイページから内容を変更できる専用ページ（`/pages/rental-edit?slip={伝票番号}`）を提供しています。`sections/main-rental-edit.liquid` + `assets/rental-edit-page.js` が以下のバックエンドAPIを呼び出します:

- 予約内容の取得（B1: `GET /bookings/by-slip`）
- 商品の削除・期間変更（B2: `DELETE` / `PATCH /bookings/:id/items/:itemId`）
- キャンセル料の試算（B3: `POST /bookings/:id/items/:itemId/cancellation-fee/estimate`）

> ※決済後（クレカ決済済み）の伝票では編集できません。
> ※商品の**追加**（Issue #2265）はバックエンドAPI側で対応済みですが、テーマ側のUIは未実装です（将来拡張）。
:::

---

## 注意事項

- マイアカウントの大部分は**Shopify標準機能**です。テーマエディタで変更できる項目は限定的です
- 注文履歴や住所の管理はShopifyのシステムで制御されています
- カスタマイズが必要な場合は開発者に相談してください
