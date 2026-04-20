import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

// Maps common country names/aliases to ISO 3166-1 alpha-2 codes
// (Zippopotam.us uses these codes)
const COUNTRY_ISO_MAP = {
  'india': 'IN',
  'united states': 'US',
  'united states of america': 'US',
  'usa': 'US',
  'us': 'US',
  'united kingdom': 'GB',
  'uk': 'GB',
  'great britain': 'GB',
  'england': 'GB',
  'australia': 'AU',
  'canada': 'CA',
  'germany': 'DE',
  'france': 'FR',
  'japan': 'JP',
  'china': 'CN',
  'brazil': 'BR',
  'mexico': 'MX',
  'italy': 'IT',
  'spain': 'ES',
  'netherlands': 'NL',
  'sweden': 'SE',
  'norway': 'NO',
  'denmark': 'DK',
  'finland': 'FI',
  'switzerland': 'CH',
  'austria': 'AT',
  'belgium': 'BE',
  'portugal': 'PT',
  'poland': 'PL',
  'russia': 'RU',
  'south africa': 'ZA',
  'new zealand': 'NZ',
  'singapore': 'SG',
  'thailand': 'TH',
  'south korea': 'KR',
  'korea': 'KR',
  'philippines': 'PH',
  'indonesia': 'ID',
  'malaysia': 'MY',
  'pakistan': 'PK',
  'bangladesh': 'BD',
  'sri lanka': 'LK',
  'nepal': 'NP',
  'argentina': 'AR',
  'colombia': 'CO',
  'chile': 'CL',
  'peru': 'PE',
  'turkey': 'TR',
  'egypt': 'EG',
  'nigeria': 'NG',
  'kenya': 'KE',
  'ghana': 'GH',
  'czech republic': 'CZ',
  'czechia': 'CZ',
  'hungary': 'HU',
  'romania': 'RO',
  'ukraine': 'UA',
  'israel': 'IL',
  'united arab emirates': 'AE',
  'uae': 'AE',
  'saudi arabia': 'SA',
  'ireland': 'IE',
  'greece': 'GR',
  'croatia': 'HR',
  'slovakia': 'SK',
  'slovenia': 'SI',
  'bulgaria': 'BG',
  'latvia': 'LV',
  'lithuania': 'LT',
  'estonia': 'EE',
  'luxembourg': 'LU',
  'iceland': 'IS',
  'moldova': 'MD',
  'serbia': 'RS',
  'bosnia': 'BA',
  'albania': 'AL',
  'north macedonia': 'MK',
  'macedonia': 'MK',
  'cyprus': 'CY',
  'malta': 'MT',
  'liechtenstein': 'LI',
  'monaco': 'MC',
  'andorra': 'AD',
  'san marino': 'SM',
  'vatican': 'VA',
  'hong kong': 'HK',
  'taiwan': 'TW',
  'vietnam': 'VN',
  'myanmar': 'MM',
  'cambodia': 'KH',
  'laos': 'LA',
  'mongolia': 'MN',
  'kazakhstan': 'KZ',
  'uzbekistan': 'UZ',
  'iran': 'IR',
  'iraq': 'IQ',
  'jordan': 'JO',
  'kuwait': 'KW',
  'bahrain': 'BH',
  'qatar': 'QA',
  'oman': 'OM',
  'yemen': 'YE',
  'lebanon': 'LB',
  'syria': 'SY',
  'afghanistan': 'AF',
  'ethiopia': 'ET',
  'tanzania': 'TZ',
  'uganda': 'UG',
  'mozambique': 'MZ',
  'zambia': 'ZM',
  'zimbabwe': 'ZW',
  'cameroon': 'CM',
  'ivory coast': 'CI',
  'senegal': 'SN',
  'morocco': 'MA',
  'algeria': 'DZ',
  'tunisia': 'TN',
  'libya': 'LY',
  'sudan': 'SD',
  'cuba': 'CU',
  'dominican republic': 'DO',
  'haiti': 'HT',
  'jamaica': 'JM',
  'trinidad and tobago': 'TT',
  'puerto rico': 'PR',
  'venezuela': 'VE',
  'ecuador': 'EC',
  'bolivia': 'BO',
  'paraguay': 'PY',
  'uruguay': 'UY',
  'guatemala': 'GT',
  'honduras': 'HN',
  'el salvador': 'SV',
  'nicaragua': 'NI',
  'costa rica': 'CR',
  'panama': 'PA',
};

