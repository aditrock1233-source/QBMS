const { GoogleGenerativeAI } = require('@google/generative-ai');

// In-memory mock database of realistic questions for simulation fallback
const MOCK_QUESTIONS_BY_SUBJECT = {
  web: [
    {
      title: "What is the correct syntax to create a React functional component?",
      questionType: "MCQ",
      options: [
        "function MyComponent() { return <div>Hello</div>; }",
        "class MyComponent extends Component { render() { return <div>Hello</div>; } }",
        "const MyComponent = () => { <div>Hello</div> }",
        "MyComponent() => <div>Hello</div>"
      ],
      correctAnswer: "function MyComponent() { return <div>Hello</div>; }",
      difficulty: "Easy",
      bloomLevel: "Remember"
    },
    {
      title: "React custom hooks must start with the word 'use'.",
      questionType: "TrueFalse",
      options: [],
      correctAnswer: "True",
      difficulty: "Easy",
      bloomLevel: "Understand"
    },
    {
      title: "Explain the difference between state and props in React.",
      questionType: "ShortAnswer",
      options: [],
      correctAnswer: "State represents mutable data managed within the component, whereas props represent immutable data passed down from parent components.",
      difficulty: "Medium",
      bloomLevel: "Understand"
    },
    {
      title: "Design a complete REST API using Express.js for a Todo application. Describe all endpoints, request methods, and middleware usage.",
      questionType: "LongAnswer",
      options: [],
      correctAnswer: "A full architecture listing endpoints (GET /todos, POST /todos, PUT /todos/:id, DELETE /todos/:id) using express.json() and custom error handling middleware.",
      difficulty: "Hard",
      bloomLevel: "Create"
    },
    {
      title: "A web application suffers from performance lag. User actions take 3 seconds to reflect. Profile the issue, list potential causes (like state re-renders, database query bottlenecks), and provide a caching strategy.",
      questionType: "CaseStudy",
      options: [],
      correctAnswer: "Analyze rendering cycles using React DevTools Profiler, debounce user inputs, implement Redis for API response caching, and optimize database indexes.",
      difficulty: "Hard",
      bloomLevel: "Analyze"
    },
    {
      title: "Write a JavaScript function that takes a nested object and flattens it into a single-level object with dot-notation keys.",
      questionType: "Programming",
      options: [],
      correctAnswer: "function flatten(obj, prefix = '') { ... }",
      difficulty: "Hard",
      bloomLevel: "Apply"
    }
  ],
  python: [
    {
      title: "Which of the following is used to append an element to a list in Python?",
      questionType: "MCQ",
      options: [
        "list.append(element)",
        "list.add(element)",
        "list.insert(element)",
        "list.push(element)"
      ],
      correctAnswer: "list.append(element)",
      difficulty: "Easy",
      bloomLevel: "Remember"
    },
    {
      title: "Python lists are mutable while tuples are immutable.",
      questionType: "TrueFalse",
      options: [],
      correctAnswer: "True",
      difficulty: "Easy",
      bloomLevel: "Remember"
    },
    {
      title: "What is a decorator in Python, and how is it used?",
      questionType: "ShortAnswer",
      options: [],
      correctAnswer: "A decorator is a design pattern in Python that allows a user to add new functionality to an existing object without modifying its structure. It is typically applied using the @decorator syntax.",
      difficulty: "Medium",
      bloomLevel: "Understand"
    },
    {
      title: "Describe the Global Interpreter Lock (GIL) in Python and explain how it affects multi-threaded and multi-processing applications.",
      questionType: "LongAnswer",
      options: [],
      correctAnswer: "The GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes at once. It limits CPU-bound multi-threading, meaning multiprocessing is preferred for parallel CPU tasks.",
      difficulty: "Hard",
      bloomLevel: "Evaluate"
    },
    {
      title: "Analyze a scenario where a Python machine learning script runs out of memory while loading a 50GB CSV file. Detail your memory-optimization strategy.",
      questionType: "CaseStudy",
      options: [],
      correctAnswer: "Load the dataset in chunks using pandas (chunksize parameter), downcast numerical data types, use generator functions, or transition to memory-mapped storage like Dask or HDF5.",
      difficulty: "Hard",
      bloomLevel: "Analyze"
    },
    {
      title: "Write a generator function in Python that yields the Fibonacci sequence up to a given number N, minimizing space complexity to O(1).",
      questionType: "Programming",
      options: [],
      correctAnswer: "def fibonacci(n):\n    a, b = 0, 1\n    while a <= n:\n        yield a\n        a, b = b, a + b",
      difficulty: "Medium",
      bloomLevel: "Apply"
    }
  ],
  db: [
    {
      title: "Which SQL command is used to remove all records from a table without logging individual row deletions?",
      questionType: "MCQ",
      options: [
        "TRUNCATE",
        "DELETE",
        "DROP",
        "REMOVE"
      ],
      correctAnswer: "TRUNCATE",
      difficulty: "Easy",
      bloomLevel: "Remember"
    },
    {
      title: "A primary key column can accept NULL values as long as they are unique.",
      questionType: "TrueFalse",
      options: [],
      correctAnswer: "False",
      difficulty: "Easy",
      bloomLevel: "Remember"
    },
    {
      title: "Explain the difference between clustered and non-clustered indexes.",
      questionType: "ShortAnswer",
      options: [],
      correctAnswer: "A clustered index defines the physical order in which data is stored in the table (one per table). A non-clustered index has a structure separate from the data rows, containing pointers to the physical rows (multiple per table).",
      difficulty: "Medium",
      bloomLevel: "Understand"
    },
    {
      title: "Explain ACID properties in database management systems and why they are vital for financial transactions.",
      questionType: "LongAnswer",
      options: [],
      correctAnswer: "ACID stands for Atomicity, Consistency, Isolation, and Durability. They guarantee database transactions are processed reliably. For finance, they prevent issues like double-spending or partial debits if a system crashes mid-transaction.",
      difficulty: "Medium",
      bloomLevel: "Evaluate"
    },
    {
      title: "A relational database schema has a high volume of JOIN queries that are slowing down dashboard loads. Plan a normalization/denormalization trade-off study.",
      questionType: "CaseStudy",
      options: [],
      correctAnswer: "Profile the query plans, add composite indexes, selectively denormalize frequently joined tables (creating materialized views or summary tables), and use cache layers.",
      difficulty: "Hard",
      bloomLevel: "Analyze"
    },
    {
      title: "Write an SQL query to find the second highest salary from an Employee table without using the LIMIT clause.",
      questionType: "Programming",
      options: [],
      correctAnswer: "SELECT MAX(Salary) FROM Employee WHERE Salary < (SELECT MAX(Salary) FROM Employee);",
      difficulty: "Hard",
      bloomLevel: "Apply"
    }
  ]
};

