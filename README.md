# Car Deals MCP Server

An MCP (Model Context Protocol) server that aggregates and searches car listings from multiple sources (Cars.com, Autotrader, and Kelley Blue Book). It scrapes listings in parallel, extracts price, mileage, dealer info, and applies optional CarFax-style filters (1-owner, no accidents, personal use).

## Table of Contents

- [Features](#features)
- [Supported Sources](#supported-sources)
- [Installation](#installation)
- [Usage](#usage)
  - [As an MCP tool (for Claude Desktop / Cursor)](#as-an-mcp-tool-for-claude-desktop--cursor)
  - [Standalone testing](#standalone-testing)
- [MCP Tool: `search_car_deals`](#mcp-tool-search_car_deals)
  - [Parameters](#parameters)
  - [Example response](#example-response)
- [Technical details](#technical-details)
- [Development & testing](#development--testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- Search used car listings across multiple sources
- Extract price, mileage, listing link, and dealer information
- Deal rating heuristic
- Optional CarFax-like filters: 1-Owner, No Accidents, Personal Use
- Parallel scraping for improved performance
- Puppeteer with stealth techniques to reduce bot detection

## Supported Sources

| Source     | Price | Mileage | Deal Rating | Dealer Info | CarFax Filters |
|------------|:-----:|:-------:|:-----------:|:-----------:|:--------------:|
| Cars.com   | ✅    | ✅      | ✅          | ✅          | ✅             |
| Autotrader | ✅    | ✅      | ⚠️ (limited) | ✅          | ⚠️ (limited)   |
| KBB        | ✅    | ✅      | ✅          | ⚠️ (limited) | ⚠️ (limited)   |

## Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/SiddarthaKoppaka/car_deals_search_mcp.git
cd car_deals_search_mcp
npm install
```

## Usage

### As an MCP tool (for Claude Desktop / Cursor)

Add the MCP server entry to your MCP configuration:

```json
{
  "mcpServers": {
    "car-deals": {
      "command": "node",
      "args": ["/path/to/car-deals-mcp/src/server.js"]
    }
  }
}
```

The MCP tool name is `search_car_deals` (see parameters below).

### Standalone testing

Run tests or a simple scraper invocation:

```bash
# Run unit/integration tests (if provided)
npm test

# Run a quick scrape (example)
node -e "
const { scrapeCarscom } = require('./src/scraper.js');
scrapeCarscom({
  make: 'Toyota',
  model: 'Camry',
  oneOwner: true,
  noAccidents: true,
  personalUse: true
}, 5).then(listings => listings.forEach(l => console.log(l.format())));
"
```

## MCP Tool: `search_car_deals`

This MCP tool searches configured sources and returns aggregated listings matching the query parameters.

### Parameters

| Parameter    | Type     | Required | Description |
|--------------|----------|----------|-------------|
| make         | string   | ✅       | Car manufacturer (e.g., Toyota, Honda) |
| model        | string   | ✅       | Car model (e.g., Camry, Accord) |
| zip          | string   | ❌       | ZIP code for localizing search (default: 90210) |
| yearMin      | integer  | ❌       | Minimum model year |
| yearMax      | integer  | ❌       | Maximum model year |
| priceMax     | integer  | ❌       | Maximum price (USD) |
| mileageMax   | integer  | ❌       | Maximum mileage |
| maxResults   | integer  | ❌       | Max results per source (default: 10) |
| sources      | array    | ❌       | Sources to query: ["cars.com","autotrader","kbb"] (default: all) |
| oneOwner     | boolean  | ❌       | CarFax filter: 1-owner only |
| noAccidents  | boolean  | ❌       | CarFax filter: no accidents reported |
| personalUse  | boolean  | ❌       | CarFax filter: personal use only |

### Example response

An example aggregated listing returned by the tool:

```
🚗 2021 Toyota Camry XSE
   💰 Price: $23,491
   📏 Mileage: 52,649 mi
   ⭐ Deal Rating: Good Deal
   🏆 CarFax: 1-Owner | No Accidents | Personal Use
   🏪 Dealer: Valencia BMW
   🌐 Source: Cars.com
   🔗 https://www.cars.com/vehicledetail/...
```

## Technical details

- Scraping: Puppeteer (headless Chromium) with stealth plugin to reduce bot detection.
- Concurrency: Parallel scraper workers to query multiple sources concurrently.
- Protocol: Implements an MCP-compliant server endpoint to integrate with MCP clients.
- Data extraction: Source-specific parsers normalize fields into a common listing schema.

## Development & testing

- Code lives under src/ (server, scrapers, parsers, utils).
- Run unit tests with npm test.
- Lint and format according to repository standards (add config if missing).

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repository.
2. Create a feature branch (e.g., feature/add-kbb-enhancements).
3. Add tests for new behavior.
4. Open a pull request describing changes and rationale.

Please include test coverage for scraping/parsing changes to avoid regressions when source sites change.

## License

MIT
