// Import the required module to load environment variables
require('dotenv').config();

// Define a constant for the no appointment message
// const NO_APPOINTMENT = 'No appointment available from this date. Please try again later.';
async function checkAppointment(page) {
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

  // Get the HTML content of the page and the JSON script containing the criteria
  const content = await page.content();

  const criteriaRegex = /"critere":\s*(\{[^}]*\})/;
  const match = criteriaRegex.exec(content);

  // Initialize an object to store the criteria
  let criteria = null;

  // If a match was found
  if (match && match[1]) {
    try {
      // Parse the found JSON to get the criteria object
      criteria = JSON.parse(match[1]);
    } catch (error) {
      // Log an error message if the JSON parsing fails
      console.error('Error parsing criteria:', error);
    }
  }

  return criteria;
}
// Define the main function to scrape data from a URL
// Define the main function to scrape data from a URL
async function scrapeAppointment(req, res) {
  // Get the page from the request
  const page = req.page;

  try {
    let criteria = await checkAppointment(page);

    // Keep checking for appointments until they become available
    if (!criteria || criteria.datePremiereDispo === '') {
      console.log('No appointment available from this date. Please try again later.');
      // If no appointments are available according to the criteria, reload the page and check again
    return  res.status(200).json({
        status: 'success',
        available: false,
        message: `No appointment available from this date. Please try again later.`,
      });
    }

    // If appointments may be available
    res.status(200).json({
      status: 'success',
      available: true,
      message: `Appointments available between ${criteria.dateMin} and ${criteria.dateMax}. `,
    });
  } catch (error) {
    // If an error occurs during the scraping process
    res.status(500).json({ status: 'error', message: `Failed scrapping : ${error.message}` });
  }
}


// Export the function
module.exports = scrapeAppointment;
