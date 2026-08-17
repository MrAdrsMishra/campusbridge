import * as cheerio from 'cheerio';

/**
 * Searches college360.co.in for a target college in a city and extracts its URL.
 * @param {string} city - Target city (e.g., 'Bhopal')
 * @param {string} collegeKeyword - Target college name keyword (e.g., 'SAGE')
 */
async function extractCollegeUrl(city, collegeKeyword) {
  const targetPageUrl = `https://college360.co.in/place/${encodeURIComponent(city)}`;

  try {
    console.log(`Fetching listing from: ${targetPageUrl}...`);
    const response = await fetch(targetPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let foundUrl = null;
    let foundTitle = null;

    // Iterate through all links on the city listing page
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();

      // Check if href or text matches the college keyword
      if (
        href &&
        (href.includes('/university/') || href.includes('/college/')) &&
        (text.toLowerCase().includes(collegeKeyword.toLowerCase()) || 
         href.toLowerCase().includes(collegeKeyword.toLowerCase()))
      ) {
        // Resolve relative links if necessary
        foundUrl = href.startsWith('http') ? href : `https://college360.co.in${href}`;
        foundTitle = text || 'Matched College Link';
        return false; // Stop loop on first match
      }
    });

    if (foundUrl) {
      console.log(`\nMatch Found!`);
      console.log(`Title: ${foundTitle}`);
      console.log(`URL:   ${foundUrl}`);
      return foundUrl;
    } else {
      console.log(`\nNo matching college URL found for keyword: "${collegeKeyword}"`);
      return null;
    }

  } catch (error) {
    console.error('Extraction failed:', error.message);
  }
}

// Run the extractor
extractCollegeUrl('Bhopal', 'Sri Satya Sai University of Technology and Medical Sciences (SSSUTMS)');