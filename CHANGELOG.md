# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.2.0](https://github.com/logaretm/villus/compare/v1.1.0...v1.2.0) (2022-05-30)


### Bug Fixes

* query variables import path ([6a05aee](https://github.com/logaretm/villus/commit/6a05aeeb8dbee1a1aa84fb46f6d13a7346a2e222))


### Features

* added query skip argument ([9b0ba85](https://github.com/logaretm/villus/commit/9b0ba8591546ef8d17f66cd0dbbad1229902dfb4))
* allow lazy variables to be passed in to queries ([980673b](https://github.com/logaretm/villus/commit/980673b347f49f56312f60bb0367fe1aca13c2e4))





# [1.1.0](https://github.com/logaretm/villus/compare/v1.0.1...v1.1.0) (2022-04-23)


### Bug Fixes

* add export types for villus.d.ts ([#155](https://github.com/logaretm/villus/issues/155)) ([ca2a6b2](https://github.com/logaretm/villus/commit/ca2a6b290b5fec2262cc65c4baf71716c4282501))


### Features

* enable useQuery etc function outside of setup and outside component ([#156](https://github.com/logaretm/villus/issues/156)) ([14335b3](https://github.com/logaretm/villus/commit/14335b31a8713c03b6573561d1c1fbdc1e84c731))





## [1.0.1](https://github.com/logaretm/villus/compare/v1.0.0...v1.0.1) (2021-11-06)

**Note:** Version bump only for package villus-monorepo





# [1.0.0](https://github.com/logaretm/villus/compare/v1.0.0-rc.21...v1.0.0) (2021-10-18)


### Features

* add `paused` for subscriptions init object ([#143](https://github.com/logaretm/villus/issues/143)) ([9cfa418](https://github.com/logaretm/villus/commit/9cfa4188e0679aa72d1c00a7ea40fd39c58f8a06))
* added slot typing ([1aec7e7](https://github.com/logaretm/villus/commit/1aec7e727a2b2dee2a3f58708307c91198609f78))





# [1.0.0-rc.21](https://github.com/logaretm/villus/compare/v1.0.0-rc.20...v1.0.0-rc.21) (2021-08-26)


### Bug Fixes

* handle possible empty responses ([bc96bf8](https://github.com/logaretm/villus/commit/bc96bf849fe2a1797170ff5a693899be6fd9f260))





# [1.0.0-rc.20](https://github.com/logaretm/villus/compare/v1.0.0-rc.19...v1.0.0-rc.20) (2021-08-07)

**Note:** Version bump only for package villus-monorepo





# [1.0.0-rc.19](https://github.com/logaretm/villus/compare/v1.0.0-rc.18...v1.0.0-rc.19) (2021-07-25)


### Features

* update the reactive result for cache-and-network policy closes [#76](https://github.com/logaretm/villus/issues/76) ([23cd60b](https://github.com/logaretm/villus/commit/23cd60ba3646b95514af37cd3f174e21f2151867))





# [1.0.0-rc.18](https://github.com/logaretm/villus/compare/v1.0.0-rc.17...v1.0.0-rc.18) (2021-06-29)


### Bug Fixes

* added TData to client execute variants closes [#128](https://github.com/logaretm/villus/issues/128) ([80426e2](https://github.com/logaretm/villus/commit/80426e21c98301d9896f814e94c106a1374cd385))





# [1.0.0-rc.17](https://github.com/logaretm/villus/compare/v1.0.0-rc.16...v1.0.0-rc.17) (2021-05-12)

### ☠️ Breaking

Dropped support for Vue 2.x and removed usage of `vue-demi`, this was decided because half of the codebase didn't work with Vue 2 (HOC) and reactivity caveats of Vue 2 no longer applies to Vue 3 which is limiting.


# [1.0.0-rc.16](https://github.com/logaretm/villus/compare/v1.0.0-rc.15...v1.0.0-rc.16) (2021-04-15)


### Bug Fixes

* normalize the multipart queries closes [#112](https://github.com/logaretm/villus/issues/112) ([#113](https://github.com/logaretm/villus/issues/113)) ([c54fd0e](https://github.com/logaretm/villus/commit/c54fd0e80f8d05a4a115630e8b7c83bd2c58a5f3))





# [1.0.0-rc.15](https://github.com/logaretm/villus/compare/v1.0.0-rc.14...v1.0.0-rc.15) (2021-03-06)


### Bug Fixes

* explose villus public types closes [#105](https://github.com/logaretm/villus/issues/105) ([a9b62de](https://github.com/logaretm/villus/commit/a9b62de2e24fba25c26cbf3527606d6f258a8b4c))
* used correct import of type ([608018a](https://github.com/logaretm/villus/commit/608018a6fad13cd2626cf3cc9609e28d5dc472b4))





# [1.0.0-rc.14](https://github.com/logaretm/villus/compare/v1.0.0-rc.13...v1.0.0-rc.14) (2021-03-04)


### Bug Fixes

* handle multiple executions state integrity ([43d936b](https://github.com/logaretm/villus/commit/43d936b91a407af0e3e83a1f1a1c81dbb00d0806))





# [1.0.0-rc.13](https://github.com/logaretm/villus/compare/v1.0.0-rc.12...v1.0.0-rc.13) (2021-02-27)


### Bug Fixes

* ensure fetch recongizes partial error responses ([6c0a6fa](https://github.com/logaretm/villus/commit/6c0a6fa81a57131c9c23758435a1143f3fafd33d))
* handle batched respones with non 200 codes closes [#104](https://github.com/logaretm/villus/issues/104) ([5cb088d](https://github.com/logaretm/villus/commit/5cb088df59d0b0d64b71a27b21181a1e50e9e57e))





# [1.0.0-rc.12](https://github.com/logaretm/villus/compare/v1.0.0-beta.0...v1.0.0-rc.12) (2021-02-16)


### Bug Fixes

* effect conditions for Query and Subscription components ([20f6803](https://github.com/logaretm/villus/commit/20f68035861916dffadbe11ea5a55739cc1e9ac8))
* ensure executeopts arg is optional ([f3f4bca](https://github.com/logaretm/villus/commit/f3f4bca64121938d22329ed70f5d6dceb1693121))
* expose villus client symbol for testing ([141bf97](https://github.com/logaretm/villus/commit/141bf9717250894d58a71ce3dd8a28160677b229))
* fetchonMounted typo ([09c3de4](https://github.com/logaretm/villus/commit/09c3de457e4a4b30742e5f315b1241b0961681fb))
* handle network errors for the batch plugin closes [#86](https://github.com/logaretm/villus/issues/86) ([39a92aa](https://github.com/logaretm/villus/commit/39a92aa35a0ae54c772b317d35cd73d84548ec62))
* handle non 200 error responses closes [#49](https://github.com/logaretm/villus/issues/49) ([0950fa8](https://github.com/logaretm/villus/commit/0950fa8a82060a02871d4eb027841eb0ecb31f96))
* only resubscribe if the query/vars change closes [#94](https://github.com/logaretm/villus/issues/94) ([739b75e](https://github.com/logaretm/villus/commit/739b75e8e140fa418011672ba081bf10a4611237))
* prevent running the query onMounted when suspended closes [#56](https://github.com/logaretm/villus/issues/56) ([27385b6](https://github.com/logaretm/villus/commit/27385b66e196a43e6ab64800183a693939f5320a))
* remove invalid import ([3bfdaf7](https://github.com/logaretm/villus/commit/3bfdaf77028549c22705f0a702bb84a4dcd1d66f))
* safe access to the provides property ([73efd25](https://github.com/logaretm/villus/commit/73efd25399988ea3615e208fff16ef8fbcd5d7e1))
* type import path ([9c7c12c](https://github.com/logaretm/villus/commit/9c7c12ce0bbf8f1cf2d88b6b1b2d56a1b21299ba))
* type the patched useResult ([31fe56b](https://github.com/logaretm/villus/commit/31fe56b89f9f8d02c48c02beec4227618cc6f2d8))
* typing issue ([18de818](https://github.com/logaretm/villus/commit/18de8186566d36a43999c8fb0cab51ccd3102e0a))
* typing of operation in fetch plugin ([2dc8173](https://github.com/logaretm/villus/commit/2dc81738c784f00373a95d70bd75a38a3e35d62d))
* use QueryVariables as default type for subscription forwarder [#93](https://github.com/logaretm/villus/issues/93) ([3791251](https://github.com/logaretm/villus/commit/37912514ce7f5fe1123d0f2c46c95963c67203ef))
* use standard execution result for subscription forwarder closes [#93](https://github.com/logaretm/villus/issues/93) ([9ced480](https://github.com/logaretm/villus/commit/9ced480d387edb8d1d8893cc88d3ae0e856a897c))
* weird linting issue ([e0141d5](https://github.com/logaretm/villus/commit/e0141d512b65ab4b5ec2e714caa57c716fd53491))


### Features

* add install method to client ([#83](https://github.com/logaretm/villus/issues/83)) ([397bbdb](https://github.com/logaretm/villus/commit/397bbdb612a4bacfd5f3b9242d48b2ec94ccde14))
* added basic implementation of multipart fetcher ([bca5ee8](https://github.com/logaretm/villus/commit/bca5ee857a0c9583850d4f23e673c3467321044f))
* added cache-only policy closes [#30](https://github.com/logaretm/villus/issues/30) ([ef194b7](https://github.com/logaretm/villus/commit/ef194b7395f1ea24130647cea50e318b10b71aff))
* added context per query basis closes [#96](https://github.com/logaretm/villus/issues/96) ([8248b06](https://github.com/logaretm/villus/commit/8248b06674a4bf2757f0025740d7b775945acc09))
* added dedup test ([8b12141](https://github.com/logaretm/villus/commit/8b1214155b0bd8c4ff1c89734af8ba1d6e2838f1))
* added edit page helper and new dark mode settings ([27f05eb](https://github.com/logaretm/villus/commit/27f05eb99ca65cc0eb64e7a0d9822dd513de3690))
* allow adding other hash items to the query key helper ([5d18e8a](https://github.com/logaretm/villus/commit/5d18e8a7c3016cc9adef0bacfe43076878654a73))
* avoid deduping mutations and subscriptions ([3bb9642](https://github.com/logaretm/villus/commit/3bb9642990b8fac1352964c965b6483ad0626655))
* changed the signature of provider and useClient ([b4fa6d9](https://github.com/logaretm/villus/commit/b4fa6d953a4997554497253bf520d401c571d4b2))
* draft the plugin api and implement fetch and cache plugins ([15d6adc](https://github.com/logaretm/villus/commit/15d6adc0a165cd9f420d3440d449026c7869bcde))
* enhance suspense query suspense API and allow override query vars ([c38e574](https://github.com/logaretm/villus/commit/c38e574a12801cf8e15b05c37637bc62b1cae9b4))
* export plugins types ([598a65f](https://github.com/logaretm/villus/commit/598a65fec909ae273aa2bb588e0d9e3d306dee88))
* expose getQueryKey helper ([26548d5](https://github.com/logaretm/villus/commit/26548d575d579bd1cff44c7cbacc93c07e06fee8))
* expose new definePlugin type helper ([6f79a97](https://github.com/logaretm/villus/commit/6f79a97b040f132cdbea97a7e6050043f21b2195))
* generate query key on client level ([84ebccb](https://github.com/logaretm/villus/commit/84ebccbad54d1a015717ed58e587a86da49e83e1))
* implement dedup plugin ([eb0f0a3](https://github.com/logaretm/villus/commit/eb0f0a36947aec6a5cf02a0b395acfe32f63f1d8))
* implement response context closes [#62](https://github.com/logaretm/villus/issues/62) ([04cae29](https://github.com/logaretm/villus/commit/04cae29a8ba6163127a6da4985e37585084763ce))
* initial isFetching ([#74](https://github.com/logaretm/villus/issues/74)) ([ea043da](https://github.com/logaretm/villus/commit/ea043da2a4d25c81e772c2a8b9a8c9ddf33e6680))
* re-execute subscriptions closes [#79](https://github.com/logaretm/villus/issues/79) ([0ec4680](https://github.com/logaretm/villus/commit/0ec46802c80788531a7b84c516eac9d879b076e8))
* re-implement batch using the new plugins API ([861da91](https://github.com/logaretm/villus/commit/861da912029ba4caafb26a19cc92b20bb4e55d6a))
* re-implement subscriptions as a plugin ([e5e790a](https://github.com/logaretm/villus/commit/e5e790a404eb0cc27a9320999c03484e8bf575d5))
* remove initialIsFetching and sync it with fetchOnMount ([a1e75c4](https://github.com/logaretm/villus/commit/a1e75c4aeb800a2e22e123bb1c75271258ff09dc))
* remove uneeded stop signal ([8f436a3](https://github.com/logaretm/villus/commit/8f436a3ce6e71f36d0f9f05de8c9fe01588c07f5))
* rename lazy to fetchOnMount ([68b937e](https://github.com/logaretm/villus/commit/68b937ebfc91037494be33a67f643c22e11b5064))
* rename pause and resume for queries to  be more explicit ([ca9cf1e](https://github.com/logaretm/villus/commit/ca9cf1eb93aeff8a40cc9d85465e45089990d412))
* rename pause prop to paused and watch its effect ([fca32d4](https://github.com/logaretm/villus/commit/fca32d4e03f57312340ca0cea6d6697eef21280a))
* rename suspend prop to suspended for consistency ([06eaecd](https://github.com/logaretm/villus/commit/06eaecd8a5ac02f82d015511c8fb80db79150deb))
* support typed document node ([9c166f6](https://github.com/logaretm/villus/commit/9c166f6bffa589ec580d8e8d6f2729ab17a662c0))
* updated graphql dep closes [#65](https://github.com/logaretm/villus/issues/65) ([ef4be0a](https://github.com/logaretm/villus/commit/ef4be0afb8cba12a57c5cc128b999f570898fa69))
* updated query component prop names ([d0fc40d](https://github.com/logaretm/villus/commit/d0fc40d7376c6e8cd3d7cfb02b03198e7e7d11f9))
* upgrade Vue and provide a workaround for [#72](https://github.com/logaretm/villus/issues/72) ([6127f37](https://github.com/logaretm/villus/commit/6127f379adf743b691f48f9bc6d044553f9771b5))
* use defineComponent helper with subscription ([ef7c16a](https://github.com/logaretm/villus/commit/ef7c16a4948b407f36523b037d58db41d9f50302))
* use public API and add villus to deps ([4b98e79](https://github.com/logaretm/villus/commit/4b98e79d3e146da608a45d72ac81e00b6ba735ec))
* use the defineComponent helper with Query component and omit redudencies ([d00e25b](https://github.com/logaretm/villus/commit/d00e25b8d924434ab44602d65788a2d4a9da5bda))
* use the public plugin API and add villus to multipart deps ([77fb90f](https://github.com/logaretm/villus/commit/77fb90f71e400b3000dd18ffbfa7f355365c5c01))
* **breaking:** signature updates ([#70](https://github.com/logaretm/villus/issues/70)) ([47937e8](https://github.com/logaretm/villus/commit/47937e8437cae6e78769dc7b0abfa2f4c41f5996))
* use the defineComponent helper with Mutation component ([eb72067](https://github.com/logaretm/villus/commit/eb7206783e898b710463c87f0cb2a2e880c659e9))
