export const DATASET_CATEGORIES = [
  { value: 'healthcare', label: 'Healthcare', subcategories: ['Disease surveillance', 'Hospital infrastructure', 'Medical research'] },
  { value: 'agriculture', label: 'Agriculture', subcategories: ['Crop yields', 'Food security', 'Climate data'] },
  { value: 'economics', label: 'Economics', subcategories: ['GDP', 'Trade', 'Inflation', 'Labor markets'] },
  { value: 'education', label: 'Education', subcategories: ['School performance', 'Literacy rates', 'University data'] },
  { value: 'climate', label: 'Climate', subcategories: ['Weather', 'Environmental monitoring', 'Satellite imagery'] },
  { value: 'transport', label: 'Transport', subcategories: ['Traffic patterns', 'Infrastructure data'] },
  { value: 'finance', label: 'Finance', subcategories: ['Banking access', 'Remittances', 'Microfinance', 'Currency data'] },
  { value: 'governance', label: 'Governance & Politics', subcategories: ['Election data', 'Policy documents', 'Public spending', 'Corruption indices'] },
  { value: 'demographics', label: 'Demographics & Population', subcategories: ['Census data', 'Migration', 'Urbanization', 'Birth/death rates'] },
  { value: 'energy', label: 'Energy', subcategories: ['Power grid coverage', 'Renewable energy', 'Electrification rates', 'Oil & gas'] },
  { value: 'water', label: 'Water & Sanitation', subcategories: ['Access to clean water', 'Sanitation infrastructure', 'Drought data', 'Flood zones'] },
  { value: 'land', label: 'Land & Natural Resources', subcategories: ['Land use', 'Mining', 'Deforestation', 'Soil data', 'Mineral reserves'] },
  { value: 'conflict', label: 'Conflict & Security', subcategories: ['Conflict zones', 'Displacement', 'Peacekeeping', 'Refugee data'] },
  { value: 'technology', label: 'Technology & Connectivity', subcategories: ['Internet penetration', 'Mobile usage', 'Digital infrastructure', 'Fintech'] },
  { value: 'trade', label: 'Trade & Logistics', subcategories: ['Cross-border trade', 'Port activity', 'Supply chains', 'Import/export data'] },
  { value: 'public-health', label: 'Public Health', subcategories: ['Vaccination rates', 'Maternal health', 'Malnutrition', 'Disease outbreaks'] },
  { value: 'biodiversity', label: 'Biodiversity & Wildlife', subcategories: ['Species tracking', 'Conservation areas', 'Poaching', 'Marine ecosystems'] },
  { value: 'housing', label: 'Housing & Urban Development', subcategories: ['Housing prices', 'Slum data', 'City planning', 'Infrastructure gaps'] },
  { value: 'gender', label: 'Gender & Social Inclusion', subcategories: ['Gender equality indices', 'Women in leadership', 'Child labour', 'Disability data'] },
  { value: 'labour', label: 'Labour & Employment', subcategories: ['Unemployment rates', 'Informal economy', 'Wage data', 'Skills gaps'] },
  { value: 'justice', label: 'Justice & Human Rights', subcategories: ['Court data', 'Prison statistics', 'Human rights violations', 'Legal access'] },
  { value: 'media', label: 'Media & Communication', subcategories: ['Press freedom', 'Broadcast data', 'Language distribution', 'Telecommunications'] },
  { value: 'tourism', label: 'Tourism & Culture', subcategories: ['Visitor statistics', 'Heritage sites', 'Cultural events', 'Arts economy'] },
  { value: 'science', label: 'Science & Research', subcategories: ['Academic publications', 'R&D spending', 'Patent filings', 'Innovation indices'] },
  { value: 'food', label: 'Food & Nutrition', subcategories: ['Hunger indices', 'Food prices', 'Supply chains', 'Dietary data'] },
  { value: 'disaster', label: 'Disaster & Risk', subcategories: ['Natural disaster records', 'Emergency response', 'Climate risk maps'] },
  { value: 'sports', label: 'Sports & Youth', subcategories: ['Youth population data', 'Sports infrastructure', 'Athletic performance'] },
]

