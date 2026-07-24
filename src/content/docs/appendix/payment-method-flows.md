---
title: '決済方法別伝票作成フロー'
description: 'クレカ（前払い/後払い）・銀行振込・店頭現金の決済方法別に、各ケースでどう伝票・請求書を作成するかのマトリクス'
sidebar:
  order: 57
---

> **💡 運用者向け:** お客様の決済方法（クレカ前払い・クレカ後払い・銀行振込・店頭現金）によって、**伝票の作り方・請求書の発行タイミング・返金の方法**が異なります。このページでは「どんなケースでどう伝票を作成するか」を一覧表で整理しています。迷ったときはこの表を参照してください。

## 決済方法の分類

| 決済方法 | 条件 | 特徴 |
|---|---|---|
| **クレカ前払い** | クレカ × 店頭受取 × 「今すぐ払う」ボタン（`pay_now=true`） | カート投入時に**即時決済**。DO① が即 Order 化される |
| **クレカ後払い** | クレカ × （配送 または 店頭受取×`pay_now=false`） | DO① が **OPEN のまま**残る。返却時または前日に金額確定→請求書発行→決済 |
| **銀行振込** | `bank_transfer`（銀行振込可タグ顧客のみ） | DO① が OPEN のまま。返却後、請求書発行→振込入金 |
| **店頭現金** | `cash` / `store_payment` | DO① が OPEN のまま。返却時の金額確定後、スタッフが入金登録 |

> 「クレカ後払い」は 2026-07 に基本化されました（以前は前払い強制）。店頭受取のクレカは**デフォルト後払い**で、「今すぐ払う」ボタンを押した場合のみ前払いになります。

## 伝票作成マトリクス（決済方法 × 状況）

| 状況 | クレカ前払 | クレカ後払(店頭受取) | クレカ後払(配送) | 銀行振込 | 店頭現金 |
|---|---|---|---|---|---|
| **初回DO①** | カートで即時決済 | 前日cron自動発行 | 前日cron/手動「金額確定」 | カート/管理画面でOPEN | 管理画面でOPEN |
| **配送料** | DO②別伝票 | （配送なし） | DO①に全額一本 | DO①に統合 | DO①に統合 |
| **追加料金（延長/破損）** | DO③別伝票 | DO③別伝票(確定後) | DO③別伝票(確定後) | adjusted_amount加算 | adjusted_amount加算 |
| **追加商品** | DO④別伝票 | DO④別伝票 | DO④別伝票 | 伝票に直接追加 | 伝票に直接追加 |
| **配送キャンセル料** | DO⑤別伝票 | DO①に統合 | DO①に統合 | cancellation_fee計上 | cancellation_fee計上 |
| **返金** | EASE経路(Shopify refund自動) | EASE経路 | EASE経路 | 記録のみ(オフライン返金) | 記録のみ |

## ライフサイクル（共通）

```
1. カート投入・伝票作成（DO①）
2. 前営業日18時まで: お客様は商品追加/削除可能
3. レンタル開始前日: 請求書発行 → 伝票close → 以降の追加は別伝票
4. 当日キャンセル: システム上不可（伝票close済・電話/メールで手動対応）
5. レンタル期間
6. 返却: 延長/破損等の金額確定
7. 追加料金があれば DO③（クレカ）/ adjusted_amount（非クレカ）
8. 決済完了 → 完了
```

> **伝票closeとは**: 請求書が発行されて金額が確定した状態。これ以降、商品の追加は別伝票（DO④）に分離され、当日キャンセルも不可になります。店頭現金払いは対象外（即時決済のため前日請求が発生しない）。

## 返金フロー（重要）

### 返金は必ずEASE管理画面から行う

:::warning
**Shopify admin で直接返金しないでください。** EASE に記録が残らず、顧客への請求表示と実際の返金がズレます。
:::

| 決済方法 | 返金方法 | Shopify連携 |
|---|---|---|
| **クレカ**（前払/後払） | EASE管理画面「返金」ボタン → Shopify `createRefund` 自動呼出 | ✅ 連携（1アクションで完結） |
| **銀行振込** | EASE管理画面で `refund_method=bank_transfer` で記録のみ | ❌ 連携なし（オフラインで振込返金後、EASEに記録） |
| **店頭現金** | EASE管理画面で `refund_method=cash` で記録のみ | ❌ 連携なし（現金で返した後、EASEに記録） |

### 万が一 Shopify admin で直接返金してしまった場合

EASE 側には記録されないため、**EASE管理画面でも手動で返金記録を入力**する必要があります（手動2度手間）。これを避けるため、返金は常に EASE 管理画面から行ってください。

### 過払い返金（商品削除等）

クレカ決済済み伝票で商品削除・価格減額があった場合、過払い分（`paid_amount − total_amount`）の返金は `POST /bookings/:id/refund-overpayment` で半自動処理できます。

### 二重決済の検知

振込入金済み伝票に顧客がクレカ決済してしまった場合、EASE が `double_payment_suspected` で警告を出します。自動返金しないため、スタッフが手動で返金処理を行ってください。

:::dev
> **出典:** BE #2409（DO①一本化）/ #2441（前日自動請求）/ #2330（後払い基本化）/ #2408（請求書抑制前払い限定）/ #2218（DO⑤）/ 7/23定例 B項（返金＝手動2度手間）

## 技術詳細: Draft Order 番号体系

| DO | 用途 | mirror カラム | 作成メソッド |
|---|---|---|---|
| **DO①** | 本体（レンタル料＋配送料） | `shopify_draft_order_gid` / `shopify_order_id` | cart / confirmAmountForDeferredCreditCard / confirmShippingFeeForDeferredCreditCard |
| **DO②** | 配送料（前払いクレカのみ） | `shipping_fee_*` | createShippingFeeDraftOrder |
| **DO③** | 追加料金（延長/破損） | `additional_fee_*` / `additional_fee_billings` 子テーブル | createAdditionalFeeDraftOrder |
| **DO④** | 追加商品 | `product_addition_*` | createProductAdditionDraftOrder |
| **DO⑤** | 配送キャンセル料（前払いクレカのみ） | `cancellation_fee_*` | createCancellationFeeDraftOrder |

## 伝票closeの2種類

| 種類 | トリガー | 効果 |
|---|---|---|
| **hard close** | `shopify_order_id` set（DO① が Shopify Order 化＝決済完了） | DO① に line item 追加不可。追加系は全て別 DO |
| **soft close** | `shipping_fee_amount_confirmed_at` set（後払いクレカの金額確定・前日請求） | DO① は OPEN だが item edit ロック。追加は DO④ へ |

## 関連

- [後払いクレカ基本化の仕様変更](/appendix/post-pay-credit-card-migration/) — #2407/#2408/#2409/#2441 の全体像
- [前日自動請求の仕組み](/appendix/auto-invoicing/) — #2441 の技術詳細
- [自動キャンセルの仕組み](/appendix/auto-cancellation/) — #2407
- [返金処理](/refund/) — 返金の3系統
- BE `.claude/rules/invoice-single-issuance.md` — 請求書作成経路カタログ（開発者向け）
:::
