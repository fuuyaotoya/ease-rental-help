---
title: 'メール本文テンプレート（BE送信）'
description: 'バックエンド(BE)が送信するメールの本文全文テンプレート。変数は ${...} で表記し、ソースコードと1:1。送信元アドレスの使い分け（送信専用 / 経理専用）も記載。'
sidebar:
  order: 107
---

:::dev
> **管理者/開発者向けリファレンス:** 本ページは BE が SMTP 送信するメールの本文テンプレート全文です。`${...}` は実行時に値が埋まる変数。実装（`src/modules/email/email.service.ts` / `invoices.service.ts` / `consolidated-invoices.service.ts` / `invoice-reminder-cron.service.ts`）と1:1で照合できます。本文の変更時は本ページの追従が必要です（末尾「鮮度・保守」参照）。
:::

バックエンド（BE）は nodemailer + SendGrid SMTP でメールを送信します。本ページは **BE が送信する全メールの本文テンプレート**を網羅します（Shopify が送信する注文確認などは対象外 → [メール送信の責任分界](./appendix/email-responsibility)）。

本文は `${変数名}` のプレースホルダ付きで記載し、ソースコードと1:1で照合できます。条件付きで表示される行は `（条件の場合）` と注記しています。

送信タイミング・宛先の一覧は [自動送信メール一覧](./email-notifications) を参照。

## 共通事項

### 送信元アドレス（FROM）— ⚠️ 重要

BE のメールは **2種類の送信元**を使い分けます。

| 送信元 | 性質 | 対象メール |
|--------|------|-----------|
| `rental-info@iziz.co.jp` | **送信専用**（返信不可・監視しない） | 予約確認・リマインダ・キャンセル通知・返金通知・追加決済請求（Draft Order）・管理者アラート・お問い合わせ受付 等、**請求書以外の全メール** |
| `keiri@iziz.co.jp` | **経理専用**（返信可・経理チームが受信） | **請求書メールのみ**（標準請求書・統合請求書・再請求リマインダー・督促） |

- `rental-info@` 宛の返信は **監視していません**。顧客からの問い合わせは、本文末尾の iziz 会社署名（メール: `shop@iziz.co.jp`／サイト: http://www.iziz.co.jp）をご案内しています（#2342）。
- 請求書メールだけ `keiri@iziz.co.jp`（経理専用）から送り、**入金・請求に関する返信が経理チームに届く**ようにしています。
- 設定は環境変数で上書き可能: `EMAIL_FROM`（送信専用・デフォルト `rental-info@`）/ `INVOICE_EMAIL_FROM`（請求書用・デフォルト `keiri@`）。いずれも SendGrid 認証済み sender である必要があります。

:::caution
`rental-info@iziz.co.jp` と `keiri@iziz.co.jp` はどちらも **SendGrid で認証済み（verified sender）** である必要があります。未認証のアドレスを From にすると SendGrid が送信を拒否します。
:::

### 送信の仕組み

- ライブラリ: `nodemailer`（`@nestjs-modules/mailer` 不使用）
- トランスポート: SendGrid SMTP relay（`smtp.sendgrid.net` / user=`apikey`）
- master switch: `EMAIL_ENABLED`（`false` で全メール送信スキップ・`email_logs.status='skipped_disabled'` 記録）
- 送信履歴: `email_logs` テーブルに subject / recipient / status / email_type を全件記録

### HTML ラップ・ロゴ

全メールの HTML 本文は `buildHtmlEmail(plainText)` で生成します（プレーン `text` も同梱）。

- プレーン本文を `<div style="white-space:pre-line">` でラップ（改行を保持）
- ロゴ画像（PNG）を **本文下部（フッタ）** に配置
- `LOGO_URL`: `https://cdn.shopify.com/s/files/1/0699/9582/3279/files/creative-logo01.png?v=1779071046`

### フッタ（共通の iziz 会社署名 — #2342）

**全顧客向けメール**（予約確認・リマインダ・キャンセル通知・返金通知・Draft Order 請求・会員招待・標準/統合請求書・再請求リマインダー・お問い合わせ受付）は、共通の **iziz 会社署名**（`COMPANY_SIGNATURE`）を本文末尾に付与します。`email.service.ts` の `withSignature()` 経由で、プレーン本文にも HTML 本文にも自動反映されます（ロゴ画像は署名の後に配置）。

```
□■--------------------------------------------------------------
〒141-0031 東京都品川区西五反田3-1-1
TEL: 03-5759-8266　FAX: 03-5759-8262
サイト: http://www.iziz.co.jp
メールアドレス: shop@iziz.co.jp
営業時間: 9:30～18:00(月～金)・9:30～17:00(土)
休業日: 日・祝
```

| 種別 | フッタ |
|------|--------|
| 顧客向け（共通） | 上記 iziz 会社署名（`COMPANY_SIGNATURE`・`withSignature()` で付与） |
| 管理者向け（return_overdue・廃止） | 旧 `---` / `EASE Rental System` / `Timestamp: ${ISO}`（#2182/#2321 で送信メソッドごと削除・現在送信されません） |
| 管理者アラート | `---` / `EASE Rental System - Automated Alert` / `Timestamp: ${ISO}` |

