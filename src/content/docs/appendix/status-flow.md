---
title: 'ステータス遷移図'
description: 'ステータス遷移図の操作方法と画面説明'
sidebar:
  order: 101
tableOfContents: false
---

> **💡 運用者向け:** 「伝票検索」では「処理中」「金額確認待ち」「未送信」「請求済」「完了」で伝票を絞り込めます。出荷や入金の状況は、伝票の出荷状態や支払ステータスもあわせて確認してください。

:::dev

> **付録:** A
> **主題:** 各エンティティのステータス遷移ルール

---

## 概要

EASE Rentalシステムで使用する主要なステータスとその遷移ルールをまとめています。

> 伝票の `DRAFT`・`CONFIRMED` と、返却の `PENDING` は現行の値です。返却待ちは ReturnStatus の `PENDING` で表します。

### ★ 4軸ステータスの独立性（最重要）

伝票は**独立した4つのステータス軸**を持ちます。**1つの軸の値から他軸を推測しないでください。**

| 軸 | 管理対象 | 値の流れ |
|----|---------|---------|
| ① 伝票ステータス | 金銭・業務フロー | 確定済み・処理中 → 出荷済み → 金額確認待ち → 金額確定済み → 未送信・請求済 → 完了（代表例） |
| ② ピッキング状態 | 物理準備フロー | （なし）→ ピッキング中 → ピッキング完了 |
| ③ 出荷状態 | 配送フロー | 未発送 → 発送済み → 配達済み |
| ④ 返却状態 | 返却フロー | 未返却 → 一部返却受付 → 返却受付済み → 一部金額確定 → 金額確定済み → 返却完了 |

**重要な仕様:**
- ピッキング完了は②を進めます。出荷登録は③を進め、「確定済み」や「処理中」の伝票では①も「出荷済み」に進めます。
- 返却受付には **③出荷状態が「発送済み」以上が必須**（モノが顧客に届いていないと返却できない）
- 作成時の初期値は支払方法により異なる（[伝票作成](/booking-compact/) の「作成時ステータス」参照）
- [社内確保](/internal-hold/)の伝票も同じステータスの流れを通ります。返却受付（または毎日早朝の自動処理）で0円のまま金額確定・完了します（社内確保専用のステータス値はありません）。0円のまま金額確定された伝票は、支払いを待たずに最終確認の時点で自動的に完了します（2026年9月変更）

---

## BookingStatus（伝票ステータス）

伝票の処理状態を表します。**Backend #1016 / Frontend #518 で11値に拡張**。

### 遷移図

```
DRAFT → CONFIRMED
CONFIRMED / PROCESSING → SHIPPED
SHIPPED → PRICE_CONFIRM_PENDING → AMOUNT_CONFIRMED
SHIPPED → RETURNED → AMOUNT_CONFIRMED
AMOUNT_CONFIRMED → BILLING_PENDING → PAYMENT_PENDING → COMPLETED
AMOUNT_CONFIRMED / BILLING_PENDING / PAYMENT_PENDING → PRICE_CONFIRM_PENDING（金額確定解除）
完了・キャンセル前の状態 → CANCELLED
```

### ステータス定義（11値）

| ステータス              | 説明             | 遷移条件                           |
| ----------------------- | ---------------- | ---------------------------------- |
| `DRAFT`                 | 仮予約           | 未確定の伝票      |
| `CONFIRMED`             | 確定済み         | DRAFT から確定時など          |
| `PROCESSING`            | 処理中   | 予約作成直後（cart/theme/webhook/bank_transfer・#2397）。ピッキングは picking_status 別軸 |
| `SHIPPED`               | 出荷済み         | 出荷完了時（#1016）                |
| `RETURNED`              | 返却済み         | 返却受領時（#1016）                |
| `AMOUNT_CONFIRMED`      | 金額確定済み     | 返却後金額確定時          |
| `PRICE_CONFIRM_PENDING` | 金額確認待ち     | 返却受付後や金額確定解除後                       |
| `BILLING_PENDING`       | 未送信           | 振込請求時（請求書作成済・メール未送信） |
| `PAYMENT_PENDING`       | 請求済           | 請求後の入金待ち |
| `COMPLETED`             | 完了             | 入金確認完了後                     |
| `CANCELLED`             | キャンセル       | 完了・キャンセル前に取り消した場合 |

> **SSOT**: `src/lib/constants.ts` BOOKING_STATUS / BOOKING_STATUS_LABELS
> **遷移の真実**: Backend `status-transition.ts` `isValidStatusTransition()`

---

## PaymentStatus（支払ステータス）

