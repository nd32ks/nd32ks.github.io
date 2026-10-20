// Skills, and the projects that prove them.
// To publish a repo or write-up, paste its URL into `repo` / `writeup` below and push.

export type SkillId =
  | 'sql' | 'funnel' | 'dash' | 'anomaly' | 'rca' | 'classify' | 'evaluate'
  | 'experiment' | 'stats' | 'writing' | 'llm' | 'forecast' | 'fullstack' | 'extract';

export const skills: { id: SkillId; en: string; zh: string }[] = [
  { id: 'sql', en: 'SQL', zh: 'SQL' },
  { id: 'funnel', en: 'Funnel analytics', zh: '漏斗分析' },
  { id: 'dash', en: 'Dashboards', zh: '数据看板' },
  { id: 'anomaly', en: 'Anomaly detection', zh: '异常检测' },
  { id: 'rca', en: 'Root-cause analysis', zh: '根因分析' },
  { id: 'classify', en: 'Classification', zh: '分类模型' },
  { id: 'evaluate', en: 'Model tradeoffs', zh: '模型权衡评估' },
  { id: 'experiment', en: 'A/B testing', zh: 'A/B 测试' },
  { id: 'stats', en: 'Statistical inference', zh: '统计推断' },
  { id: 'forecast', en: 'Forecasting', zh: '需求预测' },
  { id: 'llm', en: 'LLM pipelines', zh: 'LLM 数据管道' },
  { id: 'extract', en: 'Data extraction', zh: '数据抽取' },
  { id: 'fullstack', en: 'Full-stack apps', zh: '全栈应用' },
  { id: 'writing', en: 'Technical write-ups', zh: '技术写作' },
];

export type Viz = 'funnel' | 'anomaly' | 'threshold' | 'ab' | 'capstone';

export type ProofProject = {
  id: string;
  viz: Viz;
  start: string; // ISO date, inclusive
  due: string; // ISO date
  en: { title: string; desc: string };
  zh: { title: string; desc: string };
  skills: SkillId[];
  repo: string; // GitHub URL, '' until published
  writeup: string; // write-up URL, '' until published
};

export const proofProjects: ProofProject[] = [
  {
    id: 'p1', viz: 'funnel', start: '2026-10-16', due: '2026-10-25',
    en: { title: 'SQL and B2B funnel dashboard', desc: 'SQL models of a B2B sales funnel, from lead to closed deal, with a dashboard that shows where accounts drop off.' },
    zh: { title: 'SQL 与 B2B 销售漏斗看板', desc: '用 SQL 建模 B2B 销售漏斗，从线索到成交，并以看板呈现客户在哪一步流失。' },
    skills: ['sql', 'funnel', 'dash', 'writing'], repo: '', writeup: '',
  },
  {
    id: 'p2', viz: 'anomaly', start: '2026-10-26', due: '2026-11-01',
    en: { title: 'Anomaly detection and root-cause write-up', desc: 'Detect unusual movements in a metric over time, then trace each one back to its cause in a written analysis.' },
    zh: { title: '异常检测与根因分析报告', desc: '检测指标随时间出现的异常波动，并在书面分析中逐一追溯其原因。' },
    skills: ['anomaly', 'rca', 'sql', 'writing'], repo: '', writeup: '',
  },
  {
    id: 'p3', viz: 'threshold', start: '2026-11-02', due: '2026-11-08',
    en: { title: 'Abuse and misuse classifier, with tradeoffs', desc: 'A classifier that flags abusive or misuse behaviour, plus a write-up on where to set the threshold and what each choice costs.' },
    zh: { title: '滥用与误用分类器及权衡分析', desc: '识别滥用或误用行为的分类器，并撰文分析阈值设定及每种选择的代价。' },
    skills: ['classify', 'evaluate', 'writing'], repo: '', writeup: '',
  },
  {
    id: 'p4', viz: 'ab', start: '2026-11-09', due: '2026-11-15',
    en: { title: 'A/B testing toolkit and readout', desc: 'A reusable toolkit for sizing, running and analysing experiments, and a readout written for decision makers.' },
    zh: { title: 'A/B 测试工具包与结果报告', desc: '可复用的实验工具包，涵盖样本量估算、执行与分析，并附面向决策者的结果报告。' },
    skills: ['experiment', 'stats', 'writing'], repo: '', writeup: '',
  },
  {
    id: 'p5', viz: 'capstone', start: '2026-11-16', due: '2026-11-22',
    en: { title: 'Capstone draft', desc: 'An end-to-end project that brings the previous four together: data, modelling, experiment and a clear story.' },
    zh: { title: '毕业项目初稿', desc: '把前四个项目串联起来的端到端项目：数据、建模、实验与清晰的叙述。' },
    skills: ['sql', 'anomaly', 'classify', 'experiment', 'stats', 'writing'], repo: '', writeup: '',
  },
];

// Shipped work that already proves skills (anchors into the Work section).
export const shippedProof: { href: string; title: string; skills: SkillId[] }[] = [
  { href: '#p-pb', title: 'ProfessorBook', skills: ['llm', 'extract', 'fullstack', 'writing'] },
  { href: '#p-ml', title: 'Mathleagues', skills: ['extract', 'fullstack'] },
  { href: '#p-fn', title: 'FreshNext', skills: ['forecast', 'dash', 'fullstack'] },
];
