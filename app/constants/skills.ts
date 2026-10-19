export interface SkillBlock {
  id: string;
  title: string;
  categories: Array<{
    label: string;
    skills: string[];
  }>;
}

export const SKILL_BLOCKS: SkillBlock[] = [
  {
    id: 'engineering-and-ai',
    title: 'SKILLS · 01',
    categories: [
      { label: 'Languages', skills: ['Python', 'Java', 'Kotlin', 'JavaScript', 'HTML5', 'CSS3'] },
      { label: 'Data & Analytics', skills: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Microsoft Excel', 'Power BI', 'Tableau'] },
      { label: 'AI/ML/LLM Tools', skills: ['LangChain', 'RAG', 'LlamaIndex', 'OpenAI API', 'Hugging Face Transformers', 'Ollama', 'n8n'] },
      { label: 'Backend & Web', skills: ['Django', 'Flask', 'RESTful APIs', 'React', 'Node.js', 'Express.js'] },
    ],
  },
  {
    id: 'platforms-and-devices',
    title: 'SKILLS · 02',
    categories: [
      { label: 'Databases', skills: ['MySQL', 'MongoDB', 'Firebase Firestore'] },
      { label: 'Cloud, DevOps & Tools', skills: ['Microsoft Azure', 'Git', 'GitHub', 'Linux'] },
      { label: 'Mobile & IoT', skills: ['Android Studio', 'Jetpack Compose', 'Arduino', 'Wireless Communication'] },
    ],
  },
];