// Default generic question database when subject matches nothing specific
const DEFAULT_MOCK_QUESTIONS = [
  {
    title: "Define the fundamental objective of this subject and how it integrates with modern software design paradigms.",
    questionType: "ShortAnswer",
    options: [],
    correctAnswer: "Allows modular structure, efficient scaling, and proper abstraction layers.",
    difficulty: "Medium",
    bloomLevel: "Understand"
  },
  {
    title: "True or False: The principles studied in this subject apply universally across distributed systems.",
    questionType: "TrueFalse",
    options: [],
    correctAnswer: "True",
    difficulty: "Easy",
    bloomLevel: "Remember"
  },
  {
    title: "Select the most appropriate tool for modeling architecture under this subject:",
    questionType: "MCQ",
    options: ["Unified Modeling Language (UML)", "Simple Flowcharts", "JSON Text Files", "Spreadsheet Trackers"],
    correctAnswer: "Unified Modeling Language (UML)",
    difficulty: "Easy",
    bloomLevel: "Apply"
  },
  {
    title: "Conduct an architectural review of a systems failure in this subject domain. Highlight warning indicators and remediation steps.",
    questionType: "CaseStudy",
    options: [],
    correctAnswer: "Perform diagnostic logging audits, isolate thread bottlenecks, load balance endpoints, and schedule automated rollback triggers.",
    difficulty: "Hard",
    bloomLevel: "Evaluate"
  },
  {
    title: "Implement a code prototype that executes the standard algorithmic pattern related to this subject, with time complexity O(N log N).",
    questionType: "Programming",
    options: [],
    correctAnswer: "Class StandardPattern { public void solve() { ... } }",
    difficulty: "Hard",
    bloomLevel: "Create"
  },
  {
    title: "Compare and contrast traditional methodologies with current state-of-the-art approaches in this subject area.",
    questionType: "LongAnswer",
    options: [],
    correctAnswer: "A full evaluation comparing older manual/synchronous patterns to newer automated/reactive event-driven loops.",
    difficulty: "Medium",
    bloomLevel: "Analyze"
  }
];

