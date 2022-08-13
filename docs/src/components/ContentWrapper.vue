<template>
  <div class="rendered-content">
    <slot />
  </div>
</template>

<style lang="postcss">
.rendered-content {
  h1 {
    @apply text-5xl mb-8;
  }

  h2 {
    @apply text-3xl;
  }

  h3 {
    @apply text-xl;
  }

  h4,
  h5 {
    @apply text-lg;
  }

  h1,
  h2,
  h3 {
    @apply font-display;
  }

  h2,
  h3,
  h4,
  h5 {
    @apply font-semibold my-8 relative;
    transform: translateX(2ch);
    &::before {
      @apply absolute text-accent-800;
      margin-left: -2ch;
      content: '#';
    }

    @screen lg {
      transform: none;
    }
  }

  p + p {
    @apply mt-4;
  }

  ul {
    @apply px-8 my-4 list-disc;

    li + li {
      @apply mt-2;
    }
  }

  .features {
    ul {
      li {
        @apply relative flex items-center antialiased;
        &:before {
          @apply w-6 h-6 text-lg absolute rounded-full flex items-center justify-center flex-shrink-0;
          content: '';
          background-image: url("data:image/svg+xml,%3Csvg fill='none' stroke='%239580FF' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'%3E%3C/path%3E%3C/svg%3E");
          left: -2rem;
        }
      }
    }
  }

  .shiki-snippet {
    @apply my-5 relative overflow-hidden rounded-md text-sm border border-emerald-500 border-opacity-30 shadow;
    background-color: var(--code-background);
  }

  .shiki {
    @apply font-mono pb-4 pt-6 text-sm;

    counter-reset: step;
    counter-increment: step 0;
    line-height: 1.4;
    overflow: auto;
    overflow: overlay;

    .filename {
      @apply w-full block py-2 px-8 top-0 bg-gray-200 rounded-t-md font-extrabold text-sm select-none tracking-wide absolute inset-x-0;
      font-family: 'Courier New', monospace;
    }

    .filename + pre {
      @apply mt-0 rounded-t-none;
    }

    code {
      @apply flex flex-col w-full;
    }

    &-language {
      @apply absolute right-4 top-4 text-xs;
      color: var(--code-lang-label);
    }

    &.with-filename {
      margin-top: 30px;

      .shiki-language {
        @apply top-2.5;
      }
    }

    &.with-line-highlights {
      .line {
        @apply transition-all duration-300;
      }

      .line:not(.is-highlighted) {
        @apply filter grayscale opacity-40 brightness-100;
      }

      &:hover {
        .line:not(.is-highlighted) {
          @apply filter-none opacity-100;
        }

        .line.is-highlighted {
          background-color: var(--code-line-highlight);
        }
      }
    }

    .line {
      @apply block pr-2;
      padding-left: 1.4rem;
      line-height: 1.6;

      &::before {
        @apply select-none;
        content: counter(step);
        counter-increment: step;
        width: 1rem;
        border-left: 0.2rem transparent solid;
        margin-right: 1.3rem;
        display: inline-block;
        text-align: right;
        color: var(--code-line-numbers);
      }

      &.is-highlighted {
        padding-left: 0;

        &::before {
          padding-left: 1.4rem;
          margin-right: 2rem;
          border-color: var(--code-line-highlight-border);
        }
      }
    }
  }

  blockquote {
    @apply py-4 rounded-r-lg pl-4 bg-black border-l-4 border-accent-800 italic my-8 text-lg;
  }

  pre[class*='language-'] {
    @apply rounded-lg my-4 block border border-gray-100;
  }

  *:not(pre) > code:not([class]) {
    @apply text-sm px-1 rounded bg-gray-100 border border-gray-200 text-gray-900;
  }

  details {
    @apply my-10 px-3;

    summary {
      @apply outline-none mb-8;
    }
  }

  ol {
    @apply list-decimal px-8;
  }

  p,
  li,
  td {
    a[href] {
      @apply text-accent-800;

      &:hover {
        @apply underline;
      }
    }
  }

  table {
    @apply w-full my-4;
  }

  table,
  th,
  td {
    @apply border border-gray-100;
  }

  th,
  td {
    @apply p-3;
  }
}

.dark {
  *:not(pre) > code:not([class]) {
    @apply px-1 bg-black border border-gray-900 text-gray-200;
  }

  pre code,
  pre[class*='language-'] code {
    color: #f8f8f2;
  }

  *[class*='language-']::before {
    color: #7970a9;
  }

  pre[class*='language-'] {
    @apply border-carbon;
  }

  table,
  th,
  td {
    @apply border border-carbon;
  }

  .shiki {
    .filename {
      @apply bg-gray-800;
    }
  }
}
</style>
