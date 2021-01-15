# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-rc.9](https://github.com/logaretm/villus/compare/villus@1.0.0-rc.8...villus@1.0.0-rc.9) (2021-01-15)


### Features

* enhance suspense query suspense API and allow override query vars ([c38e574](https://github.com/logaretm/villus/commit/c38e574a12801cf8e15b05c37637bc62b1cae9b4))





# [1.0.0-rc.8](https://github.com/logaretm/villus/compare/villus@1.0.0-rc.7...villus@1.0.0-rc.8) (2021-01-05)


### Bug Fixes

* expose villus client symbol for testing ([141bf97](https://github.com/logaretm/villus/commit/141bf9717250894d58a71ce3dd8a28160677b229))





# [1.0.0-rc.7](https://github.com/logaretm/villus/compare/villus@1.0.0-rc.6...villus@1.0.0-rc.7) (2021-01-02)


### Features

* remove initialIsFetching and sync it with fetchOnMount ([a1e75c4](https://github.com/logaretm/villus/commit/a1e75c4aeb800a2e22e123bb1c75271258ff09dc))





# [1.0.0-rc.6](https://github.com/logaretm/villus/compare/villus@1.0.0-rc.5...villus@1.0.0-rc.6) (2020-11-26)


### Features

* add install method to client ([#83](https://github.com/logaretm/villus/issues/83)) ([397bbdb](https://github.com/logaretm/villus/commit/397bbdb612a4bacfd5f3b9242d48b2ec94ccde14))





# [1.0.0-rc.5](https://github.com/logaretm/villus/compare/villus@1.0.0-rc.4...villus@1.0.0-rc.5) (2020-11-25)


### Bug Fixes

* remove invalid import ([3bfdaf7](https://github.com/logaretm/villus/commit/3bfdaf77028549c22705f0a702bb84a4dcd1d66f))


### Features

* allow adding other hash items to the query key helper ([5d18e8a](https://github.com/logaretm/villus/commit/5d18e8a7c3016cc9adef0bacfe43076878654a73))
* expose getQueryKey helper ([26548d5](https://github.com/logaretm/villus/commit/26548d575d579bd1cff44c7cbacc93c07e06fee8))
* re-execute subscriptions closes [#79](https://github.com/logaretm/villus/issues/79) ([0ec4680](https://github.com/logaretm/villus/commit/0ec46802c80788531a7b84c516eac9d879b076e8))





# [1.0.0-rc.4](https://github.com/logaretm/villus/compare/villus@1.0.0-rc.3...villus@1.0.0-rc.4) (2020-11-01)


### Features

* expose new definePlugin type helper ([6f79a97](https://github.com/logaretm/villus/commit/6f79a97b040f132cdbea97a7e6050043f21b2195))





# [1.0.0-rc.3](https://github.com/logaretm/villus/compare/villus@1.0.0-rc.2...villus@1.0.0-rc.3) (2020-10-28)


### Features

* initial isFetching ([#74](https://github.com/logaretm/villus/issues/74)) ([ea043da](https://github.com/logaretm/villus/commit/ea043da2a4d25c81e772c2a8b9a8c9ddf33e6680))





# [1.0.0-rc.2](https://github.com/logaretm/villus/compare/villus@1.0.0-rc.1...villus@1.0.0-rc.2) (2020-10-27)


### Bug Fixes

* safe access to the provides property ([73efd25](https://github.com/logaretm/villus/commit/73efd25399988ea3615e208fff16ef8fbcd5d7e1))





# [1.0.0-rc.1](https://github.com/logaretm/villus/compare/villus@1.0.0-rc.0...villus@1.0.0-rc.1) (2020-10-26)


### Features

* upgrade Vue and provide a workaround for [#72](https://github.com/logaretm/villus/issues/72) ([6127f37](https://github.com/logaretm/villus/commit/6127f379adf743b691f48f9bc6d044553f9771b5))





# [1.0.0-rc.0](https://github.com/logaretm/villus/compare/villus@1.0.0-beta.8...villus@1.0.0-rc.0) (2020-10-22)


### Features

* **breaking:** signature updates ([#70](https://github.com/logaretm/villus/issues/70)) ([47937e8](https://github.com/logaretm/villus/commit/47937e8437cae6e78769dc7b0abfa2f4c41f5996))





# [1.0.0-beta.8](https://github.com/logaretm/villus/compare/villus@1.0.0-beta.7...villus@1.0.0-beta.8) (2020-10-21)


### Bug Fixes

* type import path ([9c7c12c](https://github.com/logaretm/villus/commit/9c7c12ce0bbf8f1cf2d88b6b1b2d56a1b21299ba))
* type the patched useResult ([31fe56b](https://github.com/logaretm/villus/commit/31fe56b89f9f8d02c48c02beec4227618cc6f2d8))


### Features

* added dedup test ([8b12141](https://github.com/logaretm/villus/commit/8b1214155b0bd8c4ff1c89734af8ba1d6e2838f1))
* avoid deduping mutations and subscriptions ([3bb9642](https://github.com/logaretm/villus/commit/3bb9642990b8fac1352964c965b6483ad0626655))
* implement dedup plugin ([eb0f0a3](https://github.com/logaretm/villus/commit/eb0f0a36947aec6a5cf02a0b395acfe32f63f1d8))
* implement response context closes [#62](https://github.com/logaretm/villus/issues/62) ([04cae29](https://github.com/logaretm/villus/commit/04cae29a8ba6163127a6da4985e37585084763ce))
* updated graphql dep closes [#65](https://github.com/logaretm/villus/issues/65) ([ef4be0a](https://github.com/logaretm/villus/commit/ef4be0afb8cba12a57c5cc128b999f570898fa69))





# [1.0.0-beta.7](https://github.com/logaretm/villus/compare/villus@1.0.0-beta.6...villus@1.0.0-beta.7) (2020-10-19)


### Bug Fixes

* typing of operation in fetch plugin ([2dc8173](https://github.com/logaretm/villus/commit/2dc81738c784f00373a95d70bd75a38a3e35d62d))


### Features

* support typed document node ([9c166f6](https://github.com/logaretm/villus/commit/9c166f6bffa589ec580d8e8d6f2729ab17a662c0))





# [1.0.0-beta.6](https://github.com/logaretm/villus/compare/villus@1.0.0-beta.5...villus@1.0.0-beta.6) (2020-10-09)

### Bug Fixes

- prevent running the query onMounted when suspended closes [#56](https://github.com/logaretm/villus/issues/56) ([27385b6](https://github.com/logaretm/villus/commit/27385b66e196a43e6ab64800183a693939f5320a))

# [1.0.0-beta.5](https://github.com/logaretm/villus/compare/villus@1.0.0-beta.4...villus@1.0.0-beta.5) (2020-10-09)

### Bug Fixes

- fetchonMounted typo ([09c3de4](https://github.com/logaretm/villus/commit/09c3de457e4a4b30742e5f315b1241b0961681fb))

# [1.0.0-beta.4](https://github.com/logaretm/villus/compare/villus@1.0.0-beta.3...villus@1.0.0-beta.4) (2020-10-07)

### Bug Fixes

- effect conditions for Query and Subscription components ([20f6803](https://github.com/logaretm/villus/commit/20f68035861916dffadbe11ea5a55739cc1e9ac8))

### Features

- re-implement subscriptions as a plugin ([e5e790a](https://github.com/logaretm/villus/commit/e5e790a404eb0cc27a9320999c03484e8bf575d5))
- rename lazy to fetchOnMount ([68b937e](https://github.com/logaretm/villus/commit/68b937ebfc91037494be33a67f643c22e11b5064))
- rename pause and resume for queries to be more explicit ([ca9cf1e](https://github.com/logaretm/villus/commit/ca9cf1eb93aeff8a40cc9d85465e45089990d412))
- rename pause prop to paused and watch its effect ([fca32d4](https://github.com/logaretm/villus/commit/fca32d4e03f57312340ca0cea6d6697eef21280a))
- rename suspend prop to suspended for consistency ([06eaecd](https://github.com/logaretm/villus/commit/06eaecd8a5ac02f82d015511c8fb80db79150deb))
- updated query component prop names ([d0fc40d](https://github.com/logaretm/villus/commit/d0fc40d7376c6e8cd3d7cfb02b03198e7e7d11f9))
- use defineComponent helper with subscription ([ef7c16a](https://github.com/logaretm/villus/commit/ef7c16a4948b407f36523b037d58db41d9f50302))
- use the defineComponent helper with Mutation component ([eb72067](https://github.com/logaretm/villus/commit/eb7206783e898b710463c87f0cb2a2e880c659e9))
- use the defineComponent helper with Query component and omit redudencies ([d00e25b](https://github.com/logaretm/villus/commit/d00e25b8d924434ab44602d65788a2d4a9da5bda))

# [1.0.0-beta.3](https://github.com/logaretm/villus/compare/villus@1.0.0-beta.2...villus@1.0.0-beta.3) (2020-10-05)

**Note:** Version bump only for package villus

# [1.0.0-beta.2](https://github.com/logaretm/villus/compare/villus@1.0.0-beta.1...villus@1.0.0-beta.2) (2020-10-02)

**Note:** Version bump only for package villus

# 1.0.0-beta.1 (2020-09-30)

### Breaking Changes

- deprecate the `context` and `fetch` options in favor of [custom plugins API](https://villus.logaretm.com/villus/guide/plugins)
- deprecate the exported `batch` fetcher in favor of [`@villus/batch` plugin](https://villus.logaretm.com/villus/plugins/batch)
- changed the signature of provider and useClient ([b4fa6d9](https://github.com/logaretm/villus/commit/b4fa6d953a4997554497253bf520d401c571d4b2)) due to conflicts with TypeScript typings

### Bug Fixes

- handle non 200 error responses closes [#49](https://github.com/logaretm/villus/issues/49) ([0950fa8](https://github.com/logaretm/villus/commit/0950fa8a82060a02871d4eb027841eb0ecb31f96))

### Features

#### Plugins API

A large chunk of villus code has been re-written from scratch to use a pipeline-like operation transformers (plugins) similair to what apollo client and urql are doing with much less jargon and complexity, they are just a simple middleware performing operations on GraphQL queries as they go out or after execution.

[Check the documentation here](https://villus.logaretm.com/villus/guide/plugins)

#### `multipart` plugin

The `multipart` plugin will enable support for graphql file upload, [check the documentation and examples here](https://villus.logaretm.com/villus/plugins/multipart)
