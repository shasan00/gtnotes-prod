import React, { createContext, useContext, useState, ReactNode } from 'react';

type SearchFilterContextType = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCourses: string[];
  setSelectedCourses: React.Dispatch<React.SetStateAction<string[]>>;
  selectedProfessors: string[];
  setSelectedProfessors: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSemesters: string[];
  setSelectedSemesters: React.Dispatch<React.SetStateAction<string[]>>;
  selectedTypes: string[];
  setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
  clearAllFilters: () => void;
};

const SearchFilterContext = createContext<SearchFilterContextType | undefined>(undefined);

export const SearchFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCourses([]);
    setSelectedProfessors([]);
    setSelectedSemesters([]);
    setSelectedTypes([]);
  };

  return (
    <SearchFilterContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        selectedCourses,
        setSelectedCourses,
        selectedProfessors,
        setSelectedProfessors,
        selectedSemesters,
        setSelectedSemesters,
        selectedTypes,
        setSelectedTypes,
        clearAllFilters,
      }}
    >
      {children}
    </SearchFilterContext.Provider>
  );
};

export const useSearchFilter = () => {
  const context = useContext(SearchFilterContext);
  if (context === undefined) {
    throw new Error('useSearchFilter must be used within a SearchFilterProvider');
  }
  return context;
};
