# Session SSO

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Add this module to your backend in order to easily authenticate with Google, Facebook, Github,
or even your custom OAuth2 handled by this same library.

This project is open to updates by its users, I ensure that PRs are relevant to the community.
In other words, if you find a bug or want a new feature, please help us by becoming one of the
[contributors](#contributors-) ✌️ ! See the [contributing section](#contributing).

## New to Single Sign On (SSO) integrations?

We suggest taking a look at the [STRATEGY.md](https://github.com/jeanlescure/session-sso/blob/main/STRATEGY.md) document before moving forward here.

## Like this project? ❤️

Please consider:

- [Buying me a coffee](https://www.buymeacoffee.com/jeanlescure) ☕
- Supporting me on [Patreon](https://www.patreon.com/jeanlescure) 🏆
- Starring this repo on [Github](https://github.com/jeanlescure/string-crypto) 🌟

## How to get started using this module?

```ts
import SessionSSO from 'session-sso';

const sso = new SessionSSO({
  // facebook dev credentials
  appId: 'oHPrt6...',
  appSecret: 'O9GGmv3KHJ...',
  // github dev credentials
  clientId: 'wf3s6u...',
  clientSecret: 'AxDmXUPUnH...',
});

// note: google doesn't need dev credentials for SSO verification,
// just on front-end to generate the initial OAuth token

const verifyGoogleResult = await sso.verifySSO({
  provider: 'google',
  authKey: 'ey0PweGlS1FG...', // token returned by `googleUser.getAuthResponse().id_token`
});

const verifyFacebookResult = await sso.verifySSO({
  provider: 'facebook',
  authKey: 'EF25LPJCBAT...', // token returned by `FB.getLoginStatus()` => `response.authResponse.accessToken`
});

const verifyGithubResult = await sso.verifySSO({
  provider: 'github',
  authKey: 'c12fa85efae0236c034b', // auth code placed in url when redirected back from https://github.com/login/oauth/authorize
});

console.log(verifyGoogleResult); // { "email": "user-email-address@gmail.com" }
console.log(verifyFacebookResult); // { "email": "user-email-address@gmail.com" }
console.log(verifyGithubResult); // { "email": "user-email-address@gmail.com" }
```

By default the library will fetch the user's email since it's the most common default scope used by
Google, Facebook, and GitHub's tokens.

If your provider allows you to fetch other scopes with your Client/Dev credentials, then you can
override which user properties are returned by `verifySSO` by passing the a `string[]` usinf the
`retrieveProperties` option like so:

```ts
await sso.verifySSO({
  provider: 'google',
  authKey: 'eyS1FG0PweGl...',
  retrieveProperties: [
    'email',
    'email_verified',
    'given_name',
    'family_name',
    'locale',
  ]
});

// would return:
// {
//   "email": "kahless@t-kuv.ma",
//   "email_verified": true,
//   "given_name": "Kahless",
//   "family_name": "-",
//   "locale": "tlh"
// }
```

You can also set these scopes when instantiating:

```ts
const sso = new SessionSSO({
  // ...
  retrieveProperties: [
    //...
  ],
});
```

**Note:** Doing it this way affects _all_ providers, so make sure all of them have the same naming conventions.

## Create your own Custom SSO Provider

The custom SSO flow was inspired by Google's.

First a user would send their authorization data (i.e. username, passowrd, etc), from here, it's up
to you to generate an authorization promise:

```ts
const authorizationPromise = async () => {
  // your top secret authorization sauce here
  // ...

  // if auth fails
  throw new Error('You cannot pass!');

  // if auth succeeds
  return {
    iss: Math.floor(Date.now() / 1000), // issue date as Epoch number (seconds since 1970)
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // expiration date (1 hour later in this case)
    email: 'user-email-address@gmail.com',
    // ...
  };
};
```

then proceed to produce another promise, this time for the private keys in JSON format:

```ts
const privateKeyPromise: Promise<PEMKeyPromisePayload> = fetch(
  'https://your.static.website/certs.priv.json',
).then((res) => res.json()).then((jpems) => {
  // `res` is a JSON with PEM keys:
  // {
  //   "nnI9yCyGPq3r5zmurEVr05uf": "-----BEGIN RSA PRIVATE KEY-----\nMIIEow...",
  //   "y7I9IXxvGBEOhc9CuBcHIklK": "-----BEGIN RSA PRIVATE KEY-----\nMIIEps..."
  // }
  //
  // For a full example of what this should look like visit: https://www.googleapis.com/oauth2/v1/certs

  // Make it hard for bad actors to reverse-engineer PEM keys by using more than one, randomly
  const randomKeyId = Object.keys(jpems).sort(() => Math.random() - 0.5)[0];

  return {
    kid: randomKeyId,
    pem: jpems[randomKeyId],
  };
});
```

finally send your front-end the resulting authentication token:

```ts
const {
  payload: {
    token, // <== send this
  },
} = await sso.generateSSO({
  authorizationPromise,
  privateKeyPromise,
});
```

now any front-end using your authentication end-point can verify that the token hasn't been forged
by sending it back to your API where you do will do a very similar check as with google, facebook, and github:


```ts
// This is the only extra step. With google, facebook, and github we already know where the verification
// comes from, so we baked it in; but here you get to set your own rule as to where to 
const publicKeyPromise: Promise<PEMKeyPromisePayload> = fetch(
  'https://your.static.website/certs.json',
).then((res) => res.json());

const verifyCustomResult = await sso.verifySSO({
  publicKeyPromise,
  authKey: token as string,
});
```

## 🚨 Where to place this library in your code/API (or "I'm new to SSO, and confused")

We've provided a handy and easy to understand explanation of a proper SSO strategy and where this
library is meant to be used, just take a look at the [STRATEGY.md](https://github.com/jeanlescure/session-sso/blob/main/STRATEGY.md) document.

## Development and build scripts

I chose Rollup to handle the transpiling, compression, and any other transformations needed to get
your Typescript code running as quickly and performant as possible.

This repo uses `runkit.js` to validate your code's sanity. Why? Because [www.npmjs.com](https://www.npmjs.com/)
uses [Runkit](https://runkit.com/home) to allow potential users to play with your module, live on
their browser, which is one of the best ways to convince someone to use your modules in their code.
Runkit will look for the `runkit.js` by default and display that as the initial playground for the
user, so by making it the default validation method during development, this encourages proper
communication with the users of your code.

**Development**

```
yarn dev
```

Uses [concurrently]() to run Rollup in watch mode (which means it will transpile to `dist` when you
save changes to your code), as well as Nodemon to listen for changes in the `dist` directory and
re-run the `runkit.js` as you modify your source! This includes running node with the `--inspect`
flag so you can inspect your code using [Google Chrome Dev Tools](https://nodejs.org/en/docs/guides/debugging-getting-started/)
(by opening `chrome://inspect` in your browser), you're welcome ;)

**Build**

```
yarn build
```

This command will build the `dist/index.js`, uglified and tree-shaken so it loads/runs faster.

## Deployment

Remember to rename your module on the `package.json`, then just folllow usual NPM conventions:

```
npm login
npm publish
```

## Contributing

Yes, thank you! This plugin is community-driven, most of its features are from different authors.
Please update the docs and tests and add your name to the `package.json` file.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://jeanlescure.cr"><img src="https://avatars2.githubusercontent.com/u/3330339?v=4" width="100px;" alt=""/><br /><sub><b>Jean Lescure</b></sub></a><br /><a href="#maintenance-jeanlescure" title="Maintenance">🚧</a> <a href="https://github.com/jeanlescure/session-sso/commits?author=jeanlescure" title="Code">💻</a> <a href="#userTesting-jeanlescure" title="User Testing">📓</a> <a href="https://github.com/jeanlescure/session-sso/commits?author=jeanlescure" title="Tests">⚠️</a> <a href="#example-jeanlescure" title="Examples">💡</a> <a href="https://github.com/jeanlescure/session-sso/commits?author=jeanlescure" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
