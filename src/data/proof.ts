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

export type Figure = 'plot' | 'sieve' | 'riffle' | 'relay';
export type Viz = 'funnel' | 'anomaly' | 'threshold' | 'ab' | 'capstone';

export type ProofProject = {
  id: string;
  viz: Viz;
  start: string; // ISO date, inclusive
  due: string; // ISO date
  en: { title: string; desc: string };
  zh: { title: string; desc: string };
  skills: SkillId[];
  figure?: { kind: Figure; label: { en: string; zh: string } }; // interactive hairline figure shown instead of the diagram
  image?: { src: string; alt: { en: string; zh: string } }; // screenshot shown instead of the diagram
  repo: string; // GitHub URL, '' until published
  writeup: string; // write-up URL, '' until published
};

export const proofProjects: ProofProject[] = [
  {
    id: 'p1', viz: 'funnel', start: '2026-10-16', due: '2026-10-25',
    en: { title: 'SQL and B2B funnel dashboard', desc: 'SQL models (DuckDB) of a synthetic B2B SaaS funnel: 600 leads, 380 deals, 166 won customers, 82 churned. The dashboard shows conversion and churn by segment.' },
    zh: { title: 'SQL 与 B2B 销售漏斗看板', desc: '用 SQL（DuckDB）为合成的 B2B SaaS 漏斗建模：600 条线索、380 个商机、166 个成交客户、82 个流失客户。看板按客户规模展示转化率和流失率。' },
    skills: ['sql', 'funnel', 'dash', 'writing'], image: { src: '/projects/b2b-funnel.webp', alt: { en: 'Dashboard screenshot: B2B funnel by segment, conversion rates, churn by segment and active customers per month', zh: '看板截图：按客户规模划分的 B2B 漏斗、转化率、流失率和每月活跃客户' } },
    repo: 'https://github.com/nd32ks/b2b-funnel-analytics', writeup: '',
  },
  {
    id: 'p2', viz: 'anomaly', start: '2026-10-26', due: '2026-11-01',
    en: { title: 'Anomaly detection and root-cause write-up', desc: 'Detect unusual movements in a metric over time, then trace each one back to its cause in a written analysis.' },
    zh: { title: '异常检测与根因分析报告', desc: '检测指标随时间出现的异常波动，并在书面分析中逐一追溯其原因。' },
    skills: ['anomaly', 'rca', 'sql', 'writing'], figure: { kind: 'plot', label: { en: 'Interactive figure: a bar chart of seven flat tabs. Moving the pointer across lifts the tabs it passes.', zh: '互动图：由七个平板组成的柱状图，指针划过时对应的平板会抬起。' } },
    repo: '', writeup: '',
  },
  {
    id: 'p3', viz: 'threshold', start: '2026-11-02', due: '2026-11-08',
    en: { title: 'Abuse and misuse classifier, with tradeoffs', desc: 'A classifier that flags abusive or misuse behaviour, plus a write-up on where to set the threshold and what each choice costs.' },
    zh: { title: '滥用与误用分类器及权衡分析', desc: '识别滥用或误用行为的分类器，并撰文分析阈值设定及每种选择的代价。' },
    skills: ['classify', 'evaluate', 'writing'], figure: { kind: 'sieve', label: { en: 'Interactive figure: three stacked sieves over a pan. The pointer height picks which sieve rises, like picking a classification threshold.', zh: '互动图：叠放在底盘上的三层筛网，指针高度决定哪一层升起，类似选择分类阈值。' } },
    repo: '', writeup: '',
  },
  {
    id: 'p4', viz: 'ab', start: '2026-11-09', due: '2026-11-15',
    en: { title: 'A/B testing toolkit and readout', desc: 'A reusable toolkit for sizing, running and analysing experiments, and a readout written for decision makers.' },
    zh: { title: 'A/B 测试工具包与结果报告', desc: '可复用的实验工具包，涵盖样本量估算、执行与分析，并附面向决策者的结果报告。' },
    skills: ['experiment', 'stats', 'writing'], figure: { kind: 'riffle', label: { en: 'Interactive figure: a tray of eight cards. The card under the pointer stands up, like comparing variants side by side.', zh: '互动图：一排八张卡片，指针所在的卡片会立起，类似并排比较不同方案。' } },
    repo: '', writeup: '',
  },
  {
    id: 'p5', viz: 'capstone', start: '2026-11-16', due: '2026-11-22',
    en: { title: 'Capstone project', desc: 'An end-to-end project that brings the previous four together: data, modelling, experiment and a clear story.' },
    zh: { title: '毕业项目', desc: '把前四个项目串联起来的端到端项目：数据、建模、实验与清晰的叙述。' },
    skills: ['sql', 'anomaly', 'classify', 'experiment', 'stats', 'writing'], figure: { kind: 'relay', label: { en: 'Interactive figure: a hub with four branches. The path to the node under the pointer lights up, like four projects feeding one capstone.', zh: '互动图：一个中心连着四条分支，指针所在节点的路径会逐段点亮，类似四个项目汇入一个毕业项目。' } },
    repo: '', writeup: '',
  },
];

// Shipped work that already proves skills (anchors into the Work section).
export const shippedProof: { href: string; title: string; skills: SkillId[] }[] = [
  { href: '#p-pb', title: 'ProfessorBook', skills: ['llm', 'extract', 'fullstack', 'writing'] },
  { href: '#p-ml', title: 'Mathleagues', skills: ['extract', 'fullstack'] },
  { href: '#p-fn', title: 'FreshNext', skills: ['forecast', 'dash', 'fullstack'] },
];
