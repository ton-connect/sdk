# Changelog @tonconnect/ui 

# [2.0.0-beta.5](https://github.com/ton-connect/sdk/compare/ui-2.0.0-beta.4...ui-2.0.0-beta.5) (2023-11-02)


### Bug Fixes

* **ui:** add CommonJS support and update build process ([18ad83a](https://github.com/ton-connect/sdk/commit/18ad83a14c998fac608deb6e161896a0f5936cc5))
* **ui:** add fallback for browsers without Web Animations API ([5c2d885](https://github.com/ton-connect/sdk/commit/5c2d8857ba7eceef9de111eb84f3744302ab2827))
* **ui:** correct detection of mobile devices for modal widget ([a34ce5b](https://github.com/ton-connect/sdk/commit/a34ce5b33077bf77739a96006335fe7b605dd96f))
* **ui:** mock localStorage in Safari private mode ([239a20f](https://github.com/ton-connect/sdk/commit/239a20f86712252bbc5d9e83236be8f9653c9ae1)), closes [#93](https://github.com/ton-connect/sdk/issues/93)
* **ui:** regenerate universal link to prevent using outdated links ([e5a6acc](https://github.com/ton-connect/sdk/commit/e5a6acc9986061802cc22cc3966609d1af6baf3e))
* **ui:** resolve android back handler issue ([a2ce2e3](https://github.com/ton-connect/sdk/commit/a2ce2e3fe6d864e2ebb34ee4144f22c9d648466b))
* **ui:** update isMobile state on opening wallet modal ([60aa2c9](https://github.com/ton-connect/sdk/commit/60aa2c9d53129ce64caa55d0396e4d53b1fcb4ed))


### Features

* **ui:** preload images after page load to improve UX and Web Vitals metrics ([f39266e](https://github.com/ton-connect/sdk/commit/f39266e519105566470d3134b1bb3024c42de0ac))



# [2.0.0-beta.4](https://github.com/ton-connect/sdk/compare/ui-2.0.0-beta.3...ui-2.0.0-beta.4) (2023-10-25)



# [2.0.0-beta.3](https://github.com/ton-connect/sdk/compare/ui-2.0.0-beta.2...ui-2.0.0-beta.3) (2023-10-20)


### Bug Fixes

* **ui:** implement back button handler for modal popup on Android devices ([ff83611](https://github.com/ton-connect/sdk/commit/ff8361138dac5efb1086ab5791e0700e67190491)), closes [#70](https://github.com/ton-connect/sdk/issues/70)
* **ui:** prevent reappearing of success tooltip on re-render ([17bbc9a](https://github.com/ton-connect/sdk/commit/17bbc9a66eb01aad10dcc9bd91ba25696c652ba8))
* **ui:** resolve illegal constructor error in safari ([512678f](https://github.com/ton-connect/sdk/commit/512678ff25ae877a7a2f608e8d8c06fda5dcbd21)), closes [#87](https://github.com/ton-connect/sdk/issues/87)
* **ui:** resolve premature promise resolution and unhandled popup closing scenarios ([5e7b825](https://github.com/ton-connect/sdk/commit/5e7b825b809856f6bd3dff969464beeb9d372a08)), closes [#67](https://github.com/ton-connect/sdk/issues/67) [#68](https://github.com/ton-connect/sdk/issues/68)


### Features

* **ui:** introduce modal, fix promise handling, and refactor internal classes ([ac803aa](https://github.com/ton-connect/sdk/commit/ac803aa7bec56f6358071a906879d814eb485c8d))
* **ui:** refactor wallet modal interfaces and expose them publicly ([5618a0a](https://github.com/ton-connect/sdk/commit/5618a0ae945b2aad50cb994d4cad8371f029bf65))


### BREAKING CHANGES

* **ui:** The method tonConnectUI.connectWallet() is now deprecated and will be removed in subsequent versions. Use tonConnectUI.openModal() instead.



# [2.0.0-beta.2](https://github.com/ton-connect/sdk/compare/ui-2.0.0-beta.1...ui-2.0.0-beta.2) (2023-09-15)


### Bug Fixes

* **ui:** next js compatibility ([2f3c644](https://github.com/ton-connect/sdk/commit/2f3c6446941d68aad6c2f544fea7caebd824e8ca))



# [2.0.0-beta.1](https://github.com/ton-connect/sdk/compare/ui-2.0.0-beta.0...ui-2.0.0-beta.1) (2023-09-12)


### Bug Fixes

* **ui:** uniqueness filtration added for universal connection bridges list ([87e53b0](https://github.com/ton-connect/sdk/commit/87e53b076a5f86146bed8dd6f06c6c205a2f09b9))



# [2.0.0-beta.0](https://github.com/ton-connect/sdk/compare/ui-1.0.0-beta.7...ui-2.0.0-beta.0) (2023-09-08)


### Bug Fixes

* dark theme fixes ([7aab019](https://github.com/ton-connect/sdk/commit/7aab019ca72e1300caa6c88457452b0cf79cca4b))
* desktop wallet connection modal updates ([04bf064](https://github.com/ton-connect/sdk/commit/04bf064f6c74fde28e30bff499e3f00971ea3c6c))
* info modal layout created ([a5bf026](https://github.com/ton-connect/sdk/commit/a5bf0263a43d153e373e34df891df1d26f3ca44c))
* mobile layout improved ([765f63c](https://github.com/ton-connect/sdk/commit/765f63cb52f7b26dd80c6e14fa0de6f2519e07ae))
* **ui:** [@wallet](https://github.com/wallet) updates ([cad46a7](https://github.com/ton-connect/sdk/commit/cad46a77227bf668392e1639829efec554de545b))
* **ui:** border-radius updated ([4223842](https://github.com/ton-connect/sdk/commit/4223842442e23e034ff9f0f8f8c1f174e81fd4aa))
* **ui:** button icon padding fixes ([c7c23e8](https://github.com/ton-connect/sdk/commit/c7c23e8f8e280caf2627e30ca6abaf0ed1fe8b26))
* **ui:** data attributes added, wallet-items labels added ([06a0d17](https://github.com/ton-connect/sdk/commit/06a0d170781f35d242e43b3a8fae13e8171b6400))
* **ui:** i18n updated ([a5cd091](https://github.com/ton-connect/sdk/commit/a5cd091c9899bc7ec4aa08d27a15f3f60d35bb47))
* **ui:** Installed wallets order fixed ([eb9ad28](https://github.com/ton-connect/sdk/commit/eb9ad28347166104969d7e0b42a4bb4ec5be5a1a))
* **ui:** mobile qr added ([9983e98](https://github.com/ton-connect/sdk/commit/9983e98ecc28e072c951194dd31a1444717cb36e))
* **ui:** mobile scroll container improvements ([68a79df](https://github.com/ton-connect/sdk/commit/68a79df648b3c4afc89cf5b72a29116072b8ac7c))
* **ui:** open link replaced with open link blank everywhere ([75d394d](https://github.com/ton-connect/sdk/commit/75d394d096727c970b05ad710b74b68b05c56f44))
* **ui:** return strategy added for telegram wallets ([97cc8ef](https://github.com/ton-connect/sdk/commit/97cc8ef1b47ab05f48168b3abfbb6a37f6bc77fc))
* **ui:** telegram links `ret` param handling ([0be57ca](https://github.com/ton-connect/sdk/commit/0be57caa275c075a3fa5b76ea3c9d51fc9ee790b))
* **ui:** tonConnectUI wallet info property was maiden optional ([0f7f46a](https://github.com/ton-connect/sdk/commit/0f7f46a105234f7f815185b83e103b54ac865c92))
* **ui:** twa "Open Wallet" button fixes ([8f8a797](https://github.com/ton-connect/sdk/commit/8f8a797eee3e02116aec11242ad67a4c82ddbc66))
* **ui:** twa redirect updated ([da7ed34](https://github.com/ton-connect/sdk/commit/da7ed340b696402792c1ff8311843b33f5e4c463))
* **ui:** ui fixes: safari all wallets list & wallet page loader padding ([6b1c574](https://github.com/ton-connect/sdk/commit/6b1c57428bef141b2f5bdc72f715cb374257f4df))
* **ui:** ui improvements ([b4e87cc](https://github.com/ton-connect/sdk/commit/b4e87cc15ff41ae48c3567c0ff4b17638d6f7b61))
* **ui:** ui improvements ([c0660f9](https://github.com/ton-connect/sdk/commit/c0660f932fe9d4e27d90d43405c8252f4f529a4b))
* **ui:** ui updates ([b810692](https://github.com/ton-connect/sdk/commit/b810692328887690305d582adf428f3282de4483))


### Features

* new ui for main screen implemented ([fca8c70](https://github.com/ton-connect/sdk/commit/fca8c70a94ceb6664e378f1d4f7e7eb9ab244c64))
* new ui for wallet connection page implemented ([c713f6e](https://github.com/ton-connect/sdk/commit/c713f6ef918ec60f91e9acccd558e752819dd6e4))
* new ui wallets list implemented ([0b748f4](https://github.com/ton-connect/sdk/commit/0b748f480cd1f18b7df891e7970e353221ad29f4))


### BREAKING CHANGES

* **ui:** `tonConnectUI.wallet` now is  `Wallet | (Wallet & WalletInfoWithOpenMethod) | null` instead of `(Wallet & WalletInfoWithOpenMethod) | null`



# [1.0.0-beta.7](https://github.com/ton-connect/sdk/compare/ui-1.0.0-beta.6...ui-1.0.0-beta.7) (2023-08-18)


### Bug Fixes

* **ui:** wallet name replaced with `app_name` when ([21f7d8b](https://github.com/ton-connect/sdk/commit/21f7d8b81f0bb69b145d8020880b37f963374849))



# [1.0.0-beta.6](https://github.com/ton-connect/sdk/compare/ui-1.0.0-beta.5...ui-1.0.0-beta.6) (2023-08-11)


### Bug Fixes

* **ui:** ios universal links issue fixed ([aad243e](https://github.com/ton-connect/sdk/commit/aad243e02e475c88620db002e85d5f67a77117c3))



# [1.0.0-beta.5](https://github.com/ton-connect/sdk/compare/ui-1.0.0-beta.4...ui-1.0.0-beta.5) (2023-05-03)


### Bug Fixes

* **ui:** Connect wallet button container width set to 'fit-content' ([09df142](https://github.com/ton-connect/sdk/commit/09df142add0f704de6f2bd94823c4976ec8fc163))



# [1.0.0-beta.4](https://github.com/ton-connect/sdk/compare/ui-1.0.0-beta.3...ui-1.0.0-beta.4) (2023-04-25)


### Bug Fixes

* **ui:** mobile QR modal added for non-mobile user agents (TWA) ([cc2183e](https://github.com/ton-connect/sdk/commit/cc2183e66a0fb9a02f34b6f353f52c9b86aae794))



# [1.0.0-beta.3](https://github.com/ton-connect/sdk/compare/ui-1.0.0-beta.2...ui-1.0.0-beta.3) (2023-04-06)


### Bug Fixes

* **ui:** "Open Wallet" button with deeplink click fallback added -- button opens the second tab in the modal ([1e93b7c](https://github.com/ton-connect/sdk/commit/1e93b7cf3fd3158b6dd7f172820fc42331fa79ff))
* **ui:** solid deps moved to the devDependencies. Deps libs removed from bundle ([cad2a47](https://github.com/ton-connect/sdk/commit/cad2a47ff7ca2fc669b8e366f4595fe19ffe0c23))



# [1.0.0-beta.2](https://github.com/ton-connect/sdk/compare/ui-1.0.0-beta.1...ui-1.0.0-beta.2) (2023-03-22)



# [1.0.0-beta.1](https://github.com/ton-connect/sdk/compare/ui-1.0.0-beta.0...ui-1.0.0-beta.1) (2023-03-22)


### Bug Fixes

* **ui:** `Notification` types fixes ([410e361](https://github.com/ton-connect/sdk/commit/410e36148e1aeaf911f23f47f7995d0f409237b1))



# [1.0.0-beta.0](https://github.com/ton-connect/sdk/compare/ui-0.0.17...ui-1.0.0-beta.0) (2023-03-22)


### Bug Fixes

* typo in ui-preferences ([72d062a](https://github.com/ton-connect/sdk/commit/72d062a5271b0678446e940bf19e98d70bb07027))
* **ui:** account button width fix ([3a76ac3](https://github.com/ton-connect/sdk/commit/3a76ac3d94d8fa7f6336db76026259b2f801e559))
* **ui:** buttons scale value updated. Connect button and dropdown menu elements size set ([6806d34](https://github.com/ton-connect/sdk/commit/6806d3453513b785e5ffb02797cd0a4d722bda57))
* **ui:** change wallets-list order feature removed ([ca0e50a](https://github.com/ton-connect/sdk/commit/ca0e50a73eb991893f11bea0b28f2985fba177e2))
* **ui:** confirm tx notification & modal translations improved. Mobile layout modal improved ([6cbd6f2](https://github.com/ton-connect/sdk/commit/6cbd6f23ba1c79a3a6a07a9db932a4abe644752f))
* **ui:** connect request arguments passing functionality refactored ([8957404](https://github.com/ton-connect/sdk/commit/895740478e36889ddf6836856064510a98541ce6))
* **ui:** data-attributes fixes. Preferred wallet placed on start of the wallets list ([83b9188](https://github.com/ton-connect/sdk/commit/83b9188989fe6f75fb9daa7f38304e9a60ba73a2))
* **ui:** different links every time when copy to clipboard is pressed bug fixed ([d3be964](https://github.com/ton-connect/sdk/commit/d3be964886b493713a669c0688fceb93b724ff0f))
* **ui:** global font-family corrected. Letter-spacing usages removed. Icons replaced with icon+container ([9650742](https://github.com/ton-connect/sdk/commit/96507424fd10e6f84a5ec9b2fd5dc3e1b488961b))
* **ui:** i18n fixes ([a6ebb6a](https://github.com/ton-connect/sdk/commit/a6ebb6afd59564a9f642e81253efc94f4adfc3ce))
* **ui:** id replaced with data-tc-<element-selector> ([b946005](https://github.com/ton-connect/sdk/commit/b94600505175c0f8fa7a22063da5ed45b2be0075))
* **ui:** image loading placeholder added. Select wallet list elements sizes fixes ([38458e7](https://github.com/ton-connect/sdk/commit/38458e793380d249081a6b47f9a9581f4a182ae1))
* **ui:** loader fill fix ([33bd260](https://github.com/ton-connect/sdk/commit/33bd260f282513252fa04f39cecb4abd265ad9e6))
* **ui:** media query not (hover: none) fix ([1675d0d](https://github.com/ton-connect/sdk/commit/1675d0d0d3779f2d117f82115b9ee0f1b0dc02fd))
* **ui:** mobile blurHandler when deeplink selected removed ([43a96ef](https://github.com/ton-connect/sdk/commit/43a96efb70b4d61b5d2874c00b3313e5bfab0b76))
* **ui:** mobile buttons animation fixes. Tab bar elements cursor fixed. Body scroll disabling when modal opened improved ([62c3f5e](https://github.com/ton-connect/sdk/commit/62c3f5e26b8b348e4345d681be8986303500b8a8))
* **ui:** mobile modal size fix ([d325fc8](https://github.com/ton-connect/sdk/commit/d325fc8c83c648e069d338fa50e3c709fc0374d5))
* **ui:** mobile safari styles fixes ([bbf4159](https://github.com/ton-connect/sdk/commit/bbf415981d1472e2fb719f48fae83222bf9c3381))
* **ui:** new UI fixes: QR code, buttons-links, body scroll disable when modal is opened, styles encapsulation ([817c9b9](https://github.com/ton-connect/sdk/commit/817c9b94bcd0d19613032bf897cada29805146fc))
* **ui:** qr code image size made eq constant. img tags replaced with the Image component ([dac5975](https://github.com/ton-connect/sdk/commit/dac5975b25f101cc03206050b1e18c1a824902e9))
* **ui:** qr code style fixes. Copy button animation improved ([5aa222f](https://github.com/ton-connect/sdk/commit/5aa222f12d8691bf8012165d9e8c3e2b941fa7bb))
* **ui:** set universal links to be opened in a new window for mobile devices ([0aae575](https://github.com/ton-connect/sdk/commit/0aae575beba603f45ae9821afda76b78fb7a74c9))
* **ui:** ssr compatibility fixes ([9810a40](https://github.com/ton-connect/sdk/commit/9810a40d6650e318d5495f51cb01e39d9fd7d480))
* **ui:** text cursor set to default. QR code size fix. Buttons border-radius fix ([401ab81](https://github.com/ton-connect/sdk/commit/401ab813843a0fd2791e7b359ef15a163fb76bc3))
* **ui:** ton icon position fix. Images drag disabled. Actions notification and modals layout improved ([86f6e87](https://github.com/ton-connect/sdk/commit/86f6e87532e43a6fc145de4303b577fbc1b409ff))
* **ui:** tonConnectUI.connector access modifier set to public ([50c771e](https://github.com/ton-connect/sdk/commit/50c771e543b17864ccf7aa66b17444f3bd3b5b42))
* **ui:** translation key changed. H1 style in the wallet's QR modal improved ([8911108](https://github.com/ton-connect/sdk/commit/89111081a006973f52505dfc84044f748543a6df))
* **ui:** ui fixes: info buttons, translations ([953b069](https://github.com/ton-connect/sdk/commit/953b069adde50a47f748de4e7da852b8a4bb9016))
* **ui:** UMD build minification enabled ([c39b4e3](https://github.com/ton-connect/sdk/commit/c39b4e357cc84d0a62bd1a87d2877b439d0ab56c))
* **ui:** wallets list configuration redesigned ([4dcc685](https://github.com/ton-connect/sdk/commit/4dcc68524a763f24f75f807f3572f5a321d0c5f9))
* **ui:** wallets list source customization removed. Images preloading added ([dca142d](https://github.com/ton-connect/sdk/commit/dca142d77606e620b6f08315d7dbe2d847d44921))



## [0.0.17](https://github.com/ton-connect/sdk/compare/ui-0.0.16...ui-0.0.17) (2023-01-30)


### Bug Fixes

* **ui:** "action canceled" icon redesigned so that it does not confuse users ([17cf7d8](https://github.com/ton-connect/sdk/commit/17cf7d8e585f53df4458778aeffa524615b11988))
* **ui:** last event notification is duplicated on wallet reconnect bug fixed ([ee82650](https://github.com/ton-connect/sdk/commit/ee82650e455c83d3986f1c0671959e2fade6583f))



## [0.0.16](https://github.com/ton-connect/sdk/compare/ui-0.0.15...ui-0.0.16) (2023-01-26)


### Bug Fixes

* **ui:** return strategy added ([d195743](https://github.com/ton-connect/sdk/commit/d195743e56649203082ed4cb3bb750298bc48954))



## [0.0.15](https://github.com/ton-connect/sdk/compare/ui-0.0.14...ui-0.0.15) (2023-01-23)


### Bug Fixes

* **ui:** ssr compatibility added ([58e78c2](https://github.com/ton-connect/sdk/commit/58e78c2c5720afce8ca1d83f30c6983ee62e8627))



## [0.0.14](https://github.com/ton-connect/sdk/compare/ui-0.0.13...ui-0.0.14) (2023-01-18)


### Bug Fixes

* **ui:** ton proof was being applied in embedded wallet browser ([06b44cf](https://github.com/ton-connect/sdk/commit/06b44cfc021649f85261c2e8a10c73b8f337f994))



## [0.0.13](https://github.com/ton-connect/sdk/compare/ui-0.0.12...ui-0.0.13) (2023-01-18)


### Bug Fixes

* **ui:** `tonConnectUI.connectionRestored` promise added. Connect button loader added while restoring connection ([ceae466](https://github.com/ton-connect/sdk/commit/ceae4660780753ba7773ef4fe1b52ab21a6bd4f0))
* **ui:** text subhead color removed. Constant white color applied to icons ([bbba7c4](https://github.com/ton-connect/sdk/commit/bbba7c4be85ce9a7f83eb1eb5cfb531863064b1e))
* **ui:** universal link desktop redirecting fix. Property 'openMethod' = 'qrcode' | 'universal-link' is now available in the ConnectedWallet interface ([3ed66ec](https://github.com/ton-connect/sdk/commit/3ed66ec0e5ce43527d560002fee3b86ed71ca2f3))
