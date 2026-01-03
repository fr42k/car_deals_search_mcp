const { scrapeAutotrader } = require('./src/scraper.js');

async function test() {
    console.log('Starting Autotrader scrape test...');
    const start = Date.now();

    try {
        const params = {
            make: 'Toyota',
            model: 'Corolla',
            zip: '90210'
        };

        const listings = await scrapeAutotrader(params, 5); // Fetch top 5
        const end = Date.now();

        const output = `Success! Found ${listings.length} listings.\nTime taken: ${(end - start) / 1000} seconds\nFirst listing title: ${listings.length > 0 ? listings[0].title : 'None'}`;
        console.log(output);
        require('fs').writeFileSync('results.txt', output);
    } catch (err) {
        const errorMsg = `Test failed: ${err.message}`;
        console.error(errorMsg);
        require('fs').writeFileSync('results.txt', errorMsg);
    }
}

test();
