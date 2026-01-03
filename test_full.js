const { searchAllSources } = require('./src/scraper.js');

async function testFull() {
    console.log('Starting Full Optimization Test (All Sources)...');
    const start = Date.now();

    try {
        const params = {
            make: 'Honda',
            model: 'Civic',
            zip: '90001',
            yearMin: 2021
        };

        // request simple search
        const results = await searchAllSources(params, 3); // Top 3 from each
        const end = Date.now();

        console.log(`\n--- Results ---`);
        console.log(`Total Time: ${(end - start) / 1000} seconds`);
        console.log(`Total Listings: ${results.listings.length}`);
        console.log(`Errors:`, results.errors);

        // Group by source
        const counts = {};
        results.listings.forEach(l => {
            counts[l.source] = (counts[l.source] || 0) + 1;
        });
        console.log('Counts per source:', counts);

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testFull();
