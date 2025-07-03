import { expect, Page } from '@playwright/test';
import * as fs from 'fs';

/// ------ NAVIGATION FUNCTIONS ------ ///

export async function acceptCookies(page: Page) {
    // Accept cookies if needed
    const acceptCookiesButton = page.getByRole('button', { name: 'Accept all cookies' });
    if (await acceptCookiesButton.isVisible({ timeout: 5000})) {
        await acceptCookiesButton.click();
    }
}

export async function navigateToHomepage(page: Page) {
    // Navigate to page 
    await page.goto('https://www.londonstockexchange.com');
    await acceptCookies(page);
}

export async function navigateToFtse100(page: Page) {
    // Navigate to page 
    await page.goto('https://www.londonstockexchange.com/indices/ftse-100/constituents');
    await acceptCookies(page);
}

export async function navigateToFtseOverview(page: Page) {
    // Navigate to page 
    await page.goto('https://www.londonstockexchange.com/indices/ftse-100');
    await page.waitForSelector('svg .highcharts-point');
    await acceptCookies(page);
}


/// ------ DATA SCRAPING FUNCTIONS ------ ///

export async function getftseAllOver7M(page: Page) {
    await navigateToFtse100(page)

    // Sort table by Market Cap
    await page.getByText('Market cap (m)').click()
    await page.locator('span.dropdown.expanded li div', { hasText: 'Highest – lowest' }).click();

    // Initialise array
    const ftseTop100: { name: string; marketCap: number }[] = [];

    // Loops through 5 pages and stores data in array
    for (let i = 0; i < 5; i++) {
        // Click on the pagination button for the current page if not page 1
        if (i > 1) {
            await acceptCookies(page);
            await page.locator('a.page-number', { hasText: String(i) }).click();
            await page.waitForTimeout(1000); 
        }

        const rows = page.locator('table.ftse-index-table-table tbody tr');
        const count = await rows.count();
        expect(count).toBeGreaterThanOrEqual(10);

        for (let j = 0; j < count; j++) {
            const row = rows.nth(j);
            const name = await row.locator('td').nth(0).innerText();
            const marketCapText = await row.locator('td').nth(3).innerText();
            const marketCap = parseFloat(marketCapText.replace(/,/g, ''));

            ftseTop100.push({ name, marketCap });
        }
    }

    // Print data in console
    console.log(ftseTop100);

    // Assert we have all 100 items
    expect(ftseTop100.length).toBe(100);

    // Filter items with a market cap < 7million
    const ftseAllOver7M = ftseTop100.filter(row => row.marketCap > 7);    
    
    // Save the data to a JSON file
    fs.writeFileSync('ftse-constituents-market-cap-over-7-million.json', JSON.stringify(ftseAllOver7M, null, 2));

    // Return data
    return ftseAllOver7M;
}

