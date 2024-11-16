# KUBTopp Signal Protocol

A decentralized protocol for creating and managing trading signals on the KUB Chain.

## Overview

The KUBTopp Signal Protocol allows traders to create and manage trading signals in a decentralized way, utilizing price oracles and random number generation for fair and transparent signal distribution.

## Key Components

- **KUBToppSignal**: Main contract handling signal creation and management
- **SignalTicket (ERC1155)**: NFT tickets representing signal access rights  
- **PriceOracle**: Oracle providing price data for trading pairs
- **RandomOracle**: Oracle providing verifiable random numbers
- **OracleCaller**: Helper contract for oracle interactions

## Setup & Deployment

1. Install dependencies:
```bash
npm install
```
2. Deploy all contracts:

```bash
npx hardhat run scripts/deploy/all.ts
```
