---
title: '延長料金計算ルール'
description: '延長料金計算ルールの操作方法と画面説明'
sidebar:
  order: 102
---


> **付録:** B
> **主題:** レンタル延長料金の計算式

---

## 概要

EASE Rentalシステムにおける延長料金の計算ルールを定義しています。ピックアップ当日からの日数に応じて、基本料金に一定割合を加算します。

> **参照:** GitHub Issue #26

---

## 計算ルール

### 基本ルール

| 期間                      | 加算率 | 説明                        |
| ------------------------- | ------ | --------------------------- |
| ピックアップ当日〜6日目迄 | 20%/日 | 基本料金の20%を日割りで加算 |
| 7日目以降                 | 10%/日 | 基本料金の10%を日割りで加算 |

### 計算式

```javascript
function calculateDailyRate(basePrice, days) {
  if (days === 1) {
    // 1日目は基本料金のみ
    dailyRate = basePrice;
  } else if (days <= 6) {
    // 2〜6日目: 基本料金 + (日数-1) × 20%
    dailyRate = basePrice × (1 + (days - 1) × 0.20);
  } else {
    // 7日目以降: 6日目の上限 + (日数-6) × 10%
    dailyRate = basePrice × 2 + (days - 6) × basePrice × 0.10;
  }
  return dailyRate;
}
```

### 数式表現

```
日数 = 1 の場合:
  料金 = 基本料金

日数 = 2〜6 の場合:
  料金 = 基本料金 × (1 + (日数 - 1) × 0.20)

日数 ≥ 7 の場合:
  料金 = 基本料金 × 2 + (日数 - 6) × 基本料金 × 0.10
```

---

## 計算例（基本料金 = 1,000円）

### 日数別料金表

| 日数   | 計算式        | 料金    | 増分         | 累計    |
| ------ | ------------- | ------- | ------------ | ------- |
| 1日目  | 1,000         | 1,000円 | -            | 1,000円 |
| 2日目  | 1,000 + 200   | 1,200円 | +200円 (20%) | 1,200円 |
| 3日目  | 1,000 + 400   | 1,400円 | +200円 (20%) | 1,400円 |
| 4日目  | 1,000 + 600   | 1,600円 | +200円 (20%) | 1,600円 |
| 5日目  | 1,000 + 800   | 1,800円 | +200円 (20%) | 1,800円 |
| 6日目  | 1,000 + 1,000 | 2,000円 | +200円 (20%) | 2,000円 |
| 7日目  | 2,000 + 100   | 2,100円 | +100円 (10%) | 2,100円 |
| 8日目  | 2,000 + 200   | 2,200円 | +100円 (10%) | 2,200円 |
| 9日目  | 2,000 + 300   | 2,300円 | +100円 (10%) | 2,300円 |
| 10日目 | 2,000 + 400   | 2,400円 | +100円 (10%) | 2,400円 |

### グラフイメージ

```
料金
  │
2,400 ┤                                         ★ 10日目
2,300 ┤                                      ★
2,200 ┤                                   ★
2,100 ┤                                ★
2,000 ┤                          ★─────★ 6日目（上限）
1,800 ┤                       ★
1,600 ┤                    ★
1,400 ┤                 ★
1,200 ┤              ★
1,000 ┤           ★
      └────────────────────────────────────── 日数
          1  2  3  4  5  6  7  8  9  10
```

---

## キャンセル料率

キャンセル料は、**レンタル開始日までの営業日数**（日曜・祝日・年末年始を除外し、**土曜は営業日**として数える・Issue #2163）を基準に決まります。**暦日（カレンダー日）ではない**点に注意してください（例: 日曜・祝日を挟むと、暦日より早く料率が上がる場合があります）。

**キープ（お申込み確定）時点でキャンセル料の対象**となります（無料キャンセル窓は廃止・仮予約制度も廃止され、仮予約の手動キャンセルも課金対象・Issue #2325）。

:::dev
> **SSOT:** Backend `src/modules/bookings/booking-totals.service.ts` `calculateCancellationFee()` / 営業日数は `calcCancelDaysBefore()`（Issue #2163） / Frontend `src/lib/utils/fee-calculator.ts`。料率改定は Issue #2325（無料キャンセル窓の廃止・キープ時点で課金・仮予約の手動キャンセルも課金化）。
:::

### 料率表（商品レンタル料）