伝票の**支払（入金・返金）**の状態を表します。**InvoiceStatus（請求書ステータス）とは別の軸**なので混同しないでください（`pending` / `sent` / `overdue` 等は InvoiceStatus 側の値です）。

### 遷移図

```
unpaid ─────────► partially_paid ─────────► paid
                                             │
                                             │ 返金発生
                                             ▼
                                  partially_refunded ─────► refunded
```

> 図は通常の入金経路です。返金は記録済みの入金額をもとに処理されます。状態の遷移ルールでは、`partially_paid` から `partially_refunded`・`refunded`、`unpaid` から `refunded` への遷移も許可しています。

### ステータス定義（5値）

| ステータス            | 説明             | 遷移条件                                               |
| --------------------- | ---------------- | ------------------------------------------------------ |
| `unpaid`              | 未払い           | 伝票作成時の初期状態                                   |
| `partially_paid`      | 一部支払い       | 一部入金の記録時（※1）                                 |
| `paid`                | 支払済み（全額） | 全額入金確認後                                         |
| `partially_refunded`  | 一部返金         | 入金額の一部を返金した場合                   |
| `refunded`            | 返金済み         | 入金額の全額を返金した場合                   |

> ※1 **画面の「一括入金処理」は全額入金のみに対応**していますが、Shopify の部分決済や、金額確定時の total 増加（延長料金の追加など）により、一度 `paid` になった伝票が `partially_paid` に差し戻ることがあります（Issue #2249）。この場合、伝票は未入金一覧に再表示されます。

> **SSOT**: Backend `src/modules/bookings/status-transition.ts` `PaymentStatus` / `isValidPaymentStatusTransition()`
> **注意**: `overdue`（期限超過）は **InvoiceStatus** 側の値です。PaymentStatus には期限超過に相当する値はありません。

---

## InvoiceStatus（請求書ステータス）

請求書の状態を表します。

### 遷移図

```
DRAFT ───────────────────────────────────────────────────────────┐
    │                                                            │
    │ 保存完了                                                   │
    ▼                                                            │
PENDING ──────────────────────────────────────────────────────────┤
    │                                                            │
    │ 請求書送付                                                  │
    ▼                                                            │
SENT ──────────────────────────────────────────────────────────────┤
    │                                                            │
    │ 発行確定                                                    │
    ▼                                                            │
ISSUED ────────────────────────────────────────────────────────────┤
    │                                                            │
    │ 入金確認                                                    │
    ▼                                                            │
PAID ───────────────────────────────────────────────────────────────┤
    │                                                            │
    │ 無効化                                                      │
    ▼                                                            │
VOIDED                                                              │
                                                                    │
OVERDUE ◄── (期限超過時)                                            │
                                                                    │
CANCELLED ◄─────────────────────────────────────────────────────────┘
```

### ステータス定義

| ステータス  | 説明         | 遷移条件                     |
| ----------- | ------------ | ---------------------------- |
| `draft`     | 下書き       | 請求書作成時の初期状態       |
| `pending`   | 未送信       | 保存完了後                   |
| `sent`      | 入金待ち     | 請求書の送付完了後           |
| `issued`    | 発行済み     | 発行確定後                   |
| `paid`      | 支払済み     | 入金確認後                   |
| `overdue`   | 支払期限超過 | 支払期限経過後               |
| `cancelled` | キャンセル   | 請求書がキャンセルされた場合 |
| `voided`    | 無効         | 請求書が無効化された場合     |

> **SSOT**: `src/lib/constants.ts` INVOICE_STATUS / INVOICE_STATUS_LABELS

---

## 出荷状態と配送ごとの状態

伝票の出荷状態（`bookings.shipping_status`）は `pending`（未発送）、`shipped`（発送済み）、`delivered`（配達済み）です。

配送ごとの状態（`deliveries.status`）は `pending`・`in_progress`・`completed`・`cancelled` です。`pending` または `in_progress` から完了・キャンセルに進みます。配送のキャンセルを取り消すと `pending` に戻ります。

---

## ステータス遷移のベストプラクティス

### 基本原則

1. ステータスは原則として前方に進む（戻り遷移は最小限）
2. 伝票の `COMPLETED` と `CANCELLED` は終了状態
3. スタッフの操作、決済の反映、自動処理でステータスが変わる

### 例外ケース

- 入金後に請求額が増えた場合は `paid` から `partially_paid` に戻ることがあります。

---

## 3層設計アーキテクチャ（@Suiteからの再設計）

> **背景**: @Suiteの単層7ステータスは、Backendで3層に分離再設計されています（Issue #943, #980, #1016）。
> これはバグではなく、物理フロー・金銭フロー・返却フローを独立追跡するための設計判断です。
> Backend #1016 で BookingStatus が 6→11値に拡張され、物理フロー（CONFIRMED/PROCESSING/SHIPPED/RETURNED）が BookingStatus レベルに統合されました。

