import { useEffect, useState } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import './App.css';
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios';
import Markdown from "react-markdown";
import "prismjs/components/prism-markdown";
import html2pdf from "html2pdf.js";

function App() {
  // ------------------ Auth States ------------------
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("currentUser")) || null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [alert, setAlert] = useState(null);

  // ------------------ Resume States ------------------
  const [resumePrompt, setResumePrompt] = useState(`✍️ Write your job role, skills, and experience here...`);
  const [generatedResume, setGeneratedResume] = useState(``);

  useEffect(() => {
    prism.highlightAll();
  });


  
useEffect(() => {
  if (!user) {
    setName("");
    setEmail("");
    setPassword("");
  }
}, [user]);
  // ------------------ Alerts ------------------
  function showAlert(message, type) {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  }

  // ------------------ Auth Handlers ------------------
function handleSignup() {
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (users[email]) {
    showAlert("❌ Email already exists!", "error");
    return;
  }

  // save new user
  users[email] = { name, password };
  localStorage.setItem("users", JSON.stringify(users));

  // success but DO NOT log in automatically
  showAlert("✅ Signup successful! Please login now.", "success");

  // reset inputs for login (manual typing required)
  setIsSignup(false);
  setName("");
  setEmail("");      // 👈 clear email too
  setPassword("");
}

function handleLogin() {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[email] && users[email].password === password) {
    const loggedUser = { email, name: users[email].name };
    setUser(loggedUser);
    localStorage.setItem("currentUser", JSON.stringify(loggedUser));
    showAlert(`✅ Welcome back, ${users[email].name}!`, "success");
  } else {
    showAlert("❌ Invalid email or password!", "error");
  }
}

function handleLogout() {
  setUser(null);
  localStorage.removeItem("currentUser");

  // clear inputs so login/signup fields don't pre-fill
  setName("");
  setEmail("");
  setPassword("");

  showAlert("👋 Logged out successfully.", "success");
}

  // ------------------ Resume Functions ------------------
  const downloadResume = async () => {
    const element = document.querySelector(".right");
    if (!element) return alert("No resume to download!");

    const options = {
      margin: [10, 3, 10, 10],
      filename: "My_Resume.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, scrollX: 0, scrollY: 0, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "p" },
      pagebreak: { mode: ["css", "legacy"] }
    };

    const clonedElement = element.cloneNode(true);
    const wrapper = document.createElement("div");
    wrapper.style.width = "210mm";
    wrapper.style.background = "white";
    wrapper.style.padding = "10mm";
    wrapper.style.boxSizing = "border-box";

    wrapper.appendChild(clonedElement);
    document.body.appendChild(wrapper);

    await html2pdf().set(options).from(wrapper).save();
    document.body.removeChild(wrapper);
  };

  async function buildResume() {
    try {
      const response = await axios.post('https://ai-resume-builder-backend-0vpw.onrender.com/ai/get-resume', { resumePrompt });
      setGeneratedResume(response.data);
    } catch (err) {
      setGeneratedResume("❌ Error: Could not generate resume. Check server.");
    }
  }

  function clearAll() {
    setResumePrompt("");
    setGeneratedResume("");
  }

  // ------------------ Render ------------------
if (!user) {
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">
          {isSignup ? "✨ Create Account" : "🔐 Welcome Back"}
        </h1>
        <p className="auth-subtitle">
          {isSignup ? "Join us and start building resumes 🚀" : "Login to continue 💼"}
        </p>

        {isSignup && (
          <input
            type="text"
            placeholder="👤 Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
          />
        )}

        <input
          type="email"
          placeholder="📧 Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />

        <input
          type="password"
          placeholder="🔑 Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />

        {isSignup ? (
          <button onClick={handleSignup} className="auth-btn signup-btn">✨ Signup</button>
        ) : (
          <button onClick={handleLogin} className="auth-btn login-btn">➡️ Login</button>
        )}

        <p onClick={() => setIsSignup(!isSignup)} className="toggle-auth">
          {isSignup ? "Already have an account? Login" : "Don’t have an account? Signup"}
        </p>

        {alert && (
          <div className={`auth-alert ${alert.type}`}>
            {alert.message}
          </div>
        )}
      </div>
    </div>
  );
}

  return (
    <>
      <header className="header">
        <h1>📄 AI Resume Builder</h1>
        <p className="subtitle">Generate ATS-friendly, professional resumes instantly 🚀</p>
  {user && (
    <p className="welcome-text">👋 Welcome back, {user.name}!</p>
  )}


        <div className="btn-group">
          <button className="review-btn" onClick={buildResume}>✨ Build Resume</button>
          <button className="download-btn" onClick={downloadResume}>⬇️ Download Resume</button>
          <button className="clear-btn" onClick={clearAll}>🗑 Clear</button>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </header>

      {alert && (
        <div className={`alert ${alert.type}`}>
          {alert.message}
        </div>
      )}

      <main>
        {/* Left: Prompt Input */}
        <div className="left">
          <div className="code">
            <h2>✍️ Enter Details</h2>
            <Editor
              value={resumePrompt}
              onValueChange={setResumePrompt}
              highlight={resumePrompt => prism.highlight(resumePrompt, prism.languages.markdown, "markdown")}
              padding={15}
              style={{
                fontFamily: '"Fira Code", monospace',
                fontSize: 16,
                border: "1px solid #444",
                borderRadius: "8px",
                height: "100%",
                width: "100%",
                backgroundColor: "#0f0f0f",
                color: "#fff",
                overflow: "auto"
              }}
            />
          </div>
        </div>

        {/* Right: Resume Preview */}
        <div className="right">
          <h2>📑 Resume Preview</h2>
          <div className="resume-preview">
            <Markdown rehypePlugins={[rehypeHighlight]}>
              {generatedResume || "💡 Your AI-generated resume will appear here after clicking 'Build Resume'."}
            </Markdown>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