export const LICENSES = [
  { value: 'cc0', label: 'CC0 (Public Domain)' },
  { value: 'cc-by', label: 'CC BY 4.0' },
  { value: 'cc-by-sa', label: 'CC BY-SA 4.0' },
  { value: 'cc-by-nc', label: 'CC BY-NC 4.0' },
  { value: 'odc-by', label: 'ODC-By' },
  { value: 'odbl', label: 'ODbL' },
  { value: 'proprietary', label: 'Proprietary' },
]

export const FILE_FORMATS = ['CSV', 'JSON', 'GeoJSON', 'Parquet', 'XLSX', 'Shapefile', 'PDF', 'Images']

export const ROLES = {
  ADMIN: 'admin',
  RESEARCHER: 'researcher',
  CONTRIBUTOR: 'contributor',
  INSTITUTION: 'institution',
}

export const VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  ORGANIZATION: 'organization',
}

export const MODERATION_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

export const AFRICAN_COUNTRIES = [
  'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cameroon', 'Central African Republic', 'Chad', 'Comoros',
  'Congo', 'DR Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea',
  'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea',
  'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya',
  'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco',
  'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'São Tomé & Príncipe',
  'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa',
  'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda',
  'Zambia', 'Zimbabwe',
]

// Mock data for search results
export const MOCK_DATASETS = [
  {
    id: 1,
    title: 'African Health Statistics 2023',
    description: 'Comprehensive health data across African countries including vaccination rates, disease prevalence, and healthcare access.',
    category: 'healthcare',
    country: 'Nigeria',
    license: 'cc-by',
    fileSize: 2048000, // 2MB
    createdAt: '2023-06-15',
    downloads: 1250,
    rating: 4.5,
    tags: ['health', 'vaccination', 'africa'],
  },
  {
    id: 2,
    title: 'Climate Change Impact on Agriculture',
    description: 'Dataset analyzing the effects of climate change on crop yields and food security in East Africa.',
    category: 'agriculture',
    country: 'Kenya',
    license: 'cc0',
    fileSize: 5120000, // 5MB
    createdAt: '2023-08-22',
    downloads: 890,
    rating: 4.2,
    tags: ['climate', 'agriculture', 'food-security'],
  },
  {
    id: 3,
    title: 'Economic Indicators Dashboard',
    description: 'GDP, inflation, and trade data for African nations from 2010-2023.',
    category: 'economics',
    country: 'South Africa',
    license: 'odbl',
    fileSize: 1024000, // 1MB
    createdAt: '2023-04-10',
    downloads: 2100,
    rating: 4.8,
    tags: ['economics', 'gdp', 'trade'],
  },
  {
    id: 4,
    title: 'Education Access in Rural Areas',
    description: 'Survey data on school attendance, literacy rates, and educational infrastructure in rural African communities.',
    category: 'education',
    country: 'Ghana',
    license: 'cc-by-sa',
    fileSize: 1536000, // 1.5MB
    createdAt: '2023-09-05',
    downloads: 675,
    rating: 4.0,
    tags: ['education', 'literacy', 'rural'],
  },
  {
    id: 5,
    title: 'Renewable Energy Adoption',
    description: 'Tracking solar and wind energy implementation across African countries.',
    category: 'energy',
    country: 'Morocco',
    license: 'cc-by-nc',
    fileSize: 3072000, // 3MB
    createdAt: '2023-07-18',
    downloads: 1450,
    rating: 4.6,
    tags: ['energy', 'renewable', 'solar'],
  },
]

// Mock usernames for mentions
export const MOCK_USERNAMES = [
  'johndoe',
  'sarahsmith',
  'mikejohnson',
  'emilydavis',
  'alexwilson',
  'lisabrown',
  'davidmiller',
  'jenniferlee',
  'chrisgarcia',
  'amandawhite',
]
