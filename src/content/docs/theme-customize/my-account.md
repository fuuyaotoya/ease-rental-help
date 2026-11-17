---
title: 'マイアカウント'
description: 'お客様のマイアカウント画面と、テーマエディタで確認できるページの案内'
sidebar:
  order: 10
---

# マイアカウント

![マイアカウント](/images/theme-customize/my-account-overview.png)

マイアカウントでは、お客様がレンタル伝票、未払い、全履歴、配送先、請求先、登録情報を確認します。実際の操作と表示条件は [顧客マイページ（お客様向け）](/customer-mypage/) を確認してください。

## テーマエディタで開くには

1. Shopify管理画面の **オンラインストア** > **テーマ** を開きます。
2. **カスタマイズ** を押します。
3. ページセレクターの **その他** > **顧客アカウント** から確認したいページを選びます。

## 主なページ

| ページ | 内容 |
|--------|------|
| アカウント画面 | 貸出予定、未払い、全履歴、配送先管理、請求先管理、アカウント詳細 |
| 注文詳細 | 注文ごとの詳細 |
| 住所一覧 | Shopifyの住所管理。登録できる住所は1件です |
| ログイン | ログインフォーム |
| 新規登録 | アカウント登録フォーム |
| パスワードリセット | パスワード再設定 |

マイアカウントの業務機能はテーマエディタから変更できません。表示や動作を変える場合は開発担当へ依頼してください。

:::dev
テンプレートは `customers/account.json`、`customers/order.json`、`customers/addresses.json`、`customers/login.json`、`customers/register.json`、`customers/reset.json` です。

レンタル予約は `customer-rental-bookings`、配送キャンセル料は `customer-unpaid-fees`、配送先は `customer-account-shipping`、請求先は `customer-account-billing` が表示します。

予約内容の変更ページは `/pages/rental-edit?slip={伝票番号}` です。取得・商品削除・期間変更・キャンセル料試算はバックエンドで再判定します。
:::
