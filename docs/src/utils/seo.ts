import { MarkdownInstance } from 'astro';

export function generateMetaTags({ title, description, image, url, keywords }: any) {
  return [
    {
      name: 'description',
      content: description,
    },
    {
      name: 'og:description',
      property: 'og:description',
      content: description,
    },
    {
      name: 'og:title',
      property: 'og:title',
      content: title,
    },
    url
      ? {
          name: 'og:url',
          property: 'og:url',
          content: url,
        }
      : undefined,
    image
      ? {
          name: 'og:image',
          property: 'og:image',
          content: image,
        }
      : undefined,
    image
      ? {
          name: 'image',
          property: 'image',
          content: image,
        }
      : undefined,
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      property: 'twitter:title',
      content: title,
    },
    {
      name: 'twitter:description',
      property: 'twitter:description',
      content: description,
    },
    image
      ? {
          name: 'twitter:image',
          property: 'twitter:image',
          content: image,
        }
      : undefined,
    keywords
      ? {
          name: 'keywords',
          property: 'keywords',
          content: Array.isArray(keywords) ? keywords.join(', ') : keywords,
        }
      : undefined,
  ].filter(Boolean);
}

export function generateLinks({ url }) {
  return [
    {
      hid: 'canonical',
      rel: 'canonical',
      href: url,
    },
  ];
}

export interface Frontmatter {
  title: string;
  order: number;
}

export function buildMenu(pages: MarkdownInstance<Frontmatter>[]) {
  return [...pages.sort((a, b) => a.frontmatter.order - b.frontmatter.order)].map(p => {
    return {
      title: p.frontmatter.title,
      order: p.frontmatter.order,
      path: p.url,
    };
  });
}
