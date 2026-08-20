export const HERO_SLIDES = [
  
];

export const TYPED_PHRASES = [
  "Find Top Vocational Courses",
  "Get 1:1 Admission Guidance",
  "Compare Fees & Cutoffs",
  "Discover Verified Colleges",
  "Track Application Deadlines",
];

export const coursesByCategory: Record<
  string,
  { name: string; shortForm: string | null }[]
> = {
  "Engineering and Technology": [
    {
      name: "Bachelor of Technology",
      shortForm: "B.Tech",
    },
    {
      name: "Master of Technology",
      shortForm: "M.Tech",
    },
    {
      name: "Master of Business Administration",
      shortForm: "MBA",
    },
    {
      name: "Bachelor of Commerce",
      shortForm: "B.Com",
    },
    {
      name: "Bachelor of Science",
      shortForm: "B.Sc",
    },
    {
      name: "Bachelor of Business Administration",
      shortForm: "BBA",
    },
    {
      name: "Master of Arts",
      shortForm: "MA",
    },
    {
      name: "M.tech in Computer Science Engineering",
      shortForm: "M.tech - CSE",
    },
    {
      name: "M.tech in Structural Engineering",
      shortForm: "M.tech - SE",
    },
    {
      name: "M.Tech in Control Systems",
      shortForm: "M.Tech - CS",
    },
    {
      name: "M.Tech in Chemical Engineering",
      shortForm: "M.Tech - CHE",
    },
    {
      name: "M.tech Artificial Intelligence",
      shortForm: "M.tech - AI",
    },
    {
      name: "B.Tech in Computer Science and Engineering",
      shortForm: "B.Tech - CSE",
    },
    {
      name: "B.Tech in Civil Engineering",
      shortForm: "B.Tech - Civil",
    },
    {
      name: "B.Tech in Artificial Intelligence and Data Science",
      shortForm: "B.Tech - AIDS",
    },
  ],
  "Management and Business Administration": [
    {
      name: "Master of Business Administration",
      shortForm: "MBA",
    },
    {
      name: "Master of Business Administration",
      shortForm: "MBA",
    },
    {
      name: "Bachelor of Business Administration",
      shortForm: "BBA",
    },
    {
      name: "Bachelor of Hotel management",
      shortForm: "BHM",
    },
    {
      name: "Bachelor of Business Administration",
      shortForm: "BBA",
    },
    {
      name: "MBA ( Finance Administration)",
      shortForm: "MBA in Fin Admn",
    },
    {
      name: "MBA In Operations Management",
      shortForm: "MBA In OM",
    },
    {
      name: "MBA (Human Resource Management))",
      shortForm: "MBA in HR Admn",
    },
    {
      name: "MBA (Marketing Management)",
      shortForm: "MBA in Mkt Mgt",
    },
    {
      name: "MBA In Business Analytics",
      shortForm: "MBA - Business Analytics",
    },
  ],
  Science: [
    {
      name: "B.Sc. Biotechnology",
      shortForm: "B.Sc.  - Biotech",
    },
    {
      name: "B.Sc.. Computer Science",
      shortForm: "B.Sc- CSE",
    },
    {
      name: "M.Sc In Data Science",
      shortForm: "M.Sc - Data Sc",
    },
    {
      name: "B.Sc. Chemistry",
      shortForm: "B.Sc. - Chem",
    },
    {
      name: "M.Sc In Chemistry",
      shortForm: "M.Sc - Chemistry",
    },
    {
      name: "M,Sc In Biotechnology",
      shortForm: "M.Sc - Biotechnology",
    },
    {
      name: "B.SC Physics",
      shortForm: "B.SC PHY",
    },
    {
      name: "M.Sc In Physics",
      shortForm: "M.Sc - Physics",
    },
    {
      name: "Bachelor of Science",
      shortForm: "B.Sc",
    },
    {
      name: "Master of Science",
      shortForm: "M.Sc",
    },
  ],
  "IT and Computer Applications": [
    {
      name: "Master of Computer Application",
      shortForm: "MCA",
    },
    {
      name: "Bachelor of Computer Application",
      shortForm: "BCA",
    },
  ],
  Commerce: [
    {
      name: "Bachelor of Commerce",
      shortForm: "B.Com",
    },
  ],
  "Architecture and Planning Course": [
    {
      name: "Bachelor of Architecture",
      shortForm: "B.Arch",
    },
  ],
  "Design and Fine Arts": [
    {
      name: "Bachelor of Design",
      shortForm: "B.Des",
    },
  ],
  "Doctoral / Research Programs": [
    {
      name: "PHD In Political Science",
      shortForm: "PHD - PS",
    },
    {
      name: "PHD In Biotechnology",
      shortForm: "PHD - Biotech",
    },
    {
      name: "PHD In Life Sciences",
      shortForm: "PHD - LS",
    },
    {
      name: "PHD In Biomedical Engineering",
      shortForm: "PHD - BME",
    },
    {
      name: "PHD In Data Science",
      shortForm: "PHD -DS",
    },
    {
      name: "PHD In Physics",
      shortForm: "PHD - PHY",
    },
    {
      name: "PHD In Commerce",
      shortForm: "PHD - COM",
    },
    {
      name: "PHD In History",
      shortForm: "PHD - Hist",
    },
    {
      name: "PHD In English",
      shortForm: "PHD - ENG",
    },
    {
      name: "PHD In Mathematics",
      shortForm: "PHD - Math",
    },
    {
      name: "PHD In Chemistry",
      shortForm: "PHD - Chem",
    },
    {
      name: "PHD In Economics",
      shortForm: "PHD - ECO",
    },
    {
      name: "PHD In Sociology and Social Systems",
      shortForm: "PHD - SSS",
    },
    {
      name: "PHD In Psychology",
      shortForm: "PHD - Psych",
    },
  ],
};

