# SBIC2023-RawlBolt

## Project Description

- It is a Proof of Concept (POC) to streamline the consruction workflow as following.
  - The on-site photos sent by site personnel to Telegram Channel or Bot, will be forwarded to RawlBolt dapp.
  - Forwarded photos and texts will be integrated into report using AI
  - Reports will be stored in IPFS and and get minted as NFT.
  - Collected NFTs can be used as a proof of workdone.
  - Smart contract get trigerred to release payment if sufficient NFTs (milestone for that project) get collected.

## Getting Started

- Create your own Telegram bot or use the demo bot RawlBolt (t.me/rawlbolt_bot).
- Login to [RawlBolt](https://rawlbolt.xyz) dapp
- The photo sent via Telegram Chat will be forwarded to RawlBolt dapp
- Work summary can be generated using AI (API_KEY might get revoked, please configure your own key and run locally if you wan to test this feature)
- Gerenated reports will be stored in IPFS using `web3.storage`

### Run Locally

- Check `.env.sample` and configure `.env` at local.
- Go to [web](./apps/web/) folder and run frontend React loaclly.

```bash
cd ./apps/web
npm run dev
```