function resolveCountryCode(countryInput) {
  return COUNTRY_ISO_MAP[countryInput.trim().toLowerCase()] || null;
}

// Normalize city name for fuzzy comparison
function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default function AddressForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zip: initialData?.zip || '',
    country: initialData?.country || '',
  });

  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for that field on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateAddress = async () => {
    const newErrors = {};

    // --- Country validation ---
    const isoCode = resolveCountryCode(formData.country);
    if (!isoCode) {
      newErrors.country = 'Please enter a valid country name (e.g. India, United States).';
    }

    // --- ZIP + City validation via Zippopotam.us ---
    if (isoCode && formData.zip.trim()) {
      try {
        const response = await fetch(
          `https://api.zippopotam.us/${isoCode}/${formData.zip.trim()}`
        );

        if (!response.ok) {
          // 404 means the ZIP does not exist in that country
          newErrors.zip = `ZIP/postal code "${formData.zip}" does not exist in ${formData.country}.`;
        } else {
          const data = await response.json();
          const returnedCities = data.places.map((p) => p['place name']);
          const enteredCityNorm = normalizeName(formData.city);

          const cityMatches = returnedCities.some((c) => {
            const cn = normalizeName(c);
            return cn.includes(enteredCityNorm) || enteredCityNorm.includes(cn);
          });

          if (!cityMatches && formData.city.trim()) {
            newErrors.city = `City doesn't match this ZIP code. Found: ${returnedCities.join(', ')}.`;
          }

          // Also cross-check the state if the API returns it
          const returnedStates = [
            ...new Set(data.places.map((p) => p['state'])),
          ];
          const enteredStateNorm = normalizeName(formData.state);
          const stateMatches = returnedStates.some((s) => {
            const sn = normalizeName(s);
            return sn.includes(enteredStateNorm) || enteredStateNorm.includes(sn);
          });

          if (!stateMatches && formData.state.trim() && returnedStates.length > 0) {
            newErrors.state = `State doesn't match this ZIP code. Found: ${returnedStates.join(', ')}.`;
          }
        }
      } catch {
        // Network failure — skip API validation silently so users aren't blocked offline
      }
    } else if (isoCode && !formData.zip.trim()) {
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

    onSubmit(formData);
  };

  const busy = isLoading || isValidating;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
          {errors.city && (
            <p className="text-xs text-red-500">{errors.city}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State/Province *</Label>
          <Input
            id="state"
            name="state"
            required
            value={formData.state}
            onChange={handleChange}
            placeholder="Maharashtra"
            disabled={busy}
            className={errors.state ? 'border-red-500' : ''}
          />
          {errors.state && (
            <p className="text-xs text-red-500">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP / Postal Code *</Label>
          <Input
            id="zip"
            name="zip"
            required
            value={formData.zip}
            onChange={handleChange}
            placeholder="400001"
            disabled={busy}
            className={errors.zip ? 'border-red-500' : ''}
          />
          {errors.zip && (
            <p className="text-xs text-red-500">{errors.zip}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            name="country"
            required
            value={formData.country}
            onChange={handleChange}
            placeholder="India"
            disabled={busy}
            className={errors.country ? 'border-red-500' : ''}
          />
          {errors.country && (
            <p className="text-xs text-red-500">{errors.country}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={busy}
        >
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