import { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '@/hooks/use-vehicles';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  performSearch: () => void;
  searchResults: any[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { data: vehicles } = useVehicles();

  const performSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Search in vehicles
    const matchingVehicles = vehicles?.filter(v => 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vin_masked.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model_code.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (matchingVehicles.length > 0) {
      // Navigate to first matching vehicle
      navigate(`/vehicles/${matchingVehicles[0].id}`);
      setSearchQuery('');
    }
  };

  return (
    <SearchContext.Provider value={{ 
      searchQuery, 
      setSearchQuery, 
      performSearch,
      searchResults: []
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
