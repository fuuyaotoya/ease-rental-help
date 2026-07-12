// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkDevDirective from './src/plugins/remark-dev-directive.mjs';

export default defineConfig({
  site: 'https://ease-rental-help.onrender.com',
  markdown: {
    remarkPlugins: [remarkDevDirective],
  },
  integrations: [
    starlight({
      title: 'EASE Rental',
      description: 'EASE Rental レンタル管理システムの操作マニュアル',
      components: {
        Sidebar: './src/components/Sidebar.astro',
      },
      head: [
        {
          // Apply the dev-mode class before paint to avoid a flash of
          // developer-only content on load.
          tag: 'script',
          content:
            "try{if(localStorage.getItem('ease-help-dev-mode')==='1')document.documentElement.classList.add('dev-mode')}catch(e){}",
        },
      ],
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
            { label: '会社まとめ請求', slug: 'consolidated-invoices' },
            { label: '配送料確定・Shopify請求', slug: 'delivery-fee-shopify-flow' },
          ],
        },
        {
          label: 'マスタ・顧客',
          items: [
            { label: '会員申込・承認', slug: 'membership-apply' },
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
            { label: '自動送信メール一覧', slug: 'email-notifications' },
            { label: 'メール本文テンプレート', slug: 'email-templates' },
          ],
        },
        {
          label: 'テーマカスタマイズ',
          items: [
            { label: 'テーマカスタマイズ概要', slug: 'theme-customize' },
            { label: 'トップページ', slug: 'theme-customize/homepage' },
            { label: 'コレクションページ', slug: 'theme-customize/collection' },
            { label: '商品ページ', slug: 'theme-customize/product' },
            { label: 'スタジオページ', slug: 'theme-customize/studio' },
            { label: 'スタジオ料金一覧', slug: 'theme-customize/studio-pricing' },
            { label: '展示会ページ', slug: 'theme-customize/exhibition' },
            { label: 'About/会社情報', slug: 'theme-customize/about' },
            { label: 'レンタルトップ', slug: 'theme-customize/rental-top' },
            { label: 'カートページ', slug: 'theme-customize/cart' },
            { label: 'マイアカウント', slug: 'theme-customize/my-account' },
          ],
        },
        {
          label: 'Shopify管理画面',
          items: [
            { label: '注文一覧（Orders）', slug: 'shopify-admin/orders' },
            { label: '下書き注文（Draft Orders）', slug: 'shopify-admin/draft-orders' },
            { label: '顧客（Customers）', slug: 'shopify-admin/customers' },
            { label: 'アカウント無効化・ブラックリスト運用', slug: 'shopify-admin/account-blacklist' },
            { label: '商品管理（Products）', slug: 'shopify-admin/products' },
          ],
        },
        {
          label: '付録',
          items: [
            { label: 'ステータス遷移図', slug: 'appendix/status-flow' },
            { label: '延長料金計算ルール', slug: 'appendix/fee-calculation' },
            { label: '金額変更時の精算（返金・追加請求）', slug: 'appendix/amount-change-settlement' },
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
