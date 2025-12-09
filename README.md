<<<<<<< HEAD
# car_deals_search_mcp
=======
# Car Deals MCP Server

An MCP (Model Context Protocol) server that searches for car deals from multiple sources including **Cars.com**, **Autotrader**, and **Kelley Blue Book (KBB)**.

## Features

- 🚗 Search for used cars across multiple listing sites
- 💰 Get prices, mileage, and deal ratings
- 🏆 **CarFax filters**: 1-Owner, No Accidents, Personal Use
- 🏪 See dealer information and locations
- 🔗 Direct links to listing details
- ⚡ Parallel scraping for fast results

## Supported Sources

| Source | Price | Mileage | Deal Rating | Dealer Info | CarFax Filters |
|--------|-------|---------|-------------|-------------|----------------|
| Cars.com | ✅ | ✅ | ✅ | ✅ | ✅ |
| Autotrader | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| KBB | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |

## Installation

```bash
cd "car deals search MCP"
npm install
```

## Usage

### With Claude Desktop / Cursor

Add to your MCP configuration:

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

### Standalone Testing

```bash
# Test the scraper directly
npm test

# Search with CarFax filters
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

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `make` | string | ✅ | Car manufacturer (Toyota, Honda, Ford, etc.) |
| `model` | string | ✅ | Car model (Camry, Accord, F-150, etc.) |
| `zip` | string | ❌ | ZIP code for location (default: 90210) |
| `yearMin` | integer | ❌ | Minimum model year |
| `yearMax` | integer | ❌ | Maximum model year |
| `priceMax` | integer | ❌ | Maximum price in dollars |
| `mileageMax` | integer | ❌ | Maximum mileage |
| `maxResults` | integer | ❌ | Max results per source (default: 10) |
| `sources` | array | ❌ | Sources to search: "cars.com", "autotrader", "kbb" |
| `oneOwner` | boolean | ❌ | **CarFax filter**: 1-Owner vehicles only |
| `noAccidents` | boolean | ❌ | **CarFax filter**: No accidents/damage reported |
| `personalUse` | boolean | ❌ | **CarFax filter**: Personal use only (not rental/fleet) |

### Example Response

```
🚗 2021 Toyota Camry XSE
   💰 Price: $23,491
   📏 Mileage: 52,649 mi.
   ⭐ Deal Rating: Good Deal
   🏆 CarFax: 1-Owner | No Accidents | Personal Use
   🏪 Dealer: Valencia BMW
   🌐 Source: Cars.com
   🔗 https://www.cars.com/vehicledetail/...
```

## Technical Details

This server uses:
- **Puppeteer** with stealth plugin to bypass bot detection
- **MCP SDK** for protocol compliance
- Parallel scraping for performance

## License

MIT
>>>>>>> 4ed6499 (v1)
