export interface Note {
  id: number;
  title: string;
  description: string;
  classCode: string;
  professor: string;
  semester: string;
  type: "Notes" | "Exam" | "Homework";
}

export const mockNotes: Note[] = [
  {
    id: 1,
    title: "CS 1301 Midterm 1 Notes",
    description: "Comprehensive notes covering topics for Midterm 1 in CS 1301, including Python basics, data structures, and algorithms.",
    classCode: "CS 1301",
    professor: "Dr. Smith",
    semester: "Fall 2023",
    type: "Notes",
  },
  {
    id: 2,
    title: "MATH 1551 Final Exam (Spring 2022)",
    description: "Past final exam from Spring 2022 for MATH 1551, covering multivariable calculus concepts.",
    classCode: "MATH 1551",
    professor: "Prof. Jones",
    semester: "Spring 2022",
    type: "Exam",
  },
  {
    id: 3,
    title: "PHYS 2211 Homework 3 Solutions",
    description: "Detailed solutions for Homework 3 in PHYS 2211, focusing on kinematics and dynamics.",
    classCode: "PHYS 2211",
    professor: "Dr. Lee",
    semester: "Fall 2023",
    type: "Homework",
  },
  {
    id: 4,
    title: "CS 2110 Lecture 5 Notes",
    description: "Notes from Lecture 5 of CS 2110, covering object-oriented programming principles and Java syntax.",
    classCode: "CS 2110",
    professor: "Prof. Davis",
    semester: "Spring 2023",
    type: "Notes",
  },
  {
    id: 5,
    title: "CHEM 1310 Quiz 2 (Fall 2021)",
    description: "Quiz 2 from CHEM 1310, focusing on chemical bonding and molecular structure.",
    classCode: "CHEM 1310",
    professor: "Dr. Chen",
    semester: "Fall 2021",
    type: "Exam",
  },
];