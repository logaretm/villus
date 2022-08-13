---
layout: ../../layouts/PageLayout.astro
title: Overview
order: 1
---

# Introduction

villus is a minimal [GraphQL](https://graphql.org/) client for Vue.js, exposing components to build highly customizable GraphQL projects. You can use this in small projects or large complex applications.

I use GraphQL In most of the apps I build, but more often than not I end up only using the bare-bones **ApolloLink** without the extra whistles provided by the **ApolloClient**. I often even just use a bare `fetch` to run my GraphQL queries as I prefer to handle caching and persisting on my own when building complex PWA apps. Also the fact that Apollo Client sometimes throws obscure non-standard GraphQL errors doesn't help.

To solve this, I needed a bare-bones GraphQL client for Vue.js, but with small quality of life defaults out of the box, like caching. Keeping it simple means it gets to be flexible and lightweight, and can be scaled to handle more complex challenges.

This library is inspired by [URQL](https://github.com/FormidableLabs/urql), and forked from my past contribution to the `vue-gql` library before a different direction was decided for it.

## Features

- 📦 **Minimal:** Its all you need to query GQL APIs
- 🦐 **Tiny:** Very small footprint
- 🗄 **Caching:** Simple and convenient query caching by default
- 💪 **TypeScript**: Written in Typescript
- 💚 Minimal Vue.js Components
- 🖇 Composition API support

## Compatibility

This library relies on the `fetch` web API to run queries, you can use `unfetch` (client-side) or `node-fetch` (server-side) to use as a polyfill.

## Alternatives

### [VueApollo](https://github.com/vue/vue-apollo)

**VueApollo** Is probably the most complete Vue GraphQL client out there and is the official one for apollo, like **villus** it exposes components to work with queries and mutations. It builds upon the **ApolloClient** ecosystem. Use it if you find **villus** lacking for your use-case.
