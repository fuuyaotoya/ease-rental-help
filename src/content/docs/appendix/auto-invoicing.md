---
title: '前日自動請求の仕組み'
description: '後払いクレカ（店頭受取）のレンタル開始前日自動請求の仕組み（全額一本化・伝票クローズ）'
sidebar:
  order: 56
---

> **💡 運用者向け:** 後払いクレカ（店頭受取）の伝票は、**レンタル開始日の前日に自動で請求書が発行**されます（2026-07-24 運用開始）。前日18時にシステムが対象伝票を検索し、全額一本の請求書PDF＋メールを自動送信します。スタッフの操作は不要です。**例外**（初回即時入金希望等）は手動で金額確定ボタンから請求書を発行できます。店頭現金払いは対象外です。

## 概要

### 対象となる伝票

以下の**全て**の条件を満たす伝票が対象:

- **店頭受取**（配送なし・`delivery_plan='pickup'`）
- **後払いクレジットカード**（`shopify_credit` または `credit_card`・`pay_now=false`）
- **本体分のカード決済（①）が未決済**（Shopify の下書き注文が未決済）
- **未請求**（`shipping_fee_amount_confirmed_at` 無し＝まだ金額確定していない）
- **レンタル開始日が翌日**（前日 = 今日）

### タイミングとライフサイクル

```
カート投入・伝票作成
      ↓
前日まで: お客様は商品の出し入れ（追加/削除）可能
      ↓
レンタル開始前日 18:00 JST
      ↓ ← cron が自動で請求書発行・伝票close
伝票close（shipping_fee_amount_confirmed_at set）
      ↓
以降の追加 → 別伝票（DO④）
当日キャンセル → システム上不可（電話・メールで手動対応）
      ↓
返却後: 延長/破損等の追加料金 → DO③（別伝票）
      ↓
決済完了 → DO① が Shopify Order 化 → 完了
```

### 重要なルール

| 項目 | 内容 |
|---|---|
| **送信時刻** | 毎日 18:00 JST（環境変数で変更可能） |
| **店頭現金払い** | **対象外**（即時決済のため） |
| **配送あり後払いクレカ** | 別経路（`confirm-shipping-fee` 手動または順次自動化予定） |
| **当日キャンセル** | **不可**（伝票close済み・電話/メールで手動対応のみ） |
| **伝票close後の商品追加** | **別伝票**（追加商品のカード決済）に分離される |
| **例外（手動発行）** | 初回即時入金希望等は手動EPから即時発行可能 |

## 例外: 手動での金額確定・請求書発行

前日 cron を待たず、スタッフが任意のタイミングで請求書を発行したい場合:

- **手動EP**: `POST /api/v1/bookings/:id/confirm-amount-deferred-cc`（pickup 専用）
- この EP は前日 cron と同一のコア（`confirmAmountForDeferredCreditCard`）を呼ぶため、同じ処理（全額一本・伝票close・請求書作成・メール送付・Shopify rebuild）が実行される
- 既に金額確定済みの伝票は400エラーで弾かれる（冪等・二重発行防止）

:::dev
> **出典:** #2441（2026-07-24 実装完了・commit `defd224c`〜`64221a1d`）。7/23定例 A項（`meeting-2026-07-23.md`）。BE memory: `pickup-deferred-credit-initial-invoice-proposal`

## 技術詳細

### cron サービス

- **ファイル**: `src/modules/schedule/deferred-cc-initial-invoice-cron.service.ts`
- **スケジュール**: `@Cron('0 18 * * *', { timeZone: 'Asia/Tokyo' })`・env `DEFERRED_CC_INITIAL_INVOICE_CRON` で上書き可能
- **登録**: `schedule.module.ts` providers

### predicate（対象検索クエリ）

```
deleted_at: null
status: { not: CANCELLED }
payment_method: { in: ['credit_card', 'shopify_credit'] }
delivery_plan: 'pickup'
pay_now: false
shopify_order_id: null          ← DO① OPEN
shipping_fee_amount_confirmed_at: null  ← 未確定
shopify_draft_order_gid: { not: null }  ← DO① 存在
start_date: { gte: 明日00:00JST, lt: 翌日00:00JST }  ← start_date=明日
```

### 金額確定コア（confirmAmountForDeferredCreditCard）

1. **識別ゲート**: `isCreditCardPayment && isDeferredCheckoutBooking && !shopify_order_id && delivery_plan='pickup'`
2. **advisory lock**: `booking:confirm:${bookingId}`（#2409 と共有・単一ロック）
3. **CAS updateMany**: `shipping_fee_amount_confirmed_at` + `delivery_included_in_total` を set（WHERE status NOT IN CANCELLED/COMPLETED・race-safe）
4. **recalculate**: pickup は配送料 adjustment 折込なし（cart 時点 total が権威・`filterAdjustmentsForConfirmedDeferred` pickup-aware）
5. **booking_history**: `DEFERRED_CC_INITIAL_INVOICE_CONFIRMED`
6. **draft_order_rebuild enqueue**: `{ sendShopifyInvoice: true }`（transactional outbox・tx 内）
7. **post-tx**: `setImmediate` → `issueInvoiceForBooking`（BE請求書PDF＋メール）

### 伝票close（ソフトロック）

- `shipping_fee_amount_confirmed_at` set → `isBookingLockedForItemEdit` → `resolveBookingEditability` が `editable=false / can_add=false` を返す
- item 追加ブロック → 別伝票（DO④）へ誘導
- 顧客自己キャンセル: `updateStatusFromCustomer` CANCELLED 分岐 + `cancelBookingFromCustomer` in-tx recheck でブロック（ConflictException）

### 取り残し（stranded）の backfill

- cron 導入（2026-07-24）より前に start_date を迎えた伝票は前日を過ぎているため cron で拾えない
- `scripts/heal-pickup-deferred-cc-stranded-2441.ts`（dry-run / --execute）で遡及請求
- 1件ごとに `data_consistency_logs` に audit

### 関連

- BE #2441（CLOSED・実装完了）
- [後払いクレカ基本化の仕様変更](/appendix/post-pay-credit-card-migration/) — #2407/#2408/#2409/#2441 の全体像
- [決済方法別伝票作成フロー](/appendix/payment-method-flows/) — マトリクス
- [自動キャンセルの仕組み](/appendix/auto-cancellation/) — #2407（対となる自動化）
:::
