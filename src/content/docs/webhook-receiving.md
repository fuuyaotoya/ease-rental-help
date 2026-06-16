---
title: 'Webhook受信'
description: 'Webhook受信の操作方法と画面説明'
sidebar:
  order: 91
---


:::dev
> **パス:** `/webhook-receiving`
> **区分:** 【管理者用】
:::

![Webhook受信画面](/images/webhook-receiving.png)

## 概要

ShopifyからのWebhook受信履歴を確認する画面です。システム連携の正常性確認や、トラブルシューティングに使用します。

---

## 主な機能

### Webhookログ一覧

Shopifyから受信したWebhookの履歴を表示します。

#### 表示項目
| 項目 | 説明 |
|------|------|
| 受信日時 | Webhookを受信した日時 |
| トピック | Webhookの種類（例: orders/create, products/update） |
| ステータス | 処理状態（成功/失敗/処理中） |
| ペイロード | 受信したJSONデータのプレビュー |

### フィルタ機能

- トピック別フィルタ
- ステータス別フィルタ
- 日時範囲指定

### 詳細表示

各Webhookレコードをクリックすると、詳細情報を確認できます：
- 完全なペイロード（JSON）
- 処理ログ
- エラーメッセージ（失敗時）

---

## Shopify Webhookトピック

EASE Rentalで使用する主なWebhookトピック：

### 顧客関連
| トピック | 説明 |
|---------|------|
| `customers/create` | 新規顧客作成 |
| `customers/update` | 顧客情報更新 |
| `customers/delete` | 顧客削除 |

### 商品関連
| トピック | 説明 |
|---------|------|
| `products/create` | 新規商品作成 |
| `products/update` | 商品情報更新 |
| `products/delete` | 商品削除 |

### 注文関連
| トピック | 説明 |
|---------|------|
| `draft_orders/create` | Draft Order作成 |
| `draft_orders/update` | Draft Order更新 |
| `orders/create` | 注文作成 |
| `orders/update` | 注文更新 |
| `orders/fulfilled` | 注文履行完了 |

### 履行関連
| トピック | 説明 |
|---------|------|
| `fulfillments/create` | 履行作成 |
| `fulfillments/update` | 履行更新 |

---

## ステータス一覧

| ステータス | 説明 |
|-----------|------|
| 成功 | Webhook処理が正常に完了 |
| 失敗 | 処理中にエラーが発生 |
| 処理中 | 現在処理中 |

---

## トラブルシューティング

### Webhookが受信されない場合

1. **Shopify管理画面でWebhook設定を確認**
   - 設定 > 通知 > Webhook
   - URLが正しく設定されているか確認

2. **Webhook送信履歴を確認**
   - Shopify管理画面から最近の送信を確認
   - エラーレスポンスがないか確認

3. **ネットワーク接続を確認**
   - ファイアウォール設定
   - SSL証明書の有効性

### 処理が失敗する場合

1. 該当のWebhookログを開く
2. エラーメッセージを確認
3. ペイロードの内容を確認（データ不整合の可能性）
4. 必要に応じてShopifyデータ画面から手動同期を実行

---

## 関連画面

| 画面 | パス | 説明 |
|------|------|------|
| Shopifyデータ | `/shopify-data` | データ同期管理 |
| 顧客管理 | `/customer-management` | 顧客情報 |
| 商品管理 | `/products` | 商品情報 |

---

## 備考

- 本画面は管理者権限でのみアクセス可能
- ログは一定期間後に自動削除される場合があります
- 個人情報を含むペイロードの取り扱いに注意してください
