"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { FormEvent, useEffect, useMemo, useState } from "react";

type Locale = "en" | "zh-CN";
type View = "today" | "important" | "planned" | "completed";
type RepeatRule = "none" | "daily" | "weekdays" | "weekly" | "monthly" | "yearly";
type TaskList = "工作" | "生活" | "自我成长";
type Task = {
  id: string;
  title: string;
  date: string;
  list: TaskList;
  time?: string;
  repeat: RepeatRule;
  important?: boolean;
  pinned?: boolean;
  completed?: boolean;
  notes?: string;
  updatedAt: number;
};

type Messages = {
  workspace: string;
  myDay: string;
  important: string;
  planned: string;
  completed: string;
  myLists: string;
  newList: string;
  settings: string;
  localMode: string;
  localOnly: string;
  backup: string;
  search: string;
  more: string;
  todayProgress: string;
  planProgress: string;
  tasks: string;
  pending: string;
  pinned: string;
  recurring: string;
  completeToday: string;
  emptyDay: string;
  moreToGo: string;
  todayPlan: string;
  planFor: string;
  modifiedFirst: string;
  noPending: string;
  emptyCompleted: string;
  addTask: string;
  whatNext: string;
  selectRepeat: string;
  add: string;
  cancel: string;
  taskDetails: string;
  closeDetails: string;
  taskName: string;
  date: string;
  time: string;
  list: string;
  repeat: string;
  notes: string;
  notesPlaceholder: string;
  saveChanges: string;
  today: string;
  tomorrow: string;
  nextWeek: string;
  nextUp: string;
  calmToday: string;
  noPendingPlans: string;
  previousMonth: string;
  nextMonth: string;
  newPlan: string;
  focus: string;
  give25: string;
  focusRunning: string;
  focusPaused: string;
  focusDescription: string;
  pauseFocus: string;
  continueFocus: string;
  startFocus: string;
  reset: string;
  celebrationTitle: string;
  celebrationText: string;
  removed: string;
  undo: string;
  dismiss: string;
  editTask: string;
  moveToday: string;
  moveTomorrow: string;
  deleteTask: string;
  overdue: string;
  uncomplete: string;
  markComplete: string;
  edit: string;
  setRepeat: string;
  markImportant: string;
  unmarkImportant: string;
  pinTask: string;
  unpinTask: string;
  displayName: string;
  language: string;
  settingsHint: string;
  closeSettings: string;
  languageEnglish: string;
  languageChinese: string;
};

const LEGACY_TODAY = "2026-09-02";
const STORAGE_KEY = "daily-planner-tasks-v1";
const RESTORE_KEY = "daily-planner-restore-sample-v1";
const TODAY_MIGRATION_KEY = "daily-planner-today-migration-v1";
const LOCALE_KEY = "daily-planner-locale-v1";
const NAME_KEY = "daily-planner-name-v1";

