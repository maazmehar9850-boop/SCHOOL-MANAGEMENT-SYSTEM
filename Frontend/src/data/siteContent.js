import { IMG } from "./siteImages";

export const PROGRAMS = [
  {
    id: "intermediate",
    title: "Intermediate",
    category: "Foundation",
    duration: "2 Years",
    eligibility: "Matriculation / O-Levels",
    description:
      "A rigorous intermediate pathway that builds academic foundations in sciences, commerce, and arts with continuous mentoring.",
    image: IMG.intermediate,
  },
  {
    id: "undergraduate",
    title: "Undergraduate Programs",
    category: "Degree",
    duration: "4 Years",
    eligibility: "Intermediate / A-Levels",
    description:
      "Degree programs designed for academic excellence, research exposure, and career-ready professional skills.",
    image: IMG.undergrad,
  },
  {
    id: "computer-science",
    title: "Computer Science",
    category: "Technology",
    duration: "4 Years",
    eligibility: "Intermediate (Pre-Eng / ICS)",
    description:
      "Modern computing curriculum covering programming, AI foundations, networks, databases, and software engineering.",
    image: IMG.cs,
  },
  {
    id: "business",
    title: "Business Studies",
    category: "Management",
    duration: "4 Years",
    eligibility: "Intermediate / Equivalent",
    description:
      "Leadership-focused business education spanning management, marketing, entrepreneurship, and strategy.",
    image: IMG.business,
  },
  {
    id: "commerce",
    title: "Commerce",
    category: "Finance",
    duration: "2–4 Years",
    eligibility: "Matric / Intermediate",
    description:
      "Accounting, finance, and commercial studies that prepare students for professional and corporate careers.",
    image: IMG.commerce,
  },
  {
    id: "arts",
    title: "Arts",
    category: "Humanities",
    duration: "2–4 Years",
    eligibility: "Matric / Intermediate",
    description:
      "Creative and analytical arts programs nurturing communication, critical thinking, and cultural literacy.",
    image: IMG.arts,
  },
  {
    id: "pre-medical",
    title: "Pre-Medical",
    category: "Science",
    duration: "2 Years",
    eligibility: "Matric Science",
    description:
      "Focused pre-medical track with biology, chemistry, and physics preparation for medical entrance pathways.",
    image: IMG.premed,
  },
  {
    id: "pre-engineering",
    title: "Pre-Engineering",
    category: "Science",
    duration: "2 Years",
    eligibility: "Matric Science",
    description:
      "Engineering foundations in mathematics, physics, and chemistry with problem-solving and lab practice.",
    image: IMG.preeng,
  },
  {
    id: "short-courses",
    title: "Short Courses",
    category: "Skills",
    duration: "1–6 Months",
    eligibility: "Open Enrollment",
    description:
      "Career-boosting short programs in digital skills, languages, and professional certifications.",
    image: IMG.shortCourses,
  },
];

export const TESTIMONIALS = [
  {
    name: "Ayesha Khan",
    program: "Computer Science",
    rating: 5,
    review:
      "Aspira College gave me confidence, mentors who cared, and a learning culture that prepared me for university and internships.",
    photo: IMG.testimonial1,
  },
  {
    name: "Hamza Ali",
    program: "Business Studies",
    rating: 5,
    review:
      "The faculty are exceptional. Practical projects and leadership workshops helped me grow beyond textbooks.",
    photo: IMG.testimonial2,
  },
  {
    name: "Sara Malik",
    program: "Pre-Medical",
    rating: 5,
    review:
      "Labs, counseling, and a supportive campus made my intermediate years focused and motivating. Highly recommended.",
    photo: IMG.testimonial3,
  },
  {
    name: "Bilal Ahmed",
    program: "Commerce",
    rating: 4,
    review:
      "From admissions to academics, everything feels organized. The digital portal keeps attendance and results transparent.",
    photo: IMG.testimonial4,
  },
];

