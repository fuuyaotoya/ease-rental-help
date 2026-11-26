---
title: '延長料金計算ルール'
description: '延長料金・キャンセル料の計算ルール（営業日ベースの料率表と計算機つき）'
sidebar:
  order: 102
---


> **付録:** 延長料金とキャンセル料の計算ルール

---

## 概要

レンタル料金は、ピックアップ当日を1日目として計算します。延長料金は、延長後の通算日数で計算したレンタル料金から、延長前のレンタル料金を差し引いた金額です。基本料金が1,000円で、5日間のレンタルを2日延長した場合は、6日目の200円と7日目の100円の合計で300円です。

---

## 計算ルール

### 基本ルール

| 期間                      | 加算率 | 説明                        |
| ------------------------- | ------ | --------------------------- |
| ピックアップ当日（1日目） | 100% | 基本料金 |
| 2〜6日目 | 20%/日 | 基本料金の20%を1日ごとに加算 |
| 7日目以降                 | 10%/日 | 基本料金の10%を日割りで加算 |

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

キャンセル料は、**レンタル開始日までの営業日数**で決まります。日曜と、「マスタ管理」の「営業日・祝日」で休業日として登録されている祝日・年末年始は数えません。土曜は休業日として登録されている日を除き、営業日として数えます。

**キープ（お申込み確定）時点でキャンセル料の対象**となります（無料キャンセル窓は廃止）。**仮予約は現在も使用できます。ただし、スタッフが手動でキャンセルする場合もキャンセル料の対象です。**

:::dev
> **SSOT:** Backend `src/modules/bookings/booking-totals.service.ts` `calculateCancellationFee()` / 営業日数は `calcCancelDaysBefore()` / Frontend `src/lib/utils/fee-calculator.ts`。
:::

### 料率表（商品レンタル料）

| キャンセル時期（開始日までの営業日） | 料率 | 説明 |
|----------------------------------|------|------|
| **7日前以上** | **10%** | 基本レンタル料の10% |
| **6〜2日前** | **30%** | 基本レンタル料の30% |
| **前日** | **50%** | 基本レンタル料の50% |
| **当日 / 開始後** | **100%** | 基本レンタル料の全額 |

### 配送キャンセル料（別料率）

配送手配後のキャンセルでは、商品レンタル料のキャンセル料とは**別に**配送キャンセル料が発生します。こちらは前日・当日のみ発生し、2日前以前は発生しません。

| キャンセル時期（開始日までの営業日） | 配送料の料率 |
|----------------------------------|------------|
| **2日前以上** | **0%** |
| **前日** | **30%** |
| **当日 / 開始後** | **100%** |

#### 配送キャンセル料 計算機

キャンセル日・レンタル開始日・配送料を入力すると、配送キャンセル料の目安を確認できます。この計算機は祝日と年末年始を掲載時の設定で数えます。実際の計算には「マスタ管理」の「営業日・祝日」に登録された休業日が使われます。

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
  <p class="cancel-calc__note">※ この計算機は日曜・2026〜2027年の祝日・12/29〜1/3を休業日として扱います。</p>
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
    // Delivery rate, counted back from the rental start in business days.
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

- **商品レンタル料:** 商品ごとのレンタル料金に数量を掛けた税抜金額に、商品の料率を適用します。
- **配送料:** 配送ごとの税抜配送料に、配送の料率を適用します。
- **消費税:** キャンセル料を計算したあと、請求額の計算時に消費税がかかります。

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
| **伝票全体のキャンセル** | 取り消しの対象になる商品と配送 | 今回取り消す商品に商品料率を適用。「レンタル料のキャンセル料を0円にする」にチェックを入れると、今回分の商品キャンセル料は0円 | 銀行振込・店頭支払いなどでは、未実施の配送を取り消して配送の料率を適用。チェックを入れると、その配送キャンセル料も0円。クレジットカードの伝票では、配送は残る |
| **商品の部分キャンセル** | 伝票の特定商品のみ | キャンセルした商品に商品料率を適用（残商品は影響なし） | 影響なし |
| **配送のキャンセル** | 配送のみ | 影響なし | キャンセルした配送に配送キャンセル料率（上記「配送キャンセル料」）を適用（クレカは配送キャンセル料のカード決済・後払い伝票は本体分の決済に統合） |

> **ポイント:** キャンセル料は、**伝票の状態**と**キャンセルの範囲・経路**によって異なります。店舗で仮押さえした仮予約をスタッフが手動でキャンセルする場合は、課金対象です。

:::note[伝票全体をキャンセルするときの請求額]
銀行振込・店頭支払いなどの伝票では、「レンタル料のキャンセル料を0円にする」にチェックを入れて「キャンセルを実行」すると、未実施の配送のキャンセル料も0円になります。確認画面には配送料のキャンセル料が「0円対象外です」と表示されますが、処理後は0円になります。

たとえば、当日に税抜10,000円の商品と税抜6,000円の未実施配送を取り消す場合、チェックを入れると商品キャンセル料0円、配送キャンセル料0円です。以前のキャンセル料や追加料金などの残額がなければ、請求額は税込0円です。

実施済みの配送の配送料や、先に個別キャンセルした商品のキャンセル料が残ることがあります。クレジットカードの伝票では、チェックを入れても配送は残ります。詳しくは[伝票作成・伝票詳細](/booking-compact/#配送をキャンセルした場合配送キャンセル料の請求)をご覧ください。
:::

### 伝票の状態による無料・課金の区別

| 伝票の状態 | キャンセル経路 | キャンセル料 |
|---|---|---|
| **未確定（カート確定前）** | 顧客マイページからキャンセル | **無料**（未確定のため） |
| **仮予約（管理画面で手動作成した仮押さえ）** | スタッフが手動キャンセル | **課金対象**（キープ時点で課金） |
| **確定予約以降** | スタッフ経由でキャンセル | **課金対象**（本マニュアルの料率表どおり） |
| **[社内確保](/internal-hold/)** | スタッフが手動キャンセル | **無料**（常に0円。明細・配送・伝票のどの単位でも0円で、PDFの明細行も0円で印字されます） |

:::dev
> **顧客セルフキャンセル:** BE `updateStatusFromCustomer` → `cancelBookingFromCustomer`（cancelBooking サブセット tx）。`DRAFT`（未確定）はキャンセル料を skip（無料）。`CONFIRMED`（確定済み）は per-item `calculateCancellationFee` + `applyCancellationSideEffects` + `recalculate` でキャンセル料を計上（cancelBooking と対称・ただし Shopify 返金 warning・手動メールは skip）。
> **部分キャンセル:** キャンセル料を後払い伝票の charges に計上（`cancelBookingItem` cascade 含む）。
> **配送キャンセル料の統合:** 後払い伝票は本体分の決済（①）charges に統合（伝票1:領収書1の回復・クレカは引き続き⑤）。
> **二重請求の三層防御**（settlement gate + swap CAS + active-billing 交差 fail-closed）。顧客セルフキャンセルは追加料金③の未決済行を cleanup し、同防御と整合。
> **SSOT:** `calculateCancellationFee`（`booking-totals.service.ts`）+ `applyCancellationSideEffects`（util・8 caller）+ `recalculate`。配送キャンセル料は `deliveries.cancellation_fee`。
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
   - 延長の計算では、従来の終了日までを延長前の日数、翌日から実際の返却日までを延長日数として数える

2. **端数処理**（用途別に異なります — すべて切り捨てではありません）
   - **消費税**: 切捨て（`ROUND_FLOOR`）
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