const messages: Record<Locale, Messages> = {
  en: {
    workspace: "Workspace", myDay: "My Day", important: "Important", planned: "Planned", completed: "Completed", myLists: "My lists", newList: "New list", settings: "Settings", localMode: "Local mode", localOnly: "Your data stays on this device", backup: "Back up tasks", search: "Search tasks…", more: "More", todayProgress: "Today’s progress", planProgress: "Plan progress", tasks: "tasks", pending: "Pending", pinned: "Pinned", recurring: "Recurring", completeToday: "Great work. Today is complete.", emptyDay: "This day is still open — write down one thing to start.", moreToGo: "Nice start. Complete {count} more to wrap up today.", todayPlan: "Today’s plan", planFor: "Plan for", modifiedFirst: "Latest edits first", noPending: "No pending tasks. Enjoy the breathing room.", emptyCompleted: "Completed tasks will appear here, neatly tucked away.", addTask: "Add task", whatNext: "What would you like to do next?", selectRepeat: "Choose repeat rule", add: "Add", cancel: "Cancel", taskDetails: "Task details", closeDetails: "Close details", taskName: "Task name", date: "Date", time: "Time", list: "List", repeat: "Repeat", notes: "Notes", notesPlaceholder: "Add a little context for this task…", saveChanges: "Save changes", today: "Today", tomorrow: "Tomorrow", nextWeek: "Next week", nextUp: "Next up", calmToday: "A calm day ahead", noPendingPlans: "There are no pending plans right now.", previousMonth: "Previous month", nextMonth: "Next month", newPlan: "New plan", focus: "Focus time", give25: "Give yourself 25 minutes", focusRunning: "Stay with the one thing in front of you. The rest can wait.", focusPaused: "A pause is okay. Continue when you are ready.", focusDescription: "Put your attention on one thing in front of you.", pauseFocus: "Pause focus", continueFocus: "Continue focus", startFocus: "Start focus", reset: "Reset", celebrationTitle: "Today, beautifully complete.", celebrationText: "Every plan has been gently taken care of.", removed: "Removed “{title}”", undo: "Undo", dismiss: "Dismiss notification", editTask: "Edit task", moveToday: "Move to today", moveTomorrow: "Move to tomorrow", deleteTask: "Delete task", overdue: "Overdue", uncomplete: "Mark {title} as pending", markComplete: "Complete {title}", edit: "Edit {title}", setRepeat: "Set repeat", markImportant: "Mark important", unmarkImportant: "Remove importance", pinTask: "Pin task", unpinTask: "Unpin task", displayName: "Your name", language: "Language", settingsHint: "Used for your greeting and saved locally.", closeSettings: "Close settings", languageEnglish: "English", languageChinese: "简体中文",
  },
  "zh-CN": {
    workspace: "工作区", myDay: "我的一天", important: "重要", planned: "计划中", completed: "已完成", myLists: "我的清单", newList: "新建清单", settings: "设置", localMode: "本地模式", localOnly: "数据只保存在此设备", backup: "备份任务", search: "搜索任务…", more: "更多操作", todayProgress: "今日完成度", planProgress: "计划完成度", tasks: "项任务", pending: "待完成", pinned: "已置顶", recurring: "重复任务", completeToday: "太棒了，今天的安排圆满完成。", emptyDay: "这一天还很空，先写下一件想完成的事吧。", moreToGo: "好的开始！再完成 {count} 项，今天就圆满了。", todayPlan: "今天的安排", planFor: "为", modifiedFirst: "最近修改优先", noPending: "没有待完成的任务，享受这段空白吧。", emptyCompleted: "完成任务后，它们会整齐地出现在这里。", addTask: "添加任务", whatNext: "接下来想做什么？", selectRepeat: "选择重复规则", add: "添加", cancel: "取消", taskDetails: "任务详情", closeDetails: "关闭详情", taskName: "任务名称", date: "日期", time: "时间", list: "清单", repeat: "重复", notes: "备注", notesPlaceholder: "写下这件事的上下文…", saveChanges: "保存修改", today: "今天", tomorrow: "明天", nextWeek: "下周", nextUp: "接下来", calmToday: "今天很从容", noPendingPlans: "当前没有待处理的安排。", previousMonth: "上个月", nextMonth: "下个月", newPlan: "新建计划", focus: "专注一下", give25: "给自己 25 分钟", focusRunning: "现在只做眼前的一件事，其他稍后再想。", focusPaused: "暂停一下也没关系，准备好后继续。", focusDescription: "把注意力放在眼前的一件事上。", pauseFocus: "暂停计时", continueFocus: "继续专注", startFocus: "开始专注", reset: "重置", celebrationTitle: "今天，圆满完成！", celebrationText: "所有安排都被温柔地照顾到了。", removed: "已移除「{title}」", undo: "撤销", dismiss: "关闭提示", editTask: "编辑任务", moveToday: "移到今天", moveTomorrow: "移到明天", deleteTask: "删除任务", overdue: "已过期", uncomplete: "标记「{title}」未完成", markComplete: "完成「{title}」", edit: "编辑「{title}」", setRepeat: "设置重复", markImportant: "标记重要", unmarkImportant: "取消重要", pinTask: "置顶任务", unpinTask: "取消置顶", displayName: "你的名字", language: "语言", settingsHint: "用于首页问候语，只保存在本机。", closeSettings: "关闭设置", languageEnglish: "English", languageChinese: "简体中文",
  },
};

const repeatLabels: Record<Locale, Record<RepeatRule, string>> = {
  en: { none: "No repeat", daily: "Every day", weekdays: "Weekdays", weekly: "Every week", monthly: "Every month", yearly: "Every year" },
  "zh-CN": { none: "不重复", daily: "每天", weekdays: "每个工作日", weekly: "每周", monthly: "每月", yearly: "每年" },
};
const listLabels: Record<Locale, Record<TaskList, string>> = {
  en: { 工作: "Work", 生活: "Life", 自我成长: "Self-growth" },
  "zh-CN": { 工作: "工作", 生活: "生活", 自我成长: "自我成长" },
};
const listClass: Record<TaskList, string> = { 工作: "work", 生活: "life", 自我成长: "learning" };

