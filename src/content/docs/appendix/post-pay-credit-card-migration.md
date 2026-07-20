---
title: '後払いクレカ基本化の仕様変更'
description: '#1993前提崩れに伴う3 issue（#2407自動キャンセル停止・#2327商品ロック・#2409金額確定フロー）の流れ・裁定・実装状況（2026-07-20）'
sidebar:
  order: 55
---

> **💡 運用者向け:** 2026-07 に「クレカ＝前払い強制」の旧前提（#1993）が崩れ、**後払いが基本**になりました。これに伴う仕様変更が3本進行中です。(1) 開始日基準の自動キャンセルを**停止**（スタッフ手動管理へ・実装済）(2) クレカ伝票の**商品ロック**（実装済・過渡期）(3) 後払いクレカの**金額確定フロー**（予定・未実装）。技術詳細・裁定経緯は開発者モード（ページ右上トグル）ON でご確認ください。

:::dev
> **出典:** #2327 調査 → #2407/#2408/#2409 起票（2026-07-19）+ ユーザー裁定（2026-07-20）。BE memory: `issue-2407-2409-1993-premise-collapse-respec`

## 背景: #1993 前提の崩れ

#1982/#1993 は「**クレカ顧客は請求書なし・領収書都度発行・前払い強制・未払いは開始日前（135分cron/02:00cron）で自動キャンセル**」を前提としていました。しかし後払いが基本になった現在、この前提は実フローと乖離しました（本番実績: bank_transfer 56%・配送ありクレカの DO② 使用は10%のみ）。

結果として「後払いクレカに請求書を出せない」「スタッフの任意タイミング請求ができない」「auto-cancel が後払い伝票を巻き込むリスク」等が顕在化し、#2327 の調査から **3 issue（A/B/C）** に分割して仕様再編中です。

## 3 issue の裁定表（2026-07-20 时点）

| issue | 役 | 内容 | 状態 |
|---|---|---|---|
| **#2407** | C（独立・小） | 開始日基準の auto-cancel（02:00 cron）と7日前 final reminder を停止 | ✅ **実装済**（commit `574f358c`・デプロイ live）|
| **#2327 Phase1** | （関連・既存） | クレカ顧客が DO②（配送料請求）を作成すると商品追加削除をロック | ✅ **実装済**（commit `1c279358`）|
| **#2408** | A（中・Bの前提） | 請求書抑制を前払いクレカ（`pay_now`×pickup）限定に縮小 | ⏸ **実装保留でクローズ**（要望発生時に再着手）|
| **#2409** | B（大・核心） | 後払いクレカの金額確定フロー（全額一本・DO②廃止・DO④分離） | 🚫 **未実装**（#2408 ブロック中）|

実装順は C → A → B を想定していましたが、#2408 は「クレカ用請求書は書式分岐（振込先非表示等）が複雑・支払い先URLは既にメール送付済・領収書は都度発行済で実務上は請求書なしで運用が回っており緊急性低」との判断で**実装保留**。#2409 は #2408 の ccGuard 緩和が前提のため同様にブロック中です。

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
- **bank_transfer の #1944 soft-wording 振込督促**: Phase2 停止で消滅（手動管理運用で一貫・Phase1 + スタッフ直接連絡で担保）
- 変更ファイル: `draft-booking-lifecycle.service.ts`（gate 追加）/ spec / email-mock / `.claude/rules/auto-cancel-exclusions.md`

> 詳細は [自動キャンセルの仕組み](/appendix/auto-cancellation/) 参照。

---

## #2327: 商品ロック（✅ 実装済・過渡期）

クレカ顧客が **DO②（配送料請求ドラフトオーダー）を作成した時点**で、送料算定根拠の商品リストを固定するため **商品 item の追加・削除・更新をロック**します。

- **判定**: `isBookingLockedForItemEdit`（`status-transition.ts`）= `isBookingLockedForEdit(status)` OR `(isCreditCardPayment(payment_method) AND shipping_fee_billing_status != null)`
- **適用範囲**: 11 item CUD（`booking-items.service.ts`）+ `resolveBookingEditability` + app-proxy caller
- **配送操作・金額 adjustment CUD**: 従来窓維持（#1731）
- `shipping_fee_billing_status != null` は pending/paid/cancelled 全てで不可逆ロック（cleanup は pending のみ null 戻し可・送料未決済時）

