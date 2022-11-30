[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
```
        .///.                .///.     //.            .//  `/////////////-
       `++:++`              .++:++`    :++`          `++:  `++:......---.`
      `/+: -+/`            `++- :+/`    /+/         `/+/   `++.
      /+/   :+/            /+:   /+/    `/+/        /+/`   `++.
  -::/++::`  /+:       -::/++::` `/+:    `++:      :++`    `++/:::::::::.
  -:+++::-`  `/+:      --++/---`  `++-    .++-    -++.     `++/:::::::::.
   -++.       .++-      -++`       .++.    .++.  .++-      `++.
  .++-         -++.    .++.         -++.    -++``++-       `++.
 `++:           :++`  .++-           :++`    :+//+:        `++:----------`
 -/:             :/-  -/:             :/.     ://:         `/////////////-
```

# Aave Protocol v2

This repository is forked from [Aave Protocol v2](https://github.com/aave/protocol-v2). It only introduces configuration changes in the `rab/goerli` branch to add support for the goerli testnet and to make deploying StaticATokens a little easier.

## Setup

The repository uses Docker Compose to manage sensitive keys and load the configuration. Prior any action like test or deploy, you must run `docker-compose up` to start the `contracts-env` container, and then connect to the container console via `docker-compose exec contracts-env bash`.

Follow the next steps to setup the repository:

- Install `docker` and `docker-compose`
- Create an enviroment file named `.env` and fill the next enviroment variables

```
# Private key for the account that will deploy contracts
PRIVATE_KEY=""

# Add one or the other: Alchemy or Infura provider key
ALCHEMY_KEY=""
INFURA_KEY=""

# Optional Etherscan key, for automatic verification of the contracts
ETHERSCAN_KEY=""
```

## Deploy StaticAToken

You can deploy a `StaticAToken` with the following commands:

```
# In one terminal
docker-compose up

# Open another tab or terminal
docker-compose exec contracts-env bash

# A new Bash terminal is prompted, connected to the container
npm run compile
npx hardhat --network <network_name> deploy-atoken-wrapper \\
--a-token-address <atoken_address> \\
--pool <pool_address> \\
--proxy-admin <admin_address> \\
--verify
```

- `<network_name>` should be something like `main` or `goerli`.
- `<atoken_address>` represents the aToken for which you would like to deploy a static wrapper.
- `<pool_address>` is the lending pool for the chosen aToken: this must match the output of `<atoken_address>.POOL()`.
- `<admin_address>` is account who will have permission to upgrade the proxy's implementation - this is a highly privileged entity!

Here is an example command to deploy `waDAI` to Ethereum mainnet:

```
npx hardhat --network main deploy-atoken-wrapper \\
--a-token-address 0x028171bCA77440897B824Ca71D1c56caC55b68A3 \\
--pool 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9 \\
--proxy-admin 0xEE56e2B3D491590B5b31738cC34d5232F378a8D5 \\
--verify
```
