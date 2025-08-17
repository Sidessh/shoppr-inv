import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface AddressSuggestion {
  id: string;
  display_name: string;
  formatted: string;
}

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  autoComplete?: string;
}

// Mock Indian addresses for autocomplete (in real app, you'd use Google Places API or similar)
const mockAddresses = [
  { id: '1', display_name: 'Koramangala, Bangalore, Karnataka 560034', formatted: 'Koramangala, Bangalore, Karnataka 560034' },
  { id: '2', display_name: 'Whitefield, Bangalore, Karnataka 560066', formatted: 'Whitefield, Bangalore, Karnataka 560066' },
  { id: '3', display_name: 'Electronic City, Bangalore, Karnataka 560100', formatted: 'Electronic City, Bangalore, Karnataka 560100' },
  { id: '4', display_name: 'Indiranagar, Bangalore, Karnataka 560038', formatted: 'Indiranagar, Bangalore, Karnataka 560038' },
  { id: '5', display_name: 'HSR Layout, Bangalore, Karnataka 560102', formatted: 'HSR Layout, Bangalore, Karnataka 560102' },
  { id: '6', display_name: 'Jayanagar, Bangalore, Karnataka 560011', formatted: 'Jayanagar, Bangalore, Karnataka 560011' },
  { id: '7', display_name: 'Marathahalli, Bangalore, Karnataka 560037', formatted: 'Marathahalli, Bangalore, Karnataka 560037' },
  { id: '8', display_name: 'BTM Layout, Bangalore, Karnataka 560029', formatted: 'BTM Layout, Bangalore, Karnataka 560029' },
  { id: '9', display_name: 'Rajajinagar, Bangalore, Karnataka 560010', formatted: 'Rajajinagar, Bangalore, Karnataka 560010' },
  { id: '10', display_name: 'Malleswaram, Bangalore, Karnataka 560003', formatted: 'Malleswaram, Bangalore, Karnataka 560003' },
  { id: '11', display_name: 'Connaught Place, New Delhi, Delhi 110001', formatted: 'Connaught Place, New Delhi, Delhi 110001' },
  { id: '12', display_name: 'Karol Bagh, New Delhi, Delhi 110005', formatted: 'Karol Bagh, New Delhi, Delhi 110005' },
  { id: '13', display_name: 'Lajpat Nagar, New Delhi, Delhi 110024', formatted: 'Lajpat Nagar, New Delhi, Delhi 110024' },
  { id: '14', display_name: 'Andheri West, Mumbai, Maharashtra 400058', formatted: 'Andheri West, Mumbai, Maharashtra 400058' },
  { id: '15', display_name: 'Bandra West, Mumbai, Maharashtra 400050', formatted: 'Bandra West, Mumbai, Maharashtra 400050' },
  { id: '16', display_name: 'Powai, Mumbai, Maharashtra 400076', formatted: 'Powai, Mumbai, Maharashtra 400076' },
  { id: '17', display_name: 'Salt Lake, Kolkata, West Bengal 700064', formatted: 'Salt Lake, Kolkata, West Bengal 700064' },
  { id: '18', display_name: 'Park Street, Kolkata, West Bengal 700016', formatted: 'Park Street, Kolkata, West Bengal 700016' },
  { id: '19', display_name: 'T. Nagar, Chennai, Tamil Nadu 600017', formatted: 'T. Nagar, Chennai, Tamil Nadu 600017' },
  { id: '20', display_name: 'Anna Nagar, Chennai, Tamil Nadu 600040', formatted: 'Anna Nagar, Chennai, Tamil Nadu 600040' }
];

export function AddressInput({ 
  value, 
  onChange, 
  placeholder = "Enter your address", 
  className, 
  id,
  autoComplete = "address-line1"
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const searchAddresses = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter mock addresses
    const filtered = mockAddresses.filter(addr => 
      addr.display_name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setIsLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    searchAddresses(newValue);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    onChange(suggestion.formatted);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={className}
      />
      
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              Searching addresses...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.display_name}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No addresses found
            </div>
          )}
        </div>
      )}
    </div>
  );
}



