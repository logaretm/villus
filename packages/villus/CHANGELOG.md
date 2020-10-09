# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-beta.6](https://github.com/logaretm/villus/compare/villus@1.0.0-beta.5...villus@1.0.0-beta.6) (2020-10-09)


### Bug Fixes

* prevent running the query onMounted when suspended closes [#56](https://github.com/logaretm/villus/issues/56) ([27385b6](https://github.com/logaretm/villus/commit/27385b66e196a43e6ab64800183a693939f5320a))





# [1.0.0-beta.5](https://github.com/logaretm/villus/compare/villus@1.0.0-beta.4...villus@1.0.0-beta.5) (2020-10-09)


### Bug Fixes

* fetchonMounted typo ([09c3de4](https://github.com/logaretm/villus/commit/09c3de457e4a4b30742e5f315b1241b0961681fb))





# [1.0.0-beta.4](https://github.com/logaretm/villus/compare/villus@1.0.0-beta.3...villus@1.0.0-beta.4) (2020-10-07)


### Bug Fixes

* effect conditions for Query and Subscription components ([20f6803](https://github.com/logaretm/villus/commit/20f68035861916dffadbe11ea5a55739cc1e9ac8))


### Features

* re-implement subscriptions as a plugin ([e5e790a](https://github.com/logaretm/villus/commit/e5e790a404eb0cc27a9320999c03484e8bf575d5))
* rename lazy to fetchOnMount ([68b937e](https://github.com/logaretm/villus/commit/68b937ebfc91037494be33a67f643c22e11b5064))
* rename pause and resume for queries to  be more explicit ([ca9cf1e](https://github.com/logaretm/villus/commit/ca9cf1eb93aeff8a40cc9d85465e45089990d412))
* rename pause prop to paused and watch its effect ([fca32d4](https://github.com/logaretm/villus/commit/fca32d4e03f57312340ca0cea6d6697eef21280a))
* rename suspend prop to suspended for consistency ([06eaecd](https://github.com/logaretm/villus/commit/06eaecd8a5ac02f82d015511c8fb80db79150deb))
* updated query component prop names ([d0fc40d](https://github.com/logaretm/villus/commit/d0fc40d7376c6e8cd3d7cfb02b03198e7e7d11f9))
* use defineComponent helper with subscription ([ef7c16a](https://github.com/logaretm/villus/commit/ef7c16a4948b407f36523b037d58db41d9f50302))
* use the defineComponent helper with Mutation component ([eb72067](https://github.com/logaretm/villus/commit/eb7206783e898b710463c87f0cb2a2e880c659e9))
* use the defineComponent helper with Query component and omit redudencies ([d00e25b](https://github.com/logaretm/villus/commit/d00e25b8d924434ab44602d65788a2d4a9da5bda))





# [1.0.0-beta.3](https://github.com/logaretm/villus/compare/villus@1.0.0-beta.2...villus@1.0.0-beta.3) (2020-10-05)

**Note:** Version bump only for package villus





# [1.0.0-beta.2](https://github.com/logaretm/villus/compare/villus@1.0.0-beta.1...villus@1.0.0-beta.2) (2020-10-02)

**Note:** Version bump only for package villus





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
