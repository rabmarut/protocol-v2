import path from 'path';
import fs from 'fs';
import { HardhatUserConfig } from 'hardhat/types';
// @ts-ignore
import { accounts } from './test-wallets.js';
import { eEthereumNetwork, eNetwork, ePolygonNetwork, eXDaiNetwork } from './helpers/types';
import { BUIDLEREVM_CHAINID, COVERAGE_CHAINID } from './helpers/buidler-constants';
import {
  NETWORKS_RPC_URL,
  NETWORKS_DEFAULT_GAS,
  BLOCK_TO_FORK,
  buildForkConfig,
} from './helper-hardhat-config';

require('dotenv').config();

import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'temp-hardhat-etherscan';
import 'hardhat-gas-reporter';
import 'hardhat-typechain';
import '@tenderly/hardhat-tenderly';
import 'solidity-coverage';

const SKIP_LOAD = process.env.SKIP_LOAD === 'true';
const DEFAULT_BLOCK_GAS_LIMIT = 12450000;
const DEFAULT_GAS_MUL = 1.2;
const DEFAULT_GAS_PRICE = 20000000000;
const HARDFORK = 'istanbul';
const INFURA_KEY = process.env.INFURA_KEY || '';
const ALCHEMY_KEY = process.env.ALCHEMY_KEY || '';
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const MAINNET_FORK = process.env.MAINNET_FORK === 'true';

// Prevent to load scripts before compilation and typechain
if (!SKIP_LOAD) {
  ['misc', 'migrations', 'dev', 'full', 'verifications', 'deployments', 'helpers'].forEach(
    (folder) => {
      const tasksPath = path.join(__dirname, 'tasks', folder);
      fs.readdirSync(tasksPath)
        .filter((pth) => pth.includes('.ts'))
        .forEach((task) => {
          require(`${tasksPath}/${task}`);
        });
    }
  );
}

require(`${path.join(__dirname, 'tasks/misc')}/set-bre.ts`);

const getCommonNetworkConfig = (networkName: eNetwork, networkId: number) => ({
  url: NETWORKS_RPC_URL[networkName],
  hardfork: HARDFORK,
  blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
  gasMultiplier: DEFAULT_GAS_MUL,
  gasPrice: NETWORKS_DEFAULT_GAS[networkName],
  chainId: networkId,
  accounts: [ PRIVATE_KEY ]
});

const mainnetFork = MAINNET_FORK
  ? {
      blockNumber: 12521999,
      url: ALCHEMY_KEY
        ? `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`
        : `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    }
  : undefined;

const buidlerConfig: HardhatUserConfig = {
  gasReporter: {
    enabled: false,
  },
  solidity: {
    compilers: [
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
            details: {
              yul: true,
              yulDetails: {
                stackAllocation: true,
              },
            },
          },
          evmVersion: 'istanbul',
        },
      },
      {
        version: '0.8.3',
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: 'istanbul',
        },
      },
    ],
  },
  typechain: {
    outDir: 'types',
    target: 'ethers-v5',
  },
  etherscan: {
    apiKey: ETHERSCAN_KEY,
  },
  mocha: {
    timeout: 0,
  },
  tenderly: {
    project: process.env.TENDERLY_PROJECT || '',
    username: process.env.TENDERLY_USERNAME || '',
    forkNetwork: '1', //Network id of the network we want to fork
  },
  networks: {
    coverage: {
      url: 'http://localhost:8555',
      chainId: COVERAGE_CHAINID,
    },
    kovan: getCommonNetworkConfig(eEthereumNetwork.kovan, 42),
    ropsten: getCommonNetworkConfig(eEthereumNetwork.ropsten, 3),
    main: getCommonNetworkConfig(eEthereumNetwork.main, 1),
    goerli: getCommonNetworkConfig(eEthereumNetwork.goerli, 5),
    tenderlyMain: getCommonNetworkConfig(eEthereumNetwork.tenderlyMain, 3030),
    matic: getCommonNetworkConfig(ePolygonNetwork.matic, 137),
    mumbai: getCommonNetworkConfig(ePolygonNetwork.mumbai, 80001),
    xdai: getCommonNetworkConfig(eXDaiNetwork.xdai, 100),
    hardhat: {
      hardfork: 'berlin',
      blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
      gas: DEFAULT_BLOCK_GAS_LIMIT,
      gasPrice: 8000000000,
      chainId: BUIDLEREVM_CHAINID,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      accounts: accounts.map(({ secretKey, balance }: { secretKey: string; balance: string }) => ({
        privateKey: secretKey,
        balance,
      })),
      forking: mainnetFork,
      mining: {
        auto: true,
      },
    },
    buidlerevm_docker: {
      hardfork: 'berlin',
      blockGasLimit: 9500000,
      gas: 9500000,
      gasPrice: 8000000000,
      chainId: BUIDLEREVM_CHAINID,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      url: 'http://localhost:8545',
    },
    ganache: {
      url: 'http://ganache:8545',
      accounts: {
        mnemonic: 'fox sight canyon orphan hotel grow hedgehog build bless august weather swarm',
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
    },
  },
};

export default buidlerConfig;
