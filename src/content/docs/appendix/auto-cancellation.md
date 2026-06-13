---
title: '自動キャンセルの仕組み'
description: 'クレジットカード・銀行振込の未決済 Draft Order が自動キャンセルされる仕組みと条件'
sidebar:
  order: 50
tableOfContents: false
---

> **💡 運用者向け:** クレジットカード・銀行振込で決済が完了しないまま放置された予約（カート経由）は、在庫ロックを防ぐため自動キャンセルされます。管理画面で手動作成した伝票（`backend_app`）は対象外です。キャンセル条件・タイミング・ジョブ・トラブルシューティングの技術詳細は開発者モード（ページ右上のトグル）を ON にしてご確認ください。

:::dev
> **出典:** BE #1772 調査結果（2026-05-23）+ UAT 実証データ検証

## 概要

Shopify テーマ経由（カート）で作成された予約のうち、決済が完了しないまま放置された Draft Order は**自動的にキャンセル**されます。これにより、在庫の長期ロックを防ぎ、新規予約を受け付けられる状態に戻します。

## キャンセル対象

| 条件 | 値 |
|------|---|
| 伝票ステータス | `DRAFT` / `PROCESSING` / `BILLING_PENDING` |
| 予約ソース | `cart` （Shopify テーマ経由）。**`backend_app`（管理画面手動作成）は対象外** |
| 支払方法 | `shopify_credit` / `bank_transfer` 両方 |
| キャンセル理由 | `Draft Order expired (unpaid)` |

## ジョブ稼働

| 項目 | 値 |
|------|---|
| **ジョブ名** | `draft-booking-lifecycle` |
| **稼働頻度** | 毎日 02:00 JST |
| **稼働確認方法** | Backend の `reminder_logs` テーブルで `reminder_type='auto_cancel'` を検索 |
| **失敗時の通知** | 現状は Logger のみ（外部通知なし） |

## 自動処理フロー

```
Shopify でカート → Draft Order 作成（決済前）
   ↓
   ↓ 顧客が支払い操作を行わず放置
   ↓
   ↓ Shopify Draft Order が expire（24-72時間）
   ↓
Backend が webhook 経由で検知
   ↓
booking.status = CANCELLED
booking.cancellation_reason = "Draft Order expired (unpaid)"
   ↓
在庫ロック解放（releaseInventoryBatch）
顧客にキャンセル通知メール送信
管理者にキャンセル通知メール送信
```

## 実証データ（直近の自動キャンセル例）

2026-05-22 時点のテスト環境より:

| 伝票No. | 作成日 | キャンセル日 | レンタル開始日 | 支払方法 |
|---------|--------|------------|--------------|---------|
| B260522028 | 5/22 | 5/22 | 5/22 | 銀行振込 |
| B260522012 | 5/22 | 5/22 | 5/29 | クレカ |
| B260521017 | 5/21 | 5/21 | 5/23 | クレカ |
| B260521013 | 5/21 | 5/21 | 5/22 | 銀行振込 |

> 直近5/18〜5/22まで毎日キャンセルが発生しており、ジョブ・Webhook が安定稼働していることを示しています。

### Shopify Admin での確認結果

2026-05-23 検証: 上記キャンセル伝票の Draft Order GID を直接 Shopify Admin にアクセスして確認したところ、**全て「このアドレスに下書き注文はありません」（404）** が表示されました。

| 伝票No. | Backend ステータス | Shopify Admin |
|---------|-------------------|---------------|
| B260522028 (DraftOrder 1301329576111) | CANCELLED | 404（完全削除） |
| B260521017 (DraftOrder 1300993114287) | CANCELLED | 404（完全削除） |

これは以下を意味します:
- Shopify 側で Draft Order が完全に削除されている = Shopify の expire メカニズムが完了
- Backend の `cancellationReason="Draft Order expired (unpaid)"` と完全に同期
- 重複データなし、データ整合性が保たれている

## 対象外のケース

以下の伝票は **自動キャンセルされません**:

| 伝票種別 | 理由 |
|---------|------|
| 管理画面 (`/booking-compact`) で作成 | `source = 'backend_app'` のため対象外 |
| 既に AMOUNT_CONFIRMED / COMPLETED | キャンセル対象ステータスではない |
| Shopify Draft Order が expire していない | webhook が発火しない |

## トラブルシューティング

### 「自動キャンセルされていない」と思われる場合

1. **伝票の `source` を確認**
   - `backend_app` の場合は自動キャンセル対象外。管理画面から手動でキャンセル
   - `cart` の場合のみ自動キャンセル対象
2. **Shopify Draft Order の状態を確認**
   - Shopify Admin で該当 Draft Order が `expired` になっているか
   - まだ `open` の場合は、Shopify 側のタイムアウトが来ていない
3. **Backend ログを確認**
   - `reminder_logs` テーブルで該当伝票の処理ログを検索

### 「意図せず自動キャンセルされた」と思われる場合

- 顧客が決済を完了していなかった可能性が高い
- Shopify Admin の Draft Order ページで履歴確認可能
- 必要に応じて新規 Draft Order を作成して再請求

## 関連

- [返却・金額確定](/bookings-return/) — キャンセル後の在庫ロック解放
- [メール送信責任分界](/appendix/email-responsibility/) — キャンセル通知メール
- [仮予約期限切れ](/appendix/email-responsibility/) — BE #994/#996/#1003 で実装
:::
