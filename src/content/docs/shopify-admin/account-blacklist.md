---
title: 'アカウント無効化・ブラックリスト運用'
description: '問題のある顧客への対応手順。Shopifyでのアカウント無効化・タグ付与・メモ記録・返金による手動ブラックリスト運用'
sidebar:
  order: 35
---

> **💡 運用者向け:** 悪質・要注意の顧客が出た場合は、①**Shopify で顧客アカウントを無効化** → ②**「無効」タグを付与** → ③**必要なら理由をメモに記録** → ④**決済済みなら注文をキャンセルして返金**、の4手順で手動対応します。Shopify には「顧客をブロックして注文を止める」機能はありません。**システムが自動で新規予約を止めることはない**ため、受注時に担当者が状態を確認して手動で断る運用が前提です。仕組みの技術詳細は開発者モード（ページ右上のトグル）を ON にしてご確認ください。

> **対象画面:** Shopify管理画面 > 顧客（Customers）
> **URL:** `https://admin.shopify.com/store/ease-site/customers`

## 概要

キャンセル常習・支払い遅延・トラブルなどで今後の取引を止めたい顧客を「ブラックリスト」として扱うための手動運用手順です。専用のブラックリスト機能はないため、**既存の「アカウント無効化」＋「タグ」＋「メモ」＋「注文キャンセル・返金」を組み合わせて**対応します。

:::caution[システムは予約を自動で止めません]
アカウントを無効化してもタグを付けても、**新規予約が自動的に拒否されることはありません**（レンタルの予約は独自の受注フローで作成されるため）。ブラックリスト顧客からの依頼は、**受注担当者が伝票作成前に顧客の状態（無効・タグ）を確認し、手動で受注をお断りする**運用としてください。
:::

---

## 手順1: 顧客アカウントを無効化する

Shopify のストアフロント（会員ログイン）を使えなくします。本ストアは**旧版（クラシック）の顧客アカウント**を利用しているため、顧客ごとに個別で無効化できます。無効化しても情報は消えず、後から再有効化できます。

![「その他の操作」ドロップダウンの「アカウントを無効にする」](/images/shopify-admin/customers-disable.png)

```
手順:
1. Shopify管理画面 > 「顧客」を開く
2. 対象の顧客名をクリックして詳細画面を開く
3. 画面右上の「その他の操作」（⋯）をクリックする
4. ドロップダウンから「アカウントを無効にする」を選ぶ
5. 確認ダイアログで無効化する
```

:::note[無効化で止まるのは「ログイン」だけ]
無効化はストアフロントでの**ログイン／チェックアウト時のアカウント利用を止めるもの**です。ゲストとしての注文操作そのものをブロックするShopify標準機能はありません。だからこそ、下記のタグと受注時の手動確認を併用します。
:::

