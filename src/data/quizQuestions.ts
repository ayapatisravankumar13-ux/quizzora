import { QuizQuestionWithAnswer } from '../types/quiz';

export const QUIZ_QUESTIONS: QuizQuestionWithAnswer[] = [
  {
    id: 1,
    question: "What is one common use of an AI writing tool?",
    options: [
      { key: "A", text: "Repairing a keyboard" },
      { key: "B", text: "Writing or improving text" },
      { key: "C", text: "Charging a mobile phone" },
      { key: "D", text: "Printing money" }
    ],
    correctAnswer: "B"
  },
  {
    id: 2,
    question: "In which year was Python first released?",
    options: [
      { key: "A", text: "1991" },
      { key: "B", text: "1995" },
      { key: "C", text: "1989" },
      { key: "D", text: "2000" }
    ],
    correctAnswer: "A"
  },
  {
    id: 3,
    question: "What is a prompt in an AI tool?",
    options: [
      { key: "A", text: "A command or question given to the AI" },
      { key: "B", text: "A saved password" },
      { key: "C", text: "A computer virus" },
      { key: "D", text: "A type of hardware cable" }
    ],
    correctAnswer: "A"
  },
  {
    id: 4,
    question: "What will be the output of this python program?",
    codeSnippet: "x = 10\nx = x + 5\nprint(x)",
    options: [
      { key: "A", text: "5" },
      { key: "B", text: "105" },
      { key: "C", text: "15" },
      { key: "D", text: "10" }
    ],
    correctAnswer: "C"
  },
  {
    id: 5,
    question: "What is a pitch in a hackathon?",
    options: [
      { key: "A", text: "A project presentation" },
      { key: "B", text: "A database" },
      { key: "C", text: "A sport activity" },
      { key: "D", text: "A coding error" }
    ],
    correctAnswer: "A"
  },
  {
    id: 6,
    question: "Which information should you avoid sharing with an AI tool?",
    options: [
      { key: "A", text: "A general topic for discussion" },
      { key: "B", text: "A simple question" },
      { key: "C", text: "A public website address" },
      { key: "D", text: "Private passwords and sensitive personal information" }
    ],
    correctAnswer: "D"
  },
  {
    id: 7,
    question: "What is the result of 10 % 3?",
    options: [
      { key: "A", text: "0.3" },
      { key: "B", text: "1" },
      { key: "C", text: "3" },
      { key: "D", text: "10" }
    ],
    correctAnswer: "B"
  },
  {
    id: 8,
    question: "Who created Python?",
    options: [
      { key: "A", text: "Guido van Rossum" },
      { key: "B", text: "James Gosling" },
      { key: "C", text: "Bjarne Stroustrup" },
      { key: "D", text: "Dennis Ritchie" }
    ],
    correctAnswer: "A"
  },
  {
    id: 9,
    question: "What is the type of the value 10.5?",
    options: [
      { key: "A", text: "float" },
      { key: "B", text: "bool" },
      { key: "C", text: "int" },
      { key: "D", text: "str" }
    ],
    correctAnswer: "A"
  },
  {
    id: 10,
    question: "What is a variable?",
    options: [
      { key: "A", text: "A data type" },
      { key: "B", text: "A name that refers to a value" },
      { key: "C", text: "A symbol used only for comments" },
      { key: "D", text: "Constant" }
    ],
    correctAnswer: "B"
  },
  {
    id: 11,
    question: "Which platform can deploy a frontend project directly from a github repository?",
    options: [
      { key: "A", text: "Google AI Studio" },
      { key: "B", text: "MySQL" },
      { key: "C", text: "Notepad" },
      { key: "D", text: "Netlify" }
    ],
    correctAnswer: "D"
  },
  {
    id: 12,
    question: "Which variable stores a floating-point number?",
    options: [
      { key: "A", text: "float age = 20.5" },
      { key: "B", text: "marks = 85.5" },
      { key: "C", text: "name = \"Rahul\"" },
      { key: "D", text: "passed = True" }
    ],
    correctAnswer: "B"
  },
  {
    id: 13,
    question: "What is the output of the following code?",
    codeSnippet: "num = 0\nif num % 2 == 0:\n    print(\"Even number\")\nelse:\n    print(\"Odd number\")",
    options: [
      { key: "A", text: "Odd number" },
      { key: "B", text: "Error" },
      { key: "C", text: "Even number" },
      { key: "D", text: "None" }
    ],
    correctAnswer: "C"
  },
  {
    id: 14,
    question: "What file extension is generally used for Python files?",
    options: [
      { key: "A", text: ".file" },
      { key: "B", text: ".python" },
      { key: "C", text: ".pyt" },
      { key: "D", text: ".py" }
    ],
    correctAnswer: "D"
  },
  {
    id: 15,
    question: "Which of the following are the OpenAI products/tools?",
    options: [
      { key: "A", text: "ChatGPT" },
      { key: "B", text: "Gemini" },
      { key: "C", text: "Claude" },
      { key: "D", text: "Perplexity" }
    ],
    correctAnswer: "A"
  },
  {
    id: 16,
    question: "What is the result of int(\"25\")?",
    options: [
      { key: "A", text: "The integer 25" },
      { key: "B", text: "The Boolean True" },
      { key: "C", text: "The string \"25\"" },
      { key: "D", text: "The float 25.0" }
    ],
    correctAnswer: "A"
  },
  {
    id: 17,
    question: "Which of the following is a valid variable name?",
    options: [
      { key: "A", text: "return" },
      { key: "B", text: "my-name" },
      { key: "C", text: "my_name" },
      { key: "D", text: "2name" }
    ],
    correctAnswer: "C"
  },
  {
    id: 18,
    question: "What is a prototype?",
    options: [
      { key: "A", text: "A method of testing software" },
      { key: "B", text: "Final version of product" },
      { key: "C", text: "An early model of a product" },
      { key: "D", text: "A product design document" }
    ],
    correctAnswer: "C"
  },
  {
    id: 19,
    question: "What is the output of print(bool(0))?",
    options: [
      { key: "A", text: "True" },
      { key: "B", text: "False" },
      { key: "C", text: "0" },
      { key: "D", text: "None" }
    ],
    correctAnswer: "B"
  },
  {
    id: 20,
    question: "Which symbol starts a single-line comment in Python?",
    options: [
      { key: "A", text: "//" },
      { key: "B", text: "#" },
      { key: "C", text: "/*" },
      { key: "D", text: "--" }
    ],
    correctAnswer: "B"
  },
  {
    id: 21,
    question: "Which value is a string in the program print(\"Hello World\")?",
    options: [
      { key: "A", text: "Hello World" },
      { key: "B", text: "\"Hello World\"" },
      { key: "C", text: "print" },
      { key: "D", text: "string" }
    ],
    correctAnswer: "B"
  },
  {
    id: 22,
    question: "What is an AI chatbot?",
    options: [
      { key: "A", text: "A type of computer keyboard" },
      { key: "B", text: "A device used only for printing documents" },
      { key: "C", text: "A programming language" },
      { key: "D", text: "A tool that can communicate with users using artificial intelligence" }
    ],
    correctAnswer: "D"
  },
  {
    id: 23,
    question: "A Website consists of",
    options: [
      { key: "A", text: "Database" },
      { key: "B", text: "Frontend" },
      { key: "C", text: "Backend" },
      { key: "D", text: "All of the above" }
    ],
    correctAnswer: "D"
  },
  {
    id: 24,
    question: "Which variable assignment stores the integer 20?",
    options: [
      { key: "A", text: "age = 20" },
      { key: "B", text: "age == 20" },
      { key: "C", text: "age = \"20\"" },
      { key: "D", text: "int age = 20" }
    ],
    correctAnswer: "A"
  },
  {
    id: 25,
    question: "What is the main purpose of Git?",
    options: [
      { key: "A", text: "Tracking changes in source code" },
      { key: "B", text: "Designing images" },
      { key: "C", text: "Creating websites only" },
      { key: "D", text: "Managing databases" }
    ],
    correctAnswer: "A"
  },
  {
    id: 26,
    question: "Which type of programming language is Python?",
    options: [
      { key: "A", text: "Low-level, hardware-specific" },
      { key: "B", text: "Assembly-only" },
      { key: "C", text: "Markup-based" },
      { key: "D", text: "High-level, general-purpose" }
    ],
    correctAnswer: "D"
  },
  {
    id: 27,
    question: "MVP Stands For",
    options: [
      { key: "A", text: "Maximized viable product" },
      { key: "B", text: "Maximum viable product" },
      { key: "C", text: "Minimum viable product" },
      { key: "D", text: "Main viable product" }
    ],
    correctAnswer: "C"
  },
  {
    id: 28,
    question: "What does the print() function do?",
    options: [
      { key: "A", text: "Displays output on the screen" },
      { key: "B", text: "Converts data types" },
      { key: "C", text: "Accepts user input" },
      { key: "D", text: "Defines a variable" }
    ],
    correctAnswer: "A"
  },
  {
    id: 29,
    question: "What is the purpose of teamwork?",
    options: [
      { key: "A", text: "Combining different skills" },
      { key: "B", text: "Achieving a common goal" },
      { key: "C", text: "Sharing responsibilities" },
      { key: "D", text: "All of the above" }
    ],
    correctAnswer: "D"
  },
  {
    id: 30,
    question: "Which keyword is used to define a function in Python?",
    options: [
      { key: "A", text: "function" },
      { key: "B", text: "def" },
      { key: "C", text: "define" },
      { key: "D", text: "fun" }
    ],
    correctAnswer: "B"
  }
];

// Helper to return questions without exposing answers to the client
export function getSanitizedQuestions() {
  return QUIZ_QUESTIONS.map(({ id, question, codeSnippet, options }) => ({
    id,
    question,
    codeSnippet,
    options
  }));
}
