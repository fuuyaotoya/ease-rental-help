---
title: 'ステータス遷移図'
description: 'ステータス遷移図の操作方法と画面説明'
sidebar:
  order: 101
tableOfContents: false
---

> **💡 運用者向け:** 伝票の状態は「伝票ステータス」「支払ステータス」「配送ステータス」「返却ステータス」の4つの独立した軸で管理され、画面では「処理中 / 金額確認待ち / 請求待ち / 入金待ち / 完了」で表示されます。各ステータスの内部値・遷移ルール・3層設計の技術詳細は開発者モード（ページ右上のトグル）を ON にしてご確認ください。

:::dev

> **付録:** A
> **主題:** 各エンティティのステータス遷移ルール

---

## 概要

EASE Rentalシステムで使用する主要なステータスとその遷移ルールをまとめています。

> **重要:** 以下のステータス値が正規値です。旧ドキュメントの値（DRAFT, CONFIRMED, PENDING等）は使用しません。また `AWAITING_RETURN`（返却待ち）は旧資料に登場しますが、**現システムの enum/DB には存在しない幻影の状態**です（返却待ちは `PENDING` で表します）。

### ★ 4軸ステータスの独立性（最重要）

伝票は**独立した4つのステータス軸**を持ちます。**1つの軸の値から他軸を推測しないでください。**

| 軸 | 管理対象 | 値の流れ |
|----|---------|---------|
| ① 伝票ステータス | 金銭・業務フロー | 下書き → 確定 → 処理中 → 金額確認待ち → 金額確定 → 請求待ち → 入金待ち → 完了 |
| ② ピッキング状態 | 物理準備フロー | （なし）→ ピッキング中 → ピッキング完了 |
| ③ 出荷状態 | 配送フロー | 未発送 → 発送済み → 配達済み |
| ④ 返却状態 | 返却フロー | 未返却 → 一部返却受付 → 返却受付済み → 一部金額確定 → 金額確定済み → 返却完了 |

**重要な仕様:**
- ピッキング・出荷を行っても **①伝票ステータスは変化しません**（②③が別軸で進む）
- 返却受付には **③出荷状態が「発送済み」以上が必須**（モノが顧客に届いていないと返却できない）
- 作成時の初期値は支払方法により異なる（[伝票作成](/booking-compact/) の「作成時ステータス」参照）

---

## BookingStatus（伝票ステータス）

伝票の処理状態を表します。**Backend #1016 / Frontend #518 で11値に拡張**。

### 遷移図

```
DRAFT ────────────────────────────────────────────────────────────┐
    │ 確定                                                         │
    ▼                                                             │
CONFIRMED ────────────────────────────────────────────────────────┤
    │ ピッキング完了                                               │
    ▼                                                             │
PROCESSING ───────────────────────────────────────────────────────┤
    │ 出荷完了                                                     │
    ▼                                                             │
SHIPPED ──────────────────────────────────────────────────────────┤
    │ 返却受領                                                     │
    ▼                                                             │
RETURNED ─────────────────────────────────────────────────────────┤
    │ 金額確定                                                     │
    ▼                                                             │
AMOUNT_CONFIRMED ─────────────────────────────────────────────────┤
    │                                                             │
    │ 金額確定待ち/請求待ち/入金待ち（短絡も可）                    │
    ├───────────────── PRICE_CONFIRM_PENDING ──────────────────────┤
    │                                                             │
    ├───────────────── BILLING_PENDING ────────────────────────────┤
    │                                                             │
    ├───────────────── PAYMENT_PENDING ────────────────────────────┤
    │                                                             │
    ▼ 入金完了                                                   │
COMPLETED ─────────────────────────────────────────────────────────┘

CANCELLED ◄──── 任意のステータスから遷移可能
```

### ステータス定義（11値）

