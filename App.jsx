import React, { useEffect, useState } from "react";
import {
  BookOpen, CarFront, ChartNoAxesCombined, ShieldCheck, UserRound,
  LogOut, Trophy, Clock3, ArrowRight, LockKeyhole, Mail, Eye, EyeOff,
  CheckCircle2, CircleHelp, Settings, Menu, X
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./supabase";

const starterQuestions = [
  {
    question: "What does a triangular road sign with a red border usually indicate?",
    options: ["A warning", "A motorway", "A parking area", "A compulsory instruction"],
    correct: "A warning",
    explanation: "Triangular signs with red borders generally warn drivers about hazards or conditions ahead."
  },
  {
    question: "When should you use your mirrors?",
    options: ["Before changing speed or direction", "Only when parking", "Only on motorways", "Only at night"],
    correct: "Before changing speed or direction",
    explanation: "Use your mirrors regularly and before changing speed or direction so you know what is happening around you."
  }
];

function Brand() {
  return <div className="brand"><div className="brand-icon"><CarFront size={26}/></div><div><b>ROAD READY <span>UK</span></b><small>LEARN · PREPARE · DRIVE</small></div></div>;
}

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault(); setError(""); setMessage(""); setBusy(true);
    try {
      if (!isSupabaseConfigured) throw new Error("Account services aren't connected yet. Add your Supabase project details to the .env file first.");
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: name, role: "learner" } }
        });
        if (error) throw error;
        if (data.session) onAuthenticated(data.session.user);
        else setMessage("Check your email for a confirmation link. Once confirmed, come back and sign in.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthenticated(data.user);
      }
    } catch (err) { setError(err.message || "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  return <div className="auth-layout">
    <section className="auth-hero">
      <Brand/>
      <div className="hero-copy">
        <div className="eyebrow">YOUR JOURNEY STARTS HERE</div>
        <h1>Feel ready<br/>for the road.</h1>
        <p>Build confidence one step at a time, with learning tools that travel with you.</p>
        <div className="road-art"><div className="road-line"/></div>
        <div className="hero-points"><span>✓ Learn at your pace</span><span>✓ Track your progress</span><span>✓ Keep your learning in one place</span></div>
      </div>
      <div className="hero-footer">Your journey. Our support.</div>
    </section>
    <section className="auth-panel">
      <div className="auth-card">
        <div className="mobile-brand"><Brand/></div>
        <div className="eyebrow">LEARNER ACCOUNT</div>
        <h2>{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
        <p className="muted">{mode === "signup" ? "Start building your driving confidence today." : "Sign in to pick up where you left off."}</p>
        <form onSubmit={submit}>
          {mode === "signup" && <label>Your name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Alex Morgan" autoComplete="name" required minLength={2}/></label>}
          <label>Email address<div className="input-icon"><Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></div></label>
          <label>Password<div className="input-icon"><LockKeyhole size={17}/><input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={mode==="signup"?"new-password":"current-password"} required minLength={8}/><button className="icon-button" type="button" onClick={()=>setShowPassword(!showPassword)} aria-label="Show or hide password">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
          {error && <div className="notice error">{error}</div>}
          {message && <div className="notice success">{message}</div>}
          <button className="primary full" disabled={busy}>{busy?"Please wait…":mode==="signup"?"Create my account":"Sign in"} <ArrowRight size={18}/></button>
        </form>
        <div className="switch-auth">{mode==="signup"?"Already have an account?":"New to Road Ready UK?"} <button onClick={()=>{setMode(mode==="signup"?"login":"signup");setError("");setMessage("");}}>{mode==="signup"?"Sign in":"Create an account"}</button></div>
        <div className="privacy-note"><ShieldCheck size={17}/> Your account is private. Your learning records are visible only to you.</div>
        <p className="tiny">Road Ready UK is an independent learning platform and is not affiliated with or endorsed by DVSA.</p>
      </div>
    </section>
  </div>;
}

function Dashboard({ user, onSignOut }) {
  const [profile, setProfile] = useState({ full_name: user.user_metadata?.full_name || "", role: "learner" });
  const [progress, setProgress] = useState({ questions_answered: 0, correct_answers: 0 });
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("home");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [choice, setChoice] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => { loadData(); }, [user.id]);

  async function loadData() {
    if (!isSupabaseConfigured) return;
    const [p, s] = await Promise.all([
      supabase.from("learner_profiles").select("full_name, role").eq("id", user.id).maybeSingle(),
      supabase.from("learning_sessions").select("id, activity, score, total, created_at").eq("user_id", user.id).order("created_at", {ascending:false}).limit(10)
    ]);
    if (p.error || s.error) { setLoadError("We couldn't load all your learning data. Please refresh or contact support."); return; }
    if (p.data) setProfile(p.data);
    if (s.data) {
      setHistory(s.data);
      setProgress({
        questions_answered: s.data.reduce((n,x)=>n+(x.total||0),0),
        correct_answers: s.data.reduce((n,x)=>n+(x.score||0),0)
      });
    }
  }

  async function saveAnswer() {
    if (!choice) return;
    const q = starterQuestions[questionIndex];
    const score = choice === q.correct ? 1 : 0;
    setSaving(true); setFeedback(score ? "Correct — well done!" : `Not quite. ${q.explanation}`);
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("learning_sessions").insert({
        user_id: user.id, activity: "theory_practice", score, total: 1,
        details: { question_index: questionIndex, selected_answer: choice }
      });
      if (error) setLoadError("Your answer was shown, but couldn't be saved. Please try again later.");
      else await loadData();
    }
    setSaving(false);
  }

  const accuracy = progress.questions_answered ? Math.round(progress.correct_answers / progress.questions_answered * 100) : 0;
  const displayName = profile.full_name || user.email?.split("@")[0] || "Driver";

  return <div className="app-shell">
    <header className="topbar"><Brand/><div className="top-actions"><span className="welcome-user">Hi, {displayName}</span><button className="outline small" onClick={onSignOut}><LogOut size={16}/> Sign out</button></div></header>
    <div className="dashboard-wrap">
      <aside className="sidebar">
        <div className="side-label">YOUR SPACE</div>
        {[["home","Home",UserRound],["theory","Theory practice",BookOpen],["progress","My progress",ChartNoAxesCombined],["history","Learning history",Clock3],["settings","Account settings",Settings]].map(([id,label,Icon])=><button key={id} className={`nav-item ${tab===id?"active":""}`} onClick={()=>setTab(id)}><Icon size={18}/>{label}</button>)}
        <div className="sidebar-tip"><Trophy size={22}/><b>Every step counts!</b><small>Little and often is a great way to build confidence.</small></div>
      </aside>
      <main className="main-content">
        {loadError && <div className="notice error">{loadError}</div>}
        {tab==="home" && <>
          <div className="welcome-banner"><div><div className="eyebrow">YOUR DRIVING JOURNEY</div><h1>You're on your way, {displayName}!</h1><p>Ready for a little practice today?</p></div><div className="banner-emoji">🚗</div></div>
          <div className="section-heading"><div><h2>Your learning snapshot</h2><p className="muted">Your saved activity, all in one place.</p></div></div>
          <div className="stat-grid"><div className="stat-card"><BookOpen/><strong>{progress.questions_answered}</strong><span>Questions attempted</span></div><div className="stat-card"><Trophy/><strong>{progress.correct_answers}</strong><span>Correct answers</span></div><div className="stat-card"><ChartNoAxesCombined/><strong>{accuracy}%</strong><span>Accuracy</span></div></div>
          <div className="content-card"><div className="card-heading"><div><h3>Ready for a quick theory session?</h3><p className="muted">Try an original practice question and save your result.</p></div><BookOpen size={27}/></div><button className="primary" onClick={()=>setTab("theory")}>Start theory practice <ArrowRight size={17}/></button></div>
          <div className="content-card"><h3>Recent learning activity</h3><HistoryList history={history}/></div>
        </>}
        {tab==="theory" && <div className="content-card quiz-card"><div className="eyebrow">THEORY PRACTICE · SAMPLE</div><h2>{starterQuestions[questionIndex].question}</h2><div className="answer-list">{starterQuestions[questionIndex].options.map(opt=><button key={opt} className={`answer ${choice===opt?"selected":""}`} onClick={()=>{setChoice(opt);setFeedback("");}}>{opt}</button>)}</div>{feedback && <div className={`notice ${choice===starterQuestions[questionIndex].correct?"success":"error"}`}>{feedback}</div>}<div className="quiz-actions"><button className="outline" onClick={()=>{setQuestionIndex((questionIndex+1)%starterQuestions.length);setChoice("");setFeedback("");}}>Next question</button><button className="primary" disabled={!choice||saving} onClick={saveAnswer}>{saving?"Saving…":"Check answer & save"}</button></div><p className="tiny">These are original sample questions, not official DVSA questions or a complete theory test.</p></div>}
        {tab==="progress" && <div className="content-card"><div className="eyebrow">YOUR DEVELOPMENT</div><h2>My progress</h2><p className="muted">Your progress is calculated from saved practice sessions.</p><div className="progress-ring"><strong>{accuracy}%</strong><span>answer accuracy</span></div><div className="stat-grid"><div className="stat-card"><strong>{progress.questions_answered}</strong><span>Attempted</span></div><div className="stat-card"><strong>{progress.correct_answers}</strong><span>Correct</span></div></div></div>}
        {tab==="history" && <div className="content-card"><h2>Learning history</h2><p className="muted">Your latest saved practice sessions.</p><HistoryList history={history}/></div>}
        {tab==="settings" && <div className="content-card"><div className="eyebrow">YOUR ACCOUNT</div><h2>Account settings</h2><div className="profile-row"><span>Name</span><b>{displayName}</b></div><div className="profile-row"><span>Email</span><b>{user.email}</b></div><div className="profile-row"><span>Account type</span><b>Learner</b></div><p className="tiny">Profile editing, password reset and account deletion will be added before public launch.</p></div>}
      </main>
    </div>
    <footer className="app-footer">ROAD READY UK <span>·</span> Learn. Prepare. Drive. <span>·</span> Independent learning platform</footer>
  </div>;
}

function HistoryList({ history }) {
  if (!history.length) return <div className="empty-state"><CircleHelp size={25}/><b>No saved sessions yet</b><span>Complete a theory practice question to see it here.</span></div>;
  return <div className="history-list">{history.map(item=><div className="history-row" key={item.id}><div><b>{item.activity==="theory_practice"?"Theory practice":"Learning activity"}</b><small>{new Date(item.created_at).toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"})}</small></div><strong>{item.score}/{item.total}</strong></div>)}</div>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    if (!isSupabaseConfigured) { setChecking(false); return; }
    supabase.auth.getSession().then(({data})=>{setUser(data.session?.user ?? null);setChecking(false);});
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session)=>setUser(session?.user ?? null));
    return ()=>subscription.unsubscribe();
  }, []);
  async function signOut() { if (isSupabaseConfigured) await supabase.auth.signOut(); setUser(null); }
  if (checking) return <div className="loading">Getting your Road Ready space ready…</div>;
  return user ? <Dashboard user={user} onSignOut={signOut}/> : <Auth onAuthenticated={setUser}/>;
}