:::note[#2342 での変更]
- 顧客向けメールの簡易フッタ（`---` / `EASE Rental` / `お問い合わせ: info@ease-rental.com`）を廃止し、共通の iziz 会社署名に統一しました。
- 標準請求書（`--` / `${自社会名}` / `TEL` / `FAX`）・統合請求書（`────` / `${自社会名}`）が本文に持っていた独自フッタも廃止し、共通署名に統一しました。会社名は**請求書 PDF 本体**に記載されています（メール本文からは会社名表記が消え、iziz 署名のサイト URL・メールアドレスで発行者を明示します）。
- 返金完了通知は従来フッタなしでしたが、共通署名を付与するようにしました。
:::

### 宛名生成ロジック（buildBillingGreeting）

請求書メールの宛名は請求先マスタ（`billing_addresses`）から生成。4パターン:

| 条件 | 宛名 |
|------|------|
| 会社名＋担当者名 あり | `${会社名}` / `${部署} ${担当者名} 様`（部署なし場合は `${担当者名} 様`） |
| 会社名のみ | `${会社名}` / `ご担当者様` |
| 担当者名のみ | `${担当者名} 様` |
| 両方なし | `ご担当者様` |

:::note[宛名 SSOT の適用範囲]
`buildBillingGreeting`（`src/modules/email/utils/build-billing-greeting.ts`）を使っているのは**返金通知・標準/統合請求書・再請求リマインダー**（請求先マスタ由来の宛名）。予約確認・リマインダ・キャンセル通知・Draft Order 請求・会員招待・お問い合わせ受付は `${customerName} 様` 等のインライン分岐（「御中」は全メソッドで使用しません・#2342）。
:::

### 補助関数

| 関数 | 挙動 |
|------|------|
| `formatYen(x)` | `¥` 前置＋`toLocaleString()`。null/undefined → `¥0` |
| `resolveDisplayId(slip, id)` | `slipNumber \|\| bookingId \|\| '不明'`（伝票番号優先） |
| `getCompanyName()` | 送信元（自社）の会社名 |

---

## 予約関連

### 1. 予約受付確認（sendBookingConfirmation）

- **件名**: `【EASE Rental】ご予約を受け付けました`（bank_transfer 以外）/ `【EASE Rental】仮予約を受け付けました`（仮予約）
- **FROM**: `rental-info@iziz.co.jp`（送信専用）
- **email_type**: `booking_confirmation`
- **トリガー**: カート確定直後（全決済方法）

**お支払いセクション（paymentMethod で分岐）:**

bank_transfer:
```
【お支払いについて】
お客様は銀行振込でのお支払いとなります。
月末締めの請求書を別途お送りいたしますので、記載の期日までにお振込みください。
※ご返却があった月末で締めさせていただきます。例)7/30貸出→8/1返却の場合は8月末締めになります。
```

cash / store_payment:
```
【お支払いについて】
お支払いは店頭にて承ります。
```

クレジットカード（invoiceUrl あり）:
```
【お支払いについて】
以下のURLよりお支払い手続きをお願いいたします。
${invoiceUrl}
```

クレジットカード（invoiceUrl なし・フォールバック）:
```
【お支払いについて】
お支払い手続きの案内メールを別途お送りいたします。
```

**配送セクション（buildDeliverySection・配送情報がある場合のみ表示）:**
```
【配送について】
■ ${deliveryTypeLabel}（ラベルがない場合は ■ 配送）
（宛先がある場合）  宛先: ${destinationName}
（住所がある場合）  住所: ${address}
（電話がある場合）  電話: ${phone}
（日付がある場合）  日付: ${deliveryDate}
（時間帯がある場合）  時間帯: ${timeWindow}
※配送の手配の可否・料金につきましては、別途ご連絡いたします。
```

**HTML版の特記事項（#2359・#2370）:**
- 商品画像がある場合（`items.some(item => !!item.imageUrl)`）、`【ご予約商品】`セクションを商品写真テーブル（`buildProductListHtml`）に置換（#2359）。画像1枚もない場合は従来テキスト版（#2055）。
- ガイド行の「ご利用ガイド」を `<a href="${BOOKING_ADDITION_GUIDE_URL}" style="color:#0066cc;text-decoration:underline;">ご利用ガイド</a>` アンカーに置換（#2370）。
- Thunderbird・Outlook系（Wordレンダリングエンジン）ではCSS `max-width` が効かず商品画像が原寸で表示されてレイアウトが崩れるのを防ぐため、HTML属性でサイズ固定する二重防御をとっています（[#2359](https://github.com/iziz-system/ease-rental-backend/issues/2359)）。Gmail は自前で画像リサイズするため影響を受けません。

**本文（メイン）:**
```
（customerNameがある場合）${customerName} 様
（customerNameがない場合）お客様

いつもEASE Rentalをご利用いただきありがとうございます。
（仮予約の場合）以下の内容で仮予約（仮押さえ）を受け付けました。お支払いの完了をもって予約が確定となります。
（それ以外）以下の内容でご予約を受け付けました。

【ご予約内容】
（伝票番号がある場合）伝票番号: ${slipNumber}
レンタル期間: ${startDate} 〜 ${endDate}

【ご予約商品】
（商品ごとに1行）  ・${productName}（数量: ${quantity}）
（SKU がある場合は行末に付与）  ・${productName}（数量: ${quantity}） SKU: ${sku}
（商品がない場合）  ・(商品情報なし)

（合計金額がある場合）合計金額: ¥${totalAmount}（税込）

（#2303/#2370）商品の追加をご希望の場合は、ご利用ガイド（https://ease-site.myshopify.com/pages/rental-faq#guide）をご覧ください。（HTML版では「ご利用ガイド」をアンカーテキスト化）

${paymentSection}

（配送情報がある場合）${deliverySection}

ご不明な点がございましたら、お気軽にお問い合わせください。

□■--------------------------------------------------------------
〒141-0031 東京都品川区西五反田3-1-1
TEL: 03-5759-8266　FAX: 03-5759-8262
サイト: http://www.iziz.co.jp
メールアドレス: shop@iziz.co.jp
営業時間: 9:30～18:00(月～金)・9:30～17:00(土)
休業日: 日・祝
```

**変数**: `${customerName}`, `${slipNumber}`, `${startDate}`, `${endDate}`, `${productName}`, `${quantity}`, `${totalAmount}`, `${invoiceUrl}`, `${deliveryTypeLabel}`, `${destinationName}`, `${address}`, `${phone}`, `${deliveryDate}`, `${timeWindow}`

### 2. 仮予約確定通知（sendTentativeConfirmedNotification）

- **件名**: `【EASE Rental】仮予約が確定になりました`
- **FROM**: `rental-info@iziz.co.jp`（送信専用）
- **email_type**: `tentative_confirmed`
- **トリガー**: 仮予約が確定になった時（`ENABLE_TENTATIVE_CONFIRM_MAIL=true` のみ送信・デフォルト false）

```
（customerNameがある場合）${customerName} 様
（customerNameがない場合）お客様

いつもEASE Rentalをご利用いただきありがとうございます。

以下のご予約（${resolveDisplayId(slipNumber, bookingId)}）について、仮予約が確定となりましたのでお知らせいたします。

【確定内容】
（商品ごとに1行）  ・${productName}（数量: ${quantity}、期間: ${period}）
確定日時: ${confirmedAt}

引き続きよろしくお願いいたします。
ご不明な点がございましたら、お気軽にお問い合わせください。

□■--------------------------------------------------------------
〒141-0031 東京都品川区西五反田3-1-1
TEL: 03-5759-8266　FAX: 03-5759-8262
サイト: http://www.iziz.co.jp
メールアドレス: shop@iziz.co.jp
営業時間: 9:30～18:00(月～金)・9:30～17:00(土)
休業日: 日・祝
```

**変数**: `${customerName}`, `${slipNumber}`, `${bookingId}`, `${productName}`, `${quantity}`, `${period}`, `${confirmedAt}`

### 3. 仮予約リマインダ（sendDraftBookingReminder）

- **件名**: `【EASE Rental】ご予約のお支払いのご案内（レンタル開始${daysUntilStart}日前）`
- **FROM**: `rental-info@iziz.co.jp`（送信専用）
- **email_type**: `reminder`
- **トリガー**: 仮予約の支払督促（`draft-booking-lifecycle` cron・毎日2時）

```
（customerNameがある場合）${customerName} 様
（customerNameがない場合）お客様

いつもEASE Rentalをご利用いただきありがとうございます。

以下のご予約（${resolveDisplayId(slipNumber, bookingId)}）について、お支払いが確認できておりません。

【ご予約内容】
（商品ごとに1行）  ・${productName}（数量: ${quantity}、期間: ${period}）
レンタル開始日: ${startDate}
（合計金額がある場合）ご請求金額: ${formatYen(totalAmount)}（税込）

※ レンタル開始日の7日前（午前2時）までにお支払いが確認できない場合、
  ご予約は自動的にキャンセルとなりますのでご注意ください。

お支払い方法やご不明な点がございましたら、お気軽にお問い合わせください。

□■--------------------------------------------------------------
〒141-0031 東京都品川区西五反田3-1-1
TEL: 03-5759-8266　FAX: 03-5759-8262
サイト: http://www.iziz.co.jp
メールアドレス: shop@iziz.co.jp
営業時間: 9:30～18:00(月～金)・9:30～17:00(土)
休業日: 日・祝
```

**変数**: `${customerName}`, `${slipNumber}`, `${bookingId}`, `${productName}`, `${quantity}`, `${period}`, `${startDate}`, `${formatYen(totalAmount)}`, `${daysUntilStart}`

### 4. 最終リマインダ（sendFinalReminderBeforeAutoCancel）

- **件名**: `【EASE Rental】【重要】ご予約が明日自動キャンセルされます`
- **FROM**: `rental-info@iziz.co.jp`（送信専用）
- **email_type**: `reminder`
- **トリガー**: 自動キャンセル前日（レンタル開始7日前・`draft-booking-lifecycle` cron）

```
（customerNameがある場合）${customerName} 様
（customerNameがない場合）お客様

いつもEASE Rentalをご利用いただきありがとうございます。

【重要】以下のご予約について、明日自動キャンセルが実行される予定です。

【ご予約内容】
（伝票番号がある場合）伝票番号: ${slipNumber}
レンタル品目: ${itemName}
レンタル開始日: ${startDate}
自動キャンセル予定日: ${cancelDate}

${paymentInstruction}

ご不明な点がございましたら、お気軽にお問い合わせください。

□■--------------------------------------------------------------
〒141-0031 東京都品川区西五反田3-1-1
TEL: 03-5759-8266　FAX: 03-5759-8262
サイト: http://www.iziz.co.jp
メールアドレス: shop@iziz.co.jp
営業時間: 9:30～18:00(月～金)・9:30～17:00(土)
休業日: 日・祝
```

`${paymentInstruction}` は銀行振込可否で分岐:
- 銀行振込可（`isBankTransferAllowed=true`）: `自動キャンセルはされませんが、早期のお支払いをお願いいたします。`
- それ以外: `お支払いまたはご連絡をお願いいたします。`

**変数**: `${customerName}`, `${slipNumber}`, `${itemName}`, `${startDate}`, `${cancelDate}`, `${paymentInstruction}`

### 5. キャンセル通知（sendAutoCancelNotification）

- **件名**: `【EASE Rental】ご予約の自動キャンセルのお知らせ`（自動）/ `【EASE Rental】ご予約のキャンセルのお知らせ`（手動・`isManual`）
- **FROM**: `rental-info@iziz.co.jp`（送信専用）
- **email_type**: `auto_cancel`
- **トリガー**: 仮予約の自動キャンセル（cron）/ 手動キャンセル

```
（customerNameがある場合）${customerName} 様
（customerNameがない場合）お客様

いつもEASE Rentalをご利用いただきありがとうございます。

（手動の場合）以下のご予約（${resolveDisplayId(slipNumber, bookingId)}）がキャンセルされましたのでお知らせいたします。
（自動の場合）以下のご予約（${resolveDisplayId(slipNumber, bookingId)}）は、お支払いが確認できなかったため自動キャンセルとなりました。

【キャンセル理由】
${reason}

【ご予約内容】
（商品ごとに1行）  ・${productName}（数量: ${quantity}、期間: ${period}）

改めてご予約をご希望の場合は、再度お申し込みをお願いいたします。
ご不明な点がございましたら、お気軽にお問い合わせください。

□■--------------------------------------------------------------
〒141-0031 東京都品川区西五反田3-1-1
TEL: 03-5759-8266　FAX: 03-5759-8262
サイト: http://www.iziz.co.jp
メールアドレス: shop@iziz.co.jp
営業時間: 9:30～18:00(月～金)・9:30～17:00(土)
休業日: 日・祝
```

**変数**: `${customerName}`, `${slipNumber}`, `${bookingId}`, `${reason}`, `${productName}`, `${quantity}`, `${period}`

---

## 返却・返金

### 6. 返金完了通知（sendRefundNotification）

- **件名**: `返金完了のお知らせ（請求書: ${invoiceNumber}）`（請求書番号がある場合）/ `返金完了のお知らせ`（ない場合）
- **FROM**: `rental-info@iziz.co.jp`（送信専用）
- **email_type**: `refund`
- **トリガー**: 返金処理実行時（`requestRefund` 等）

```
${greeting}

返金処理が完了しました。
返金金額: ${formatYen(amount)}（税込）
（伝票番号がある場合）伝票番号: ${slipNumber}
（請求書番号がある場合）請求書番号: ${invoiceNumber}
（理由がある場合）理由: ${reason}

□■--------------------------------------------------------------
〒141-0031 東京都品川区西五反田3-1-1
TEL: 03-5759-8266　FAX: 03-5759-8262
サイト: http://www.iziz.co.jp
メールアドレス: shop@iziz.co.jp
営業時間: 9:30～18:00(月～金)・9:30～17:00(土)
休業日: 日・祝
```

**変数**: `${greeting}`（[buildBillingGreeting](#宛名生成ロジックbuildbillinggreeting) の出力・会社名/部署/担当者名・未指定は「ご担当者様」）, `${formatYen(amount)}`, `${slipNumber}`, `${invoiceNumber}`, `${reason}`

:::note[廃止: 返却期限超過通知]
旧 #6「返却期限超過通知（sendReturnOverdueNotice）」は、自動延長機能の廃止（#2182）に伴い `4f75d69e`（fix #2321・残骸削除）で送信メソッドごと削除されました（127行）。現在は送信されません。`return_overdue` email_type は過去の `email_logs`（sent 66 / skipped 42）の後方互換のため `email-type.constant.ts` に `[DEPRECATED #2321]` コメント付きで残置のみ。
:::

---

## 請求書（keiri@iziz.co.jp から送信）

:::note
請求書メールは **経理専用アドレス `keeri@iziz.co.jp`** から送信されます。入金・請求に関する返信が経理チームに届きます。他のメール（送信専用 `rental-info@`）とは差出人が異なります。
:::

請求書メールはいずれも **銀行振込顧客のみ** が対象（クレジットカード顧客は Shopify 決済リンクで処理）。宛先は注文アカウントではなく **請求先マスタ（`billing_addresses`）の `billing_email`**。請求先未登録・`billing_email` 空の場合は送信スキップ＋管理者アラート（→ 管理者アラート）。

### 7. 標準請求書（invoices.service generateInvoiceEmailText）

- **件名**: `【EASE Rental】請求書送付のご案内`（#2690 B065）
- **FROM**: `keiri@iziz.co.jp`（経理専用）
- **email_type**: `invoice`
- **トリガー**: 請求書送信操作時・返却確定時の自動発行
- **添付**: 請求書 PDF

```
${greeting}

この度はご利用いただき、誠にありがとうございました。
ご返却が完了し、ご利用料金が確定いたしましたので、
請求書（番号: ${invoice.invoice_number}）をお送りいたします。

添付の請求書をご確認の上、記載のお支払い期限までにお振込みをお願いいたします。
なお、お振込み手数料はご負担ください。

ご不明な点がございましたら、お気軽にお問い合わせくださいませ。

□■--------------------------------------------------------------
〒141-0031 東京都品川区西五反田3-1-1
TEL: 03-5759-8266　FAX: 03-5759-8262
サイト: http://www.iziz.co.jp
メールアドレス: shop@iziz.co.jp
営業時間: 9:30～18:00(月～金)・9:30～17:00(土)
休業日: 日・祝
```

**変数**: `${greeting}`（[buildBillingGreeting](#宛名生成ロジックbuildbillinggreeting) の出力）, `${invoice.invoice_number}`（※ #2342 で旧フッタ `--`/`${companyName}`/TEL/FAX を廃止し、共通の iziz 会社署名に統一。会社名は PDF 本体に記載）

### 8. 統合（まとめ）請求書（consolidated-invoices.service generateInvoiceEmailText）

- **件名**: `【請求書】${getCompanyName()} ${monthFormatted}分`
- **FROM**: `keiri@iziz.co.jp`（経理専用）
- **email_type**: `invoice`
- **トリガー**: 月次統合請求書送信操作時（API）/ 月次バッチ cron
- **添付**: 統合請求書 PDF

```
${greeting}

平素よりお世話になっております。
${ourCompanyName}です。

下記の通り、月次統合請求書をお送りいたします。
添付のPDFをご確認のうえ、お支払いをお願いいたします。

請求月: ${monthFormatted}

ご不明点がございましたら、お気軽にお問い合わせください。

よろしくお願いいたします。

□■--------------------------------------------------------------
〒141-0031 東京都品川区西五反田3-1-1
TEL: 03-5759-8266　FAX: 03-5759-8262
サイト: http://www.iziz.co.jp
メールアドレス: shop@iziz.co.jp
営業時間: 9:30～18:00(月～金)・9:30～17:00(土)
休業日: 日・祝
```

**変数**: `${greeting}`（buildBillingGreeting の出力・引数は `consolidated_invoices` snapshot の `billing_company_name` / `billing_department` / `billing_contact_name`）, `${ourCompanyName}`（`getCompanyName()`）, `${monthFormatted}`（`${year}年${month.padStart(2,'0')}月`・例: `2026年01月`）

### 9. 単票（個別）請求書の再請求リマインダー（invoice-reminder-cron generateReminderEmailText）

- **件名**: `【再請求】請求書のお支払いについて (${invoice.invoice_number})`
- **FROM**: `keiri@iziz.co.jp`（経理専用・`emailService.sendInvoice` 経由）
- **email_type**: `invoice`
- **トリガー**: 未入金の標準請求書に対する再請求（`invoice-reminder-cron`・定期）
- **添付**: 請求書 PDF

```
${greeting}

平素より大変お世話になっております。
${ourCompanyName}でございます。

${reminderText}の請求書再送付のご連絡を申し上げます。

請求書番号: ${invoiceNumber}
お支払い期限: ${dueDate}
請求金額: ${formatYen(totalAmount)}（税込）

つきましては、添付の請求書をご確認いただき、
お支払いの手続きをお願い申し上げます。

既にお支払い済みの場合は、何卒ご容赦くださいませ。

ご不明な点がございましたら、お気軽にお問い合わせください。

今後ともよろしくお願い申し上げます。

--
${ourCompanyName}
EASE Rental
```

**変数**: `${greeting}`（buildBillingGreeting・`resolveBookingEffectiveBillingFromMaster` #2255 経由）, `${ourCompanyName}`（`getCompanyName()`）, `${reminderText}`（`reminderNumber === 1 ? '初回' : '${reminderNumber}回目'`）, `${invoiceNumber}`, `${dueDate}`（`formatDateJP(invoice.due_date)`・`YYYY年M月D日`）, `${formatYen(totalAmount)}`

:::caution[二重フッタ（#2342 取り残し・BE側修正候補）]
本文内に `-- / ${ourCompanyName} / EASE Rental` の独自フッタが残存しており、さらに `withSignature()` で iziz 会社署名（COMPANY_SIGNATURE）も付与される**二重フッタ状態**。初回送信（#7/#8）は #2342 で本文内フッタを削除済みだが、再請求リマインダー（#9/#10）は取り残されている。BE 側で本文内フッタを削除する修正が候補。
:::

### 10. 統合（まとめ）請求書の再請求リマインダー（invoice-reminder-cron generateConsolidatedReminderEmailText）

- **件名**: `【再請求】${monthFormatted}分 統合請求書のお支払いについて`
- **FROM**: `keeri@iziz.co.jp`（経理専用・`emailService.sendInvoice` 経由）
- **email_type**: `invoice`
- **トリガー**: 未入金の統合請求書の再請求（`invoice-reminder-cron`・定期）
- **添付**: 統合請求書 PDF

```
${greeting}

平素より大変お世話になっております。
${ourCompanyName}でございます。

${monthFormatted}分の統合請求書につきまして、
${reminderText}の再送付をご連絡申し上げます。

請求金額: ${formatYen(totalAmount)}（税込）

つきましては、添付の請求書をご確認いただき、
お支払いの手続きをお願い申し上げます。

既にお支払い済みの場合は、何卒ご容赦くださいませ。

ご不明な点がございましたら、お気軽にお問い合わせください。

今後ともよろしくお願い申し上げます。

--
${ourCompanyName}
EASE Rental
```

**変数**: `${greeting}`（buildBillingGreeting・引数は `consolidated_invoices` snapshot 列）, `${ourCompanyName}`, `${monthFormatted}`（`${year}年${month.padStart(2,'0')}月`）, `${reminderText}`, `${formatYen(totalAmount)}`

:::caution[二重フッタ（#2342 取り残し・BE側修正候補）]
#9 と同一。本文内フッタ `-- / ${ourCompanyName} / EASE Rental` が残存 + withSignature で iziz 署名も付与。
:::

### 11. Draft Order 追加決済請求（sendDraftOrderInvoiceMail）

- **FROM**: `rental-info@iziz.co.jp`（送信専用）※「請求書」ではなく追加決済の決済リンク案内のため経理専用ではなく送信専用
- **email_type**: `draft_order_invoice`（`recordDunning=true` のときは追加で `reminder` も記録）
- **トリガー**: 追加課金発生時（DO②配送料 / DO③追加料金 / DO④追加商品 / DO⑤配送キャンセル料）・cron 督促（T-3/T-1）

**件名・冒頭文（kind 別）:**

| kind | 件名 | 本文冒頭文（preamble） |
|------|------|----------------------|
| `shipping_fee` | `【EASE】配送料のお支払いのお願い（伝票番号: ${displayId}）` | `配送料のお支払いをお願いいたします。` |
| `additional_fee` | `【EASE】追加料金のお支払いのお願い（伝票番号: ${displayId}）` | `追加料金（延長料金・損害料金等）のお支払いをお願いいたします。` |
| `product_addition` | `【EASE】追加商品のお支払いのお願い（伝票番号: ${displayId}）` | `追加商品のお支払いをお願いいたします。` |
| `cancellation_fee` | `【EASE】配送キャンセル料のお支払いのお願い（伝票番号: ${displayId}）` | `配送キャンセル料のお支払いをお願いいたします。` |

※ cron 督促時は `subjectOverride` / `preambleOverride` で上書きされる場合があります。

**お支払い方法セクション（invoiceUrl の有無で分岐）:**

invoiceUrl あり:
```
【お支払い方法】
以下のURLよりクレジットカード決済をお願いいたします。
${invoiceUrl}
（paymentDeadlineMinutes > 0 の場合）※お支払い期限: 発行から${paymentDeadlineMinutes}分以内
```

invoiceUrl なし（フォールバック）:
```
【お支払い方法】
お支払い手続きの案内メールを別途お送りいたします。
```

**本文（4種共通テンプレ）:**
```
（customerNameがある場合）${customerName} 様
（customerNameがない場合）お客様

いつもEASE Rentalをご利用いただきありがとうございます。
${preamble}

【伝票番号】
${displayId}
（基準日ラベルがある場合）${referenceDateLabel}

【お支払い内容】
（合計がある場合）合計: ¥${totalAmount}
（明細がある場合・商品ごとに1行）  ・${title}（×${quantity}）（¥${amount}）

${paymentSection}

ご不明な点がございましたら、お気軽にお問い合わせください。

□■--------------------------------------------------------------
〒141-0031 東京都品川区西五反田3-1-1
TEL: 03-5759-8266　FAX: 03-5759-8262
サイト: http://www.iziz.co.jp
メールアドレス: shop@iziz.co.jp
営業時間: 9:30～18:00(月～金)・9:30～17:00(土)
休業日: 日・祝
```

**変数**: `${customerName}`, `${preamble}`, `${displayId}`, `${referenceDateLabel}`, `${totalAmount}`, `${title}`, `${quantity}`, `${amount}`, `${invoiceUrl}`, `${paymentDeadlineMinutes}`

:::note[金額「（税込）」未明記・BE側修正候補]
`合計: ¥${totalAmount}` / 明細 `¥${amount}` に「（税込）」がありません（#2216 d243a953 の統一明記から逸脱）。本ページは実コード通りを記載。BE 側での「（税込）」追加が修正候補。
:::

---

## 管理者アラート（sendAdminAlert）

- **件名**: `【EASE Rental Alert】${subject}`（引数 `subject` の先頭に prefix 付与）
- **FROM**: `rental-info@iziz.co.jp`（送信専用・宛先は管理者）
- **email_type**: `admin_alert`
- **トリガー**: データ不整合・請求先情報不備・Shopify連携エラー・長期間OPENのDraftOrder等の異常検知時（API/webhook/cron 多岐）

本文は caller が渡す `message` + `details` で動的生成。テンプレート構造は共通1種:

```
${message}


【詳細情報】
（details の各エントリごとに1行）
（value が object の場合）${key}: ${JSON.stringify(value, null, 2)}  ※複数行JSON
（value がそれ以外の場合）${key}: ${value}

---
EASE Rental System - Automated Alert
Timestamp: ${new Date().toISOString()}
```

（`details` なしの場合は `${message}` と `---` の間に空行2行のみ）

**代表的な caller パターン:**

| 検知内容 | 件名（`【EASE Rental Alert】` の後） | message 概要 |
|---------|--------------------------------------|-------------|
| 請求書メール送信スキップ（請求先不備） | `【要対応】請求先情報不備により請求書メール送信スキップ` | 請求先が未解決、または `billing_email` 未登録。請求先マスタの登録・補完が必要 |
| 統合請求書メール送信スキップ | `【要対応】請求先情報不備により統合請求書メール送信スキップ` | `billing_email` が未登録。請求先マスタの登録・補完が必要 |
| Shopify連携エラー | `【要対応】Shopify連携エラー検出` | Shopify API 呼び出し失敗の内容 |
| 長期間OPENのDraftOrder | `【警告】長期間 OPEN の DraftOrder が検出されました` | 期限超過の Draft Order 情報 |
| Orphan Order | `[Orphan Order] ...` | 孤立注文の検知 |
| 二重決済疑い | `[二重決済疑い] ...` | 振込後クレカ二重決済の検知 |

他、`data-integrity-monitor` / `shipping-fee-stale-draft-order-cron` / `draft-booking-lifecycle` / `invoice-reminder-cron` / `andon-notifier` 等、計13箇所の caller から送信されます。

:::note[顧客向けではない]
管理者アラートは `withSignature()` を通さず、iziz 会社署名は付きません（`email.service.ts` で "Internal notifications intentionally bypass this" と明記）。
:::

---

## 会員・お問い合わせ

### 12. 会員登録案内（sendMembershipInvitation・#2264 新規申込向け）

- **件名**: `【EASE Rental】会員登録のご案内（アカウント有効化のお願い）`
- **FROM**: `rental-info@iziz.co.jp`（送信専用）
- **email_type**: `membership_invitation`
- **トリガー**: スタッフが会員申込を承認した時（承認フローで Shopify 顧客作成後・`customerGenerateAccountActivationUrl` で有効化URL生成直後）

```
（companyName がある場合）${companyName} ご担当者様
（companyName がない場合）お客様

この度は会員申込をいただき、誠にありがとうございます。
内容を確認させていただいた結果、お客様のお申込みを承認いたしました。

つきましては下記のURLからアカウントを有効化し、パスワードを設定してください。
有効化後、レンタルのご予約が可能になります。

${activationUrl}

※このURLの有効期限は発行から30日間です。期限が切れた場合は再度ご連絡ください。

□■--------------------------------------------------------------
〒141-0031 東京都品川区西五反田3-1-1
TEL: 03-5759-8266　FAX: 03-5759-8262
サイト: http://www.iziz.co.jp
メールアドレス: shop@iziz.co.jp
営業時間: 9:30～18:00(月～金)・9:30～17:00(土)
休業日: 日・祝
```

**変数**: `${companyName}`（申込者の会社名・ない場合は「お客様」）, `${activationUrl}`（legacy accounts の有効化URL・有効期限30日）

:::note[Phase C（既存顧客一括招待）との違い]
本テンプレートは**新規申込（#2264）の承認後**に送られる招待メールです（「内容を確認させていただいた結果、承認」の案内）。Phase C（既存顧客マイグレーション・#2342）の一括招待は**既存顧客向け**（審査なし・Shopify 標準テンプレートで一括送信）のため文面が別です → [会員申込・承認フロー](./membership-apply) の「Phase C」節
:::

### 13. お問い合わせ受付（sendInquiryReceipt・buildInquiryReceiptText）

- **件名**: `【EASE Rental】お問い合わせ受付（自動送信メール）`
- **FROM**: `rental-info@iziz.co.jp`（送信専用）
- **email_type**: `inquiry_receipt`
- **トリガー**: お問い合わせフォーム送信時（App Proxy 受付・#2360 で `form_type` 別に振分：在庫確認 / 一般お問い合わせ）

**宛名（salutation）:**
- 法人（companyName あり）: `${companyName} ご担当者様`
- 個人（companyName なし）: `${contactName} 様`

**本文（旧 iziz サイト互換フォーマット・セクション区切り `…`×50）:**
```
${salutation}

${greeting}（在庫確認: この度は、EASE WEBカタログより在庫確認をいただき誠にありがとうございます。/ 一般: この度は、EASE WEBカタログよりお問い合わせをいただき誠にありがとうございます。）
お問い合わせ頂いた内容は下記の通りでお間違えがないかご確認下さい。

※送信メールは登録しているものなので、こちらは送信専用のアドレスになります。
　後ほど、正式なご案内メールをお送りいたします。

……………………………………………………
お客様情報
……………………………………………………
（会社名がある場合）⬩会社名: ${companyName}
⬩担当者名: ${contactName}
（電話がある場合）⬩電話番号: ${phone}
⬩メールアドレス: ${email}

……………………………………………………
お問合せ内容
……………………………………………………
（種別がある場合）⬩お問い合わせ種別: ${inquiryType}（#2360）
（期間がある場合）⬩レンタル期間: ${rentalPeriod}
（予約種別がある場合）⬩${reservationType}
（メッセージがある場合）⬩お問い合わせ内容:
${message}（#2360 自由記述）

（搬入希望がある場合）
⬩デリバリー(搬入)希望
  ⬩時間: ${time}
  ⬩住所: ${address}
  ⬩搬入の際にお手伝い頂ける方: ${helper}
  ⬩搬入先に駐車場はありますか: ${parking}

（搬出希望がある場合）
⬩デリバリー（搬出）希望
  …（搬入と同構造・directionLabel=搬出）

（支払方法がある場合）
……………………………………………………
お支払方法について
……………………………………………………
${paymentLines}（決済方法・請求先ブロック: 会社名/担当者/メール/プロジェクト名）

（在庫確認商品がある場合）
……………………………………………………
在庫確認商品
……………………………………………………
+ アイテム名: ${name}
（型番がある場合）+ 型番: ${modelNumber}
+ 数量: ${quantity}
（日数がある場合）+ レンタル日数: ${rentalDays}
+ 合計金額: ${formatYen(amount)}

……………………………………………………
合計数量：${totalQuantity}
（合計がある場合）合計金額(税別)：${formatYen(amountExcludingTax)}

□■--------------------------------------------------------------
〒141-0031 東京都品川区西五反田3-1-1
TEL: 03-5759-8266　FAX: 03-5759-8262
サイト: http://www.iziz.co.jp
メールアドレス: shop@iziz.co.jp
営業時間: 9:30～18:00(月～金)・9:30～17:00(土)
休業日: 日・祝
```

**変数**: `${salutation}`, `${greeting}`, `${companyName}`, `${contactName}`, `${phone}`, `${email}`, `${inquiryType}`, `${rentalPeriod}`, `${reservationType}`, `${message}`, 搬入/搬出希望（time/address/helper/parking）, `${paymentLines}`, 在庫確認商品（name/modelNumber/quantity/rentalDays/amount）, `${totalQuantity}`, `${amountExcludingTax}`

:::note[旧 iziz 互換・税別路線]
本メールは旧 iziz サイト互換フォーマットです。`withSignature()` SSOT 経由でなく本文内に直接 `COMPANY_SIGNATURE` を配置（#2342）。また金額は**税別路線**（`合計金額(税別)`・アイテム `合計金額` は税区分明示なし）で、#2216「（税込）」統一の対象外。
:::

---

## Shopify 送信メール（参考）

以下は **Shopify が直接送信**するメール（BE 経由ではない）で、初回顧客への即時支払い（ドラフトオーダー請求）等で利用します。文面は **Shopify admin > 設定 > 通知** で編集します（Liquid テンプレートの正は `ease-rental-shopifytheme/docs/specs/theme-spec/shopify-email-templates/`）。

### 注文確認（order-confirmation）

- **トリガー**: 注文確定時（Shopify 決済完了）

**宛名**（個人/法人を `customer.last_name` の「・」有無で判別・#618）:
- 法人: `会社名 部署 担当者名 様`（部署なし場合は `会社名 担当者名 様`）
- 個人: `担当者名 様`

**署名**: iziz 会社署名（BE と共通・`□■----` 〒住所/TEL/FAX/サイト/メール/営業時間）

### 下書き注文の請求書（draft-order-invoice）

- **トリガー**: ドラフトオーダーから請求メール送信時（初回顧客の即時支払い等）
- **宛名**: 注文確認に同じ（会社・部署・担当者・日本式）
- **署名**: iziz 会社署名（BE と共通）

:::note[宛名のロジック]
- 会社名: `customer.metafields.ease_rental.company`（なければ `customer.last_name`）
- 担当者名: `customer.metafields.ease_rental.contact_person`（なければ `customer.first_name`）
- 部署: `customer.metafields.ease_rental.department`（未設定なら省略・#2342 で追加）
- 個人/法人判別: `customer.last_name` が「・」を含む=個人（会社名なし）。含まない=法人（last_name は `composeLastName` で会社名＋部署を合成）
:::

---

## 鮮度・保守

- **最終確認日**: 2026-08-17
- **対象 BE commit**: `77dd6800`（#2370 ガイドURL修正・#2342 iziz 署名統一・#2359 写真テーブル・#2360 フォーム振分・#2216 税込明記 を反映。2026-08-17 に #1/#7/#8/#12 の本文をコードと逐語照合し、本ページ側の誤記 3 件〔銀行振込セクションの「場合是」→「場合は」・商品行の SKU 欠落・下記 consolidated パスの誤り〕を是正。#2689 で署名の営業時間を 18:00 に、#2690 B065/B066/B069 で #7 の件名・本文と #12 の本文を更新）
- **本文はコードから手動転記** しています。以下のファイルの本文を変更した際は、本ページの追従が必要です:
  - `src/modules/email/email.service.ts`（各 send メソッドの `text`）
  - `src/modules/invoices/invoices.service.ts`（`generateInvoiceEmailText`）
  - `src/modules/invoices/consolidated-invoices.service.ts`（`generateInvoiceEmailText`）
  - `src/modules/schedule/invoice-reminder-cron.service.ts`（`generateReminderEmailText` / `generateConsolidatedReminderEmailText`）
  - `src/modules/email/utils/build-billing-greeting.ts`（宛名生成）

### 既知の乖離・follow-up

- **再請求リマインダー（#9/#10）の二重フッタ**: 本文内に `-- / 会社名 / EASE Rental` が残存 + `withSignature` で iziz 署名も付与（#2342 完全統一から取り残し・BE側で本文内フッタ削除が修正候補）。
- **sendDraftOrderInvoiceMail（#11）の金額「（税込）」未明記**: `合計: ¥${totalAmount}` / 明細 `¥${amount}` に「（税込）」がない（#2216 統一から逸脱・BE側修正候補）。
- **#6 返却期限超過通知**: #2182 廃止・#2321 残骸削除で実コードから削除済み。本ページからも削除（廃止注記のみ残置）。

## 関連

- [自動送信メール一覧](./email-notifications)（送信タイミング・宛先の一覧）
- [付録D: メール送信の責任分界](./appendix/email-responsibility)（Shopify vs BE の責任分担）
