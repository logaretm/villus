# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 1.0.0-beta.1 (2020-09-30)

### Breaking Changes

- deprecate the `context` and `fetch` options in favor of [custom plugins API](https://logaretm.github.io/villus/guide/plugins)
- deprecate the exported `batch` fetcher in favor of [`@villus/batch` plugin](https://logaretm.github.io/villus/plugins/batch)
- changed the signature of provider and useClient ([b4fa6d9](https://github.com/logaretm/villus/commit/b4fa6d953a4997554497253bf520d401c571d4b2)) due to conflicts with TypeScript typings

### Bug Fixes

- handle non 200 error responses closes [#49](https://github.com/logaretm/villus/issues/49) ([0950fa8](https://github.com/logaretm/villus/commit/0950fa8a82060a02871d4eb027841eb0ecb31f96))

### Features

#### Plugins API

A large chunk of villus code has been re-written from scratch to use a pipeline-like operation transformers (plugins) similair to what apollo client and urql are doing with much less jargon and complexity, they are just a simple middleware performing operations on GraphQL queries as they go out or after execution.

[Check the documentation here](https://logaretm.github.io/villus/guide/plugins)

#### `multipart` plugin

The `multipart` plugin will enable support for graphql file upload, [check the documentation and examples here](https://logaretm.github.io/villus/plugins/multipart)
