const { client } = require('../config/elasticsearch');

/**
 * Search content using Elasticsearch with dynamic filters
 * @param {Object} filters - Search filters
 * @param {string} filters.keyword - Keyword to search in title, description, content
 * @param {string} filters.category - Exact category match
 * @param {string} filters.country - Exact country match
 * @param {string} filters.license - Exact license match
 * @param {Object} filters.fileSize - File size range { min, max }
 * @param {Object} filters.dateRange - Date range { from, to }
 * @returns {Array} Array of search results
 */
async function searchContent(filters = {}) {
  try {
    const query = {
      bool: {
        must: [],
        filter: []
      }
    };

    // Keyword search using multi_match
    if (filters.keyword && filters.keyword.trim()) {
      query.bool.must.push({
        multi_match: {
          query: filters.keyword.trim(),
          fields: ['title^3', 'description^2', 'content'], // Boost title and description
          fuzziness: 'AUTO'
        }
      });
    }

    // Exact match filters
    const exactFilters = ['category', 'country', 'license'];
    exactFilters.forEach(field => {
      if (filters[field] && filters[field].trim()) {
        query.bool.filter.push({
          term: { [field]: filters[field].trim() }
        });
      }
    });

    // File size range filter
    if (filters.fileSize && (filters.fileSize.min !== undefined || filters.fileSize.max !== undefined)) {
      const rangeQuery = { range: { fileSize: {} } };
      if (filters.fileSize.min !== undefined) {
        rangeQuery.range.fileSize.gte = filters.fileSize.min;
      }
      if (filters.fileSize.max !== undefined) {
        rangeQuery.range.fileSize.lte = filters.fileSize.max;
      }
      query.bool.filter.push(rangeQuery);
    }

    // Date range filter
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
      const rangeQuery = { range: { date: {} } };
      if (filters.dateRange.from) {
        rangeQuery.range.date.gte = filters.dateRange.from;
      }
      if (filters.dateRange.to) {
        rangeQuery.range.date.lte = filters.dateRange.to;
      }
      query.bool.filter.push(rangeQuery);
    }

    // Perform search
    const response = await client.search({
      index: 'content', // Assuming 'content' index, adjust as needed
      body: {
        query,
        size: 50, // Limit results, can be parameterized
        sort: [{ _score: 'desc' }, { date: 'desc' }] // Sort by relevance then date
      }
    });

    // Format and return results
    return response.hits.hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      ...hit._source
    }));

  } catch (error) {
    console.error('Elasticsearch search error:', error.message);
    throw new Error(`Search failed: ${error.message}`);
  }
}

module.exports = { searchContent };