| キャンセル時期（開始日までの営業日） | 料率 | 説明 |
|----------------------------------|------|------|
| **7日前以上** | **10%** | 基本レンタル料の10% |
| **6〜2日前** | **30%** | 基本レンタル料の30% |
| **前日** | **50%** | 基本レンタル料の50% |
| **当日 / 開始後** | **100%** | 基本レンタル料の全額 |

### 配送キャンセル料（別料率・Issue #719）

配送手配後のキャンセルでは、商品レンタル料のキャンセル料とは**別に**配送キャンセル料が発生します。こちらは前日・当日のみ発生し、2日前以前は発生しません。

| キャンセル時期（開始日までの営業日） | 配送料の料率 |
|----------------------------------|------------|
| **2日前以上** | **0%** |
| **前日** | **30%** |
| **当日 / 開始後** | **100%** |

#### 配送キャンセル料 計算機

キャンセル日・レンタル開始日・配送料を入力すると、配送キャンセル料が自動計算されます（営業日ベース・#719 料率）。システムの実計算（Backend `calcCancelDaysBefore`・Issue #2163）と同じルールで見積もれます。

<div class="cancel-calc">
  <div class="cancel-calc__row">
    <label class="cancel-calc__label">レンタル開始日
      <input type="date" id="cc-start" class="cancel-calc__input" />
    </label>
    <label class="cancel-calc__label">キャンセル日
      <input type="date" id="cc-cancel" class="cancel-calc__input" />
    </label>
    <label class="cancel-calc__label">配送料（円）
      <input type="number" id="cc-fee" class="cancel-calc__input" min="0" step="100" inputmode="numeric" placeholder="例: 1500" />
    </label>
  </div>
  <button type="button" id="cc-calc" class="cancel-calc__btn">キャンセル料を計算</button>
  <div id="cc-result" class="cancel-calc__result" aria-live="polite"></div>
  <p class="cancel-calc__note">※ 営業日 ＝ <strong>日曜・祝日・年末年始（12/29〜1/3）を除外</strong>し、<strong>土曜は営業日</strong>として数えます。祝日が挟まると思いより早く料率が上がることがあります（暦日との差に注意）。</p>
</div>

<script is:inline>
(() => {
  // Japanese public holidays 2026-2027. The production system uses a per-shop
  // holiday master; these standard dates approximate it for estimation.
  const HOLIDAYS = new Set([
    '2026-01-01','2026-01-12','2026-02-11','2026-02-23','2026-03-21','2026-04-29',
    '2026-05-04','2026-05-05','2026-05-06',
    '2026-07-20','2026-08-11','2026-09-21','2026-09-23','2026-10-12','2026-11-03','2026-11-23',
    '2027-01-01','2027-01-11','2027-02-11','2027-02-23','2027-03-22','2027-04-29',
    '2027-05-03','2027-05-04','2027-05-05',
    '2027-07-19','2027-08-11','2027-09-20','2027-09-23','2027-10-11','2027-11-03','2027-11-23'
  ]);
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const isYearEnd = (d) => {
    const m = d.getMonth() + 1, day = d.getDate();
    return (m === 12 && day >= 29) || (m === 1 && day <= 3);
  };
  const isBusinessDay = (d) => {
    if (d.getDay() === 0) return false;        // Sunday
    if (isYearEnd(d)) return false;            // 12/29 - 1/3
    if (HOLIDAYS.has(fmt(d))) return false;    // public holiday
    return true;
  };
  const addDays = (d, n) => { const r = new Date(d.getTime()); r.setDate(r.getDate() + n); return r; };
  // inclusive business-day count over [from, to]; from > to => 0 (mirrors BE calculateBusinessDays).
  const businessDaysInclusive = (from, to) => {
    if (from.getTime() > to.getTime()) return 0;
    let count = 0, d = new Date(from.getTime()), guard = 0;
    while (d.getTime() <= to.getTime() && guard < 400) {
      if (isBusinessDay(d)) count++;
      d = addDays(d, 1);
      guard++;
    }
    return count;
  };
  const yen = (n) => '¥' + Math.round(n).toLocaleString('ja-JP');

  const calc = () => {
    const startEl = document.getElementById('cc-start');
    const cancelEl = document.getElementById('cc-cancel');
    const feeEl = document.getElementById('cc-fee');
    const result = document.getElementById('cc-result');
    if (!startEl || !cancelEl || !feeEl || !result) return;
    const start = startEl.value, cancel = cancelEl.value, feeRaw = feeEl.value;
    if (!start || !cancel || feeRaw === '') {
      result.innerHTML = '<span class="cc-warn">レンタル開始日・キャンセル日・配送料をすべて入力してください。</span>';
      return;
    }
    const startDate = new Date(start + 'T00:00:00');
    const cancelDate = new Date(cancel + 'T00:00:00');
    const fee = Number(feeRaw);
    if (Number.isNaN(fee) || fee < 0) {
      result.innerHTML = '<span class="cc-warn">配送料は 0 以上の数値で入力してください。</span>';
      return;
    }
    // #719 delivery rate, counted back from the rental start in business days.
    const inclusive = businessDaysInclusive(cancelDate, startDate);
    const diffDays = inclusive - 1 < 0 ? 0 : inclusive - 1;
    let rate, label;
    if (diffDays === 0) { rate = 1.0; label = '当日 / 開始後（100%）'; }
    else if (diffDays === 1) { rate = 0.3; label = '前日（30%）'; }
    else { rate = 0; label = '2日前以上（0%）'; }
    const charge = Math.round(fee * rate);
    result.innerHTML =
      '<div class="cc-line">キャンセル時期（開始日までの営業日）: <strong>' + label +
      '</strong> <span class="cc-diff">（営業日差 ' + diffDays + '日）</span></div>' +
      '<div class="cc-line">配送料 ' + yen(fee) + ' × ' + (rate * 100) + '% ＝ ' +
      '<strong class="cc-charge">' + yen(charge) + '</strong></div>';
  };
  const btn = document.getElementById('cc-calc');
  if (btn) btn.addEventListener('click', calc);
})();
</script>

