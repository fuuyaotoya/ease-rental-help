---
title: '下書き注文（Draft Orders）'
description: 'Shopify管理画面での下書き注文の確認方法。Draft Orderのステータス・支払いリンク送信の確認手順'
sidebar:
  order: 20
---

> **対象画面:** Shopify管理画面 > 注文 > 下書き（Draft Orders）
> **URL:** `https://admin.shopify.com/store/ease-site/orders/drafts`

![下書き注文一覧画面](/images/shopify-admin/draft-orders-list.png)

## 概要

Shopify管理画面の「下書き注文」ページでは、テーマのカート経由で自動作成されたDraft Order（下書き注文）の状況を確認できます。

:::caution[操作はBE管理画面で]
Draft Orderに関連する伝票操作は、**EASE RentalのBE管理画面**で行ってください。Shopify管理画面での直接操作は推奨しません。
:::

---

## ページへのアクセス

```
手順:
1. Shopify管理画面を開く
2. 左サイドバーの「注文」をクリック
3. 「下書き」タブをクリック
```

![下書きタブ](/images/shopify-admin/draft-orders-nav.png)

---

## Draft Orderのライフサイクル

```
カートで予約 → Draft Order自動作成（status: open）
    ↓
顧客が支払いリンクから決済 → Order（注文）に変換（status: completed）
    ↓
または 支払い期限切れ → 自動キャンセル（status: expired）
```

### ステータスの意味

| ステータス | 意味 |
|-----------|------|
| **Open** | 支払い待ち。顧客に支払いリンクが送信済み |
| **Invoice sent** | 請求書（支払いリンク）が送信済み |
| **Completed** | 支払いが完了し、正式な注文（Order）に変換された |
| **Expired** | 支払い期限切れ。自動キャンセル対象 |

---

## 確認できる情報

### 一覧画面

| 列 | 内容 |
|----|------|
| **下書き注文** | Draft Order番号（例: `#D1234`） |
| **日付** | 作成日時 |
| **ステータス** | Open / Invoice sent / Completed / Expired |
| **顧客** | 注文者の氏名 |
| **合計** | 合計金額 |
| **支払い** | 支払い状況 |

### 詳細画面

Draft Order番号をクリックすると詳細を確認できます：

![Draft Order詳細](/images/shopify-admin/draft-orders-detail.png)

| 項目 | 内容 |
|------|------|
| **商品明細** | 商品名・バリアント・数量・単価 |
| **顧客情報** | 氏名・メール・電話番号 |
| **配送先** | 配送先住所 |
| **メタフィールド** | レンタル日付・レンタル期間などの情報 |
| **アクティビティ** | 送信履歴・ステータス変更のタイムライン |

---

## よくある確認シーン

### 顧客から「支払いリンクが届かない」と問い合わせがあった場合

```
1. 下書き注文一覧を開く
2. 該当のDraft Orderを検索（顧客名で検索）
3. 詳細画面を開く
4. 「アクティビティ」セクションで送信履歴を確認
5. ステータスが「Invoice sent」になっているか確認
```

### Draft Orderが期限切れ（Expired）になったか確認したい場合

```
1. 下書き注文一覧を開く
2. フィルターで「ステータス: Expired」を設定
3. 該当のDraft Orderを確認
```

:::tip[自動キャンセルについて]
支払い期限切れのDraft Orderは、BEの自動キャンセルジョブ（毎日02:00 JST稼働）により自動的にキャンセルされます。詳細は [自動キャンセルの仕組み](/appendix/auto-cancellation/) を参照してください。
:::

---

## 注意事項

- **Draft Orderの直接キャンセル・削除**は避けてください（BEとの整合性が崩れる可能性があります）
- 支払いリンクの再送信が必要な場合は、BE管理画面から操作してください
- Draft Orderが`Completed`になった後は、正式な注文（Orders）として確認できます

---

## 関連

- [注文一覧（Orders）](/shopify-admin/orders/) — 正式な注文の確認方法
- [自動キャンセルの仕組み](/appendix/auto-cancellation/) — 未決済Draft Orderの自動キャンセル仕様
- [伝票検索](/slip-search/) — BE管理画面での伝票検索
