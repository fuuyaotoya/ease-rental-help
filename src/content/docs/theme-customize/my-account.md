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
| アカウント画面 | `customers/account.json` | 注文履歴一覧・アカウント情報 |
| 注文詳細 | `customers/order.json` | 個別注文の詳細 |
| 住所一覧 | `customers/addresses.json` | 配送先住所の管理 |
| ログイン | `customers/login.json` | ログインフォーム |
| 新規登録 | `customers/register.json` | アカウント登録 |
| パスワードリセット | `customers/reset.json` | パスワード再設定 |

---

## 使用セクション

| セクション | 説明 |
|-----------|------|
| `main-account` | アカウント画面（注文一覧） |
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
- `status` フィールドに基づいてタブ表示（未払い / 支払い済み 等）
- 詳細はテーマの `sections/main-account.liquid` を参照

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