const getTodayKey = () => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
};
const pad = (value: number) => String(value).padStart(2, "0");
const keyFromDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const dateFromKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};
const addDays = (key: string, days: number) => {
  const date = dateFromKey(key);
  date.setDate(date.getDate() + days);
  return keyFromDate(date);
};
const formatDate = (key: string, locale: Locale) => new Intl.DateTimeFormat(locale === "en" ? "en-US" : "zh-CN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(dateFromKey(key));
const formatShortDate = (key: string, locale: Locale) => new Intl.DateTimeFormat(locale === "en" ? "en-US" : "zh-CN", { month: "short", day: "numeric" }).format(dateFromKey(key));
const formatMonth = (month: Date, locale: Locale) => new Intl.DateTimeFormat(locale === "en" ? "en-US" : "zh-CN", { year: "numeric", month: "long" }).format(month);
const timestamp = () => Date.now();

const createInitialTasks = (today = getTodayKey()): Task[] => [
  { id: "project-files", title: "Sort this week's project files", date: today, list: "工作", repeat: "none", completed: true, updatedAt: 7 },
  { id: "call-mom", title: "Call Mom", date: today, list: "生活", time: "10:30", repeat: "weekly", updatedAt: 6 },
  { id: "review-notes", title: "Finish product retrospective", date: today, list: "工作", repeat: "none", important: true, updatedAt: 5 },
  { id: "lunch-walk", title: "Take a walk during lunch", date: today, list: "生活", time: "12:30", repeat: "daily", updatedAt: 4 },
  { id: "read-book", title: "Read 20 pages", date: today, list: "自我成长", repeat: "none", important: true, updatedAt: 3 },
  { id: "weekly-plan", title: "Plan next week's meetings", date: addDays(today, 2), list: "工作", time: "09:30", repeat: "weekly", updatedAt: 2 },
  { id: "groceries", title: "Restock weekend groceries", date: addDays(today, 5), list: "生活", repeat: "monthly", updatedAt: 1 },
];

function normalizeTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) return createInitialTasks();
  const repeatValues: RepeatRule[] = ["none", "daily", "weekdays", "weekly", "monthly", "yearly"];
  return value.flatMap((raw, index) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Partial<Task>;
    if (typeof item.title !== "string" || typeof item.date !== "string") return [];
    const repeat = repeatValues.includes(item.repeat as RepeatRule) ? item.repeat as RepeatRule : "none";
    return [{ id: typeof item.id === "string" ? item.id : `task-${index}`, title: item.title, date: item.date, list: item.list === "生活" || item.list === "自我成长" ? item.list : "工作", time: item.time, repeat, important: Boolean(item.important), pinned: Boolean(item.pinned), completed: Boolean(item.completed), notes: typeof item.notes === "string" ? item.notes : "", updatedAt: typeof item.updatedAt === "number" ? item.updatedAt : Date.now() - index }];
  });
}

function repeatNextDate(dateKey: string, rule: RepeatRule) {
  const date = dateFromKey(dateKey);
  if (rule === "daily") date.setDate(date.getDate() + 1);
  if (rule === "weekdays") do { date.setDate(date.getDate() + 1); } while (date.getDay() === 0 || date.getDay() === 6);
  if (rule === "weekly") date.setDate(date.getDate() + 7);
  if (rule === "monthly") { const day = date.getDate(); date.setDate(1); date.setMonth(date.getMonth() + 1); date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())); }
  if (rule === "yearly") date.setFullYear(date.getFullYear() + 1);
  return keyFromDate(date);
}

function RepeatOptions({ locale }: { locale: Locale }) {
  return <>{(Object.keys(repeatLabels[locale]) as RepeatRule[]).map((rule) => <option value={rule} key={rule}>{repeatLabels[locale][rule]}</option>)}</>;
}

function TaskDetails({ task, locale, onSave, onClose }: { task: Task; locale: Locale; onSave: (update: Partial<Task>) => void; onClose: () => void }) {
  const copy = messages[locale];
  const [title, setTitle] = useState(task.title);
  const [date, setDate] = useState(task.date);
  const [time, setTime] = useState(task.time ?? "");
  const [list, setList] = useState(task.list);
  const [repeat, setRepeat] = useState(task.repeat);
  const [notes, setNotes] = useState(task.notes ?? "");
  const today = getTodayKey();
  return <div className="task-details"><div className="detail-top"><span>{copy.taskDetails}</span><button aria-label={copy.closeDetails} onClick={onClose}>×</button></div><label className="detail-field full"><span>{copy.taskName}</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label><div className="detail-fields"><label className="detail-field"><span>{copy.date}</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /><small className="date-shortcuts"><button type="button" onClick={() => setDate(today)}>{copy.today}</button><button type="button" onClick={() => setDate(addDays(today, 1))}>{copy.tomorrow}</button><button type="button" onClick={() => setDate(addDays(today, 7))}>{copy.nextWeek}</button></small></label><label className="detail-field"><span>{copy.time}</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label></div><div className="detail-fields"><label className="detail-field"><span>{copy.list}</span><select value={list} onChange={(event) => setList(event.target.value as TaskList)}>{(Object.keys(listLabels[locale]) as TaskList[]).map((item) => <option value={item} key={item}>{listLabels[locale][item]}</option>)}</select></label><label className="detail-field"><span>{copy.repeat}</span><select value={repeat} onChange={(event) => setRepeat(event.target.value as RepeatRule)}><RepeatOptions locale={locale} /></select></label></div><label className="detail-field full"><span>{copy.notes}</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={copy.notesPlaceholder} /></label><div className="detail-actions"><button className="save-detail" onClick={() => onSave({ title: title.trim() || task.title, date, time: time || undefined, list, repeat, notes })}>{copy.saveChanges}</button><button className="cancel-detail" onClick={onClose}>{copy.cancel}</button></div></div>;
}

