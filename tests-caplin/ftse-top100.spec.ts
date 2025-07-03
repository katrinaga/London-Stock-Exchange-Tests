import { test, expect, Page } from '@playwright/test';
import * as helpers from './helpers';


let ftseAllOver7M: { name: string; marketCap: number }[] = [];
let ftseTop10HighestPercentageChange: { name: string; percentChange: number }[] = [];
let ftseTop10LowestPercentageChange: { name: string; percentChange: number }[] = [];
let ftseMonthlyAverageIndexValues36Months: { month: string; averageIndexValue: number }[] = [];

// Note: Navigation is handled by the navigation functions in helpers.ts. There is also a helper function for accepting cookies. 
test.describe('Navigation Tests', () => {
    test('Navigate to the London Stock Exchange website', async ({ page, context }) => {
        await helpers.navigateToHomepage(page)

        // Assert that slider hero image section is present & visible
        expect(page.locator('section.slider-wrapper')).toBeVisible({ timeout: 10000 });
    });

    test('Navigate to the London Stock Exchange website, then FTSE 100 page', async ({ page, context }) => {
        await helpers.navigateToHomepage(page)
        
        // Wait for new page to open when clicking the link
        const [newPage] = await Promise.all([
            context.waitForEvent('page'), // listen for new page
            page.getByText('View FTSE 100').click(), // trigger the click that opens the new page
        ]);

        // Wait for the new page to load
        await newPage.waitForLoadState();

        // Assert the new page's URL
        expect(newPage.url()).toBe('https://www.londonstockexchange.com/indices/ftse-100/constituents');
    });
});

test.describe('FTSE 100 Constituents Tests', () => {
    // There are three test scanerios that require extracting and displaying data. These are:
    // #2 "Write a test to Identify, extract, and display somewhere of choice the FTSE 100’s latest top 10 constituents with the highest percentage change."
    // #3 "Write a test Identify, extract, and display somewhere of choice the FTSE 100’s latest top 10 constituents with the lowest percentage change."
    // #4 "Write a test to Identify, extract, and display somewhere of choice all FTSE 100 constituents where the ‘Market Cap’ exceeds 7 million."
    // This data is gathered in the beforeAll "Get FTSE data", to avoid it being requested multiple times. Validation of this data is conducted in seperate tests below. 
        
    test.beforeAll('Get FTSE data', async ({ browser }) => {
        const page = await browser.newPage();
        ftseAllOver7M = await helpers.getftseAllOver7M(page)
        ftseTop10HighestPercentageChange = await helpers.getftseTop10HighestPercentageChange(page)
        ftseTop10LowestPercentageChange = await helpers.getftseTop10LowestPercentageChange(page)
    });

    test('Confirm table pressence', async ({page}) => {
        await helpers.navigateToFtse100(page)

        // Confirm table pressence 
        const table = page.locator('table.ftse-index-table-table');
        await expect(table).toBeVisible();
    });

    test('Top ten lists contain exactly 10 items ', async () => {
        expect(ftseTop10HighestPercentageChange.length).toBe(10);
        expect(ftseTop10LowestPercentageChange.length).toBe(10);
    });

    test('Lists do not contain empty names ', async () => {
        for (const item of ftseTop10HighestPercentageChange) {
            expect(item.name.trim().length).toBeGreaterThan(0);
        }

        for (const item of ftseTop10LowestPercentageChange) {
            expect(item.name.trim().length).toBeGreaterThan(0);
        }

        for (const item of ftseAllOver7M) {
            expect(item.name.trim().length).toBeGreaterThan(0);
        }
    });    

    test('FTSE Over 7M list does not contain constituents where the Market Cap exceeds 7 million', async () => {
        for (const item of ftseAllOver7M) {
            expect(item.marketCap).toBeGreaterThan(7);
        }
    });    
});

test.describe('FTSE 100 Overview Tests', () => {

    test.beforeAll('Get monthly index values over past 3 years', async ({ browser }) => {
        const page = await browser.newPage();
        ftseMonthlyAverageIndexValues36Months = await helpers.getftseIndexValues3Years(page)
    });

    test('Confirm monthly index values array contains 36 months of data', async ({ browser }) => {
        expect(ftseMonthlyAverageIndexValues36Months.length).toEqual(36);
    });

    test('Find lowest monthly value in the last 3 years', async ({ browser }) => {
        // Find the lowest value in the 'ftseMonthlyAverageIndexValues' array
        // Use 'map' to create a new array of only numbers rather than (Date, Number) datapoints
        const values = ftseMonthlyAverageIndexValues36Months.map(d => d.averageIndexValue);

        // Use the 'Math.min' function to search this numbers array to find the lowest value
        const lowestValue = Math.min(...values);

        // use 'find' to find the corresponding month
        const lowestDataPoint = ftseMonthlyAverageIndexValues36Months.find(d => d.averageIndexValue === lowestValue);


        // Sanity check (verify the data actually makes sense)
        expect(lowestValue).toBeGreaterThan(0); // The lowest value shouldn't be 0
        expect(lowestDataPoint).toBeDefined();  // The lowest datapoint should have been found when we called 'find'

        // Output the value to the console
        console.log(`Lowest value in last 36 months was ${lowestValue} on ${lowestDataPoint?.month}`);  
    });

});