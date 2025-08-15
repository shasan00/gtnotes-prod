import React, { useMemo } from "react";
import Layout from "@/components/Layout";
import NoteCard from "@/components/NoteCard";
import { useNotes } from "@/hooks/useNotes";
import Sidebar from "@/components/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchFilter } from "@/context/SearchFilterContext";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Function to check if a note matches all selected filters
const matchesFilters = (note: any, filters: {
  searchQuery: string;
  selectedCourses: string[];
  selectedProfessors: string[];
  selectedSemesters: string[];
  selectedTypes: string[];
}) => {
  const {
    searchQuery,
    selectedCourses,
    selectedProfessors,
    selectedSemesters,
    selectedTypes,
  } = filters;

  // Convert search query to lowercase for case-insensitive matching
  const searchLower = searchQuery.toLowerCase();
  
  // Check if note matches search query
  const matchesSearch = !searchLower || 
    note.title.toLowerCase().includes(searchLower) ||
    note.course.toLowerCase().includes(searchLower) ||
    note.professor.toLowerCase().includes(searchLower) ||
    (note.description && note.description.toLowerCase().includes(searchLower));
  
  // Check if note matches all selected filters
  const matchesCourses = selectedCourses.length === 0 || 
    selectedCourses.includes(note.course);
    
  const matchesProfessors = selectedProfessors.length === 0 || 
    selectedProfessors.includes(note.professor);
    
  const matchesSemesters = selectedSemesters.length === 0 || 
    selectedSemesters.includes(note.semester);
    
  const matchesTypes = selectedTypes.length === 0 || 
    (note.type && selectedTypes.includes(note.type));
  
  return matchesSearch && matchesCourses && matchesProfessors && 
         matchesSemesters && matchesTypes;
};

const Index = () => {
  const { notes, loading, error, refreshNotes } = useNotes();
  const {
    searchQuery,
    selectedCourses,
    selectedProfessors,
    selectedSemesters,
    selectedTypes,
  } = useSearchFilter();
  
  // Filter notes based on search query and selected filters
  const filteredNotes = useMemo(() => {
    if (!notes?.length) return [];
    
    return notes.filter(note => 
      matchesFilters(note, {
        searchQuery,
        selectedCourses,
        selectedProfessors,
        selectedSemesters,
        selectedTypes,
      })
    );
  }, [notes, searchQuery, selectedCourses, selectedProfessors, selectedSemesters, selectedTypes]);
  
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
    
    return {
      courses: Array.from(unique.courses).sort(),
      professors: Array.from(unique.professors).sort(),
      semesters: Array.from(unique.semesters).sort().reverse(),
      types: Array.from(unique.types).sort(),
    };
  }, [notes]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-screen-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-full max-w-sm">
                <Skeleton className="h-64 w-full" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-screen-2xl">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error loading notes: {error}</p>
            <button 
              onClick={refreshNotes}
              className="px-4 py-2 bg-gt-gold text-white rounded hover:bg-gt-gold/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-screen-2xl">
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No notes available yet.</p>
            <p className="text-sm text-gray-500">Be the first to upload some notes!</p>
          </div>
        ) : (
          <div className="w-full">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} found
                {searchQuery || selectedCourses.length > 0 || selectedProfessors.length > 0 || 
                 selectedSemesters.length > 0 || selectedTypes.length > 0 ? ' matching filters' : ''}
              </h2>
            </div>
            
            {filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {filteredNotes.map((note) => (
                  <NoteCard 
                    key={note.id} 
                    id={note.id}
                    title={note.title}
                    description={note.description}
                    course={note.course}
                    professor={note.professor}
                    semester={note.semester}
                    status={note.status}
                    fileName={note.fileName}
                    createdAt={note.createdAt}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No notes found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {notes.length > 0 
                    ? "Try adjusting your search or filter criteria"
                    : "No notes have been uploaded yet. Be the first to upload some!"
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;