function formatTimer(seconds: number) { return `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`; }

function NextUpCard({ task, selectedDate, locale }: { task?: Task; selectedDate: string; locale: Locale }) {
  const copy = messages[locale];
  return <div className="next-up-card"><div className="next-up-head"><span className="eyebrow">{copy.nextUp}</span><span className="next-up-mark">◌</span></div>{task ? <><h3>{task.title}</h3><p><i className={`dot ${listClass[task.list]}`} />{listLabels[locale][task.list]}<em>·</em>{task.time ?? (task.date === selectedDate ? copy.today : formatShortDate(task.date, locale))}</p></> : <><h3>{copy.calmToday}</h3><p>{copy.noPendingPlans}</p></>}</div>;
}

function Calendar({ selectedDate, month, tasks, locale, onSelect, onMonthChange, onCreate }: { selectedDate: string; month: Date; tasks: Task[]; locale: Locale; onSelect: (key: string) => void; onMonthChange: (offset: number) => void; onCreate: () => void }) {
  const copy = messages[locale];
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => index < firstWeekday ? null : index - firstWeekday + 1);
  const taskDates = new Set(tasks.map((task) => task.date));
  const weekdays = locale === "en" ? ["M", "T", "W", "T", "F", "S", "S"] : ["一", "二", "三", "四", "五", "六", "日"];
  return <div className="mini-calendar"><div className="calendar-head"><h2>{formatMonth(month, locale)}</h2><div className="calendar-nav"><button aria-label={copy.previousMonth} onClick={() => onMonthChange(-1)}>‹</button><button aria-label={copy.nextMonth} onClick={() => onMonthChange(1)}>›</button></div></div><div className="weekdays">{weekdays.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="calendar-grid">{cells.map((day, index) => { if (!day) return <span className="empty-day" key={`empty-${index}`} />; const key = `${year}-${pad(monthIndex + 1)}-${pad(day)}`; const isSelected = selectedDate === key; return <button aria-label={`${locale === "en" ? "Select" : "选择"} ${key}`} className={`${isSelected ? "today" : ""} ${taskDates.has(key) ? "has-task" : ""}`} key={key} onClick={() => onSelect(key)}>{day}</button>; })}</div><button className="calendar-action" onClick={onCreate}><span>＋</span> {copy.newPlan}</button></div>;
}

function TaskRow({ task, locale, editingRepeat, expanded, menuOpen, onToggle, onImportant, onPin, onDelete, onEditRepeat, onRepeatChange, onOpen, onClose, onSave, onMenuToggle, onMoveToday, onMoveTomorrow }: { task: Task; locale: Locale; editingRepeat: boolean; expanded: boolean; menuOpen: boolean; onToggle: () => void; onImportant: () => void; onPin: () => void; onDelete: () => void; onEditRepeat: () => void; onRepeatChange: (rule: RepeatRule) => void; onOpen: () => void; onClose: () => void; onSave: (update: Partial<Task>) => void; onMenuToggle: () => void; onMoveToday: () => void; onMoveTomorrow: () => void }) {
  const copy = messages[locale];
  const today = getTodayKey();
  const dueState = task.date < today ? "overdue" : task.date > today ? "upcoming" : "today";
  const dateLabel = task.date < today ? copy.overdue : task.date === today ? `${copy.today}${task.time ? ` · ${task.time}` : ""}` : `${formatShortDate(task.date, locale)}${task.time ? ` · ${task.time}` : ""}`;
  const interpolate = (value: string) => value.replace("{title}", task.title);
  return <><div className={`task-row ${task.completed ? "done" : ""} ${task.pinned ? "pinned" : ""} ${menuOpen ? "menu-open" : ""}`}><button className="check" aria-label={task.completed ? interpolate(copy.uncomplete) : interpolate(copy.markComplete)} onClick={onToggle}>{task.completed ? "✓" : ""}</button><button className="task-copy" onClick={onOpen} aria-label={interpolate(copy.edit)}><strong>{task.title}</strong><span><i className={`dot ${listClass[task.list]}`} />{listLabels[locale][task.list]}<em>·</em><b className={`due-label ${dueState}`}>{dateLabel}</b>{task.repeat !== "none" && <><em>·</em><b className="repeat-label">↻ {repeatLabels[locale][task.repeat]}</b></>}</span></button>{editingRepeat ? <select className="repeat-select" autoFocus aria-label={`${copy.setRepeat}: ${task.title}`} value={task.repeat} onChange={(event) => onRepeatChange(event.target.value as RepeatRule)}><RepeatOptions locale={locale} /></select> : <button className={`repeat-button ${task.repeat !== "none" ? "set" : ""}`} aria-label={copy.setRepeat} onClick={onEditRepeat}>↻{task.repeat !== "none" && <small>{repeatLabels[locale][task.repeat]}</small>}</button>}<button className={`star ${task.important ? "starred" : ""}`} aria-label={task.important ? copy.unmarkImportant : copy.markImportant} onClick={onImportant}>{task.important ? "★" : "☆"}</button><button className={`pin ${task.pinned ? "active" : ""}`} aria-label={task.pinned ? copy.unpinTask : copy.pinTask} onClick={onPin}>↥</button><button className="more" title={copy.more} aria-label={`${copy.more}: ${task.title}`} aria-expanded={menuOpen} onClick={onMenuToggle}>···</button>{menuOpen && <div className="task-menu"><button onClick={onOpen}>{copy.editTask}</button><button onClick={onMoveToday}>{copy.moveToday}</button><button onClick={onMoveTomorrow}>{copy.moveTomorrow}</button><span /><button className="danger" title={copy.deleteTask} onClick={onDelete}><i className="trash-icon" aria-hidden="true" />{copy.deleteTask}</button></div>}</div>{expanded && <TaskDetails task={task} locale={locale} onSave={onSave} onClose={onClose} />}</>;
}

