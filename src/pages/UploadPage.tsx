import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/components/ui/use-toast";
import { 
  validateSemester, 
  validateCourse, 
  validateProfessorName, 
  type ValidationResult 
} from "@/utils/validation";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    professor: "",
    semester: "",
    description: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    course: "",
    professor: "",
    semester: "",
  });


  const [formatTimers, setFormatTimers] = useState<{[key: string]: NodeJS.Timeout}>({});

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(formatTimers).forEach(timer => clearTimeout(timer));
    };
  }, [formatTimers]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any existing timer for this field
    if (formatTimers[name]) {
      clearTimeout(formatTimers[name]);
    }
    
    // Real-time validation
    if (name === 'course') {
      const validation = validateCourse(value);
      setValidationErrors(prev => ({
        ...prev,
        course: validation.isValid ? "" : validation.message || ""
      }));
      
      // Auto-format if valid - only if user stopped typing for 1.5 seconds and field looks complete
      if (validation.isValid && validation.formatted && validation.formatted !== value) {
        const timer = setTimeout(() => {
          // Only format if the value hasn't changed and appears to be a complete entry
          setFormData(current => {
            if (current.course === value) {
              return {
                ...current,
                course: validation.formatted!
              };
            }
            return current;
          });
        }, 1500); // Longer delay to ensure user is done typing
        
        setFormatTimers(prev => ({ ...prev, course: timer }));
      }
    } else if (name === 'professor') {
      const validation = validateProfessorName(value);
      setValidationErrors(prev => ({
        ...prev,
        professor: validation.isValid ? "" : validation.message || ""
      }));
      
      // Only auto-format professor names when they appear complete (more than just first name)
      // and user has stopped typing for a longer period
      if (validation.isValid && validation.formatted && validation.formatted !== value) {
        // Check if this looks like a complete name (has at least 2 words)
        const wordCount = value.trim().split(/\s+/).length;
        if (wordCount >= 2) {
          const timer = setTimeout(() => {
            // Double-check the value hasn't changed before formatting
            setFormData(current => {
              if (current.professor === value) {
                return {
                  ...current,
                  professor: validation.formatted!
                };
              }
              return current;
            });
          }, 2000); // Even longer delay for names to avoid interrupting typing
          
          setFormatTimers(prev => ({ ...prev, professor: timer }));
        }
      }
    } else if (name === 'semester') {
      const validation = validateSemester(value);
      setValidationErrors(prev => ({
        ...prev,
        semester: validation.isValid ? "" : validation.message || ""
      }));
      
      // autoformats if valid - only if user stopped typing for 1.5 seconds
      if (validation.isValid && validation.formatted && validation.formatted !== value) {
        const timer = setTimeout(() => {
          // only formats if the value hasn't changed
          setFormData(current => {
            if (current.semester === value) {
              return {
                ...current,
                semester: validation.formatted!
              };
            }
            return current;
          });
        }, 1500); // delay to ensure user is done typing
        
        setFormatTimers(prev => ({ ...prev, semester: timer }));
      }
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear any pending timer for this field
    if (formatTimers[name]) {
      clearTimeout(formatTimers[name]);
      setFormatTimers(prev => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }
    
    // Format immediately on blur if valid
    if (name === 'course') {
      const validation = validateCourse(value);
      if (validation.isValid && validation.formatted && validation.formatted !== value) {
        setFormData(prev => ({
          ...prev,
          course: validation.formatted!
        }));
      }
    } else if (name === 'professor') {
      const validation = validateProfessorName(value);
      if (validation.isValid && validation.formatted && validation.formatted !== value) {
        setFormData(prev => ({
          ...prev,
          professor: validation.formatted!
        }));
      }
    } else if (name === 'semester') {
      const validation = validateSemester(value);
      if (validation.isValid && validation.formatted && validation.formatted !== value) {
        setFormData(prev => ({
          ...prev,
          semester: validation.formatted!
        }));
      }
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for semester when selected
    if (name === 'semester') {
      setValidationErrors(prev => ({
        ...prev,
        semester: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Validate all fields before submission
    const courseValidation = validateCourse(formData.course);
    const professorValidation = validateProfessorName(formData.professor);
    const semesterValidation = validateSemester(formData.semester);
    
    const errors = {
      course: courseValidation.isValid ? "" : courseValidation.message || "",
      professor: professorValidation.isValid ? "" : professorValidation.message || "",
      semester: semesterValidation.isValid ? "" : semesterValidation.message || "",
    };
    
    setValidationErrors(errors);
    
    // Don't submit if there are validation errors
    if (errors.course || errors.professor || errors.semester) {
      toast({
        title: "Validation Error",
        description: "Please correct the highlighted fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('course', courseValidation.formatted || formData.course);
      formDataToSend.append('professor', professorValidation.formatted || formData.professor);
      formDataToSend.append('semester', formData.semester);
      formDataToSend.append('description', formData.description);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required. Please sign in again.');
      }

      const response = await fetch('/api/notes/upload', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      // Show success toast
      toast({
        title: "Success!",
        description: "Your notes have been uploaded successfully.",
        variant: "default",
      });
      
      // Trigger a custom event to notify other components that notes have been updated
      window.dispatchEvent(new CustomEvent('notesUpdated'));
      
      // Reset form after successful upload
      setFile(null);
      setFormData({
        title: "",
        course: "",
        professor: "",
        semester: "",
        description: "",
      });
      setValidationErrors({
        course: "",
        professor: "",
        semester: "",
      });
    } catch (error: any) {
      console.error("Upload failed:", error);
      alert(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <>
    <Header />
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 text-gt-gold">Upload Notes</h1>
        <p className="text-center text-muted-foreground mb-8">
          Share your study materials with the GT community
        </p>

        <form onSubmit={handleSubmit}>
          <Card className="border-gt-gold/20">
            <CardHeader>
              <CardTitle className="text-gt-gold">Upload Your File</CardTitle>
              <CardDescription>
                Upload your lecture notes, study guides, or other course materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Dropzone */}
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-gt-gold bg-gt-gold/5' : 'border-gray-300 hover:border-gt-gold/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-10 w-10 text-gt-gold mb-2" />
                  {isDragActive ? (
                    <p className="text-gt-gold font-medium">Drop the file here</p>
                  ) : (
                    <>
                      <p className="font-medium">Drag & drop a file here, or click to select</p>
                      <p className="text-sm text-muted-foreground">PDF files only (Max 10MB)</p>
                    </>
                  )}
                </div>
              </div>

              {/* Selected File Preview */}
              {file && (
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gt-gold" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gt-gold">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Lecture 4 Notes"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course" className="text-gt-gold">Course</Label>
                  <Input
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="e.g., CS 1301"
                    className={validationErrors.course ? "border-red-500" : ""}
                    required
                  />
                  {validationErrors.course && (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.course}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Format: SUBJECT NUMBER (e.g., "CS 1301", "ECE 2040")
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professor" className="text-gt-gold">Professor</Label>
                  <Input
                    id="professor"
                    name="professor"
                    value={formData.professor}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="e.g., Jane Smith"
                    className={validationErrors.professor ? "border-red-500" : ""}
                    required
                  />
                  {validationErrors.professor && (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.professor}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter first and last name without titles (e.g., "Jane Smith", "John Q. Smith")
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester" className="text-gt-gold">Semester</Label>
                <Input
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="e.g., Fall 2025"
                  className={validationErrors.semester ? "border-red-500" : ""}
                  required
                />
                {validationErrors.semester && (
                  <div className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.semester}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Format: Term Year (e.g., "Fall 2025", "Summer 2021")
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gt-gold">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add a brief description of your notes..."
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                disabled={isUploading || !file}
                className="bg-gt-gold hover:bg-gt-gold/90 text-white"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Upload Notes'
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>By uploading, you agree to our community guidelines and confirm that you have the right to share this content.</p>
        </div>
      </div>
    </div>
    </>
  );
}
