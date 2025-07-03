# Playwright Demo - London Stock Exchange Tests
 Playwright tests for the FTSE 100 list, created for a technical assesment to demonstrate capability with the Playwright test framework. 

 # Test Scenarios (Assesment Specifications)
1. Navigate to the London Stock Exchange website: https://www.londonstockexchange.com/.
2. Write a test to Identify, extract, and display somewhere of choice the FTSE 100’s latest top 10 constituents with the highest percentage change.
3. Write a test Identify, extract, and display somewhere of choice the FTSE 100’s latest top 10 constituents with the lowest percentage change.
4. Write a test to Identify, extract, and display somewhere of choice all FTSE 100 constituents where the ‘Market Cap’ exceeds 7 million.
5. Write a test to determine which month over the past three years recorded the lowest average index value.

 # Helper Functions

 Navigation functions are all handled in **helpers.ts**.

I have also used helper functions to collect the data needed for scenarios 2, 3, 4 & 5. This is to, as much as possible, seperate out the gathering of the data itself from the tests that validate it. The results from the data scraping are saved to JSON files so that they can also be manually checked, if needed. These data-gathering functions are called in beforeAll tests, as they only need to be ran once.

 # Question regarding Scenario #4
 The instruction here was *"Write a test to Identify, extract, and display somewhere of choice all FTSE 100 constituents where the ‘Market Cap’ exceeds 7 million."*

 I am not sure if this was a mistake, as all of the FTSE 100 constituents market cap exceeds 7 million by a huge amount. (The market cap is listed in Millions, and 3,544.37 is the lowest value at the time of writing.) It is possible the scenario should have been "7 Billon". However, I was unable to confirm this with the recruiter who issued the assessment. It is possible I have misunderstood the instruction here but, as it stands, there is nothing to filter out or identify here, so the test result (ftse-constituents-market-cap-over-7-million) will contain all 100 constituents. 

 # Known Issues / Areas for Future Improvement: 

1) Tests are flakier than they should be and shouldn't be ran in parallel to circumvent this. This is often caused by pages loading slower than expected, or by the animated "accept cookies" banner taking too long to appear, or appearing at unexpected times. Timeouts and waits have been used to help with this, but the tests still fail occasionally if the page is particularly slow to load. Was not able to finish investigating this issue due to time constraints. If this issue is encountered, please re-run the failing tests and they should pass on retry. 

2) Navigation functions and data gatheirng functions are both stored in a single "helpers.ts" file. For a larger project it would make sense to seperate these out furthur into specific "navigation" functions and "data scraping" functions. 

3) The Page Object Model is not used here, as most tests are related to the data gathered and not the front-end of the site itself. Still, for a larger project I would seperate out the selectors & other page objects into this format, for clarity and maintainability. (I do have other projects that have used this, which I am happy to share.)