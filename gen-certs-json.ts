// This is a utility script for manually bundling into JSON files the PEM files generated with:
//
// ```
// # generate private keys
// openssl genrsa -out private.a.pem 2048
// openssl genrsa -out private.b.pem 2048
//
// # extract public keys from privates ones
// openssl rsa -in private.a.pem -pubout > public.a.pem
// openssl rsa -in private.b.pem -pubout > public.b.pem
// ```

import fs from 'fs';
import ShortUniqueId from 'short-unique-id';

const uid = new ShortUniqueId();

const ids = [
  uid(24),
  uid(24),
];

try {
  fs.statSync('./private.a.pem');
  fs.statSync('./private.b.pem');
} catch(e) {
  console.log(`
Generate private keys:

openssl genrsa -out private.a.pem 2048
openssl genrsa -out private.b.pem 2048
  `);

  process.exit();
}

try {
  fs.statSync('./public.a.pem');
  fs.statSync('./public.b.pem');
} catch(e) {
  console.log(`
Extract public keys:

openssl rsa -in private.a.pem -pubout > public.a.pem
openssl rsa -in private.b.pem -pubout > public.b.pem
  `);

  process.exit();
}

const privCerts = {
  [`${ids[0]}`]: fs.readFileSync('./private.a.pem').toString(),
  [`${ids[1]}`]: fs.readFileSync('./private.b.pem').toString(),
};

const pubCerts = {
  [`${ids[0]}`]: fs.readFileSync('./public.a.pem').toString(),
  [`${ids[1]}`]: fs.readFileSync('./public.b.pem').toString(),
};

fs.writeFileSync('./certs.priv.json', JSON.stringify(privCerts, null, 2));
fs.writeFileSync('./certs.json', JSON.stringify(pubCerts, null, 2));