### ⚠️ 過渡期の注意（#2409 で契機差替予定）

#2327 Phase1 のロック契機（DO② 作成）は、**#2409 で「金額確定済み」に差し替え予定**です（DO② 廃止・全額一本化のため）。骨格（`isBookingLockedForItemEdit`・11 caller・`resolveBookingEditability`）はそのまま流用し、判定条件のみ変わります。#2409 実装までは現行（DO② 作成でロック）が正です。

---

## #2409: 後払いクレカ金額確定フロー（🚫 未実装・予定）

> **注意**: 本節は**予定仕様**です（#2408 ブロック中で未実装）。実装時に詳細化されます。

後払いクレカ（クレカ × `shopify_order_id` 無し = DO① OPEN）を**銀行振込可顧客と同様**の請求フローにします:

1. スタッフが配送料決定後・ピッキング完了後など**任意のタイミング**で「金額確定」を実行
2. 配送料確定画面（`/bookings-shipping-fee`）の「Shopifyへ送信」ボタンを**「金額確定」にリネーム**（返却画面 `/bookings-return` の「金額確定」と同様の振る舞い）
3. 金額確定ボタンの **3点セット**: ①金額確定（伝票ロック）②請求書作成 ③メールで請求情報＋請求書送付
4. **請求は全額一本**（レンタル料＋配送料・銀行振込と同じ・顧客の支払いは1回）。**後払いクレカでは DO② を使わない**（配送料は DO① に統合）
5. 金額確定後の商品追加: 伝票に紐づくが **Shopify 上は別ドラフトオーダー（DO④）に分離**

### 設計の要点（実装時に詳細化）

- **「金額確定済み」の表現**: 新フラグ列 or 既存 invoice 存在で判定。B-3 ロック判定・B-4 DO④ 振替判定・FE 表示が同じ信号を読む（3点配線・#2329 教訓）
- **ステータス**: 配送料確定時点では `AMOUNT_CONFIRMED` にしない（返却後専用のため・出荷前〜レンタル中なので出荷・返却フローが壊れる）。ロックは専用フラグで表現
- **DO① への配送料統合**: Outbox worker 経由。`INVOICE_SENT` 書き込み失敗は #2398/#2401 のセーフティネット踏襲
- **返却時との整合**: 返却時 `confirmReturnAmount` は従来通り（延長料・損料の確定）。配送料確定はその前段の部分確定。延長料等は DO③（adjustment_items→additional_fee_billings）で別請求（既存機構・変更なし）
- **#2327 Phase1 のロック契機**: 本 issue の B-3 で「金額確定済み」に差替（骨格は流用）

### ブロック条件

- **#2408（ccGuard 緩和）が前提**: 後払いクレカの請求書作成には ccGuard を「前払いクレカのみ拒否」に緩和する必要がある。#2408 は実装保留のため #2409 もブロック中
- FE 連携（`/bookings-shipping-fee` 画面のボタン改名・確認ダイアログ・完了表示）は BE API 確定後に別 issue 起票

---

## 実装順と現状

```
#2407 (C) ──────────────────────── ✅ 実装済（2026-07-20・commit 574f358c）
                                     ↓
#2408 (A) ──────────────────────── ⏸ 実装保留でクローズ（要望発生時に再着手）
                                     ↓ (ブロック中)
#2409 (B) ──────────────────────── 🚫 未実装（#2408 ブロック中）
#2327 Phase1 (関連) ────────────── ✅ 実装済（commit 1c279358・#2409 で契機差替予定）
```

## 関連

- [自動キャンセルの仕組み](/appendix/auto-cancellation/) — #2407 の技術詳細（8経路カタログ）
- [返却・金額確定](/bookings-return/) — #2409 の返却時フロー（既存・#2409 はその前段）
- [配送料確定・Shopify請求](/delivery-fee-shopify-flow/) — #2409 B-1 の対象画面
- BE `.claude/rules/auto-cancel-exclusions.md` — 自動キャンセル経路カタログ（開発者向け）
- BE memory: `issue-2407-2409-1993-premise-collapse-respec`（裁定の詳細）
:::
