import { visit } from 'unist-util-visit';

/**
 * Remark plugin: convert `:::dev` container directives into a
 * `<div class="dev-only">` wrapper. Inner content is still parsed as Markdown.
 *
 * Authoring:
 *   :::dev
 *   Developer-only content here.
 *   :::
 *
 * Visibility is controlled at runtime by the `dev-mode` class on <html>
 * (see DevModeToggle.astro + custom.css). When dev mode is off, the wrapper
 * is hidden via CSS.
 */
export default function remarkDevDirective() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'containerDirective' || node.name !== 'dev') return;

      const data = node.data || (node.data = {});
      data.hName = 'div';
      data.hProperties = { className: ['dev-only'] };
    });
  };
}