export async function getftseTop10HighestPercentageChange(page: Page){
    await navigateToFtse100(page)

    // Sort table by highest percentage change
    await page.getByText('Change %').click()
    await page.locator('span.dropdown.expanded li div', { hasText: 'Highest – lowest' }).click();

    // Get table rows and make sure they are at least 10
    const rows = page.locator('table.ftse-index-table-table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(10); 

    // Put the data from the top 10 rows into an array
    const top10: { name: string; percentChange:string } [] = [];
    for (let i = 0; i < 10; i++){
        const row = rows.nth(i);

        const name = await row.locator('td').nth(1).innerText();
        const percentChange = await row.locator('td').nth(6).innerText();

        top10.push({ name, percentChange});
    }

    // Print data in console
    console.log(top10);

    // Convert the percentage strings into float values
    const ftseTop10HighestPercentageChange = top10.map(({ name, percentChange }) => {
        const num = parseFloat(percentChange.replace('%', '').replace('+', ''));
        return { name, percentChange: num };
    });

    // Save the ftseTop10HighestPercentageChange array to a JSON file
    fs.writeFileSync('ftse-top10-constituents-highest-percent-change.json', JSON.stringify(ftseTop10HighestPercentageChange, null, 2));

    // Return data
    return ftseTop10HighestPercentageChange;
}

export async function getftseTop10LowestPercentageChange(page: Page){
    await navigateToFtse100(page)

    // Sort table by lowest percentage change
    await page.getByText('Change %').click()
    await page.locator('span.dropdown.expanded li div', { hasText: 'Lowest – highest' }).click();

    // Get table rows and make sure they are at least 10
    const rows = page.locator('table.ftse-index-table-table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(10); 

    // Put the data from the top 10 rows into an array
    const top10: { name: string; percentChange:string } [] = [];
    for (let i = 0; i < 10; i++){
        const row = rows.nth(i);

        const name = await row.locator('td').nth(1).innerText();
        const percentChange = await row.locator('td').nth(6).innerText();

        top10.push({ name, percentChange});
    }

    // Print data in console
    console.log(top10);

    // Convert the percentage strings into float values
    const ftseTop10LowestPercentageChange = top10.map(({ name, percentChange }) => {
        const num = parseFloat(percentChange.replace('%', '').replace('+', ''));
        return { name, percentChange: num };
    });

    // Assert we have exactly 10 items
    expect(ftseTop10LowestPercentageChange.length).toBe(10);

    // Assert no empty names
    for (const item of ftseTop10LowestPercentageChange) {
        expect(item.name.trim().length).toBeGreaterThan(0);
    }

    // Save the ftseTop10LowestPercentageChange array to a JSON file
    fs.writeFileSync('ftse-top10-constituents-lowest-percent-change.json', JSON.stringify(ftseTop10LowestPercentageChange, null, 2));

    // Return data
    return ftseTop10LowestPercentageChange;
}

export async function getftseIndexValues3Years(page: Page){
    await navigateToFtseOverview(page)
    
    // Click on the .time-range-select to select '5Y'
    await page.locator('button.dropdown-toggle div', { hasText: '1Y' }).click();
    await page.locator('div.dropdown-option-text', { hasText: '5Y' }).click();

    // Wait for the chart to load
    await page.waitForSelector('svg .highcharts-point' );
    await acceptCookies(page);

    // Click on the .periodicity-select to select 'Monthly'
    await page.locator('button.dropdown-toggle div', { hasText: 'Weekly' }).click();
    await page.locator('div.dropdown-option-text', { hasText: 'Monthly' }).click();

    // Wait for the chart to load
    await page.waitForSelector('svg .highcharts-point');
    
    // Get all data points on the chart
    const points = await page.locator('svg .highcharts-point').all();

    // Set up array
    const ftseMonthlyAverageIndexValues: { month: string; averageIndexValue: number }[] = [];
    
    for (const point of points) {
        // Get the aria-label attribute
        const ariaLabel = await point.getAttribute('aria-label');
        
        if (ariaLabel) {
            const parts = ariaLabel.split(' ');
    
            // Value is at index 5
            const value = parseFloat(parts[5]);
    
            // Month is at index 7, Year is at index 8
            const month = parts[7];
            const year = parts[8];
    
            ftseMonthlyAverageIndexValues.push({
                month: `${month} ${year}`,
                averageIndexValue: value
            });
            // console.log(month + " " + year + " " + value)
        }
    }

    // Get the last 36 months of data
    const ftseMonthlyAverageIndexValues36Months = ftseMonthlyAverageIndexValues.slice(-36);

    // Verify we have 36 months of data
    expect(ftseMonthlyAverageIndexValues36Months.length).toEqual(36);

    // Save the array to a JSON file
    fs.writeFileSync('ftse-average-index-values-36-months.json', JSON.stringify(ftseMonthlyAverageIndexValues36Months, null, 2));

    // Return data
    return ftseMonthlyAverageIndexValues36Months;
}