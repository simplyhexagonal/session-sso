![Session SSO Logo depicting a cloud with a fingerprint connected to colored dots representing the multiple SSO providers that are supported by this package](https://assets.jeanlescure.io/session-sso-logo.svg)

# Session SSO
![Tests](https://github.com/simplyhexagonal/session-sso/workflows/tests/badge.svg)

Add this package to your back-end API in order to easily authenticate with Google, Facebook, Github,
or even your custom OAuth2 handled by this same library.

## Open source notice

This project is open to updates by its users, [I](https://github.com/jeanlescure) ensure that PRs are relevant to the community.
In other words, if you find a bug or want a new feature, please help us by becoming one of the
[contributors](#contributors-) ✌️ ! See the [contributing section](#contributing)

## Like this module? ❤

Please consider:

- [Buying me a coffee](https://www.buymeacoffee.com/jeanlescure) ☕
- Supporting Simply Hexagonal on [Open Collective](https://opencollective.com/simplyhexagonal) 🏆
- Starring this repo on [Github](https://github.com/simplyhexagonal/package) 🌟

## New to Single Sign On (SSO) integrations?

We suggest taking a look at the [STRATEGY.md](https://github.com/jeanlescure/session-sso/blob/main/STRATEGY.md) document before moving forward here.

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
override which user properties are returned by `verifySSO` by passing the a `string[]` using the
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
//   payload: {
//     "email": "kahless@t-kuv.ma",
//     "email_verified": true,
//     "given_name": "Kahless",
//     "family_name": "-",
//     "locale": "tlh"
//   }
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

## Error handling

Both `verifySSO` and `generateSSO` promises will return an object with **only one property**,
either `payload` or `error`.

On success, both `verifySSO` and `generateSSO` will resolve with an object with the `payload`
property, for example:

```js
{
  payload: {
    //...
  }
}
```

On error, both `verifySSO` and `generateSSO` will reject with an object with the `error` property,
for example:

```js
{
  error: "..."
}
```

**Note:** the value of the `error` property is a string.

## 🚨 Where to place this library in your code/API (or "I'm new to SSO, and confused")

We've provided a handy and easy to understand explanation of a proper SSO strategy and where this
library is meant to be used, just take a look at the [STRATEGY.md](https://github.com/jeanlescure/session-sso/blob/main/STRATEGY.md) document.

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
    <td align="center"><a href="https://dianalu.design"><img src="https://avatars2.githubusercontent.com/u/1036995?v=4" width="100px;" alt=""/><br /><sub><b>Diana Lescure</b></sub></a><br /><a href="https://github.com/jeanlescure/session-sso/commits?author=DiLescure" title="Documentation">📖</a> <a href="https://github.com/jeanlescure/session-sso/pulls?q=is%3Apr+reviewed-by%3ADiLescure" title="Reviewed Pull Requests">👀</a> <a href="#design-DiLescure" title="Design">🎨</a></td>
  </tr>
</table>
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

Copyright (c) 2020-Present [Session SSO Contributors](https://github.com/simplyhexagonal/session-sso/#contributors-).<br/>
Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