/**
 * Generate questions using Google Gemini, or fall back to simulation
 */
const generateAIQuestions = async (subject, sections, difficultyMix, setIndex = 0, syllabusFocus = '', customInstructions = '', excludeQuestions = []) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const setLabel = String.fromCharCode(65 + setIndex); // A, B, C...

  if (!apiKey) {
    console.warn(`⚠️ GEMINI_API_KEY is not defined. Falling back to Simulated AI Question Generation for Set ${setLabel}...`);
    return generateSimulatedQuestions(subject, sections, difficultyMix, setLabel, setIndex);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash as the fast and reliable model for structured JSON outputs
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    let exclusionPrompt = '';
    if (excludeQuestions && excludeQuestions.length > 0) {
      exclusionPrompt = `
CRITICAL: To ensure the sets are completely distinct and cover different concepts/questions, you MUST NOT duplicate or closely overlap with any of the following questions that were already generated in previous sets:
${excludeQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')}
Please focus on different topics, angles, scenarios, or concepts of the subject.
`;
    }

    const prompt = `
You are an expert academic examiner. Generate a list of exam questions for the subject "${subject}" (Set ${setLabel}) based on the following section rules and difficulty requirements.

Syllabus / Concept Focus Areas:
${syllabusFocus ? syllabusFocus : 'General curriculum coverage'}

Sections details:
${JSON.stringify(sections, null, 2)}

Difficulty distribution requirement:
- Easy: ${difficultyMix.easy}%
- Medium: ${difficultyMix.medium}%
- Hard: ${difficultyMix.hard}%

${customInstructions ? `Additional Custom Commands/Instructions: ${customInstructions}` : ''}
${exclusionPrompt}

You MUST generate EXACTLY the number of questions specified in each section.
Ensure the questions for this Set (Set ${setLabel}) are unique, challenging, and strictly academically accurate.
Make sure the marks value matches the section's marksPerQuestion.

Return a JSON array of question objects. Every question in the array must strictly conform to this JSON schema:
[
  {
    "title": "Clear, concise, and complete question statement. If MCQ, do not put options in the title.",
    "description": "Optional background, code block, or explanation (can be empty string)",
    "questionType": "Must be exactly one of: 'MCQ', 'TrueFalse', 'ShortAnswer', 'LongAnswer', 'CaseStudy', 'Programming'",
    "options": ["Array of 4 options as strings. Mandatory only for 'MCQ', leave empty array for other types."],
    "correctAnswer": "Correct answer or sample correct response as string",
    "marks": Number (must match the section's marksPerQuestion),
    "difficulty": "Must be exactly one of: 'Easy', 'Medium', 'Hard'",
    "bloomLevel": "Must be exactly one of: 'Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'"
  }
]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsedQuestions = JSON.parse(text);

    if (Array.isArray(parsedQuestions)) {
      return parsedQuestions;
    } else if (parsedQuestions.questions && Array.isArray(parsedQuestions.questions)) {
      return parsedQuestions.questions;
    }
    throw new Error('Gemini response did not contain an array of questions');
  } catch (error) {
    console.error(`❌ Live Gemini generation failed for Set ${setLabel}:`, error.message);
    console.warn(`⚠️ Falling back to Simulated AI Question Generation for Set ${setLabel} due to error.`);
    return generateSimulatedQuestions(subject, sections, difficultyMix, setLabel, setIndex);
  }
};

/**
 * Generate simulated questions matching the prompt specifications if AI key is missing or fails
 */
function generateSimulatedQuestions(subject, sections, difficultyMix, setLabel, setIndex = 0) {
  const topics = [
    'fundamentals and core principles',
    'architectural patterns and design',
    'performance optimization techniques',
    'security protocols and standards',
    'error handling and troubleshooting',
    'testing and quality assurance',
    'integration and scalability',
    'future trends and emerging methodologies',
    'compliance and auditing control',
    'operational lifecycle management'
  ];

  const generated = [];

  for (const section of sections) {
    const { questionType, numberOfQuestions, marksPerQuestion } = section;

    // Generate the required number of questions
    for (let count = 0; count < numberOfQuestions; count++) {
      const topicIndex = (count + setIndex * 3) % topics.length;
      const topic = topics[topicIndex];

      let title = '';
      let options = [];
      let correctAnswer = '';
      let difficulty = 'Medium';
      let bloomLevel = 'Understand';

      if (questionType === 'MCQ') {
        title = `Which of the following best describes the primary objective of "${topic}" in the context of ${subject}?`;
        options = [
          `To optimize system efficiency and streamline processes for ${topic}.`,
          `To enforce strict structural boundaries and access control for ${topic}.`,
          `To manage state propagation and event loops for ${topic}.`,
          `To establish database connection routing patterns for ${topic}.`
        ];
        correctAnswer = options[0];
        difficulty = 'Easy';
        bloomLevel = 'Remember';
      } else if (questionType === 'TrueFalse') {
        title = `True or False: In the context of ${subject}, implementing "${topic}" is considered a deprecated practice.`;
        options = [];
        correctAnswer = 'False';
        difficulty = 'Easy';
        bloomLevel = 'Understand';
      } else if (questionType === 'ShortAnswer') {
        title = `Briefly explain how "${topic}" influences the overall system design and workflow in ${subject}.`;
        options = [];
        correctAnswer = `It ensures modular decoupling, ease of maintenance, and high scalability across components.`;
        difficulty = 'Medium';
        bloomLevel = 'Understand';
      } else if (questionType === 'LongAnswer') {
        title = `Provide a detailed analysis of "${topic}" in ${subject}. Discuss its historical context, modern implementations, and compare it against alternative practices.`;
        options = [];
        correctAnswer = `A comprehensive evaluation discussing performance gains, implementation complexity, and case studies.`;
        difficulty = 'Hard';
        bloomLevel = 'Analyze';
      } else if (questionType === 'CaseStudy') {
        title = `Analyze a scenario where a system built with ${subject} experiences severe operational degradation due to misconfigured "${topic}". Propose a mitigation plan.`;
        options = [];
        correctAnswer = `Diagnose resource locks, optimize thread pools, scale horizontal nodes, and introduce caching layers.`;
        difficulty = 'Hard';
        bloomLevel = 'Evaluate';
      } else if (questionType === 'Programming') {
        title = `Implement a modular code structure or design schematic in ${subject} illustrating a standard pattern for "${topic}".`;
        options = [];
        correctAnswer = `// Implementation of ${topic}\nfunction initializeModule() {\n  // Code logic goes here\n}`;
        difficulty = 'Hard';
        bloomLevel = 'Apply';
      }

      // Add set variation label
      let uniqueTitle = title;
      if (uniqueTitle.endsWith('?')) {
        uniqueTitle = uniqueTitle.slice(0, -1) + ` (Set ${setLabel} - Q${count + 1} - ${subject})?`;
      } else {
        uniqueTitle = uniqueTitle + ` (Set ${setLabel} - Q${count + 1} - ${subject})`;
      }

      // Create a question structure
      generated.push({
        title: uniqueTitle,
        description: `Auto-generated question for topic: ${topic} (${difficulty} difficulty)`,
        questionType: questionType,
        options: options,
        correctAnswer: correctAnswer,
        marks: marksPerQuestion,
        difficulty: difficulty,
        bloomLevel: bloomLevel
      });
    }
  }

  return generated;
}

