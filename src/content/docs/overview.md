---
title: '業務フロー全体'
description: 'EASE Rental の全体業務フローとシステム概要'
sidebar:
  order: 0
---

# EASE Rental 業務フロー

![EASE Rental ダッシュボード画面](/images/dashboard.png)

## 業務フロー全体図

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EASE Rental 業務フロー                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. 商品問い合わせ                                                          │
│     └→ 予約状況一括照会（在庫確認）                                          │
│                                                                             │
│  2. 受注 → 貸出伝票作成（6ステップ）                                         │
│     顧客選択 → 伝票情報 → 明細情報 → 配送情報 → 料金確認 → 伝票登録          │
│                                                                             │
│  3. ピッキング・出荷登録（出荷前商品確認〜出荷完了）                         │
│     ピッキング対象伝票表示 → ピッキング伝票出力 → ピッキング完了（出荷登録自動）│
│                                                                             │
│  4. 返却処理（返却日入力 + 調整項目 + 金額確定）                             │
│     返却・金額確定対象伝票表示 → 返却日設定・金額確定                         │
│                                                                             │
│  5. 入金処理（支払方法別）                                                   │
│     現金/クレジット: 入金処理                                                │
│     振込: 請求書作成 → 発行 → 入金                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 各フェーズの画面一覧

### フェーズA: 業務概況

| 画面 | パス | 説明 |
|------|------|------|
| ダッシュボード | `/dashboard` | 本日の予定・統計サマリー（非表示） |

### フェーズB: 受注・伝票

| 画面 | パス | 説明 |
|------|------|------|
| [貸し出し伝票作成](/booking-compact/) | `/booking-compact` | **最重要** 6ステップで伝票作成 |
| [伝票検索](/slip-search/) | `/slip-search` | 多条件フィルタで伝票検索 |

### フェーズC: 予約確認

| 画面 | パス | 説明 |
|------|------|------|
| [商品予約状況照会](/product-reservation-inquiry/) | `/product-reservation-inquiry` | 在庫・予約状況一括照会 + カレンダー + SKU検索 |

### フェーズD: 出荷・配送

| 画面 | パス | 説明 |
|------|------|------|
| [ピッキング・出荷登録](/picking-delivery/) | `/picking-delivery` | 出荷前の商品ピッキング・出荷完了登録 |
| [配送一覧](/delivery-list/) | `/delivery-list` | 配送スケジュール確認 |

### フェーズE: 返却

| 画面 | パス | 説明 |
|------|------|------|
| [返却・金額確定](/bookings-return/) | `/bookings-return` | 返却日入力・延長料計算・金額確定 |

### フェーズF: 請求・入金

| 画面 | パス | 説明 |
|------|------|------|
| [請求書作成](/invoice-create-new/) | `/invoice/create-new` | 個別請求書の新規作成 |
| [請求一覧・入金処理](/invoices-list/) | `/invoices-list` | 請求書一覧・入金登録 |
| [未入金一覧・入金処理](/payment-management/) | `/payment-management` | 未入金伝票の入金処理 |
| [一括請求処理](/bulk-invoices/) | `/bulk-invoices` | 月次一括請求書作成 |
| [配送料確定・Shopify請求](/delivery-fee-shopify-flow/) | — | 配送料金編集・Shopify連携 |

### フェーズG: レポート

| 画面 | パス | 説明 |
|------|------|------|
| [集計表出力](/aggregate-report/) | `/aggregate-report` | 売上・商品別集計レポート（非表示） |

### フェーズH: マスタ・顧客

| 画面 | パス | 説明 |
|------|------|------|
| [顧客管理](/customer-management/) | `/customer-management` | 顧客情報の検索・編集 |
| [商品管理](/products/) | `/products` | 商品マスタ管理 |
| [マスタ管理](/master-data/) | `/master-data` | 配送会社・スタッフ等7種マスタ |

---

## 業務上の重要ルール

### 伝票件数制限

- **明細情報:** 1伝票あたり最大50件
- **配送情報:** 1伝票あたり最大10件

### 支払方法と処理フロー

| 支払方法 | 必要な入力 | 処理フロー |
|---------|----------|-----------|
| 現金 | 支払予定日 | 入金処理のみ |
| クレジットカード | 支払予定日 | 入金処理のみ |
| 振込 | 請求先・請求先担当者 | 請求書作成 → 発行 → 入金 |

## ステータス正規値

### BookingStatus

```
PROCESSING → BILLING_PENDING → PAYMENT_PENDING → COMPLETED → CANCELLED
```

### PaymentStatus

```
UNPAID → PARTIAL → PAID → REFUNDED / CANCELLED
```

### InvoiceStatus

```
DRAFT → CONFIRMED → SENT → PAID → REFUNDED / CANCELLED
```

### ShippingStatus

```
PENDING → PREPARING → IN_TRANSIT → DELIVERED / CANCELLED
```
