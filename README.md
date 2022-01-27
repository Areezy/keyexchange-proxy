# Key Exchange Proxy
This is a proxy server which performs a key exchange with [the main server](https://github.com/Areezy/password-manager-server) on behalf of [the client.](https://github.com/Areezy/password-manager)

It generates the shared secret and sends it to the client. 

## Built With
- NodeJS
- Express
- Liboqs-Node

## Installation Guide
The installation guide below only works on linux machines.

In order to use the post-quantum cryptographic algorithms, you first need to install the [liboqs dependencies](https://github.com/open-quantum-safe/liboqs#quickstart)

Also, OPENSSL version 1.1.1 or greater should be installed on your system.

This server makes use of the [Nodejs wrappers for liboqs](https://github.com/TapuCosmo/liboqs-node)

>Tweaks to the algorithms used can be made through the APIs of liboqs-node. Refer to the documentation.

>"SERVER_ADDRESS"- This environment variable needs to be set as the URL of the main server.

Once this is done, run
```
git clone
npm install
npm run dev
```
