## CodEase

CodEase lets anyone create, test, and monetize Chrome extensions simply by describing what they want. The platform builds the extension from scratch, auto‑tests it, performs security checks, enables live in‑browser testing, and then mints a token on Hedera so the community can trade, back, and discover the most useful extensions.

### What you can do
- **Describe → Build**: Turn plain English into a working Chrome extension, including code, assets, manifest, and tests.
- **Test live**: Run the extension inside the portal. No downloads or exports needed to validate UX and behavior.
- **Tokenize**: One‑click mint a token on Hedera representing your extension’s utility and adoption.
- **Trade**: Instant liquidity via our custom AMM with a bonding curve. Users swap with HBAR.
- **Grow**: Earn from platform activity. Every transaction takes a 5% fee, with 60% paid to creators.

### Who this is for
- **Creators**: Ship extensions without wrestling with boilerplate, security, or store packaging.
- **Users**: Discover, test, and support extensions you actually want to use.
- **Backers**: Get price‑discovery and liquidity from day one, with clear, utility‑tied mechanics.

### How it works
1) **Generate**: You describe the extension. CodEase scaffolds code, assets, and tests; runs security analysis.
2) **Validate**: Use the live test environment in the portal to try features and iterate quickly.
3) **Publish**: Make the extension discoverable on CodEase; users can test it directly on the public page.
4) **Tokenize on Hedera**: Define supply/decimals/creator wallet; CodEase mints and configures the token.
5) **Bootstrap liquidity**: The token is listed on our custom AMM with a bonding curve for early price discovery.
6) **Graduate**: Once the market cap matures (e.g., ~10K), liquidity is added on a public DEX for wider discovery.

### Economics at a glance
- **Swap fee**: 5% per transaction
- **Revenue split**: 60% creator, 40% platform
- **Burn mechanic**: Every 5th download/test burns 0.1% of total supply
- **Trading asset**: HBAR‑native (WHBAR wrapped support where needed)

### AMM design and maturity
- **Custom router/DEX with bonding curve**: Enables fair initial pricing and continuous liquidity for new tokens.
- **Graduation rule**: Tokens that reach a target market cap (e.g., 10K) are pooled on a public DEX for broader access.
- **Rationale**: Prevents hype‑only listings; rewards projects with sustained utility and traction.

### Contracts (Hedera testnet)
- **Router**: `0.0.6515308` — `https://hashscan.io/testnet/contract/0.0.6515308`
- **Factory**: `0.0.6515305` — `https://hashscan.io/testnet/contract/0.0.6515305`
- **WHBAR**: `0.0.5816542`

These addresses are wired into the backend (`Hedera-backend/config/index.js`) for routing and liquidity ops.

### Live testing and marketplace
- **Public token pages**: Try extensions immediately, view analytics, and see price/liquidity data.
- **No‑install demos**: Lower friction for users to evaluate utility before backing.
- **Wallet flows**: HashPack/HashConnect for association, swaps, and holdings.

### Why Hedera
- **Fast finality and low fees**: Great UX for micro‑value actions like testing, downloads, and swaps.
- **HTS + EVM**: Native tokenization with familiar EVM tooling and WHBAR for HBAR‑denominated trades.

### Trust, safety, and audits
- **Automated checks**: Unit tests, static analysis, and security scanning for generated extensions.
- **Runtime protections**: Rate limiting and security middleware in the API tier.
- **Contract lineage**: UniswapV2‑style AMM with WHBAR support; reference audit materials included (`custom-amm-dex/audits/`).
- **Transparent on‑chain data**: Mirror node analytics for supply, volume, holders, and liquidity.

### Roadmap
- Enhanced extension testing sandbox (permissions and data fixtures)
- On‑chain reputation for creators and tokens
- Secondary marketplace and bundles
- Governance and community curation signals

### FAQ
- **Why tokenize an extension?**
  To create aligned incentives: users back what they find useful; creators earn as usage grows.
- **Is this just another NFT?**
  No. Tokens here are utility/market primitives tied to real extensions and usage signals; not vague collectibles.
- **How do you prevent low‑effort spam?**
  Automated testing, security checks, bonding‑curve capital requirements, and burn mechanics tied to real usage.
- **When do tokens get listed on public DEXs?**
  After maturing past the target market cap threshold and demonstrating traction.

### Architecture
```mermaid
flowchart LR
  U[User] --> FE[Next.js Frontend]
  FE <-->|Web/API| MW[FastAPI Middleware]
  FE <-->|REST| HB[Hedera Backend (Express)]
  HB <-->|RPC / SDK| HEDERA[(Hedera Network)]
  HB <-->|Router/Factory| AMM[Custom AMM Router/DEX]
  FE -->|Wallet (HashPack/HashConnect)| HEDERA
```

### Links and resources
- Demo video: `frontend/public/demo-video.mp4`
- Whitepaper: `frontend/public/whitepaper.pdf`
- Backend docs: `Hedera-backend/START_HERE.md`, `SETUP_GUIDE.md`, `QUICK_START.md`, `AMM_DEPLOYMENT_GUIDE.md`
- Contracts project: `custom-amm-dex/`

### Appendix: developer setup
If you need to run this locally, see the docs above or the service-level READMEs. The focus of this document is product vision and mechanics.