### 3層の全体図（#1016対応後）

```
┌─────────────────────────────────────────────────────────────────┐
│ BookingStatus（伝票全体フロー・11値）#1016                      │
│ DRAFT → CONFIRMED → PROCESSING → SHIPPED → RETURNED            │
│       → AMOUNT_CONFIRMED → BILLING_PENDING                      │
│       → PAYMENT_PENDING → COMPLETED                             │
│ 返却受付・金額確定解除 → PRICE_CONFIRM_PENDING                  │
│ 完了・キャンセル前 → CANCELLED                                  │
├─────────────────────────────────────────────────────────────────┤
│ BookingItemStatus（明細物理フロー・8値）                        │
│ pending → picking → picked → shipped → delivered → returned     │
│         └→ cancelled                                            │
│         └→ confirmed                                            │
├─────────────────────────────────────────────────────────────────┤
│ ReturnStatus（返却フロー・6値）                                 │
│ PENDING → PARTIALLY_RECEIVED → RECEIVED → PARTIALLY_CONFIRMED  │
│        → AMOUNT_CONFIRMED → COMPLETED                           │
└─────────────────────────────────────────────────────────────────┘
```

### @Suite（旧）→ Backend（現）対応表

| @Suite 7ステータス | Backend での対応 | レイヤー | 備考 |
|---|---|---|---|
| `DRAFT`（下書き） | `DRAFT`（BookingStatus） | 伝票全体 | #1016 で復活。初期状態 |
| `CONFIRMED`（確定） | `CONFIRMED`（BookingStatus） | 伝票全体 | #1016 で新設（旧COMPLETED相当ではない） |
| `PROCESSING`（ピッキング済） | `PROCESSING`（BookingStatus） + `picking`/`picked`（BookingItemStatus） | 両方 | #1016 で BookingStatus にも追加 |
| `SHIPPED`（出庫済） | `SHIPPED`（BookingStatus） + `shipped`（BookingItemStatus） | 両方 | #1016 で BookingStatus にも追加 |
| `RETURNED`（返却済） | `RETURNED`（BookingStatus） + `returned`（BookingItemStatus） | 両方 | #1016 で BookingStatus にも追加 |
| `AMOUNT_CONFIRMED`（金額確定） | `AMOUNT_CONFIRMED`（BookingStatus + ReturnStatus） | 両方 | #1016 で BookingStatus にも追加 |
| `CANCELLED`（キャンセル） | `CANCELLED`（BookingStatus） + `cancelled`（BookingItemStatus） | 両方 | 伝票・明細両方でキャンセル可能 |

### PROCESSING の意味変遷

| | @Suite | Backend #943/#980 | Backend #1016（意図・Model A） | Backend #2397（現行・Model B） |
|---|---|---|---|---|
| **初期状態** | DRAFT | PROCESSING | DRAFT | DRAFT（管理画面）/ PROCESSING（cart/theme/webhook/bank_transfer） |
| **PROCESSING の意味** | ピッキング済 | 伝票作成時の初期状態 | ピッキング完了（意図のみ・実装されず） | 予約作成直後の初期ステータス（ピッキングは picking_status 別軸） |
| **予約確定** | CONFIRMED | （なし） | CONFIRMED | CONFIRMED |

> Issue #943 で `@default("DRAFT")` → `@default("PROCESSING")` に変更後、Issue #1016 で `@default("DRAFT")` に戻り 11値に拡張。#1016 は PROCESSING を「ピッキング完了」と定義した（Model A）が、`completePicking` は `booking.status` を変えない実装のため実挙動と乖離。**Issue #2397** で Model B（予約直後の初期ステータス）に統一し、ラベルを「処理中」に是正（docs-site 運用者向けページと整合）。

### レガシー値の自動変換

```typescript
// Backend status-transition.ts LEGACY_BOOKING_STATUS_MAP（#1016版）
DRAFT → DRAFT
PRICE_PENDING → DRAFT
CONFIRMED → COMPLETED
PAID → COMPLETED
REFUNDED → COMPLETED
CANCELLED → CANCELLED
```

---

## 関連資料

- [延長料金計算ルール](/appendix/fee-calculation/)
- [URL直接アクセスパターン](/appendix/url-patterns/)
- [キャンセル操作と Shopify 注文の同期](/appendix/cancellation-shopify-sync/)
- Backend Issue: iziz-system/ease-rental-backend#980
- Frontend Issue: iziz-system/ease-rental-frontend#470
:::
