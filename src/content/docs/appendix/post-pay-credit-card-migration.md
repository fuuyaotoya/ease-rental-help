---
title: '後払いクレカ基本化の仕様変更'
description: '#1993前提崩れに伴う仕様再編（#2407自動キャンセル停止・#2408請求書抑制縮小・#2409金額確定フロー・#2441前日自動請求）— 全て実装済み（2026-07-24）'
sidebar:
  order: 55
---

> **💡 運用者向け:** 2026-07 に「クレカ＝前払い強制」の旧前提（#1993）が崩れ、**後払いクレカが基本**になりました。これに伴う仕様変更4本は**全て実装済み**です。(1) 開始日基準の自動キャンセルを**停止**（スタッフ手動管理へ ✅）(2) クレカ伝票の**商品ロック**（金額確定時・✅）(3) 後払いクレカの**金額確定フロー**（全額一本請求・DO②廃止 ✅）(4) **前日自動請求** cron（pickup 後払いクレカ・レンタル開始前日に自動で請求書発行 ✅）。技術詳細は開発者モード（ページ右上トグル）ON でご確認ください。

:::dev
> **出典:** #2327 調査 → #2407/#2408/#2409 起票（2026-07-19）+ ユーザー裁定（2026-07-20）+ #2441 前日自動請求（2026-07-23定例 A項）。BE memory: `issue-2407-2409-1993-premise-collapse-respec`

## 背景: #1993 前提の崩れ

#1982/#1993 は「**クレカ顧客は請求書なし・領収書都度発行・前払い強制・未払いは開始日前（135分cron/02:00cron）で自動キャンセル**」を前提としていました。しかし後払いが基本になった現在、この前提は実フローと乖離しました（本番実績: bank_transfer 56%・配送ありクレカの DO② 使用は10%のみ）。

結果として「後払いクレカに請求書を出せない」「スタッフの任意タイミング請求ができない」「auto-cancel が後払い伝票を巻き込むリスク」等が顕在化し、#2327 の調査から **4 issue** に分割して仕様再編しました。**全て実装済み**（2026-07-24）。

## 4 issue の裁定表（2026-07-24 时点・全て実装済み）

| issue | 役 | 内容 | 状態 |
|---|---|---|---|
| **#2407** | C（独立・小） | 開始日基準の auto-cancel（02:00 cron）と7日前 final reminder を停止 | ✅ **実装済**（commit `574f358c`・2026-07-20）|
| **#2408** | A（中・Bの前提） | 請求書抑制を前払いクレカ（`isPrepaidCreditCardBooking`）限定に縮小 | ✅ **実装済**（commit `7786c9af`・2026-07-20）|
| **#2409** | B（大・核心） | 後払いクレカの金額確定フロー（全額一本・DO②廃止・DO④分離） | ✅ **実装済**（commit `9a90bede`・2026-07-20）|
| **#2441** | 続編（7/23 A項） | 前日自動請求 cron（pickup 後払いクレカ・レンタル開始前日に自動請求書発行） | ✅ **実装済**（commit `defd224c`〜`64221a1d`・2026-07-24）|

> **経緯**: 当初 #2408 は「実装保留でクローズ」としていましたが、#2409 の前提として必要なため**2026-07-20 に実装**（ccGuard を前払い限定に縮小）。これにより #2409 も同日実装完了。さらに 2026-07-23 定例 A項で「請求書発行＝前日固定（自動送信）」が確定し、#2441 として実装されました。

---

## #2407: 自動キャンセル停止（✅ 実装済）

02:00 JST cron（`draft-booking-lifecycle.service.ts`）は3フェーズ構成。**Phase 2（7日前 final reminder）も Phase 3（auto-cancel）と連動して停止**しました（Phase2 は Phase3 の前段の最終警告なので、Phase3 を止めても送り続けると「明日自動キャンセルされます」の誤告知になるため）。

| Phase | timing | 内容 | env=0 で |
|---|---|---|---|
| Phase 1 | 8日前 | `sendPaymentReminders`（「お支払いのご案内」・auto-cancel 言及なし・全顧客） | **維持（督促担保）** |
| Phase 2 | 7日前 | `sendFinalReminders`（「明日自動キャンセルされます」） | **停止**（新規 gate・commit 574f358c） |
| Phase 3 | 開始日基準 | `autoCancelExpiredDraftBookings`（auto-cancel） | **停止**（既存 gate・L363） |

- **停止手段**: 本番 env `DRAFT_AUTO_CANCEL_DAYS_BEFORE=0`（コード変更不要・既存 Phase3 gate + 新規 Phase2 gate が効く）
- **督促は維持**: Phase 1（8日前 standard reminder・全顧客・auto-cancel 言及なし）が開始前の督促を担保
- **経路#1（135分 cron・放置カート回収）**: 従来通り（既に後払い除外済み・`draft-order-cleanup.service.ts`）

> 詳細は [自動キャンセルの仕組み](/appendix/auto-cancellation/) 参照。

---

## #2408: 請求書抑制を前払いクレカ限定に縮小（✅ 実装済）

旧 #1993 では「クレカ全件」の標準請求書発行を抑制（領収書のみ）していましたが、**後払いクレカは銀行振込可顧客と同様に単票標準請求書を発行可能**にしました。

