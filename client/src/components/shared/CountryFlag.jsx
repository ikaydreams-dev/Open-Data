// src/components/shared/CountryFlag.jsx
// Renders a flag emoji for any African country listed in constants.js AFRICAN_COUNTRIES.
// Flag emojis are computed from ISO 3166-1 alpha-2 codes — no external library needed.
import { cn } from '../../lib/utils'

// ISO 3166-1 alpha-2 codes for all 54 African countries in constants.js
const COUNTRY_ISO = {
  'Algeria': 'DZ',
  'Angola': 'AO',
  'Benin': 'BJ',
  'Botswana': 'BW',
  'Burkina Faso': 'BF',
  'Burundi': 'BI',
  'Cabo Verde': 'CV',
  'Cameroon': 'CM',
  'Central African Republic': 'CF',
  'Chad': 'TD',
  'Comoros': 'KM',
  'Congo': 'CG',
  'DR Congo': 'CD',
  'Djibouti': 'DJ',
  'Egypt': 'EG',
  'Equatorial Guinea': 'GQ',
  'Eritrea': 'ER',
  'Eswatini': 'SZ',
  'Ethiopia': 'ET',
  'Gabon': 'GA',
  'Gambia': 'GM',
  'Ghana': 'GH',
  'Guinea': 'GN',
  'Guinea-Bissau': 'GW',
  'Ivory Coast': 'CI',
  'Kenya': 'KE',
  'Lesotho': 'LS',
  'Liberia': 'LR',
  'Libya': 'LY',
  'Madagascar': 'MG',
  'Malawi': 'MW',
  'Mali': 'ML',
  'Mauritania': 'MR',
  'Mauritius': 'MU',
  'Morocco': 'MA',
  'Mozambique': 'MZ',
  'Namibia': 'NA',
  'Niger': 'NE',
  'Nigeria': 'NG',
  'Rwanda': 'RW',
  'São Tomé & Príncipe': 'ST',
  'Senegal': 'SN',
  'Seychelles': 'SC',
  'Sierra Leone': 'SL',
  'Somalia': 'SO',
  'South Africa': 'ZA',
  'South Sudan': 'SS',
  'Sudan': 'SD',
  'Tanzania': 'TZ',
  'Togo': 'TG',
  'Tunisia': 'TN',
  'Uganda': 'UG',
  'Zambia': 'ZM',
  'Zimbabwe': 'ZW',
}

// Converts an ISO code (e.g. "GH") to its regional indicator emoji (e.g. 🇬🇭)
function isoToFlagEmoji(iso) {
  return iso
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)))
    .join('')
}

const sizes = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-5xl',
}

export function CountryFlag({
  country,
  size = 'md',
  showName = false,
  className,
}) {
  const iso = COUNTRY_ISO[country]
  const flag = iso ? isoToFlagEmoji(iso) : '🌍'

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className={cn(sizes[size], 'leading-none')}
        role="img"
        aria-label={country ? `Flag of ${country}` : 'African continent'}
        title={country}
      >
        {flag}
      </span>
      {showName && country && (
        <span className="text-sm text-stone-700">{country}</span>
      )}
    </span>
  )
}