:::caution[本ストアは現在旧版・Shopify がアップグレード推奨中]
「アカウントの無効化」は**旧版（classic）顧客アカウント限定**の機能です。本ストアは現在旧版で運用しているため本手順が使えますが、Shopify は旧版を**非推奨**とし、管理画面（**設定 › お客様アカウント**）で**「新しい顧客アカウント」へのアップグレードを推奨**しています（[2026年後半サンセット予定](https://shopify.dev/changelog/legacy-customer-accounts-are-deprecated)）。新版（パスワードレス・6桁コード認証）では個別の無効化ができません（[公式：顧客アカウントを管理する](https://help.shopify.com/ja/manual/customers/customer-accounts/manage)）。**アップグレード後は本手順1が使えなくなるため、タグ運用（手順2）を本体に据える運用に切り替える**必要があります。移行判断時は本手順1の継続可否を必ず再確認してください。
:::

---

## 手順2: 「無効」タグを付与する

顧客に識別用のタグを付けておくと、一覧のフィルターで抽出でき、受注時の目印になります。基本は BE（FE管理画面）でも認識される **「無効」タグ**を使います。

![顧客タグ付与](/images/shopify-admin/customers-tags.png)

:::tip[タグはFE管理画面から付けるのが確実]
FE管理画面の**顧客の「無効化」機能**を使うと、`is_active=false` の設定と同時に**「無効」タグの付与とShopifyへの同期が自動**で行われます。タグは本来 FE（BE）起点で管理される仕様のため（[顧客（Customers）](/shopify-admin/customers/) の注意事項参照）、**FEで無効化 → Shopify側でアカウント無効化、の順で両方**行うのが最も確実です。
:::

Shopify側で直接タグを付ける場合の手順:

```
手順:
1. 顧客詳細画面を開く
2. 「タグ」欄をクリック
3. 「無効」（必要に応じて「取引停止」など）を入力・選択
4. 自動保存される
```

| タグ | 用途 |
|------|------|
| **無効** | BEが認識する既定タグ。FEの無効化で自動付与される |
| **取引停止** など | 補足の識別用（任意・運用ルールに合わせる） |

:::note[タグ名の表記に注意]
Shopify 公式の注意事項として、**タグはインストールしたアプリ経由で顧客に見える可能性**があります（[公式：タグの使用](https://help.shopify.com/ja/manual/shopify-admin/productivity-tools/using-tags)）。「blacklist」「banned」のような露出した文言は避け、上記の「無効」「取引停止」のような事務的で中立的な表現を推奨します。
:::

---

## 手順3（任意）: 理由をメモに記録する

後から経緯を追えるよう、**無効化した理由・日付・担当者**を残しておきます。

```
記録先（どちらか）:
- FE管理画面の顧客メモ欄（推奨）
- Shopify顧客詳細画面の「メモ」欄
```

記録例:

```
2026-07-10 / 担当: 山田
理由: キャンセル常習（直近3件連続キャンセル）のため取引停止。
```

---

## 手順4（任意）: 注文をキャンセルして返金する

既に注文が成立しクレジットカード決済が済んでいる場合は、**注文をキャンセル＋返金**します（[公式：注文をキャンセルする](https://help.shopify.com/ja/manual/fulfillment/managing-orders/canceling-orders)）。

```
手順:
1. Shopify管理画面 > 「注文」を開く
2. 対象の注文をクリック
3. 「その他の操作」>「注文をキャンセル」を選ぶ
4. 「支払いを返金」で返金方法を選ぶ:
   - 元の決済方法（クレジットカードへ全額返金）
   - ストアクレジット（権限が必要）
   - 後で（部分返金や調査したい場合）
5. キャンセル理由を選択
6. 必要に応じてスタッフメモを入力
7. 在庫を戻す（デフォルトでON・不要ならOFF）
```

:::tip[部分返金も可能]
全額ではなく一部だけ返金したい場合は、注文詳細の「返金」ボタンから行います。返金対象アイテム・数量・送料・再入庫手数料（Restocking fee）を個別に調整できます（[公式：返品を作成する](https://help.shopify.com/ja/manual/fulfillment/managing-orders/returns/creating-returns)）。ただし**「顧客がその決済方法で支払った額」が返金上限**です。
:::

:::caution[決済手数料は返金されません]
クレジットカード決済の手数料は、返金時に**原則として返還されません**（決済1回ごとに手数料が発生する仕組み）。全額返金でも手数料分は店舗負担になる点にご留意ください。
:::

---

## 運用チェックリスト

- [ ] Shopify で対象顧客のアカウントを無効化した
- [ ] 「無効」タグを付与した（FEの無効化機能を使うと自動）
- [ ] 必要なら理由・日付・担当者をメモに記録した
- [ ] 受注担当者に「このタグ／無効の顧客からの依頼は受けない」ことを共有した
- [ ] 決済済みの注文があればキャンセル＋返金した（部分返金も可）

:::caution[再有効化するとき]
状況が解消して取引を再開する場合は、Shopify で**「アカウント招待（Send invite）」を再送**してアカウントを再有効化します（旧版クラシックアカウントの再開は招待送信が公式の手順）。あわせて FE の無効化を解除（＝「無効」タグも自動で除去）してください。メモには再開の経緯も追記します。
:::

---

:::dev
> **出典:** [Shopify 公式ドキュメント](https://help.shopify.com/ja/manual/customers/customer-accounts) + BE #2295 調査（2026-07-10）／ issue #575 拡充（2026-07-18）

## 技術背景（開発者向け）

### なぜ「タグ」で運用するのか

- Shopify の `Customer.state = DISABLED`（アカウント無効）は **Admin API から設定できない**ため、BE は代替として **「無効」タグ**（`DISABLED_TAG` = `src/common/constants/customer-status.constant.ts`）を Outbox 経由（`customer_tag_add` / `customer_tag_remove`）で付与・除去し、`mapShopifyStateToCustomerState` で状態を解決している。
- 個別アカウントの無効化は **旧版（legacy/classic）顧客アカウントでのみ**可能。新版（new customer accounts）では個別無効化はできない。本ストアは旧版運用のため手順1が成立する。

### 新旧アカウントの挙動差（公式ベース）

| | 旧版（classic） | 新版（new / passwordless） |
|---|---|---|
| 認証 | メール＋パスワード | メール＋6桁コード |
| 個別無効化 | **可能**（`Customer.state=DISABLED`） | **不可**（プロファイル削除のみ・再サインインで再生成） |
| `state` 値 | `ENABLED` / `INVITED` / `DISABLED` / `DECLINED` | 存在しない |
| 提供 | 非推奨・[2026年後半サンセット予定](https://shopify.dev/changelog/legacy-customer-accounts-are-deprecated) | 新規ストアは強制 |

新版移行後は「アカウント無効化」が使えなくなるため、**タグ運用（`DISABLED_TAG`）が唯一の状態表現**になる。手順1の前提崩れにも備えて、タグ運用を本体に据える構成が望ましい。

> **実測（2026-07-18・issue #575 拡充時）:** 本ストア `ease-site` の `設定 › お客様アカウント` で「**従来のお客様アカウントを使用しています**（非推奨・新しいお客様アカウントへのアップグレード推奨中・30日以内は元に戻せる）」を確認済み。現時点では手順1（アカウント無効化）が有効だが、アップグレード実行後に失効する点に注意。

参照:
- [レガシー顧客アカウント（無効化手順）](https://help.shopify.com/ja/manual/customers/customer-accounts/upgrade/legacy-customer-accounts)
- [新旧カスタマイズオプション比較](https://help.shopify.com/ja/manual/customers/customer-accounts/upgrade/customization-options)
- [レガシー廃止チェンジログ](https://shopify.dev/changelog/legacy-customer-accounts-are-deprecated)
- [Customer オブジェクト（state 値）](https://shopify.dev/docs/api/admin-graphql/latest/objects/Customer)

### FE 無効化（`is_active`）が行うこと

- `PATCH /customers/batch-status`（`batchUpdateStatus`）/ `POST /customers/batch-delete`（論理削除）で `customer_master.is_active` を更新し、「無効」タグの付与/除去と Shopify 同期、PII の `deleted_at` を扱う（BE #2109 / FE #1160）。
- ただし **既存の `bookings` レコードや新規予約作成には一切干渉しない**。`bookings.service.ts` の `create()` に顧客状態のガードは無く、顧客ログイン機構も BE 側に存在しない。→ 現状のブラックリストは「表示除外＋タグ＋人手確認」で成立する運用であり、システム的な取引拒否ではない。

### 返金の技術的補足

- 返金は `Order Cancel`（全額）または `Refund`（部分）で実行。`Refund` は `transactions[].amount` に依存し、**その決済方法で顧客が支払った額**が上限。
- クレジットカード決済手数料の非返還は Shopify 業界挙動。公式ヘルプに明示記載がないため、決済代行・Shopify Payments 契約条件を実務確認すること。
- 在庫戻し（`Restock inventory`）はキャンセル時にデフォルト ON。`orderCancel` で非アクティブロケーションへは戻らない例外あり。

参照:
- [注文をキャンセルする](https://help.shopify.com/ja/manual/fulfillment/managing-orders/canceling-orders)
- [返品を作成する（部分返金）](https://help.shopify.com/ja/manual/fulfillment/managing-orders/returns/creating-returns)

### 将来 BE で自動判定を入れる場合の拡張ポイント

- スキーマには `customer_master.is_blocked` / `block_reason` / `internal_memo` カラムが**既に存在するが未配線（死蔵）**。
- 自動拒否を実装するなら、(1) `bookings.service.ts` の `create()`（および App Proxy 経由の予約経路）に `is_active=false` / `is_blocked=true` を検出して予約を拒否するガードを追加、(2) `is_blocked` / `block_reason` の書き込み API を新設、が必要。別 Issue 化して対応する。
- 自動化の選択肢として **Shopify Flow**（`Order risk analyzed` トリガーで高リスク注文をキャンセル＋タグ＋スタッフ通知）の公式テンプレートも存在する（[Flow で注文を保護する](https://help.shopify.com/ja/manual/fulfillment/managing-orders/protecting-orders/shopify-flow)）。本マニュアルの対象は手動運用だが、将来の自動化導入判断の参考まで。
:::

---

## 関連

- [顧客（Customers）](/shopify-admin/customers/) — Shopify管理画面での顧客確認
- [顧客管理](/customer-management/) — FE管理画面での顧客管理・無効化操作
