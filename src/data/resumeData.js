export const CATEGORIES = {
  education: { label: 'Education', color: '#3B82F6' },
  experience: { label: 'Experience', color: '#10B981' },
  projects: { label: 'Projects', color: '#F59E0B' },
  skills: { label: 'Skills', color: '#8B5CF6' },
  contact: { label: 'Contact', color: '#06B6D4' },
  quotes: { label: 'Quotes', color: '#EAB308' },
  hobbies: { label: 'Hobbies', color: '#EC4899' },
};

export const cards = [
  // ===== EDUCATION =====
  {
    id: 'edu-uiuc',
    category: 'education',
    title: 'UIUC',
    subtitle: "Master's in Computer Science",
    preview: 'Aug 2026 – May 2028',
    width: 280,
    height: 160,
    expanded: {
      heading: 'University of Illinois Urbana-Champaign',
      subheading: "Master's in Computer Science",
      meta: 'Urbana-Champaign, IL  ·  Aug. 2026 – May 2028',
    },
  },
  {
    id: 'edu-uw',
    category: 'education',
    title: 'UW Seattle',
    subtitle: 'B.A. Geography: Data Science',
    preview: 'Sep 2022 – Jun 2026',
    width: 280,
    height: 160,
    expanded: {
      heading: 'University of Washington',
      subheading: 'Bachelor of Arts in Geography: Data Science',
      meta: 'Seattle, WA  ·  Sep. 2022 – Jun. 2026',
    },
  },

  // ===== EXPERIENCE =====
  {
    id: 'exp-researcher',
    category: 'experience',
    title: 'Student Researcher',
    subtitle: 'UW Bothell',
    preview: 'Sep 2025 – Present',
    width: 300,
    height: 175,
    expanded: {
      heading: 'Student Researcher',
      subheading: 'University of Washington – Bothell',
      meta: 'Remote  ·  Sep. 2025 – Present',
      bullets: [
        'Engineered an end-to-end PyTorch and BioPython extraction pipeline that resulted in a curated 31,453-sample dataset spanning 24 classification classes.',
        'Conducted 10 controlled ablation experiments utilizing custom sugar-masking techniques that resulted in a +4.38 percentage point increase in model classification accuracy at convergence.',
        'Deployed automated Python and Bash inference pipelines on a multi-GPU Linux cluster to process 1,995 cryo-EM maps, which resulted in 200 successful generative vs. discriminative model evaluations.',
      ],
    },
  },
  {
    id: 'exp-customboxes',
    category: 'experience',
    title: 'Backend SDE Intern',
    subtitle: 'Customboxes.io',
    preview: 'Jun 2025 – Nov 2025',
    width: 300,
    height: 175,
    expanded: {
      heading: 'Backend SDE Intern',
      subheading: 'Customboxes.io',
      meta: 'Remote  ·  Jun. 2025 – Nov. 2025',
      bullets: [
        'Engineered an OpenAI agentic system featuring 23 function-calling tools and Server-Sent Events (SSE) streaming, achieving a 90% reduction in user design time.',
        'Developed a Docker-containerized, headless Selenium web scraping pipeline featuring robust timeout handling, driving the automated extraction of 4 distinct branding classes (logos, fonts, links, QRs) from live merchant websites.',
        'Built a Python machine learning pipeline utilizing PyTorch, CLIP embeddings, and OCR text anchoring, resulting in the elimination of 70-80% of dieline noise for precise PDF analysis.',
      ],
    },
  },
  {
    id: 'exp-analog',
    category: 'experience',
    title: 'SWE Team Lead',
    subtitle: 'Analog Club',
    preview: 'Sep 2024 – Present',
    width: 300,
    height: 175,
    expanded: {
      heading: 'Software Engineer, Team Lead',
      subheading: 'Analog Club',
      meta: 'Seattle, WA  ·  Sep. 2024 – Present',
      bullets: [
        'Managed 8 software engineering contributors utilizing Git workflows to review and merge 20+ pull requests, driving the deployment of a React Single Page Application for a community of 873 members.',
        'Engineered a custom React calendar component integrated with the Google Calendar API, achieving automated event notifications and streamlined discovery for cross-platform users.',
        'Built a mobile-first UI utilizing React Router DOM and Embla Carousel while establishing Firebase backend infrastructure, enabling seamless access to galleries and digital magazines.',
      ],
    },
  },

  // ===== PROJECTS =====
  {
    id: 'proj-findmyuwprof',
    category: 'projects',
    title: 'FindMyUWProf.com',
    subtitle: 'Python, Flask, APIs, JS',
    preview: 'Jun – Nov 2024',
    width: 260,
    height: 155,
    expanded: {
      heading: 'FindMyUWProf.com',
      subheading: 'Python · Flask · APIs · JavaScript',
      meta: 'Jun. 2024 – Nov. 2024',
      bullets: [
        'Developed a Flask-based RESTful backend that merged UW professor search functionality with live RateMyProfessor data from their GraphQL API, boosting user engagement by 25% for 4,000 monthly users.',
        'Designed and implemented a responsive user interface with native JavaScript, incorporating features such as dynamic search and department-based filtering.',
      ],
    },
  },
  {
    id: 'proj-datafest',
    category: 'projects',
    title: 'ASA Datafest 2024',
    subtitle: 'R, Statistical Modeling',
    preview: 'Mar 2024',
    width: 260,
    height: 155,
    expanded: {
      heading: 'ASA Datafest 2024',
      subheading: 'Statistical Modeling · R Programming · Data Visualization',
      meta: 'Mar. 2024',
      bullets: [
        'Developed multiple linear regression models achieving a 0.8699 R-squared to evaluate End-of-Chapter (EOC) performance against participation data.',
        'Programmatically identified that multiple-choice questions (comprising over 70% of the dataset) yielded no significant improvement in learning compared to other formats.',
        'Utilized these insights to build an interactive application that allows educators to track longitudinal engagement trends and dynamically revise lesson plans.',
      ],
    },
  },

  // ===== SKILLS =====
  {
    id: 'skills-languages',
    category: 'skills',
    title: 'Languages',
    subtitle: '',
    preview: 'Python · Java · JS · TS · SQL · R',
    width: 220,
    height: 130,
    expanded: {
      heading: 'Languages',
      tags: ['Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'R', 'HTML/CSS'],
    },
  },
  {
    id: 'skills-frameworks',
    category: 'skills',
    title: 'Frameworks',
    subtitle: '',
    preview: 'React · Flask · PyTorch',
    width: 220,
    height: 130,
    expanded: {
      heading: 'Frameworks',
      tags: ['React.js', 'Node.js/Express', 'Flask', 'PyTorch', 'scikit-learn', 'LangChain', 'OpenAI Agents SDK', 'JUnit'],
    },
  },
  {
    id: 'skills-tools',
    category: 'skills',
    title: 'Dev Tools',
    subtitle: '',
    preview: 'Git · PostgreSQL · Docker',
    width: 220,
    height: 130,
    expanded: {
      heading: 'Developer Tools',
      tags: ['Git', 'PostgreSQL', 'Supabase', 'pgvector', 'GraphQL', 'RESTful APIs', 'Edge Functions', 'SQLite', 'Linux', 'SSH', 'tmux'],
    },
  },
  {
    id: 'skills-aiml',
    category: 'skills',
    title: 'AI / ML',
    subtitle: '',
    preview: 'Deep Learning · CV · Agents',
    width: 220,
    height: 130,
    expanded: {
      heading: 'AI / ML Domains',
      tags: ['Applied Machine Learning', 'Deep Learning', 'Computer Vision', 'Agentic Systems'],
    },
  },

  // ===== CONTACT =====
  {
    id: 'contact',
    category: 'contact',
    title: 'Get in Touch',
    subtitle: 'eugene.cheung03@gmail.com',
    preview: 'Bellevue, WA',
    width: 230,
    height: 150,
    expanded: {
      heading: 'Contact',
      links: [
        { label: 'Email', url: 'mailto:eugene.cheung03@gmail.com', text: 'eugene.cheung03@gmail.com' },
        { label: 'LinkedIn', url: 'https://www.linkedin.com/in/cheung-e', text: 'linkedin.com/in/cheung-e' },
        { label: 'Website', url: 'https://cheunge.dev', text: 'cheunge.dev' },
        { label: 'GitHub', url: 'https://github.com/eugene-cheung', text: 'github.com/eugene-cheung' },
        { label: 'Phone', url: 'tel:206-446-4067', text: '206-446-4067' },
        { label: 'Location', url: null, text: 'Bellevue, WA' },
      ],
    },
  },

  // ===== QUOTES =====
  {
    id: 'quote-1',
    category: 'quotes',
    isQuote: true,
    quoteText: 'The best way to predict the future is to invent it.',
    quoteAuthor: 'Alan Kay',
    width: 260,
    height: 140,
    expanded: null,
  },
  {
    id: 'quote-2',
    category: 'quotes',
    isQuote: true,
    quoteText: 'Talk is cheap. Show me the code.',
    quoteAuthor: 'Linus Torvalds',
    width: 240,
    height: 130,
    expanded: null,
  },
  {
    id: 'quote-3',
    category: 'quotes',
    isQuote: true,
    quoteText: 'Simplicity is the ultimate sophistication.',
    quoteAuthor: 'Leonardo da Vinci',
    width: 255,
    height: 130,
    expanded: null,
  },

  // ===== HOBBIES =====
  {
    id: 'hobby-valorant',
    category: 'hobbies',
    title: 'Valorant',
    subtitle: 'Peak: Immortal 1 (#2,147)',
    preview: 'Competitive FPS',
    width: 195,
    height: 130,
    expanded: {
      heading: 'Valorant',
      description: 'Peak: Immortal 1 — 36 RR (#2,147 NA)',
      links: [
        { label: 'Tracker', url: 'https://tracker.gg/valorant/profile/riot/I%20hate%20spacey%236993/overview', text: 'tracker.gg' },
      ],
    },
  },
  {
    id: 'hobby-chess',
    category: 'hobbies',
    title: 'Chess',
    subtitle: 'Peak Blitz: 1918',
    preview: 'TheEugenius on Chess.com',
    width: 195,
    height: 130,
    expanded: {
      heading: 'Chess',
      description: 'Peak Blitz rating: 1918 on Chess.com',
      links: [
        { label: 'Profile', url: 'https://www.chess.com/member/theeugenius', text: 'chess.com/theeugenius' },
      ],
    },
  },
  {
    id: 'hobby-tft',
    category: 'hobbies',
    title: 'TFT',
    subtitle: '',
    preview: 'Teamfight Tactics',
    width: 195,
    height: 130,
    expanded: {
      heading: 'Teamfight Tactics',
      description: 'Auto-battler strategy game.',
      links: [
        { label: 'Profile', url: 'https://tactics.tools/player/na/I%20hate%20spacey/6993', text: 'tactics.tools' },
      ],
    },
  },
];
