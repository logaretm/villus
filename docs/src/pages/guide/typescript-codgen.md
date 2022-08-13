---
layout: ../../layouts/PageLayout.astro
title: GraphQL Code Generator Workflow
description: How to use GraphQL code generator with villus
order: 7
---

# GraphQL Code Generator Workflow

`villus` is built with TypeScript in its core, you can provide typings for your fetched queries and their variables.

Providing typings manually for your queries and variables can be as straight forward as this:

```ts
import { useQuery } from 'villus';

interface PostsQuery {
  posts: {
    id: number;
    title: string;
  };
}

interface PostsVariables {
  first?: number;
  after?: number;
}

const { data } = useQuery<PostsQuery, PostsVariables>({
  query: `{
    posts {
      id
      title
    }
  }`,
  variables: {
    // variables are now typed as PostsVariables
  },
});

data.value; // is now typed as PostsQuery type!
```

This however simple it is, it can be very tedious and will be hard to maintain as your schema evolve with time. Which is why it is better to automatically generate them with [GraphQL code generator](https://graphql-code-generator.com/).

## Automatically Generating Types

The [GraphQL code generator](https://graphql-code-generator.com/) tool allow you to configure automation to generate the TypeScript definitions for your schema, queries, mutations and their variables.

Make to read their [documentation](https://graphql-code-generator.com/docs/getting-started/index) to get familiar with the setup and tools you will need, this guide will focus on the relevant parts of `villus`.

### Using Generated Queries

Once you've got everything setup, you will be able to import your queries and their type definitions along with their variables as well, the following is a snippet of such a setup:

```ts
import { useQuery } from 'villus';
import { Posts, PostsQuery, PostsQueryVariables } from '@/graphql/Posts.gql';

const { data } = useQuery<PostsQuery, PostsQueryVariables>({
  query: Posts
  variables: {
    // variables are now typed as PostsQueryVariables
  },
});

data.value; // is now typed as PostsQuery type!
```

### Using Typed Document

There is a nice plugin for the code generator called [Typed Document Node](https://graphql-code-generator.com/docs/plugins/typed-document-node/) that instead of generating just types for your queries, it generates a `TypedDocumentNode` that has both the type information of your queries/mutations and their variables, so you don't need to import the query type each time you use villus.

After setting up the plugin and generating the required files you can now import the new `TypedDocumented` for your queries, here is a sample:

```ts
import { useQuery } from 'villus';
import { PostsDocument } from '@/graphql/Posts';

const { data } = useQuery({
  query: PostsDocument
  variables: {
    // variables are now typed as PostsQueryVariables
  },
});

data.value; // is now typed as PostsQuery type!
```

This reduces the noise you have to import in your file and allow your code to be more concise.

## Demo

Here is a live example of a project with the complete setup of the mentioned tools in a Nuxt app:

<codesandbox title="Villus + Nuxt + TypedDocument Plugin" id="villus-nuxt-typeddocument-plugin-qewsn"></codesandbox>