- **判定 SSOT**: `isPrepaidCreditCardBooking`（`is-deferred-checkout-booking.ts`）= `isPayNowPickupCheckout`（pickup×pay_now=true）OR `isCreditCardPayment(actual_payment_method)`（決済済み確認）
- **単票標準請求書**: 前払いクレカのみ発行不可（領収書のみ・先行決済のため会計的に領収書が正）。後払いクレカは発行可能
- **まとめ請求（consolidated_invoices）**: クレカ全件（前払い/後払い問わず）引き続き除外（`recordConsolidatedPayment` の「まとめ入金クレカ全件拒否」ガードとのデッドロック回避）

---

## #2409: 後払いクレカ金額確定フロー（✅ 実装済）

後払いクレカ（クレカ × `shopify_order_id` 無し = DO① OPEN）を**銀行振込可顧客と同様**の全額一本請求フローにしました:

1. スタッフが配送料決定後・ピッキング完了後など**任意のタイミング**で「金額確定」を実行（配送ありは `confirm-shipping-fee` EP・pickup は `confirm-amount-deferred-cc` EP）
2. 金額確定ボタンの **3点セット**: ①金額確定（伝票ロック・`shipping_fee_amount_confirmed_at` set）②請求書作成（`issueInvoiceForBooking`）③メール送付＋Shopify Invoice（`draft_order_rebuild{sendShopifyInvoice:true}`）
3. **請求は全額一本**（レンタル料＋配送料・銀行振込と同じ・顧客の支払いは1回）。**後払いクレカでは DO② を使わない**（配送料は `adjustment_items` に折込→`recalculate` で DO① の `total_amount` に統合）
4. 金額確定後の商品追加: **別ドラフトオーダー（DO④）に分離**

### ロック契機（#2327 Phase1 から差替済み）

- **旧**: DO② 作成でロック（`shipping_fee_billing_status != null`）
- **新**: 金額確定でロック（`shipping_fee_amount_confirmed_at != null`）— `resolveBookingEditability` + `isBookingLockedForItemEdit` がこのフラグを読む
- 骨格（11 caller・app-proxy gate）はそのまま流用・判定条件のみ差替

### race fix（codex adversarial review・2026-07-24）

- cancel↔confirm の race を両方向で封印（cancel 側 FOR UPDATE 後 flag 再チェック + confirm 側 CAS updateMany）
- #2409（配送）と #2441（pickup）両方の confirm メソッドが CAS 化済み

---

## #2441: 前日自動請求 cron（✅ 実装済・7/23定例 A項）

2026-07-23 定例 A項で「**請求書発行＝レンタル開始日の前日に固定（自動送信）**」が確定。pickup 後払いクレカ伝票の未請求残件（19件）を解消するため、前日自動請求 cron を実装しました。

### 仕様（7/23 A項）

- **前日まで**: お客様は商品の出し入れ（追加/削除）可能
- **前日**: 請求書発行 → 伝票close → 以降の追加は別伝票
- **当日キャンセル**: システム上不可（伝票close済）。電話・メールの手動対応のみ
- **店頭受取も同ルール**（ただし**店頭現金払いは対象外**）
- **送信時刻**: 18:00 JST（env `DEFERRED_CC_INITIAL_INVOICE_CRON` で上書き可能）

### 実装

- **cron**: `DeferredCcInitialInvoiceCronService`（`schedule/`・毎日18:00 JST）・predicate: `start_date=明日` × pickup × CC × 後払い(pay_now=false) × DO①OPEN × 未確定
- **コア**: `confirmAmountForDeferredCreditCard`（pickup 専用・全額一本・配送料折込なし）
- **例外**: 初回即時入金希望等は手動EP `POST :id/confirm-amount-deferred-cc` で対応
- **キャンセルblock**: `updateStatusFromCustomer` CANCELLED 分岐に `shipping_fee_amount_confirmed_at` gate（伝票close後の顧客自己キャンセル拒否）

> 詳細は [前日自動請求の仕組み](/appendix/auto-invoicing/) 参照。

---

## 実装順と現状

```
#2407 (C) ──────────────────────── ✅ 実装済（2026-07-20・commit 574f358c）
#2408 (A) ──────────────────────── ✅ 実装済（2026-07-20・commit 7786c9af）
#2409 (B) ──────────────────────── ✅ 実装済（2026-07-20・commit 9a90bede）
#2441 (続編) ────────────────────── ✅ 実装済（2026-07-24・commit defd224c〜64221a1d）
#2327 Phase1 (関連) ────────────── ✅ 実装済・#2409 でロック契機を「金額確定」に差替済み
```

## 関連

- [自動キャンセルの仕組み](/appendix/auto-cancellation/) — #2407 の技術詳細（8経路カタログ）
- [前日自動請求の仕組み](/appendix/auto-invoicing/) — #2441 の技術詳細（cron・全額一本・伝票close）
- [決済方法別伝票作成フロー](/appendix/payment-method-flows/) — クレカ/銀行振込/店頭現金 × 各状況のマトリクス
- [返却・金額確定](/bookings-return/) — #2409 の返却時フロー
- [配送料確定](/bookings-shipping-fee/) — #2409 の配送画面
- BE `.claude/rules/auto-cancel-exclusions.md` — 自動キャンセル経路カタログ（開発者向け）
- BE `.claude/rules/invoice-single-issuance.md` — 請求書作成経路カタログ・#2408/#2423 注記（開発者向け）
- BE memory: `issue-2407-2409-1993-premise-collapse-respec`（裁定の詳細）
:::