/**
 * Generate a single question using Gemini or simulated fallback
 */
const generateSingleAIQuestion = async (subject, topicPrompt, questionType, difficulty, bloomLevel, customInstructions) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn(`⚠️ GEMINI_API_KEY is not defined. Falling back to Simulated Single AI Question Generation...`);
    return generateSimulatedSingleQuestion(subject, topicPrompt, questionType, difficulty, bloomLevel);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const prompt = `
You are an expert academic examiner. Generate a single exam question based on the following details.

Subject: ${subject}
Topic/Concept: ${topicPrompt}
Question Type: ${questionType} (Must be exactly one of: 'MCQ', 'TrueFalse', 'ShortAnswer', 'LongAnswer', 'CaseStudy', 'Programming')
Difficulty: ${difficulty} (Must be exactly one of: 'Easy', 'Medium', 'Hard')
Bloom's Level: ${bloomLevel} (Must be exactly one of: 'Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create')
${customInstructions ? `Additional Custom Command/Instructions: ${customInstructions}` : ''}

Return a JSON object matching this schema:
{
  "title": "Clear, concise, and complete question statement. If MCQ, do not put options in the title.",
  "description": "Optional background, code block, or explanation (can be empty string)",
  "options": ["Array of 4 options as strings. Mandatory only for 'MCQ', leave empty array for other types."],
  "correctAnswer": "Correct answer or sample correct response as string"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error(`❌ Live Gemini single generation failed:`, error.message);
    console.warn(`⚠️ Falling back to Simulated AI Question Generation due to error.`);
    return generateSimulatedSingleQuestion(subject, topicPrompt, questionType, difficulty, bloomLevel);
  }
};

/**
 * Generate a single simulated question based on parameters
 */
function generateSimulatedSingleQuestion(subject, topicPrompt, questionType, difficulty, bloomLevel) {
  const concept = topicPrompt || 'core concepts';
  
  // Try to find a template answer or base details
  const subLower = subject.toLowerCase();
  let pool = DEFAULT_MOCK_QUESTIONS;
  if (subLower.includes('mern') || subLower.includes('react') || subLower.includes('node') || subLower.includes('web') || subLower.includes('js') || subLower.includes('javascript') || subLower.includes('frontend')) {
    pool = MOCK_QUESTIONS_BY_SUBJECT.web;
  } else if (subLower.includes('python') || subLower.includes('machine') || subLower.includes('data science') || subLower.includes('ml')) {
    pool = MOCK_QUESTIONS_BY_SUBJECT.python;
  } else if (subLower.includes('sql') || subLower.includes('database') || subLower.includes('dbms') || subLower.includes('mongo')) {
    pool = MOCK_QUESTIONS_BY_SUBJECT.db;
  }

  // Find one with the same question type, or default to first
  const match = pool.find(q => q.questionType === questionType) || pool[0];

  let title = '';
  let options = [];
  let correctAnswer = match.correctAnswer || '';

  if (questionType === 'MCQ') {
    title = `Which of the following best describes the role of "${concept}" in ${subject}?`;
    options = [
      `It optimizes performance for ${concept}`,
      `It handles the state management of ${concept}`,
      `It serves as the main structural interface for ${concept}`,
      `None of the above`
    ];
    correctAnswer = options[0];
  } else if (questionType === 'TrueFalse') {
    title = `True or False: In ${subject}, "${concept}" is considered a core architectural pattern.`;
    options = [];
    correctAnswer = "True";
  } else if (questionType === 'ShortAnswer') {
    title = `Briefly explain the primary purpose of "${concept}" in the context of ${subject}.`;
    options = [];
    correctAnswer = `Allows modular construction, scalability, and better resource allocation of ${concept}.`;
  } else if (questionType === 'LongAnswer') {
    title = `Discuss in detail the application of "${concept}" in ${subject}. Contrast it with alternative methodologies and list its key advantages.`;
    options = [];
    correctAnswer = `Detailed comparison highlighting ease of development, maintainability, and efficiency of ${concept}.`;
  } else if (questionType === 'CaseStudy') {
    title = `Assume a large enterprise system built on ${subject} is undergoing high load issues with its "${concept}" module. Evaluate the bottlenecks and propose a scaling solution.`;
    options = [];
    correctAnswer = `Isolate the components of ${concept}, implement load balancing, cache expensive read queries, and run database connection pooling.`;
  } else if (questionType === 'Programming') {
    title = `Write a clean, modular code script in ${subject} that demonstrates the implementation of "${concept}".`;
    options = [];
    correctAnswer = `// Code block executing ${concept}\nfunction handleConcept() {\n  // Implementation here\n}`;
  }

  return {
    title,
    description: `Auto-generated question for topic: ${concept} (${difficulty} difficulty)`,
    options,
    correctAnswer
  };
}

module.exports = {
  generateAIQuestions,
  generateSingleAIQuestion
};
