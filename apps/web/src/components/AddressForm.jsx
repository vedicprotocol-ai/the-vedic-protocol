import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'CI', name: 'Ivory Coast' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MO', name: 'Macau' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'SM', name: 'San Marino' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
];

const STATES_BY_COUNTRY = {
  IN: [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
  ],
  US: [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
    'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
  ],
  CA: [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
    'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon',
  ],
  AU: [
    'Australian Capital Territory', 'New South Wales', 'Northern Territory',
    'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia',
  ],
  GB: [
    'England', 'Northern Ireland', 'Scotland', 'Wales',
    'Bedfordshire', 'Berkshire', 'Bristol', 'Buckinghamshire', 'Cambridgeshire',
    'Cheshire', 'Cornwall', 'Cumbria', 'Derbyshire', 'Devon', 'Dorset',
    'Durham', 'East Riding of Yorkshire', 'East Sussex', 'Essex', 'Gloucestershire',
    'Greater London', 'Greater Manchester', 'Hampshire', 'Herefordshire',
    'Hertfordshire', 'Isle of Wight', 'Kent', 'Lancashire', 'Leicestershire',
    'Lincolnshire', 'Merseyside', 'Norfolk', 'North Yorkshire', 'Northamptonshire',
    'Northumberland', 'Nottinghamshire', 'Oxfordshire', 'Shropshire', 'Somerset',
    'South Yorkshire', 'Staffordshire', 'Suffolk', 'Surrey', 'Tyne and Wear',
    'Warwickshire', 'West Midlands', 'West Sussex', 'West Yorkshire', 'Wiltshire', 'Worcestershire',
  ],
  DE: [
    'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen',
    'Hamburg', 'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern',
    'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland',
    'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia',
  ],
  FR: [
    'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany',
    'Centre-Val de Loire', 'Corsica', 'Grand Est', 'Hauts-de-France',
    'Île-de-France', 'Normandy', 'Nouvelle-Aquitaine', 'Occitanie',
    'Pays de la Loire', "Provence-Alpes-Côte d'Azur",
  ],
  IT: [
    'Abruzzo', 'Aosta Valley', 'Apulia', 'Basilicata', 'Calabria', 'Campania',
    'Emilia-Romagna', 'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardy',
    'Marche', 'Molise', 'Piedmont', 'Sardinia', 'Sicily', 'Trentino-South Tyrol',
    'Tuscany', 'Umbria', 'Veneto',
  ],
  ES: [
    'Andalusia', 'Aragon', 'Asturias', 'Balearic Islands', 'Basque Country',
    'Canary Islands', 'Cantabria', 'Castilla-La Mancha', 'Castile and León',
    'Catalonia', 'Ceuta', 'Extremadura', 'Galicia', 'La Rioja', 'Madrid',
    'Melilla', 'Murcia', 'Navarre', 'Valencia',
  ],
  BR: [
    'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará',
    'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso',
    'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná',
    'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte',
    'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo',
    'Sergipe', 'Tocantins',
  ],
  MX: [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
    'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato',
    'Guerrero', 'Hidalgo', 'Jalisco', 'Mexico City', 'Mexico State',
    'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
    'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora',
    'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
  ],
  JP: [
    'Aichi', 'Akita', 'Aomori', 'Chiba', 'Ehime', 'Fukui', 'Fukuoka',
    'Fukushima', 'Gifu', 'Gunma', 'Hiroshima', 'Hokkaido', 'Hyogo',
    'Ibaraki', 'Ishikawa', 'Iwate', 'Kagawa', 'Kagoshima', 'Kanagawa',
    'Kochi', 'Kumamoto', 'Kyoto', 'Mie', 'Miyagi', 'Miyazaki', 'Nagano',
    'Nagasaki', 'Nara', 'Niigata', 'Oita', 'Okayama', 'Okinawa', 'Osaka',
    'Saga', 'Saitama', 'Shiga', 'Shimane', 'Shizuoka', 'Tochigi', 'Tokushima',
    'Tokyo', 'Tottori', 'Toyama', 'Wakayama', 'Yamagata', 'Yamaguchi', 'Yamanashi',
  ],
  ZA: [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
    'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
  ],
  NZ: [
    'Auckland', 'Bay of Plenty', 'Canterbury', 'Gisborne', "Hawke's Bay",
    'Manawatu-Whanganui', 'Marlborough', 'Nelson', 'Northland', 'Otago',
    'Southland', 'Taranaki', 'Tasman', 'Waikato', 'Wellington', 'West Coast',
  ],
  MY: [
    'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Melaka',
    'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Putrajaya',
    'Sabah', 'Sarawak', 'Selangor', 'Terengganu',
  ],
  AE: [
    'Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah', 'Ras Al Khaimah',
    'Sharjah', 'Umm Al Quwain',
  ],
  SA: [
    'Asir', 'Al Bahah', 'Al Jawf', 'Al Madinah', 'Al-Qassim', 'Eastern Province',
    'Ha\'il', 'Jazan', 'Makkah', 'Najran', 'Northern Borders', 'Riyadh', 'Tabuk',
  ],
  PK: [
    'Azad Kashmir', 'Balochistan', 'Gilgit-Baltistan', 'Islamabad Capital Territory',
    'Khyber Pakhtunkhwa', 'Punjab', 'Sindh',
  ],
  CN: [
    'Anhui', 'Beijing', 'Chongqing', 'Fujian', 'Gansu', 'Guangdong', 'Guangxi',
    'Guizhou', 'Hainan', 'Hebei', 'Heilongjiang', 'Henan', 'Hong Kong',
    'Hubei', 'Hunan', 'Inner Mongolia', 'Jiangsu', 'Jiangxi', 'Jilin',
    'Liaoning', 'Macau', 'Ningxia', 'Qinghai', 'Shaanxi', 'Shandong',
    'Shanghai', 'Shanxi', 'Sichuan', 'Tianjin', 'Tibet', 'Xinjiang', 'Yunnan', 'Zhejiang',
  ],
  RU: [
    'Altai Krai', 'Amur Oblast', 'Arkhangelsk Oblast', 'Astrakhan Oblast',
    'Belgorod Oblast', 'Bryansk Oblast', 'Chechen Republic', 'Chelyabinsk Oblast',
    'Chukotka Autonomous Okrug', 'Chuvash Republic', 'Irkutsk Oblast',
    'Ivanovo Oblast', 'Jewish Autonomous Oblast', 'Kabardino-Balkarian Republic',
    'Kaliningrad Oblast', 'Kaluga Oblast', 'Kamchatka Krai', 'Karachay-Cherkess Republic',
    'Kemerovo Oblast', 'Kirov Oblast', 'Kostroma Oblast', 'Krasnodar Krai',
    'Krasnoyarsk Krai', 'Kurgan Oblast', 'Kursk Oblast', 'Leningrad Oblast',
    'Lipetsk Oblast', 'Magadan Oblast', 'Mari El Republic', 'Mordovia Republic',
    'Moscow', 'Moscow Oblast', 'Murmansk Oblast', 'Nizhny Novgorod Oblast',
    'Novgorod Oblast', 'Novosibirsk Oblast', 'Omsk Oblast', 'Orenburg Oblast',
    'Oryol Oblast', 'Penza Oblast', 'Perm Krai', 'Primorsky Krai',
    'Pskov Oblast', 'Republic of Adygea', 'Republic of Altai', 'Republic of Bashkortostan',
    'Republic of Buryatia', 'Republic of Dagestan', 'Republic of Ingushetia',
    'Republic of Kalmykia', 'Republic of Karelia', 'Republic of Khakassia',
    'Republic of North Ossetia–Alania', 'Republic of Sakha', 'Republic of Tatarstan',
    'Republic of Tyva', 'Rostov Oblast', 'Ryazan Oblast', 'Saint Petersburg',
    'Sakhalin Oblast', 'Samara Oblast', 'Saratov Oblast', 'Smolensk Oblast',
    'Stavropol Krai', 'Sverdlovsk Oblast', 'Tambov Oblast', 'Tomsk Oblast',
    'Tula Oblast', 'Tver Oblast', 'Tyumen Oblast', 'Udmurt Republic',
    'Ulyanovsk Oblast', 'Vladimir Oblast', 'Volgograd Oblast', 'Vologda Oblast',
    'Voronezh Oblast', 'Yamalo-Nenets Autonomous Okrug', 'Yaroslavl Oblast', 'Zabaykalsky Krai',
  ],
  BD: [
    'Barisal', 'Chittagong', 'Dhaka', 'Khulna', 'Mymensingh',
    'Rajshahi', 'Rangpur', 'Sylhet',
  ],
  LK: [
    'Central', 'Eastern', 'North Central', 'North Western', 'Northern',
    'Sabaragamuwa', 'Southern', 'Uva', 'Western',
  ],
  NP: [
    'Bagmati', 'Gandaki', 'Karnali', 'Koshi', 'Lumbini',
    'Madhesh', 'Sudurpashchim',
  ],
  ID: [
    'Aceh', 'Bali', 'Bangka Belitung Islands', 'Banten', 'Bengkulu',
    'Central Java', 'Central Kalimantan', 'Central Sulawesi', 'East Java',
    'East Kalimantan', 'East Nusa Tenggara', 'Gorontalo', 'Jakarta',
    'Jambi', 'Lampung', 'Maluku', 'North Kalimantan', 'North Maluku',
    'North Sulawesi', 'North Sumatra', 'Papua', 'Riau', 'Riau Islands',
    'South Kalimantan', 'South Sulawesi', 'South Sumatra', 'Southeast Sulawesi',
    'West Java', 'West Kalimantan', 'West Nusa Tenggara', 'West Papua',
    'West Sulawesi', 'West Sumatra', 'Yogyakarta',
  ],
  PH: [
    'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay',
    'Antique', 'Apayao', 'Aurora', 'Basilan', 'Bataan', 'Batanes',
    'Batangas', 'Benguet', 'Biliran', 'Bohol', 'Bukidnon', 'Bulacan',
    'Cagayan', 'Camarines Norte', 'Camarines Sur', 'Camiguin', 'Capiz',
    'Catanduanes', 'Cavite', 'Cebu', 'Compostela Valley', 'Cotabato',
    'Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental',
    'Davao Oriental', 'Dinagat Islands', 'Eastern Samar', 'Guimaras',
    'Ifugao', 'Ilocos Norte', 'Ilocos Sur', 'Iloilo', 'Isabela', 'Kalinga',
    'La Union', 'Laguna', 'Lanao del Norte', 'Lanao del Sur', 'Leyte',
    'Maguindanao', 'Marinduque', 'Masbate', 'Metro Manila', 'Misamis Occidental',
    'Misamis Oriental', 'Mountain Province', 'Negros Occidental', 'Negros Oriental',
    'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya', 'Occidental Mindoro',
    'Oriental Mindoro', 'Palawan', 'Pampanga', 'Pangasinan', 'Quezon',
    'Quirino', 'Rizal', 'Romblon', 'Samar', 'Sarangani', 'Siquijor',
    'Sorsogon', 'South Cotabato', 'Southern Leyte', 'Sultan Kudarat',
    'Sulu', 'Surigao del Norte', 'Surigao del Sur', 'Tarlac', 'Tawi-Tawi',
    'Zambales', 'Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay',
  ],
  GR: [
    'Attica', 'Central Greece', 'Central Macedonia', 'Crete', 'Eastern Macedonia and Thrace',
    'Epirus', 'Ionian Islands', 'North Aegean', 'Peloponnese', 'South Aegean',
    'Thessaly', 'Western Greece', 'Western Macedonia',
  ],
  PT: [
    'Aveiro', 'Azores', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
    'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisbon', 'Madeira',
    'Portalegre', 'Porto', 'Santarém', 'Setúbal', 'Viana do Castelo',
    'Vila Real', 'Viseu',
  ],
  PL: [
    'Greater Poland', 'Kuyavian-Pomeranian', 'Lesser Poland', 'Lodz',
    'Lower Silesian', 'Lublin', 'Lubusz', 'Masovian', 'Opole',
    'Podlaskie', 'Pomeranian', 'Silesian', 'Subcarpathian', 'Swietokrzyskie',
    'Warmian-Masurian', 'West Pomeranian',
  ],
  IE: [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway',
    'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick',
    'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
    'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow',
  ],
  NG: [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti',
    'Enugu', 'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
    'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
    'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
    'Taraba', 'Yobe', 'Zamfara',
  ],
  KE: [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu',
    'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
    'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale',
    'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
    'Meru', 'Migori', 'Mombasa', 'Muranga', 'Nairobi', 'Nakuru', 'Nandi',
    'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya',
    'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans-Nzoia', 'Turkana',
    'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
  ],
  SG: ['Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region'],
};