export default function Home() {
  const TODAY = getTodayKey();
  const initialTasks = useMemo(() => createInitialTasks(TODAY), [TODAY]);
  const [tasks, setTasks] = useState<Task[]>(() => initialTasks);
  const [locale, setLocale] = useState<Locale>("en");
  const [userName, setUserName] = useState("Alex");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [month, setMonth] = useState(() => { const today = dateFromKey(TODAY); return new Date(today.getFullYear(), today.getMonth(), 1); });
  const [view, setView] = useState<View>("today");
  const [listFilter, setListFilter] = useState<TaskList | null>(null);
  const [newTask, setNewTask] = useState("");
  const [newRepeat, setNewRepeat] = useState<RepeatRule>("none");
  const [isAdding, setIsAdding] = useState(false);
  const [editingRepeatId, setEditingRepeatId] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [menuTaskId, setMenuTaskId] = useState<string | null>(null);
  const [deletedTask, setDeletedTask] = useState<{ task: Task; index: number } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [celebrate, setCelebrate] = useState(false);
  const copy = messages[locale];

  useEffect(() => {
    const savedLocale = window.localStorage.getItem(LOCALE_KEY);
    if (savedLocale === "en" || savedLocale === "zh-CN") setLocale(savedLocale);
    const savedName = window.localStorage.getItem(NAME_KEY);
    if (savedName?.trim()) setUserName(savedName.trim());
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        let normalized = normalizeTasks(JSON.parse(saved));
        if (window.localStorage.getItem(TODAY_MIGRATION_KEY) !== "1") {
          const sampleIds = new Set(initialTasks.map((task) => task.id));
          normalized = normalized.map((task) => sampleIds.has(task.id) && task.date === LEGACY_TODAY ? { ...task, date: TODAY, updatedAt: Date.now() } : task);
          window.localStorage.setItem(TODAY_MIGRATION_KEY, "1");
        }
        const alreadyRestored = window.localStorage.getItem(RESTORE_KEY) === "1";
        const knownIds = new Set(normalized.map((task) => task.id));
        setTasks(alreadyRestored ? normalized : [...normalized, ...initialTasks.filter((task) => !knownIds.has(task.id))]);
        window.localStorage.setItem(RESTORE_KEY, "1");
      } catch { /* keep the sample plan */ }
    } else {
      window.localStorage.setItem(RESTORE_KEY, "1");
      window.localStorage.setItem(TODAY_MIGRATION_KEY, "1");
    }
    setHydrated(true);
  }, [TODAY, initialTasks]);
  useEffect(() => { if (!hydrated) return; window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); window.localStorage.setItem(LOCALE_KEY, locale); window.localStorage.setItem(NAME_KEY, userName.trim() || "Alex"); document.documentElement.lang = locale; }, [tasks, locale, userName, hydrated]);
  useEffect(() => { if (!focusRunning) return; if (focusSeconds <= 0) { setFocusRunning(false); return; } const timer = window.setInterval(() => setFocusSeconds((seconds) => Math.max(0, seconds - 1)), 1000); return () => window.clearInterval(timer); }, [focusRunning, focusSeconds]);
  useEffect(() => { if (!deletedTask) return; const timer = window.setTimeout(() => setDeletedTask(null), 7000); return () => window.clearTimeout(timer); }, [deletedTask]);

  const selectedTasks = useMemo(() => tasks.filter((task) => task.date === selectedDate), [tasks, selectedDate]);
  const visibleTasks = useMemo(() => { let result = view === "today" ? selectedTasks : view === "important" ? tasks.filter((task) => task.important && !task.completed) : view === "planned" ? tasks.filter((task) => task.date >= selectedDate && !task.completed) : tasks.filter((task) => task.completed); if (listFilter) result = result.filter((task) => task.list === listFilter); if (search.trim()) result = result.filter((task) => task.title.toLowerCase().includes(search.trim().toLowerCase())); return [...result].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.updatedAt - a.updatedAt); }, [tasks, selectedDate, selectedTasks, view, listFilter, search]);
  const pendingTasks = visibleTasks.filter((task) => !task.completed);
  const completedTasks = visibleTasks.filter((task) => task.completed);
  const nextTask = selectedTasks.filter((task) => !task.completed).sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"))[0];
  const completedCount = selectedTasks.filter((task) => task.completed).length;
  const progress = selectedTasks.length ? Math.round((completedCount / selectedTasks.length) * 100) : 0;
  const pageTitle = view === "today" ? copy.myDay : view === "important" ? copy.important : view === "planned" ? copy.planned : copy.completed;
  const displayName = userName.trim() || "Alex";
  const avatar = displayName.slice(0, 1).toUpperCase();
  const interpolate = (value: string, count?: number) => value.replace("{count}", String(count ?? 0));

  const selectDate = (key: string) => { setSelectedDate(key); setView("today"); setListFilter(null); const date = dateFromKey(key); setMonth(new Date(date.getFullYear(), date.getMonth(), 1)); };
  const goToToday = () => { setSelectedDate(TODAY); setView("today"); setListFilter(null); setSearch(""); const date = dateFromKey(TODAY); setMonth(new Date(date.getFullYear(), date.getMonth(), 1)); };
  const toggleTask = (id: string) => { const task = tasks.find((item) => item.id === id); if (!task) return; const now = timestamp(); const completing = !task.completed; let nextTasks = tasks.map((item) => item.id === id ? { ...item, completed: completing, updatedAt: now } : item); if (completing && task.repeat !== "none") nextTasks = [...nextTasks, { ...task, id: `${task.id}-next-${now}`, date: repeatNextDate(task.date, task.repeat), completed: false, pinned: false, updatedAt: now }]; const nextSelected = nextTasks.filter((item) => item.date === selectedDate); const justCompletedAll = nextSelected.length > 0 && nextSelected.every((item) => item.completed) && !selectedTasks.every((item) => item.completed); setTasks(nextTasks); if (justCompletedAll) { setCelebrate(true); window.setTimeout(() => setCelebrate(false), 3600); } };
  const addTask = (event: FormEvent) => { event.preventDefault(); const title = newTask.trim(); if (!title) return; const now = timestamp(); setTasks((current) => [...current, { id: `${now}`, title, date: selectedDate, list: listFilter ?? "工作", repeat: newRepeat, updatedAt: now }]); setNewTask(""); setNewRepeat("none"); setIsAdding(false); };
  const deleteTask = (id: string) => { const index = tasks.findIndex((task) => task.id === id); if (index < 0) return; setDeletedTask({ task: tasks[index], index }); setTasks((current) => current.filter((task) => task.id !== id)); setMenuTaskId(null); setOpenTaskId(null); };
  const undoDelete = () => { if (!deletedTask) return; setTasks((current) => { const next = [...current]; next.splice(Math.min(deletedTask.index, next.length), 0, deletedTask.task); return next; }); setDeletedTask(null); };
  const updateTask = (id: string, update: Partial<Task>) => setTasks((current) => current.map((task) => task.id === id ? { ...task, ...update, updatedAt: timestamp() } : task));
  const moveTask = (id: string, date: string) => { updateTask(id, { date }); setMenuTaskId(null); setOpenTaskId(null); };
  const shiftMonth = (offset: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  const changeView = (nextView: View) => { setView(nextView); setListFilter(null); setSearch(""); };
  const exportBackup = () => { const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), locale, userName: displayName, tasks }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `daily-planner-backup-${TODAY}.json`; link.click(); URL.revokeObjectURL(url); };

  return <main className={`app-shell ${celebrate ? "celebrating" : ""}`}>
    {celebrate && <div className="celebration" aria-live="polite"><div className="celebration-sparkles">✦ · ✧ · ✦</div><strong>{copy.celebrationTitle}</strong><span>{copy.celebrationText}</span></div>}
    {deletedTask && <div className="undo-toast" role="status"><span>{copy.removed.replace("{title}", deletedTask.task.title)}</span><button onClick={undoDelete}>{copy.undo}</button><button className="dismiss-toast" aria-label={copy.dismiss} onClick={() => setDeletedTask(null)}>×</button></div>}
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark" aria-hidden="true"><i /></span><span>Daily<br /><em>planner</em></span></div>
      <div className="profile-card"><div className="avatar">{avatar}</div><div><strong>{displayName}</strong><span>{locale === "en" ? "Make room for what matters" : "今天也要从容一点"}</span></div><span className="chevron">⌄</span></div>
      <nav className="nav-section"><span className="nav-label">{copy.workspace}</span><button className={`nav-item ${view === "today" && !listFilter ? "active" : ""}`} onClick={goToToday}><span>☼</span>{copy.myDay} <b>{tasks.filter((task) => task.date === TODAY && !task.completed).length}</b></button><button className={`nav-item ${view === "important" ? "active" : ""}`} onClick={() => changeView("important")}><span>☆</span>{copy.important} <b>{tasks.filter((task) => task.important && !task.completed).length}</b></button><button className={`nav-item ${view === "planned" ? "active" : ""}`} onClick={() => changeView("planned")}><span>▱</span>{copy.planned} <b>{tasks.filter((task) => task.date >= TODAY && !task.completed).length}</b></button><button className={`nav-item ${view === "completed" ? "active" : ""}`} onClick={() => changeView("completed")}><span>◷</span>{copy.completed}</button></nav>
      <nav className="nav-section lists"><span className="nav-label">{copy.myLists}<button aria-label={copy.newList}>＋</button></span>{(Object.keys(listLabels[locale]) as TaskList[]).map((list) => <button className={`nav-item ${listFilter === list ? "active" : ""}`} key={list} onClick={() => { setView("today"); setSelectedDate(TODAY); setListFilter(list); setSearch(""); }}>{<i className={`dot ${listClass[list]}`} />}{listLabels[locale][list]}<b>{tasks.filter((task) => task.list === list && !task.completed).length}</b></button>)}</nav>
      <div className="sidebar-bottom">
        {settingsOpen && <div className="settings-popover"><div className="settings-head"><strong>{copy.settings}</strong><button aria-label={copy.closeSettings} onClick={() => setSettingsOpen(false)}>×</button></div><label className="settings-field"><span>{copy.displayName}</span><input value={userName} maxLength={32} onChange={(event) => setUserName(event.target.value)} /></label><label className="settings-field"><span>{copy.language}</span><select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}><option value="en">{copy.languageEnglish}</option><option value="zh-CN">{copy.languageChinese}</option></select></label><small>{copy.settingsHint}</small></div>}
        <button className={`nav-item settings-button ${settingsOpen ? "active" : ""}`} aria-expanded={settingsOpen} onClick={() => setSettingsOpen((open) => !open)}><span>⚙</span>{copy.settings}</button>
        <div className="local-note"><span>◉</span><div><strong>{copy.localMode}</strong><small>{copy.localOnly}</small><button className="backup-button" onClick={exportBackup}>{copy.backup} <b>↗</b></button></div></div>
      </div>
    </aside>
    <section className="workspace">
      <header className="topbar"><div className="breadcrumb">{copy.workspace} <span>/</span> <strong>{listFilter ? listLabels[locale][listFilter] : pageTitle}</strong></div><div className="top-actions">{searchOpen && <input autoFocus className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.search} />}</div><div className="top-actions"><button className="icon-button" aria-label={copy.search} onClick={() => { setSearchOpen((open) => !open); if (searchOpen) setSearch(""); }}>⌕</button><button className="icon-button" aria-label={copy.more}>⋯</button></div></header>
      <div className="content-grid">
        <div className="main-column">
          <div className="intro"><div><p className="eyebrow">{formatDate(selectedDate, locale)}</p><h1>{view === "today" && selectedDate === TODAY ? `${locale === "en" ? "Hello" : "你好"}，${displayName}` : view === "today" ? (locale === "en" ? "Plan ahead" : "提前安排一下") : pageTitle} <span>✦</span></h1><p className="subcopy">{selectedDate === TODAY ? (locale === "en" ? "Leave a little breathing room for yourself today." : "今天也给自己留一点呼吸的空间。") : `${copy.planFor} ${formatShortDate(selectedDate, locale)}${locale === "en" ? "." : "留出的时间。"}`}</p></div><div className="weather"><span>☼</span><div><strong>26°</strong><small>{locale === "en" ? "Hangzhou · Sunny" : "杭州 · 晴"}</small></div></div></div>
          <div className={`progress-card ${progress === 100 ? "complete" : ""}`}><div className="progress-heading"><div><span className="eyebrow">{selectedDate === TODAY ? copy.todayProgress : copy.planProgress}</span><strong>{completedCount} <small>/ {selectedTasks.length} {copy.tasks}</small></strong></div><div className="percent">{progress}<small>%</small></div></div><div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div><div className="quick-stats"><div><strong>{selectedTasks.filter((task) => !task.completed).length}</strong><span>{copy.pending}</span></div><div><strong>{selectedTasks.filter((task) => task.pinned && !task.completed).length}</strong><span>{copy.pinned}</span></div><div><strong>{selectedTasks.filter((task) => task.repeat !== "none" && !task.completed).length}</strong><span>{copy.recurring}</span></div></div><p>{progress === 100 ? copy.completeToday : selectedTasks.length === 0 ? copy.emptyDay : interpolate(copy.moreToGo, selectedTasks.length - completedCount)}</p></div>
          <div className="task-list"><div className="list-heading"><h2>{listFilter ? listLabels[locale][listFilter] : view === "today" ? (selectedDate === TODAY ? copy.todayPlan : `${formatShortDate(selectedDate, locale)} ${locale === "en" ? "plan" : "的安排"}`) : `${pageTitle}${locale === "en" ? " tasks" : "的任务"}`}</h2><span className="task-count">{visibleTasks.length} {copy.tasks} · {copy.modifiedFirst}</span></div>
            <section className="task-group"><div className="group-heading"><span>{copy.pending}</span><b>{pendingTasks.length}</b></div>{pendingTasks.length ? pendingTasks.map((task) => <TaskRow key={task.id} task={task} locale={locale} editingRepeat={editingRepeatId === task.id} expanded={openTaskId === task.id} menuOpen={menuTaskId === task.id} onToggle={() => toggleTask(task.id)} onImportant={() => updateTask(task.id, { important: !task.important })} onPin={() => updateTask(task.id, { pinned: !task.pinned })} onDelete={() => deleteTask(task.id)} onEditRepeat={() => { setEditingRepeatId(task.id); setOpenTaskId(null); }} onRepeatChange={(rule) => { updateTask(task.id, { repeat: rule }); setEditingRepeatId(null); }} onOpen={() => { setOpenTaskId(task.id); setEditingRepeatId(null); setMenuTaskId(null); }} onClose={() => setOpenTaskId(null)} onSave={(update) => { updateTask(task.id, update); setOpenTaskId(null); }} onMenuToggle={() => setMenuTaskId(menuTaskId === task.id ? null : task.id)} onMoveToday={() => moveTask(task.id, TODAY)} onMoveTomorrow={() => moveTask(task.id, addDays(TODAY, 1))} />) : <p className="group-empty">{copy.noPending}</p>}{isAdding && <form className="add-form" onSubmit={addTask}><span>＋</span><input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setIsAdding(false); }} placeholder={copy.whatNext} /><select aria-label={copy.selectRepeat} value={newRepeat} onChange={(event) => setNewRepeat(event.target.value as RepeatRule)}><RepeatOptions locale={locale} /></select><button type="submit">{copy.add}</button><button type="button" onClick={() => setIsAdding(false)}>{copy.cancel}</button></form>}{!isAdding && <button className="add-task" onClick={() => setIsAdding(true)}><span>＋</span>{copy.addTask}</button>}</section>
            <section className="task-group completed-group"><div className="group-heading"><span>{copy.completed}</span><b>{completedTasks.length}</b></div>{completedTasks.length ? completedTasks.map((task) => <TaskRow key={task.id} task={task} locale={locale} editingRepeat={editingRepeatId === task.id} expanded={openTaskId === task.id} menuOpen={menuTaskId === task.id} onToggle={() => toggleTask(task.id)} onImportant={() => updateTask(task.id, { important: !task.important })} onPin={() => updateTask(task.id, { pinned: !task.pinned })} onDelete={() => deleteTask(task.id)} onEditRepeat={() => { setEditingRepeatId(task.id); setOpenTaskId(null); }} onRepeatChange={(rule) => { updateTask(task.id, { repeat: rule }); setEditingRepeatId(null); }} onOpen={() => { setOpenTaskId(task.id); setEditingRepeatId(null); setMenuTaskId(null); }} onClose={() => setOpenTaskId(null)} onSave={(update) => { updateTask(task.id, update); setOpenTaskId(null); }} onMenuToggle={() => setMenuTaskId(menuTaskId === task.id ? null : task.id)} onMoveToday={() => moveTask(task.id, TODAY)} onMoveTomorrow={() => moveTask(task.id, addDays(TODAY, 1))} />) : <p className="group-empty">{copy.emptyCompleted}</p>}</section>
          </div>
        </div>
        <aside className="right-column"><Calendar selectedDate={selectedDate} month={month} tasks={tasks} locale={locale} onSelect={selectDate} onMonthChange={shiftMonth} onCreate={() => setIsAdding(true)} /><div className={`focus-card ${focusRunning ? "started" : ""} ${focusSeconds < 25 * 60 ? "session-active" : ""}`}><span className="focus-icon">{focusRunning ? "◷" : "☕"}</span><span className="eyebrow">{copy.focus}</span><h3>{focusRunning || focusSeconds < 25 * 60 ? formatTimer(focusSeconds) : copy.give25}</h3><p>{focusRunning ? copy.focusRunning : focusSeconds < 25 * 60 ? copy.focusPaused : copy.focusDescription}</p><div className="focus-actions"><button onClick={() => { if (focusSeconds <= 0) setFocusSeconds(25 * 60); setFocusRunning((running) => !running); }}>{focusRunning ? copy.pauseFocus : focusSeconds < 25 * 60 ? copy.continueFocus : copy.startFocus} <span>{focusRunning ? "Ⅱ" : "→"}</span></button>{(focusRunning || focusSeconds < 25 * 60) && <button className="focus-reset" onClick={() => { setFocusRunning(false); setFocusSeconds(25 * 60); }}>{copy.reset}</button>}</div><div className="focus-track"><div style={{ width: `${((25 * 60 - focusSeconds) / (25 * 60)) * 100}%` }} /></div></div><NextUpCard task={nextTask} selectedDate={selectedDate} locale={locale} /></aside>
      </div>
    </section>
  </main>;
}