| ステータス              | 説明             | 遷移条件                           |
| ----------------------- | ---------------- | ---------------------------------- |
| `DRAFT`                 | 未確定           | 伝票作成時の初期状態（#1016）      |
| `CONFIRMED`             | 予約確定         | DRAFT から確定時（#1016）          |
| `PROCESSING`            | ピッキング完了   | 物理準備完了時（#1016）            |
| `SHIPPED`               | 出荷済み         | 出荷完了時（#1016）                |
| `RETURNED`              | 返却済み         | 返却受領時（#1016）                |
| `AMOUNT_CONFIRMED`      | 金額確定         | 返却後金額確定時（#1016）          |
| `PRICE_CONFIRM_PENDING` | 金額確定待ち     | 金額未確定時                       |
| `BILLING_PENDING`       | 請求待ち         | 振込請求時                         |
| `PAYMENT_PENDING`       | 入金待ち         | 現金/クレカ決済時                  |
| `COMPLETED`             | 完了             | 入金確認完了後                     |
| `CANCELLED`             | キャンセル       | 任意のタイミングからキャンセル可能 |

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

> 返金は `paid`（全額入金）以降のみ発生しうるため、`unpaid` からいきなり `refunded` には遷移しません。

### ステータス定義（5値）

| ステータス            | 説明             | 遷移条件                                               |
| --------------------- | ---------------- | ------------------------------------------------------ |
| `unpaid`              | 未払い           | 伝票作成時の初期状態                                   |
| `partially_paid`      | 一部入金         | 一部入金の記録時（※1）                                 |
| `paid`                | 支払済み（全額） | 全額入金確認後                                         |
| `partially_refunded`  | 一部返金         | 全額入金後に一部返金が記録された場合                   |
| `refunded`            | 返金済み（全額） | 全額入金後に全額返金が記録された場合                   |

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
| `sent`      | 送付済み     | 請求書の送付完了後           |
| `issued`    | 発行済み     | 発行確定後                   |
| `paid`      | 支払済み     | 入金確認後                   |
| `overdue`   | 支払期限超過 | 支払期限経過後               |
| `cancelled` | キャンセル   | 請求書がキャンセルされた場合 |
| `voided`    | 無効         | 請求書が無効化された場合     |

> **SSOT**: `src/lib/constants.ts` INVOICE_STATUS / INVOICE_STATUS_LABELS

---

## ShippingStatus（配送ステータス）

配送の状態を表します。

### 遷移図

```
PENDING ──────────────────────────────────────────────────────────┐
    │                                                             │
    │ ピッキング開始                                               │
    ▼                                                             │
PREPARING ─────────────────────────────────────────────────────────┤
    │                                                             │
    │ 出荷完了                                                     │
    ▼                                                             │
IN_TRANSIT ────────────────────────────────────────────────────────┤
    │                                                             │
    │ 配送完了                                                     │
    ▼                                                             │
DELIVERED                                                          │
                                                                   │
CANCELLED ◄───────────────────────────────────────────────────────┘
```

### ステータス定義

| ステータス   | 説明       | 遷移条件                   |
| ------------ | ---------- | -------------------------- |
| `PENDING`    | 待機中     | 伝票作成時の初期状態       |
| `PREPARING`  | 準備中     | ピッキング開始後           |
| `IN_TRANSIT` | 配送中     | 出荷完了後                 |
| `DELIVERED`  | 配送完了   | 配送先に到着後             |
| `CANCELLED`  | キャンセル | 配送がキャンセルされた場合 |

---

## ステータス遷移のベストプラクティス

### 基本原則

1. ステータスは原則として前方に進む（戻り遷移は最小限）
2. `CANCELLED` は任意のステータスからの遷移が可能
3. ステータス変更はユーザーの明示的な操作で行う

### 例外ケース

- `PENDING` から `UNPAID` への戻りは不可
- `COMPLETED` / `PAID` / `DELIVERED` / `VOIDED` は終了状態（キャンセル以外への遷移不可）

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
│ 任意 → PRICE_CONFIRM_PENDING（確定待ち短絡）                    │
│ 任意 → CANCELLED                                                │
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

| | @Suite | Backend #943/#980 | Backend #1016（現行） |
|---|---|---|---|
| **初期状態** | DRAFT | PROCESSING | DRAFT |
| **PROCESSING の意味** | ピッキング済 | 伝票作成時の初期状態 | ピッキング完了 |
| **予約確定** | CONFIRMED | （なし） | CONFIRMED |

> Issue #943 で `@default("DRAFT")` → `@default("PROCESSING")` に変更後、
> Issue #1016 で `@default("DRAFT")` に戻り、11値に拡張。

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
- Backend Issue: iziz-system/ease-rental-backend#980
- Frontend Issue: iziz-system/ease-rental-frontend#470
:::