function CountryCombobox({ value, onChange, disabled, error }) {
  const [open, setOpen] = useState(false);
  const selected = COUNTRIES.find((c) => c.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal h-9 px-3 text-sm',
            !selected && 'text-muted-foreground',
            error && 'border-red-500'
          )}
        >
          {selected ? selected.name : 'Select country...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverPrimitive.Content
        align="start"
        sideOffset={4}
        className={cn(
          'z-[500] w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] p-0 rounded-md border bg-white text-gray-900 shadow-md outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command className="bg-white">
          <CommandInput placeholder="Search country..." />
          <CommandList className="max-h-48 overflow-y-auto">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    onChange(country.code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === country.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {country.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverPrimitive.Content>
    </Popover>
  );
}

function StateField({ countryCode, value, onChange, disabled, error }) {
  const states = STATES_BY_COUNTRY[countryCode];

  if (states) {
    return (
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={cn('h-9', error && 'border-red-500')}>
          <SelectValue placeholder="Select state..." />
        </SelectTrigger>
        <SelectContent className="z-[500] bg-white text-gray-900 max-h-48 overflow-y-auto max-w-[calc(100vw-2rem)]">
          {states.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      name="state"
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="State / Province"
      disabled={disabled}
      className={error ? 'border-red-500' : ''}
    />
  );
}

function resolveInitialCountryCode(initialData) {
  if (!initialData?.country) return '';
  // Already an ISO code (2-letter uppercase)
  if (/^[A-Z]{2}$/.test(initialData.country)) return initialData.country;
  // Look up by name
  const match = COUNTRIES.find(
    (c) => c.name.toLowerCase() === initialData.country.toLowerCase()
  );
  return match?.code || '';
}

export default function AddressForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zip: initialData?.zip || '',
    countryCode: resolveInitialCountryCode(initialData),
  });

  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [isZipLookingUp, setIsZipLookingUp] = useState(false);
  const [zipHint, setZipHint] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'zip') setZipHint('');
  };

  const handleCountryChange = (code) => {
    setFormData((prev) => ({ ...prev, countryCode: code, state: '' }));
    if (errors.countryCode) setErrors((prev) => ({ ...prev, countryCode: '' }));
  };

  const handleStateChange = (val) => {
    setFormData((prev) => ({ ...prev, state: val }));
    if (errors.state) setErrors((prev) => ({ ...prev, state: '' }));
  };

  const handleZipBlur = async () => {
    const zip = formData.zip.trim();
    if (!zip || !formData.countryCode) return;

    setIsZipLookingUp(true);
    setZipHint('');
    try {
      if (formData.countryCode === 'IN') {
        const response = await fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(zip)}`);
        if (response.ok) {
          const data = await response.json();
          if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            const city = po.District || po.Name || '';
            const state = po.State || '';
            setFormData((prev) => ({
              ...prev,
              ...(city && { city }),
              ...(state && { state }),
            }));
            if (city) setErrors((prev) => ({ ...prev, city: '', state: '' }));
          } else {
            setZipHint('PIN code not found. Please enter your city and state manually.');
          }
        } else {
          setZipHint('PIN code not found. Please enter your city and state manually.');
        }
        return;
      }

      const apiKey = import.meta.env.VITE_API_NINJAS_KEY;
      if (!apiKey) return;
      const url = `https://api.api-ninjas.com/v1/zipcode?zip=${encodeURIComponent(zip)}&country=${formData.countryCode}`;
      const response = await fetch(url, { headers: { 'X-Api-Key': apiKey } });
      if (response.ok) {
        const data = await response.json();
        const entry = Array.isArray(data) && data.length > 0 ? data[0] : null;
        if (entry?.city) {
          setFormData((prev) => ({
            ...prev,
            city: entry.city,
            ...(entry.state && { state: entry.state }),
          }));
          setErrors((prev) => ({ ...prev, city: '', ...(entry.state && { state: '' }) }));
        } else {
          setZipHint('ZIP code not found. Please enter your city manually.');
        }
      } else {
        setZipHint('ZIP code not found. Please enter your city manually.');
      }
    } catch {
      // Network failure — skip silently
    } finally {
      setIsZipLookingUp(false);
    }
  };

  const validateAddress = async () => {
    const newErrors = {};

    if (!formData.countryCode) {
      newErrors.countryCode = 'Please select a country.';
    }

    if (!formData.state?.trim()) {
      newErrors.state = 'State/Province is required.';
    }

    if (formData.countryCode && !formData.zip.trim()) {
      newErrors.zip = 'ZIP/postal code is required.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsValidating(true);
    const validationErrors = await validateAddress();
    setIsValidating(false);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const countryName = COUNTRIES.find((c) => c.code === formData.countryCode)?.name || formData.countryCode;
    const { countryCode: _code, ...rest } = formData;
    onSubmit({ ...rest, country: countryName });
  };

  const busy = isLoading || isValidating;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Country *</Label>
        <CountryCombobox
          value={formData.countryCode}
          onChange={handleCountryChange}
          disabled={busy}
          error={errors.countryCode}
        />
        {errors.countryCode && <p className="text-xs text-red-500">{errors.countryCode}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Street Address *</Label>
        <Input
          id="address"
          name="address"
          required
          value={formData.address}
          onChange={handleChange}
          placeholder="123 Main St, Apt 4B"
          disabled={busy}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            placeholder="Mumbai"
            disabled={busy}
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
        </div>
        <div className="space-y-2">
          <Label>State / Province *</Label>
          <StateField
            countryCode={formData.countryCode}
            value={formData.state}
            onChange={handleStateChange}
            disabled={busy}
            error={errors.state}
          />
          {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zip">ZIP / Postal Code *</Label>
        <div className="relative">
          <Input
            id="zip"
            name="zip"
            required
            value={formData.zip}
            onChange={handleChange}
            onBlur={handleZipBlur}
            placeholder="400001"
            disabled={busy}
            className={errors.zip ? 'border-red-500' : ''}
          />
          {isZipLookingUp && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {errors.zip && <p className="text-xs text-red-500">{errors.zip}</p>}
        {zipHint && !errors.zip && <p className="text-xs text-amber-600">{zipHint}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={busy}
          className="bg-[var(--ink)] text-white hover:bg-[var(--ink)]/90"
        >
          {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData ? 'Save Changes' : 'Add Address'}
        </Button>
      </div>
    </form>
  );
}