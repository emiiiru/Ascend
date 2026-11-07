import { CATEGORIES, PLAN_OPTIONS, buildPlanDays, getCategory } from "./data.js";
import { isDemoMode, onAuthChange, signInWithGoogle, signOut } from "./auth.js";
import { createStore } from "./db.js";
import { icon } from "./icons.js";
import { computeStats, escapeHtml, lastSevenDays, toISODate } from "./utils.js";

const root = document.getElementById("app");

const state = {
  user: null,
  store: null,
  plans: new Map(), // categoryId -> plan
  busy: false,
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const navigate = (hash) => {
  location.hash = hash;
};

function parseRoute() {
  const [, name = "", id = "", day = ""] = location.hash.slice(1).split("/");
  return { name: name || "home", id, day };
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function toast(message, type = "info") {
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.setAttribute("role", "status");
  el.textContent = message;
  document.body.append(el);
  setTimeout(() => el.remove(), 2600);
}

/** Rounded, tinted icon chip for a category (size: "sm" | "" | "lg"). */
const categoryTile = (category, size = "") =>
  `<span class="tile ${size ? `tile--${size}` : ""}" style="--tone:${category.tone}">${icon(category.icon)}</span>`;

const plansList = () => [...state.plans.values()];
const doneCount = (plan) => Object.keys(plan.completed).length;

function createPlan(categoryId, daysPerWeek, previous) {
  return {
    categoryId,
    daysPerWeek,
    completed: {}, // { "1": "2026-10-31" } -> day number to completion date
    log: previous?.log ?? [], // every completion date, kept across weeks for stats
    weeksCompleted: previous?.weeksCompleted ?? 0,
    startedAt: previous?.startedAt ?? Date.now(),
    updatedAt: Date.now(),
  };
}

async function persist(plan) {
  const updated = { ...plan, updatedAt: Date.now() };
  await state.store.save(updated);
  state.plans.set(updated.categoryId, updated);
  render();
}

/* ------------------------------------------------------------------ */
/* Views                                                               */
/* ------------------------------------------------------------------ */

function viewLogin() {
  return `
    <main class="login">
      <section class="login__hero">
        <h2>Rise one day at a time.</h2>
        <p class="muted">Choose a plan, follow the routine and watch your streak grow.</p>
        <ul class="features">
          <li><span class="tile" style="--tone:#8fb4ff">${icon("calendar-check")}</span> Plans for 3, 5 or 7 days a week</li>
          <li><span class="tile" style="--tone:#6ee7b7">${icon("check-circle")}</span> Tick off every workout you finish</li>
          <li><span class="tile" style="--tone:#fdba74">${icon("flame")}</span> Build a streak and track your progress</li>
        </ul>
      </section>
      <div class="login__card">
        <img class="login__logo" src="assets/logo.svg" alt="Ascend logo" width="72" height="72" />
        <h1>Ascend</h1>
        <p class="muted">Pick a plan, follow it day by day and watch your progress grow.</p>
        <button class="btn btn--google" data-action="login">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/>
            <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/>
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
        ${
          isDemoMode
            ? `<p class="notice">Demo mode: add your Firebase config in <code>js/config.js</code> to enable real Google login and a cloud database.</p>`
            : ""
        }
      </div>
    </main>`;
}

function shell(content, activeNav) {
  const { user } = state;
  const initial = escapeHtml(user.name.trim().charAt(0).toUpperCase() || "?");
  const avatar = user.photo
    ? `<img class="avatar" src="${escapeHtml(user.photo)}" alt="" referrerpolicy="no-referrer" />`
    : `<span class="avatar avatar--initial" aria-hidden="true">${initial}</span>`;
  const current = (name) => (activeNav === name ? ' aria-current="page"' : "");

  return `
    <div class="app">
      <aside class="sidebar">
        <a class="brand" href="#/"><img src="assets/logo.svg" alt="" width="32" height="32" /> Ascend</a>
        <nav class="nav" aria-label="Main">
          <a href="#/"${current("home")}>${icon("dashboard")}<span>Dashboard</span></a>
          <a href="#/exercises"${current("exercises")}>${icon("dumbbell")}<span>Exercises</span></a>
        </nav>
        <div class="user">
          ${avatar}
          <span class="user__info">
            <strong class="user__name">${escapeHtml(user.name)}</strong>
            <small class="user__email">${escapeHtml(user.email)}</small>
          </span>
          <button class="btn btn--ghost btn--small" data-action="logout" aria-label="Sign out">
            ${icon("logout")}<span class="btn__label">Sign out</span>
          </button>
        </div>
      </aside>
      <main class="page">${content}</main>
    </div>`;
}

const statTile = (iconName, tone, label, value, hint) => `
  <div class="card stat">
    <div class="stat__top">
      <span class="stat__label">${label}</span>
      <span class="tile tile--sm" style="--tone:${tone}">${icon(iconName)}</span>
    </div>
    <strong class="stat__value">${value}</strong>
    <span class="stat__hint">${hint}</span>
  </div>`;

function planSummaryCard(plan) {
  const category = getCategory(plan.categoryId);
  if (!category) return "";
  const done = doneCount(plan);
  const percent = Math.round((done / plan.daysPerWeek) * 100);
  return `
    <a class="plan-row" href="#/plan/${category.id}">
      ${categoryTile(category)}
      <span class="plan-row__body">
        <strong>${escapeHtml(category.name)}</strong>
        <small>${plan.daysPerWeek}-day plan · ${done}/${plan.daysPerWeek} days this week</small>
        <span class="progress" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
          <span class="progress__bar" style="width:${percent}%"></span>
        </span>
      </span>
    </a>`;
}

function categoryCard(category) {
  const plan = state.plans.get(category.id);
  return `
    <a class="card card--link category" href="#/category/${category.id}">
      ${categoryTile(category, "lg")}
      <h3>${escapeHtml(category.name)}</h3>
      <p class="muted">${escapeHtml(category.description)}</p>
      <span class="tag ${plan ? "tag--active" : ""}">
        ${plan ? `Active · ${plan.daysPerWeek}-day plan` : "3 · 5 · 7 day plans"}
      </span>
    </a>`;
}

function viewHome() {
  const plans = plansList();
  const stats = computeStats(plans);
  const week = lastSevenDays(plans);
  const peak = Math.max(1, ...week.map((d) => d.count));
  const firstName = state.user.name.trim().split(" ")[0];

  const bars = week
    .map(
      (d) => `
      <div class="bars__col" title="${d.count} workout(s) on ${d.iso}">
        <div class="bars__track"><div class="bars__bar" style="height:${(d.count / peak) * 100}%"></div></div>
        <span>${d.label}</span>
      </div>`,
    )
    .join("");

  const planRows = plans.length
    ? plans.map(planSummaryCard).join("")
    : `<p class="muted">No active plans yet. <a href="#/exercises">Choose an exercise</a> to get started.</p>`;

  return `
    <section class="hero">
      <h1>${greeting()}, ${escapeHtml(firstName)}</h1>
      <p class="muted">Here is how your training is going.</p>
    </section>

    <section class="stats" aria-label="Summary">
      ${statTile("clipboard", "#8fb4ff", "Active plans", stats.activePlans, "in progress")}
      ${statTile("check-circle", "#6ee7b7", "Workouts done", stats.total, "all time")}
      ${statTile("calendar-check", "#c4b5fd", "This week", stats.thisWeek, "last 7 days")}
      ${statTile("flame", "#fdba74", "Day streak", stats.streak, stats.streak === 1 ? "day in a row" : "days in a row")}
    </section>

    <section class="split">
      <div class="card">
        <h2>Last 7 days</h2>
        <div class="bars" role="img" aria-label="Workouts completed per day over the last 7 days">${bars}</div>
      </div>
      <div class="card">
        <h2>Your plans</h2>
        <div class="plan-list">${planRows}</div>
      </div>
    </section>

    <section>
      <h2>Exercises</h2>
      <div class="grid">${CATEGORIES.map(categoryCard).join("")}</div>
    </section>`;
}

function viewExercises() {
  return `
    <section class="hero">
      <h1>Exercises</h1>
      <p class="muted">Choose a muscle group or goal, then pick a weekly plan.</p>
    </section>
    <div class="grid">${CATEGORIES.map(categoryCard).join("")}</div>`;
}

function viewCategory(categoryId) {
  const category = getCategory(categoryId);
  if (!category) return viewExercises();
  const current = state.plans.get(category.id);

  const options = PLAN_OPTIONS.map((option) => {
    const days = buildPlanDays(category, option.days);
    const isCurrent = current?.daysPerWeek === option.days;
    return `
      <button class="card card--link option ${isCurrent ? "option--current" : ""}"
              data-action="select-plan" data-category="${category.id}" data-days="${option.days}">
        <span class="option__days">${option.days}<small>days / week</small></span>
        <strong>${option.label}</strong>
        <span class="muted">${option.blurb}</span>
        <ul class="option__preview">
          ${days.map((d) => `<li>Day ${d.day}: ${escapeHtml(d.title)}</li>`).join("")}
        </ul>
        <span class="tag ${isCurrent ? "tag--active" : ""}">${isCurrent ? "Current plan" : "Start this plan"}</span>
      </button>`;
  }).join("");

  return `
    <a class="back" href="#/exercises">${icon("arrow-left")} All exercises</a>
    <section class="hero">
      <h1 class="hero__title">${categoryTile(category, "lg")} ${escapeHtml(category.name)}</h1>
      <p class="muted">${escapeHtml(category.description)}</p>
    </section>
    <h2>Choose your weekly plan</h2>
    <div class="grid grid--3">${options}</div>`;
}

function viewPlan(categoryId, dayParam) {
  const category = getCategory(categoryId);
  const plan = state.plans.get(categoryId);
  const days = buildPlanDays(category, plan.daysPerWeek);
  const done = doneCount(plan);
  const percent = Math.round((done / days.length) * 100);
  const firstOpen = days.find((d) => !plan.completed[d.day]) ?? days[days.length - 1];
  const selected = days.find((d) => d.day === Number(dayParam)) ?? firstOpen;
  const isDone = Boolean(plan.completed[selected.day]);
  const weekComplete = done === days.length;
  const restDays = 7 - days.length;

  const tabs = days
    .map((d) => {
      const classes = ["tab", d.day === selected.day ? "tab--active" : "", plan.completed[d.day] ? "tab--done" : ""];
      return `<a class="${classes.join(" ")}" href="#/plan/${category.id}/${d.day}"
                 ${d.day === selected.day ? 'aria-current="page"' : ""}>
                <span class="tab__num"><small>Day</small><strong>${d.day}</strong></span>
                <span class="tab__title">${escapeHtml(d.title)}</span>
                ${plan.completed[d.day] ? `<span class="tab__check">${icon("check")}</span>` : ""}
              </a>`;
    })
    .join("");

  const exercises = selected.exercises
    .map(
      (ex, i) => `
      <li class="exercise">
        <span class="exercise__num">${i + 1}</span>
        <span class="exercise__name">${escapeHtml(ex.name)}</span>
        <span class="pill">${escapeHtml(ex.amount)}</span>
      </li>`,
    )
    .join("");

  const banner = weekComplete
    ? `<div class="banner">
         <span class="banner__text">${icon("star")} Week complete! Great work.</span>
         <button class="btn btn--primary btn--small" data-action="next-week" data-category="${category.id}">Start next week</button>
       </div>`
    : "";

  return `
    <a class="back" href="#/category/${category.id}">${icon("arrow-left")} ${escapeHtml(category.name)} plans</a>
    <section class="hero">
      <h1 class="hero__title">${categoryTile(category, "lg")} ${escapeHtml(category.name)} · ${days.length}-day plan</h1>
      <p class="muted">
        ${done} of ${days.length} days done this week
        ${restDays ? `· rest on the other ${restDays} day${restDays > 1 ? "s" : ""}` : ""}
        ${plan.weeksCompleted ? `· ${plan.weeksCompleted} week${plan.weeksCompleted > 1 ? "s" : ""} finished` : ""}
      </p>
      <span class="progress progress--large" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
        <span class="progress__bar" style="width:${percent}%"></span>
      </span>
    </section>

    ${banner}

    <div class="plan-layout">
    <nav class="tabs" aria-label="Plan days">${tabs}</nav>

    <section class="card day">
      <div class="day__head">
        <div>
          <span class="eyebrow">Day ${selected.day}</span>
          <h2>${escapeHtml(selected.title)}</h2>
          <p class="muted">${escapeHtml(selected.focus)}</p>
        </div>
      </div>
      <ol class="exercises">${exercises}</ol>
      <div class="day__actions">
        <button class="btn ${isDone ? "btn--ghost" : "btn--primary"}"
                data-action="toggle-day" data-category="${category.id}" data-day="${selected.day}">
          ${isDone ? `${icon("undo")} Completed · Undo` : `${icon("check-circle")} Mark day complete`}
        </button>
        <a class="btn btn--ghost" href="#/category/${category.id}">${icon("refresh")} Change plan</a>
      </div>
    </section>
    </div>`;
}

/* ------------------------------------------------------------------ */
/* Rendering and routing                                               */
/* ------------------------------------------------------------------ */

function render() {
  if (!state.user) {
    root.innerHTML = viewLogin();
    return;
  }

  const { name, id, day } = parseRoute();

  // A plan page only makes sense once a plan exists for that category.
  if (name === "plan" && (!getCategory(id) || !state.plans.has(id))) {
    location.replace(getCategory(id) ? `#/category/${id}` : "#/exercises");
    return;
  }

  const views = {
    home: () => viewHome(),
    exercises: () => viewExercises(),
    category: () => viewCategory(id),
    plan: () => viewPlan(id, day),
  };
  const activeNav = name === "home" ? "home" : "exercises";
  root.innerHTML = shell((views[name] ?? views.home)(), activeNav);
}

/* ------------------------------------------------------------------ */
/* Actions (triggered from data-action attributes)                     */
/* ------------------------------------------------------------------ */

const actions = {
  async login() {
    try {
      await signInWithGoogle();
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user" && error.code !== "auth/cancelled-popup-request") {
        console.error(error);
        toast("Could not sign in with Google. Please try again.", "error");
      }
    }
  },

  logout: () => signOut(),

  async "select-plan"({ category, days }) {
    const existing = state.plans.get(category);
    if (existing?.daysPerWeek === days) {
      navigate(`#/plan/${category}`);
      return;
    }
    if (existing && doneCount(existing) > 0 && !confirm("Switching plans restarts this week's progress. Continue?")) {
      return;
    }
    await persist(createPlan(category, days, existing));
    toast("Plan saved");
    navigate(`#/plan/${category}`);
  },

  async "toggle-day"({ category, day }) {
    const plan = structuredClone(state.plans.get(category));
    const key = String(day);

    if (plan.completed[key]) {
      const date = plan.completed[key];
      delete plan.completed[key];
      const index = plan.log.lastIndexOf(date);
      if (index !== -1) plan.log.splice(index, 1);
    } else {
      const date = toISODate();
      plan.completed[key] = date;
      plan.log.push(date);
    }

    await persist(plan);
    toast(plan.completed[key] ? "Day completed. Nice work!" : "Marked as not done");
  },

  async "next-week"({ category }) {
    const plan = state.plans.get(category);
    await persist({ ...createPlan(category, plan.daysPerWeek, plan), weeksCompleted: plan.weeksCompleted + 1 });
    navigate(`#/plan/${category}/1`);
    toast("New week started");
  },
};

document.addEventListener("click", async (event) => {
  const el = event.target.closest("[data-action]");
  const handler = el && actions[el.dataset.action];
  if (!handler || state.busy) return;

  const { category, days, day } = el.dataset;
  state.busy = true;
  try {
    await handler({ category, days: Number(days), day: Number(day) });
  } catch (error) {
    console.error(error);
    toast("Something went wrong. Please try again.", "error");
  } finally {
    state.busy = false;
  }
});

window.addEventListener("hashchange", render);

/* ------------------------------------------------------------------ */
/* Start                                                               */
/* ------------------------------------------------------------------ */

onAuthChange(async (user) => {
  try {
    state.user = user;
    state.plans = new Map();
    state.store = null;

    if (user) {
      state.store = await createStore(user.uid);
      const saved = await state.store.list();
      state.plans = new Map(saved.map((plan) => [plan.categoryId, plan]));
    }
  } catch (error) {
    console.error(error);
    toast("Could not load your data. Check your connection.", "error");
  }
  render();
}).catch((error) => {
  console.error(error);
  root.innerHTML = `<p class="loading">Could not start the app. Check your Firebase config in js/config.js.</p>`;
});
