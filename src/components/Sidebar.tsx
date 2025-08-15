import React, { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchFilter } from "@/context/SearchFilterContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNotes } from "@/hooks/useNotes";
import { semesterValueToLabel } from "@/utils/validation";

// Fallback data for filters (used when no notes are available)
const FALLBACK_TYPES = ["Lecture Notes", "Study Guides", "Practice Exams", "Homework"];

interface FilterSectionProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  items,
  selectedItems,
  onToggle,
  searchTerm,
  onSearchChange,
  placeholder,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3 py-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-sm font-medium text-foreground"
      >
        <span className="text-gt-gold font-semibold">{title}</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gt-gold" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gt-gold" />
        )}
      </button>
      
      {isExpanded && (
        <div className="space-y-2 pl-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 py-1 h-9 text-sm"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    id={`${title}-${item}`}
                    checked={selectedItems.includes(item)}
                    onChange={() => onToggle(item)}
                    className="h-4 w-4 rounded border-gray-300 text-gt-gold focus:ring-gt-gold"
                  />
                  <label
                    htmlFor={`${title}-${item}`}
                    className="text-sm text-muted-foreground hover:text-foreground cursor-pointer flex-1 truncate"
                  >
                    {item}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-2">No results found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const {
    selectedCourses,
    setSelectedCourses,
    selectedProfessors,
    setSelectedProfessors,
    selectedSemesters,
    setSelectedSemesters,
    selectedTypes,
    setSelectedTypes,
    clearAllFilters,
  } = useSearchFilter();
  
  const { notes } = useNotes();
  
  // Get unique values for filters based on current notes
  const { courses, professors, semesters, types } = useMemo(() => {
    const unique = {
      courses: new Set<string>(),
      professors: new Set<string>(),
      semesters: new Set<string>(),
      types: new Set<string>(),
    };
    
    notes?.forEach(note => {
      if (note.course) unique.courses.add(note.course);
      if (note.professor) unique.professors.add(note.professor);
      if (note.semester) unique.semesters.add(note.semester);
      if (note.type) unique.types.add(note.type);
    });
    
    const semesterList = Array.from(unique.semesters)
      .map(semester => semesterValueToLabel(semester)) // Convert 'spring-2025' to 'Spring 2025'
      .sort()
      .reverse() // Most recent first
      .slice(0, 4); // Limit to exactly 4 items
    
    console.log('Semester filter items:', semesterList.length, semesterList); // Debug log
    
    return {
      courses: Array.from(unique.courses).sort().slice(0, 4), // Limit to 4 items
      professors: Array.from(unique.professors).sort().slice(0, 4), // Limit to 4 items
      semesters: semesterList,
      types: Array.from(unique.types).length > 0 ? Array.from(unique.types).sort().slice(0, 4) : FALLBACK_TYPES,
    };
  }, [notes]);
  
  const [searchTerm, setSearchTerm] = useState({
    courses: "",
    professors: "",
    semesters: "",
    types: "",
  });
  
  // Clear local search terms when filters are cleared
  useEffect(() => {
    if (selectedCourses.length === 0 && 
        selectedProfessors.length === 0 && 
        selectedSemesters.length === 0 && 
        selectedTypes.length === 0) {
      setSearchTerm({
        courses: "",
        professors: "",
        semesters: "",
        types: "",
      });
    }
  }, [selectedCourses, selectedProfessors, selectedSemesters, selectedTypes]);

  const toggleCourse = (course: string) => {
    setSelectedCourses(prev =>
      prev.includes(course)
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  const toggleProfessor = (professor: string) => {
    setSelectedProfessors(prev =>
      prev.includes(professor)
        ? prev.filter(p => p !== professor)
        : [...prev, professor]
    );
  };

  const toggleSemester = (semester: string) => {
    setSelectedSemesters(prev =>
      prev.includes(semester)
        ? prev.filter(s => s !== semester)
        : [...prev, semester]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // clearAllFilters is now provided by the context

  const activeFilterCount = [
    ...selectedCourses,
    ...selectedProfessors,
    ...selectedSemesters,
    ...selectedTypes,
  ].length;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-72 border-r bg-card p-4 overflow-y-auto hidden md:block">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gt-gold">
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </h2>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {[...selectedCourses, ...selectedProfessors, ...selectedSemesters, ...selectedTypes].map(
              (filter) => (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="flex items-center gap-1 bg-gt-gold/10 text-foreground hover:bg-gt-gold/20"
                >
                  {filter}
                  <button
                    onClick={() => {
                      if (selectedCourses.includes(filter)) toggleCourse(filter);
                      if (selectedProfessors.includes(filter)) toggleProfessor(filter);
                      if (selectedSemesters.includes(filter)) toggleSemester(filter);
                      if (selectedTypes.includes(filter)) toggleType(filter);
                    }}
                    className="ml-1 rounded-full hover:bg-gt-gold/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            )}
          </div>
        )}

        <div className="space-y-6">
          <FilterSection
            title="Courses"
            items={courses}
            selectedItems={selectedCourses}
            onToggle={toggleCourse}
            searchTerm={searchTerm.courses}
            onSearchChange={(value) => setSearchTerm(prev => ({ ...prev, courses: value }))}
            placeholder="Search courses..."
          />

          <FilterSection
            title="Professors"
            items={professors}
            selectedItems={selectedProfessors}
            onToggle={toggleProfessor}
            searchTerm={searchTerm.professors}
            onSearchChange={(value) => setSearchTerm(prev => ({ ...prev, professors: value }))}
            placeholder="Search professors..."
          />

          <FilterSection
            title="Semesters"
            items={semesters}
            selectedItems={selectedSemesters}
            onToggle={toggleSemester}
            searchTerm={searchTerm.semesters}
            onSearchChange={(value) => setSearchTerm(prev => ({ ...prev, semesters: value }))}
            placeholder="Search semesters..."
          />

          {/* Document Types filter - commented out since it's not used in note filtering
          <FilterSection
            title="Document Types"
            items={types}
            selectedItems={selectedTypes}
            onToggle={toggleType}
            searchTerm={searchTerm.types}
            onSearchChange={(value) => setSearchTerm(prev => ({ ...prev, types: value }))}
            placeholder="Search types..."
          />
          */}
        </div>
      </aside>

      {/* Mobile filter trigger + sheet (rendered in flow; hidden on md+) */}
      <div className="md:hidden px-4 mb-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-center">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-6">
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {[...selectedCourses, ...selectedProfessors, ...selectedSemesters, ...selectedTypes].map(
                    (filter) => (
                      <Badge
                        key={filter}
                        variant="secondary"
                        className="flex items-center gap-1 bg-gt-gold/10 text-foreground hover:bg-gt-gold/20"
                      >
                        {filter}
                        <button
                          onClick={() => {
                            if (selectedCourses.includes(filter)) toggleCourse(filter);
                            if (selectedProfessors.includes(filter)) toggleProfessor(filter);
                            if (selectedSemesters.includes(filter)) toggleSemester(filter);
                            if (selectedTypes.includes(filter)) toggleType(filter);
                          }}
                          className="ml-1 rounded-full hover:bg-gt-gold/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                </div>
              )}

              <FilterSection
                title="Courses"
                items={courses}
                selectedItems={selectedCourses}
                onToggle={toggleCourse}
                searchTerm={searchTerm.courses}
                onSearchChange={(value) => setSearchTerm(prev => ({ ...prev, courses: value }))}
                placeholder="Search courses..."
              />

              <FilterSection
                title="Professors"
                items={professors}
                selectedItems={selectedProfessors}
                onToggle={toggleProfessor}
                searchTerm={searchTerm.professors}
                onSearchChange={(value) => setSearchTerm(prev => ({ ...prev, professors: value }))}
                placeholder="Search professors..."
              />

              <FilterSection
                title="Semesters"
                items={semesters}
                selectedItems={selectedSemesters}
                onToggle={toggleSemester}
                searchTerm={searchTerm.semesters}
                onSearchChange={(value) => setSearchTerm(prev => ({ ...prev, semesters: value }))}
                placeholder="Search semesters..."
              />

              {/* Document Types filter - commented out since it's not used in note filtering
              <FilterSection
                title="Document Types"
                items={types}
                selectedItems={selectedTypes}
                onToggle={toggleType}
                searchTerm={searchTerm.types}
                placeholder="Search types..."
              />
              */}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default Sidebar;