---
title: 'EASE Rental 操作マニュアル'
template: splash
hero:
  tagline: レンタル商品管理・配送管理・顧客管理の操作ガイド
  actions:
    - text: 伝票作成
      link: /booking-compact/
      icon: right-arrow
      variant: primary
    - text: 業務フロー全体
      link: /overview/
      icon: right-arrow
---

import { Card, CardGrid } from '@astrojs/starlight/components';

## 業務フロー

<CardGrid stagger={1}>
  <Card title="受注・伝票" icon="clipboard">
    伝票作成から検索まで
    [伝票作成 →](/booking-compact/)
    [伝票検索 →](/slip-search/)
  </Card>
  <Card title="予約確認" icon="calendar">
    在庫・予約状況の確認
    [商品予約状況 →](/product-reservation-inquiry/)
  </Card>
  <Card title="出荷・配送" icon="truck">
    ピッキングから配送まで
    [ピッキング・出荷 →](/picking-delivery/)
    [配送一覧 →](/delivery-list/)
  </Card>
  <Card title="返却" icon="undo">
    返却処理と金額確定
    [返却・金額確定 →](/bookings-return/)
  </Card>
  <Card title="請求・入金" icon="credit-card">
    請求書作成から入金まで
    [請求書作成 →](/invoice-create-new/)
    [未入金一覧 →](/payment-management/)
  </Card>
  <Card title="マスタ管理" icon="database">
    顧客・商品・各種マスタ
    [顧客管理 →](/customer-management/)
    [マスタ管理 →](/master-data/)
  </Card>
</CardGrid>
