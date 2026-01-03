#!/usr/bin/env node

/**
 * Car Deals MCP Server
 * 
 * An MCP server that searches for car deals from Cars.com, Autotrader, and KBB.
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const { searchAllSources, scrapeCarscom, scrapeAutotrader, scrapeKBB } = require('./scraper.js');

// Cache for search results
const searchCache = new Map();

// Create server instance
const server = new Server(
    {
        name: 'car-deals-mcp',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'search_car_deals',
                description: 'Search for car deals across multiple sources (Cars.com, Autotrader, KBB). Returns listings with prices, mileage, deal ratings, and links.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        make: {
                            type: 'string',
                            description: 'Car manufacturer (e.g., Toyota, Honda, Ford)',
                        },
                        model: {
                            type: 'string',
                            description: 'Car model (e.g., Camry, Civic, F-150)',
                        },
                        zip: {
                            type: 'string',
                            description: 'ZIP code for location-based search (default: 90210)',
                        },
                        yearMin: {
                            type: 'integer',
                            description: 'Minimum model year',
                        },
                        yearMax: {
                            type: 'integer',
                            description: 'Maximum model year',
                        },
                        priceMax: {
                            type: 'integer',
                            description: 'Maximum price in dollars',
                        },
                        mileageMax: {
                            type: 'integer',
                            description: 'Maximum mileage',
                        },
                        maxResults: {
                            type: 'integer',
                            description: 'Maximum results per source (default: 10)',
                        },
                        sources: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Sources to search: "cars.com", "autotrader", "kbb". Default: all',
                        },
                        oneOwner: {
                            type: 'boolean',
                            description: 'Filter for CARFAX 1-Owner vehicles only',
                        },
                        noAccidents: {
                            type: 'boolean',
                            description: 'Filter for vehicles with no accidents or damage reported',
                        },
                        personalUse: {
                            type: 'boolean',
                            description: 'Filter for vehicles used for personal use only (not rental/fleet)',
                        },
                    },
                    required: ['make', 'model'],
                },
            },
        ],
    };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'search_car_deals') {
        try {
            const params = {
                make: args.make,
                model: args.model,
                zip: args.zip || '90210',
                yearMin: args.yearMin,
                yearMax: args.yearMax,
                priceMax: args.priceMax,
                mileageMax: args.mileageMax,
                // CarFax history filters
                oneOwner: args.oneOwner,
                noAccidents: args.noAccidents,
                personalUse: args.personalUse,
            };
            const maxResults = args.maxResults || 10;
            const sources = args.sources || ['cars.com', 'autotrader', 'kbb'];

            // Simple in-memory cache
            const cacheKey = JSON.stringify({ params, maxResults, sources });
            const cached = searchCache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp < 300000)) { // 5 min TTL
                console.error(`[MCP] Returning cached results for ${cacheKey}`);
                return cached.response;
            }

            console.error(`[MCP] Searching for ${params.make} ${params.model} in ${params.zip}`);
            console.error(`[MCP] Sources: ${sources.join(', ')}, Max: ${maxResults}`);

            // Use optimized search function with shared browser
            const searchResults = await searchAllSources(params, maxResults, sources);

            const allListings = searchResults.listings;
            const errors = searchResults.errors.map(e => `${e.source}: ${e.error}`);

            console.error(`[MCP] Total listings: ${allListings.length}`);

            // Format output
            let output = `# Car Deals Search Results\n\n`;
            output += `**Search:** ${params.make} ${params.model}`;
            if (params.yearMin || params.yearMax) {
                output += ` (${params.yearMin || 'any'}-${params.yearMax || 'any'})`;
            }
            if (params.priceMax) output += ` | Max Price: $${params.priceMax.toLocaleString()}`;
            if (params.mileageMax) output += ` | Max Mileage: ${params.mileageMax.toLocaleString()}`;

            // Show active CarFax filters
            const activeFilters = [];
            if (params.oneOwner) activeFilters.push('1-Owner');
            if (params.noAccidents) activeFilters.push('No Accidents');
            if (params.personalUse) activeFilters.push('Personal Use');
            if (activeFilters.length > 0) output += `\n**CarFax Filters:** ${activeFilters.join(', ')}`;

            output += `\n**Location:** ${params.zip}\n\n`;

            if (allListings.length === 0) {
                output += `No listings found.\n`;
            } else {
                output += `Found **${allListings.length}** listings:\n\n`;

                for (const listing of allListings) {
                    output += listing.format() + '\n\n---\n\n';
                }
            }

            if (errors.length > 0) {
                output += `\n**Errors:**\n`;
                for (const err of errors) {
                    output += `- ${err}\n`;
                }
            }

            const response = {
                content: [
                    {
                        type: 'text',
                        text: output,
                    },
                ],
            };

            // Cache the response
            searchCache.set(cacheKey, { timestamp: Date.now(), response });

            return response;
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error searching for car deals: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }

    throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Car Deals MCP Server running on stdio');
}

main().catch(console.error);
