import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, User, CalendarDays, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { NotesService, Note } from '@/services/notesService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const formatSemester = (semester: string): string => {
  if (!semester) return '';
  const [season, year] = semester.split('-');
  if (!season || !year) return semester; // Return as is if format is unexpected
  
  // Capitalize first letter of season and add space before year
  return `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
};

const NoteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Parse JWT token to get user info
          const payload = JSON.parse(atob(token.split('.')[1]));
          setIsAdmin(payload?.role === 'admin');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    const fetchNote = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const response = await NotesService.getNoteById(id);
        if (!response || !response.note) {
          // If note not found, navigate to 404 or home
          navigate('/');
          return;
        }
        setNote(response.note);
      } catch (error) {
        console.error('Error fetching note:', error);
        toast.error('Failed to load note details');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
    fetchNote();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await NotesService.deleteNote(id);
      toast.success('Note deleted successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error(error.message || 'Failed to delete note');
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!note) {
    return (
      <Layout>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Note not found</h1>
          <Button asChild variant="link" className="mt-4">
            <RouterLink to="/">Go back to Home</RouterLink>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Button asChild variant="outline" className="mb-4">
          <RouterLink to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Notes
          </RouterLink>
        </Button>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold text-primary">{note.title}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2">{note.description}</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-gt-gold/10 text-gt-gold whitespace-nowrap">{note.type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <div className="flex items-center text-lg">
              <BookOpen className="h-5 w-5 mr-3 text-muted-foreground" />
              <span className="font-semibold mr-2">Class:</span>
              <span>{note.classCode || note.course}</span>
            </div>
            <div className="flex items-center text-lg">
              <User className="h-5 w-5 mr-3 text-muted-foreground" />
              <span className="font-semibold mr-2">Professor:</span>
              <span>{note.professor}</span>
            </div>
            <div className="flex items-center text-lg">
              <CalendarDays className="h-5 w-5 mr-3 text-muted-foreground" />
              <span className="font-semibold mr-2">Semester:</span>
              <span>{formatSemester(note.semester)}</span>
            </div>
            <div className="mt-6 border-t pt-6">
              <h3 className="text-xl font-semibold mb-4">Note Content</h3>
              <div className="border rounded-md bg-muted/40 overflow-hidden">
                {note.fileUrl ? (
                  <iframe 
                    src={note.fileUrl} 
                    className="w-full h-[600px] border-0"
                    title={note.title}
                  >
                    <p>Your browser does not support iframes. You can download the PDF instead: <a href={note.fileUrl} className="text-primary hover:underline">Download PDF</a></p>
                  </iframe>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">Unable to load the note content. The file may be missing or inaccessible.</p>
                    {note.fileName && (
                      <p className="mt-2">
                        <a 
                          href={note.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Try opening {note.fileName} in a new tab
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          {isAdmin && (
            <CardFooter className="border-t pt-6">
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Note
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the note and remove the data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : 'Delete Note'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default NoteDetail;