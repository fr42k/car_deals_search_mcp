const { searchAllSources } = require('./src/scraper.js');

async function test() {
    console.log('Starting Autotrader optimization test...');
    const start = Date.now();

    try {
        const params = {
            make: 'Toyota',
            model: 'Camry',
            zip: '90210',
            yearMin: 2020
        };

        // Test Autotrader specifically as requested
        const results = await searchAllSources(params, 5, ['autotrader']);
        const end = Date.now();

        console.log(`\n--- Results ---`);
        console.log(`Time taken: ${(end - start) / 1000} seconds`);
        console.log(`Listings found: ${results.listings.length}`);

        if (results.errors.length > 0) {
            console.log('Errors:', results.errors);
        }

        if (results.listings.length > 0) {
            results.listings.forEach((l, i) => console.log(`${i + 1}. ${l.title} - ${l.price}`));
        } else {
            console.log('No listings found. Possible selector issue or bot detection.');
        }

        require('fs').writeFileSync('results.txt', `Time: ${(end - start) / 1000}s\nListings: ${results.listings.length}\nErrors: ${JSON.stringify(results.errors)}`);

    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
