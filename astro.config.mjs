// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ease-rental-help.onrender.com',
  integrations: [
    starlight({
      title: 'EASE Rental',
      description: 'EASE Rental レンタル管理システムの操作マニュアル',
      defaultLocale: 'root',
      locales: {
        root: { label: '日本語', lang: 'ja' },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/fuuyaotoya/ease-rental-help',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/fuuyaotoya/ease-rental-help/edit/main/',
      },
      lastUpdated: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
      sidebar: [
        { label: '業務フロー全体', slug: 'overview' },
        {
          label: '受注・伝票',
          items: [
            { label: '貸し出し伝票作成', slug: 'booking-compact' },
            { label: '伝票検索', slug: 'slip-search' },
          ],
        },
        {
          label: '予約確認',
          items: [
            { label: '商品予約状況照会', slug: 'product-reservation-inquiry' },
          ],
        },
        {
          label: '出荷・配送',
          items: [
            { label: 'ピッキング・出荷登録', slug: 'picking-delivery' },
            { label: '配送一覧', slug: 'delivery-list' },
          ],
        },
        {
          label: '返却',
          items: [
            { label: '返却・金額確定', slug: 'bookings-return' },
          ],
        },
        {
          label: '請求・入金',
          items: [
            { label: '請求書作成', slug: 'invoice-create-new' },
            { label: '請求一覧・入金処理', slug: 'invoices-list' },
            { label: '未入金一覧・入金処理', slug: 'payment-management' },
            { label: '返金処理', slug: 'refund' },
            { label: '一括請求処理', slug: 'bulk-invoices' },
            { label: '配送料確定・Shopify請求', slug: 'delivery-fee-shopify-flow' },
          ],
        },
        {
          label: 'マスタ・顧客',
          items: [
            { label: '顧客管理', slug: 'customer-management' },
            { label: '商品管理', slug: 'products' },
            { label: 'マスタ管理', slug: 'master-data' },
          ],
        },
        {
          label: '個人設定',
          items: [
            { label: 'マイページ', slug: 'my-page' },
          ],
        },
        {
          label: '管理者用',
          items: [
            { label: 'Shopifyデータ', slug: 'shopify-data' },
            { label: 'Webhook受信', slug: 'webhook-receiving' },
            { label: 'ダッシュボード', slug: 'dashboard' },
            { label: '集計表出力', slug: 'aggregate-report' },
          ],
        },
        {
          label: '付録',
          items: [
            { label: 'ステータス遷移図', slug: 'appendix/status-flow' },
            { label: '延長料金計算ルール', slug: 'appendix/fee-calculation' },
            { label: 'URL直接アクセス', slug: 'appendix/url-patterns' },
            { label: 'メール送信の責任分界', slug: 'appendix/email-responsibility' },
            { label: '自動キャンセルの仕組み', slug: 'appendix/auto-cancellation' },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
    mdx(),
    sitemap(),
  ],
});
