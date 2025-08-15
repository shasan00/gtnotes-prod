import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText, BookOpen, CalendarDays, User } from "lucide-react";

interface NoteCardProps {
  id: string;
  title: string;
  description?: string;
  course: string;
  professor: string;
  semester: string;
  status: 'pending' | 'approved' | 'rejected';
  fileName: string;
  createdAt: string;
}

const NoteCard: React.FC<NoteCardProps> = ({ id, title, description, course, professor, semester, status, fileName, createdAt }) => {
  const statusIcon = {
    approved: <BookOpen className="h-4 w-4 mr-2" />,
    pending: <FileText className="h-4 w-4 mr-2" />,
    rejected: <FileText className="h-4 w-4 mr-2" />,
  };

  const statusColor = {
    approved: 'text-green-600',
    pending: 'text-yellow-600',
    rejected: 'text-red-600',
  };

  const formatSemester = (semester: string): string => {
    if (!semester) return '';
    const [season, year] = semester.split('-');
    if (!season || !year) return semester; // Return as is if format is unexpected
    
    // Capitalize first letter of season and add space before year
    return `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary h-12"><Link to={`/notes/${id}`}>{title}</Link></CardTitle>
        {/* <CardDescription className="text-sm text-muted-foreground line-clamp-2 h-10">{description}</CardDescription> */}
      </CardHeader>
      <CardContent className="space-y-2 text-sm flex-grow">
        {/* <div className={`flex items-center ${statusColor[status]}`}>
          {statusIcon[status]}
          <span className="font-medium capitalize">{status}</span>
        </div> */}
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{course}</span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{professor}</span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{formatSemester(semester)}</span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="truncate">{fileName}</span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link
          to={`/notes/${id}`}
          className={cn(
            badgeVariants({ variant: "secondary" }),
            "w-full justify-center py-2 bg-gt-gold/10 text-gt-gold hover:bg-gt-gold/20 cursor-pointer"
          )}
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
};

export default NoteCard;