### 計算の対象

- **商品レンタル料:** 商品ごとの `totalPrice`（単価 × 日数）に上記料率を適用
- **配送料:** 別途、配送キャンセル料として各配送のキャンセル料に料率を適用（商品とは別計算で合算・Issue #719）
- **対象外:** 追加料金・消費税はキャンセル料の計算基準に含まれません

### 例（基本レンタル料 10,000円の場合）

| キャンセル時期 | キャンセル料 |
|--------------|------------|
| 7日前まで | ¥1,000 |
| 5日前 | ¥3,000 |
| 前日 | ¥5,000 |
| 当日 | ¥10,000 |

---

## キャンセルの種類と料率の適用

キャンセルには大きく分けて「伝票全体」「商品の部分」「配送のみ」の3パターンがあり、キャンセルの範囲と伝票の状態によって料率の適用が異なります。

### キャンセルの範囲と料率

| キャンセルの種類 | 対象 | 商品レンタル料の料率 | 配送料の扱い |
|---|---|---|---|
| **伝票全体のキャンセル** | 伝票の全商品 | 全商品に商品料率を適用。「レンタル料を0円にする」選択も可（[#1314](https://github.com/iziz-system/ease-rental-frontend/issues/1314)・**配送料は0円化の対象外**） | まだアクティブ（キャンセルされていない）配送料に **#719 料率（当日100%/前日30%）** を適用して請求額へ折り込み（BE [#2506](https://github.com/iziz-system/ease-rental-backend/issues/2506)）。クレカは DO②で別途回収 |
| **商品の部分キャンセル** | 伝票の特定商品のみ | キャンセルした商品に商品料率を適用（残商品は影響なし） | 影響なし |
| **配送のキャンセル** | 配送のみ | 影響なし | キャンセルした配送に配送キャンセル料率（上記「配送キャンセル料」）を適用（クレカは DO⑤・後払い伝票は DO① charges に統合 [#2399](https://github.com/iziz-system/ease-rental-backend/issues/2399)） |

> **ポイント:** 料率は「キャンセルする人」（管理者・顧客）で変わりません。変わるのは**伝票の状態**（仮予約=無料 / 確定済み=課金）と**キャンセルの範囲**（全体・部分・配送のみ）です。

:::note[伝票全体キャンセル時の保護・警告（2026-07改定）]
伝票全体をキャンセルする際、システムは以下を順に表示・適用します:
- **キャンセル料の事前警告ダイアログ**（[#2462](https://github.com/iziz-system/ease-rental-backend/issues/2462)）— レンタル開始済み伝票はキャンセル料の概算を事前表示
- **残アクティブ配送料の警告**（[#1320](https://github.com/iziz-system/ease-rental-frontend/issues/1320)）— まだキャンセルされていない配送がある場合、その配送料にも #719 料率のキャンセル料が発生することを警告
- **配送キャンセルの全明細確認**（[#1315](https://github.com/iziz-system/ease-rental-frontend/issues/1315)）— 配送キャンセル時、無音で破棄せず全明細キャンセル前に確認警告を表示
- **レンタル料0円（waive）を選んでも配送料は別途課金** — 配送料は #719 料率で別途回収されるため、0円化の対象外（[#1314](https://github.com/iziz-system/ease-rental-frontend/issues/1314)）
:::

### 伝票の状態による無料・課金の区別

| 伝票の状態 | キャンセル経路 | キャンセル料 |
|---|---|---|
| **仮予約（DRAFT）** — カート確定前・未確定 | 顧客マイページからキャンセル | **無料**（[#2379](https://github.com/iziz-system/ease-rental-backend/issues/2379) DRAFT skip・未確定のため） |
| **仮予約（TENTATIVE）** — 管理画面で手動作成した仮押さえ | スタッフが手動キャンセル | **課金対象**（[#2325](https://github.com/iziz-system/ease-rental-backend/issues/2325)・キープ時点で課金） |
| **確定予約（CONFIRMED）以降** | スタッフ経由でキャンセル | **課金対象**（本マニュアルの料率表どおり） |

:::dev
> **#2379（顧客セルフ全件キャンセル・#2307 gap クローズ）:** BE `updateStatusFromCustomer` → `cancelBookingFromCustomer`（cancelBooking サブセット tx）。`DRAFT`（仮予約）はキャンセル料を skip（無料）。`CONFIRMED`（確定済み）は per-item `calculateCancellationFee` + `applyCancellationSideEffects` + `recalculate` でキャンセル料を計上（cancelBooking と対称・ただし Shopify 返金 warning・手動メールは skip）。
> **#2307:** 部分キャンセルのキャンセル料を後払い伝票の charges に計上（`cancelBookingItem` cascade 含む）。
> **#2399:** 配送キャンセル料を後払い伝票の DO① charges に統合（伝票1:領収書1の回復・クレカは引き続き DO⑤）。
> **#2404:** DO③↔DO① 二重請求の三層防御（settlement gate + swap CAS + active-billing 交差 fail-closed）。顧客セルフキャンセルは DO③ PENDING 行を `cancelOutstandingBillings` で cleanup し、同防御と整合。
> **SSOT:** `calculateCancellationFee`（`booking-totals.service.ts`）+ `applyCancellationSideEffects`（util・8 caller）+ `recalculate`。配送キャンセル料は `deliveries.cancellation_fee`（#2113 SSOT）。
:::

---

:::dev
## 実装詳細

### 実装ファイル

- `src/lib/utils/fee-calculator.ts`
- `src/lib/utils/price-calculator.ts`
- `src/lib/constants.ts` — `TIER_RATES` 定数（20%/10% 段階料金）

### 関連画面

| 画面             | パス               | 使用場面       |
| ---------------- | ------------------ | -------------- |
| 貸し出し伝票作成 | `/booking-compact` | 料金見積もり時 |
| 返却・金額確定   | `/bookings-return` | 延長料金確定時 |

### 注意事項

1. **日数のカウント**
   - ピックアップ当日を1日目とする
   - 返却日は含まない（返却日前日までの日数）

2. **端数処理**（用途別に異なります — すべて切り捨てではありません）
   - **消費税**: 切捨て（`ROUND_FLOOR`・Issue #2049）
   - **配送料マスタ**: 四捨五入（`ROUND_HALF_UP`）
   - **段階料金（tiered pricing）**: `Decimal.round()`
   - **キャンセル料**: 整数に四捨五入（`toDecimalPlaces(0, HALF_UP)`）

3. **上限なし**
   - 7日目以降は10%ずつ増加し続ける（上限なし）
:::

---

## よくある質問

### Q: 3日間レンタルの場合、料金はいくら？

A: 基本料金1,000円の場合 → 1,400円

```
1,000 + (3-1) × 200 = 1,400円
```

### Q: 1週間（7日間）レンタルの場合？

A: 基本料金1,000円の場合 → 2,100円

```
1,000 × 2 + (7-6) × 100 = 2,100円
```

### Q: 6日目で料金が倍になる理由は？

A: ビジネスルールとして、6日間のレンタルで基本料金の2倍まで増加するように設計されています。7日目以降は長期利用の抑制として増加率が低下します。

---

## 関連資料

- [金額変更時の精算（返金・追加請求）](/appendix/amount-change-settlement/) — 決済済み伝票で商品を削除・追加・価格変更したときの返金/追加請求フロー
- [ステータス遷移図](/appendix/status-flow/)
- [URL直接アクセスパターン](/appendix/url-patterns/)