export const HOW_STEPS = [
  {
    number: "01",
    title: "Discover Options",
    description:
      "Search by course, city, state or college name across verified listings.",
    icon: "🔎",
  },
  {
    number: "02",
    title: "Share Goals",
    description:
      "Tell us your course, budget and preferred city in 60 seconds.",
    icon: "🎯",
  },
  {
    number: "03",
    title: "Get Personal Guidance",
    description: "A counselor shortlists colleges, scholarships and pathways.",
    icon: "🧭",
  },
  {
    number: "04",
    title: "Choose with Clarity",
    description:
      "Compare fees, cutoffs, placements and student reviews side-by-side.",
    icon: "⚖️",
  },
  {
    number: "05",
    title: "Complete Admission",
    description: "Submit documents, meet your college and secure your seat.",
    icon: "✅",
  },
];

export let SEARCH_STATES = [
  "All States",
  "Delhi",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const SEARCH_CATEGORIES = [
  "All Categories",
  "Engineering",
  "Management",
  "Medical",
  "Computer Applications",
  "Science",
  "Commerce",
  "Law",
  "Architecture",
  "Design",
  "Arts",
  "Pharmacy",
  "Paramedical",
  "Education",
  "Hotel Management",
  "PhD",
  "Vocational",
];

export type RankingCollege = {
  rank: number;
  rating: number;
  reviewsCount: number;
  exams: { name: string; cutoff: string }[];
  fee: string;
  state: string;
  placement: string;
};

// Deterministic Collegedunia-style enrichment per college (hash on id).
export function enrichCollege(id: string, name: string): RankingCollege {
  let hash = 0;
  for (let i = 0; i < (id || name).length; i++) {
    hash = (hash * 31 + (id || name).charCodeAt(i)) >>> 0;
  }
  const exams = [
    { name: "JEE Main", cutoff: `${310 + (hash % 90)}` },
    { name: "CUET", cutoff: `${300 + (hash % 130)}` },
    { name: "NCHMCT-JEE", cutoff: `${980 + (hash % 200)}` },
    { name: "CET", cutoff: `${70 + (hash % 85)}` },
  ];
  return {
    rank: (hash % 90) + 1,
    rating: 4 + Math.round(((hash % 10) + 5) * 100) / 100,
    reviewsCount: 25 + (hash % 420),
    exams: [exams[hash % 4], exams[(hash + 1) % 4]],
    fee: `₹${((hash % 150) + 30) * 1000}`,
    state: SEARCH_STATES[hash % 8],
    placement: `${72 + (hash % 26)}%`,
  };
}

export const TRUST_BADGES = [
  "Verified College Partners",
  "1:1 Admission Guidance",
  "Zero-Cost Counseling",
];

export const FEATURED_COLLEGE_NAMES = [
  "Indian Institute of Technology, Bombay",
  "Christ University, Bengaluru",
  "National Institute of Hotel Management, Mumbai",
  "St. Xavier's College, Kolkata",
  "Vellore Institute of Technology, Vellore",
  "Symbiosis International University, Pune",
  "IIT Delhi",
  "SRM Institute of Science and Technology",
  "Lovely Professional University, Jalandhar",
  "BITS Pilani, Pilani Campus",
  "IIT Madras",
  "Delhi University, North Campus",
];
