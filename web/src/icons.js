// Maps each section id to a lucide icon component. The server still sends an
// emoji in section.icon (kept for the export/markdown output), but the app
// UI renders these instead for a consistent, modern icon set.
import {
  Compass,
  CircleAlert,
  Target,
  Users,
  Lightbulb,
  ListChecks,
  CalendarDays,
  ShieldAlert,
  Map,
  BookOpen,
  Ban,
  CircleCheck,
  LayoutGrid,
  Workflow,
  Brain,
  Rocket,
  ClipboardList,
  HelpCircle,
  MessagesSquare,
  ListTodo,
  History,
  FileQuestion,
} from "lucide-react";

const SECTION_ICONS = {
  overview: Compass,
  problem: CircleAlert,
  goals: Target,
  users: Users,
  solution: Lightbulb,
  requirements: ListChecks,
  scope: CalendarDays,
  risks: ShieldAlert,
  problemAlignment: CircleAlert,
  highLevelApproach: Map,
  narrative: BookOpen,
  nonGoals: Ban,
  problemSignOff: CircleCheck,
  keyFeatures: LayoutGrid,
  keyFlows: Workflow,
  keyLogic: Brain,
  solutionSignOff: CircleCheck,
  launchPlan: Rocket,
  operationalChecklist: ClipboardList,
  faq: HelpCircle,
  openQuestions: MessagesSquare,
  impactChecklist: ListTodo,
  changelog: History,
};

export function sectionIcon(sectionId) {
  return SECTION_ICONS[sectionId] || FileQuestion;
}
