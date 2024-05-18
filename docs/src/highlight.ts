/* eslint-disable no-console */
import { getHighlighter } from 'shiki';
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationFocus,
  transformerNotationErrorLevel,
  transformerMetaHighlight,
  parseMetaHighlightString,
} from '@shikijs/transformers';
import { transformerTwoslash } from '@shikijs/twoslash';
import { createTwoslasher } from 'twoslash-vue';
import { JSDOM } from 'jsdom';
import { visit } from 'unist-util-visit';
import theme from './theme.json';
import light from './light-theme.json';

const dom = new JSDOM();
const document = dom.window.document;

/**
 * Some langs are highlighted with different grammar rules but need to be displayed
 */

// const theme: BuiltinTheme = 'rose-pine';

const highlighterPromise = getHighlighter({
  // Complete themes: https://github.com/shikijs/shiki/tree/master/packages/themes
  themes: [theme],
  langs: ['js', 'ts', 'vue', 'graphql', 'jsx', 'css', 'sh', 'yaml', 'json', 'vue-html', 'vue', 'html'],
});

const twoslasher = createTwoslasher();

const getConfig = (lang: string, meta: string) => ({
  lang: lang,
  meta: meta
    ? {
        __raw: meta,
      }
    : undefined,
  themes: {
    light: 'custom-dark',
    dark: 'custom-dark',
  },
  transformers: [
    // transformerTwoslash({
    //   twoslasher,
    //   renderer: rendererFloating(),
    // }),
    transformerNotationDiff(),
    transformerNotationHighlight(),
    transformerNotationFocus(),
    transformerNotationErrorLevel(),
    transformerMetaHighlight(),
  ],
});

export default function highlight() {
  return async function (tree) {
    const { codeToHtml } = await highlighterPromise;
    visit(tree, 'code', visitor);

    function visitor(node) {
      try {
        let highlightedTemplate = '';
        const [templatePart] = node.lang === 'vue' ? node.value.match(/<template>([\s\S]*)<\/template>/) || [] : [];

        if (templatePart && node.lang === 'vue') {
          highlightedTemplate = codeToHtml(templatePart, getConfig('vue-html', node.meta));
        }

        const highlightMeta = parseMetaHighlightString(node.meta);
        const html = codeToHtml(node.value, getConfig(node.lang, node.meta));
        const fragment = document.createDocumentFragment();
        const wrapper = document.createElement('div');
        wrapper.classList.add('shiki-snippet');
        wrapper.innerHTML = html;
        fragment.appendChild(wrapper);

        if (highlightedTemplate) {
          const firstIdx = [...wrapper.querySelectorAll('.line')].findIndex(line => line.textContent === '<template>');
          const lastIdx = [...wrapper.querySelectorAll('.line')].findLastIndex(
            line => line.textContent === '</template>',
          );
          const htmlFrag = document.createElement('div');
          htmlFrag.innerHTML = highlightedTemplate;
          const replacements = [...htmlFrag.querySelectorAll('.line')];
          for (let i = firstIdx; i <= lastIdx; i++) {
            const line = wrapper.querySelector(`.line:nth-child(${i + 1})`);
            line?.replaceWith(replacements[i - firstIdx]);
          }
        }

        const langSpan = createSpan(node.lang, 'shiki-language', {
          'data-language': node.lang,
        });
        const shikiEl = fragment.querySelector('.shiki') as HTMLElement | null;

        if (highlightMeta?.length) {
          shikiEl.classList.add('has-highlighted');
        }

        shikiEl?.prepend(langSpan);

        fragment.querySelector('.line:last-child:empty')?.remove();
        if ([...fragment.querySelectorAll('.line')].length === 1) {
          shikiEl?.classList.add('single-line');
        }

        node.value = fragment.querySelector('.shiki-snippet')?.outerHTML;
        node.type = 'html';
      } catch (err) {
        console.error(err);
        console.log(node.lang);
      }
    }
  };
}

function createSpan(text: string, className: string, attrs?: Record<string, string>) {
  const document = dom.window.document;

  const span = document.createElement('span');
  span.textContent = text;
  span.classList.add(className);
  if (attrs) {
    Object.keys(attrs).forEach(attr => {
      span.setAttribute(attr, attrs[attr]);
    });
  }

  return span;
}