export const FACULTY = [
  {
    name: "Dr. Nadia Rahman",
    department: "Computer Science",
    qualification: "PhD Computer Science",
    experience: "14 years",
    bio: "Specializes in AI education, curriculum design, and mentoring undergraduate research projects.",
    photo: IMG.faculty1,
  },
  {
    name: "Prof. Imran Shah",
    department: "Business Studies",
    qualification: "MBA, MPhil Management",
    experience: "18 years",
    bio: "Industry-experienced educator focused on entrepreneurship, strategy, and student leadership.",
    photo: IMG.faculty2,
  },
  {
    name: "Ms. Fatima Noor",
    department: "Pre-Medical",
    qualification: "MSc Biology",
    experience: "11 years",
    bio: "Known for concept clarity, lab excellence, and supportive exam preparation for medical pathways.",
    photo: IMG.faculty3,
  },
  {
    name: "Mr. Usman Tariq",
    department: "Pre-Engineering",
    qualification: "MS Electrical Engineering",
    experience: "12 years",
    bio: "Brings applied engineering thinking into classrooms with strong math and physics foundations.",
    photo: IMG.faculty4,
  },
  {
    name: "Dr. Sana Iqbal",
    department: "Arts & Humanities",
    qualification: "PhD English Literature",
    experience: "16 years",
    bio: "Develops communication, critical analysis, and academic writing skills across arts programs.",
    photo: IMG.faculty5,
  },
  {
    name: "Mr. Ahmed Raza",
    department: "Commerce",
    qualification: "ACCA, MCom",
    experience: "10 years",
    bio: "Connects accounting theory with real financial practice and professional certification readiness.",
    photo: IMG.faculty6,
  },
];

export const NEWS = [
  {
    title: "Aspira Opens New Digital Learning Hub",
    date: "Mar 12, 2026",
    category: "Campus",
    excerpt: "Students now access modern labs, collaboration spaces, and mentoring pods for project-based learning.",
    image: IMG.news1,
  },
  {
    title: "Annual Science Olympiad Results Announced",
    date: "Feb 28, 2026",
    category: "Academics",
    excerpt: "Pre-medical and pre-engineering students earned top regional distinctions in experimental science.",
    image: IMG.news2,
  },
  {
    title: "Career Fair Connects 40+ Employers",
    date: "Feb 10, 2026",
    category: "Careers",
    excerpt: "Undergraduate students met recruiters from technology, finance, healthcare, and education sectors.",
    image: IMG.news3,
  },
  {
    title: "Scholarship Drive for Merit Students",
    date: "Jan 22, 2026",
    category: "Admissions",
    excerpt: "Need-based and merit scholarships open for the upcoming session with simplified online applications.",
    image: IMG.news4,
  },
  {
    title: "Cultural Week Celebrates Student Talent",
    date: "Jan 08, 2026",
    category: "Events",
    excerpt: "Music, debate, drama, and art exhibitions highlighted the creative energy of Aspira campus life.",
    image: IMG.news5,
  },
  {
    title: "Faculty Development Workshop Series",
    date: "Dec 18, 2025",
    category: "Faculty",
    excerpt: "Educators explored modern pedagogy, assessment design, and inclusive classroom practices.",
    image: IMG.news6,
  },
];

export const EVENTS = [
  {
    title: "Open Day & Campus Tour",
    date: "Apr 05, 2026",
    time: "10:00 AM",
    place: "Main Campus",
    category: "Admissions",
  },
  {
    title: "Leadership Summit 2026",
    date: "Apr 18, 2026",
    time: "11:30 AM",
    place: "Auditorium",
    category: "Student Life",
  },
  {
    title: "Inter-College Debate Championship",
    date: "May 02, 2026",
    time: "09:30 AM",
    place: "Seminar Hall",
    category: "Competitions",
  },
  {
    title: "Alumni Mentorship Evening",
    date: "May 20, 2026",
    time: "04:00 PM",
    place: "Library Lounge",
    category: "Careers",
  },
];

export const FAQS = [
  {
    q: "How do I apply to Aspira College?",
    a: "Complete the online admissions form, upload required documents, and wait for entrance review confirmation from the admissions office.",
  },
  {
    q: "What documents are required?",
    a: "Typically CNIC/B-Form, recent photographs, previous academic transcripts, character certificate, and domicile where applicable.",
  },
  {
    q: "Are scholarships available?",
    a: "Yes. Merit-based, need-based, and sibling scholarships are offered each session subject to eligibility and available seats.",
  },
  {
    q: "Can I visit the campus before applying?",
    a: "Absolutely. Schedule a campus tour through the Contact page or attend an Open Day to meet faculty and explore facilities.",
  },
  {
    q: "Does Aspira provide a student portal?",
    a: "Yes. Students, teachers, and administration use a secure campus portal for attendance, results, fees, and resources.",
  },
];
