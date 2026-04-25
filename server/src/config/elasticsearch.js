const { Client } = require('@elastic/elasticsearch');

// Create Elasticsearch client with environment variable
const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// Basic connection check (optional, can be called during app startup)
async function checkConnection() {
  try {
    await client.ping();
    console.error('Elasticsearch connection successful');
  } catch (error) {
    console.error('Elasticsearch connection failed:', error.message);
    throw error;
  }
}

module.exports = { client, checkConnection };