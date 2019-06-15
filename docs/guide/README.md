---
title: Introduction
lang: en-US
meta:
  - name: og:title
    content: Introduction | Vue-gql
---

# Introduction

Vue-gql is a minimal [GraphQL](https://graphql.org/) client for Vue.js, exposing components to build highly customizable GraphQL projects. You can use this in small projects or large complex applications.

We use GraphQL In most of our apps we build at Baianat, but more often than not we end up only using the bare-bones **ApolloLink** without the extra whistles provided by the **ApolloClient**, or we use `fetch` to run our GraphQL queries as we like to handle caching and persisting on our own. Also we would like to use [Vuex](https://vuex.vuejs.org/) in some of the queries, but due to **ApolloClient** having its own immutable store, we cannot use both side-by side and one makes the other redundant.

To solve this, we needed a bare-bones GraphQL client for Vue.js, but with small quality of life defaults out of the box, like caching. Keeping it simple means it gets to be flexible and lightweight, and can be scaled to handle more complex challenges.

This library is inspired by [URQL](https://github.com/FormidableLabs/urql).

## Features

- Small bundle size, no dependencies.
- API is exposed as minimal Vue components that do most of the work for you.
- Query caching by default with sensible configurable policies: `cache-first`, `network-only`, `cache-and-network`.
- SSR support.
- TypeScript friendly as its written in pure TypeScript.

## Compatibility

This library relies on the `fetch` web API to run queries, you can use `unfetch` (client-side) or `node-fetch` (server-side) to use as a polyfill.

## Alternatives

### [VueApollo](https://github.com/Akryum/vue-apollo)

**VueApollo** Is probably the most complete Vue GraphQL client out there, like **vue-gql** it exposes components to work with queries and mutations. It builds upon the **ApolloClient** ecosystem. Use it if you find **vue-gql** lacking for your use-case.
