import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = axios.create({
  baseURL: "https://fsd-mse2-shivanshidhyani178-1.onrender.com/api",
});

// 🔐 Add token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [grievances, setGrievances] = useState([]);
  const [gForm, setGForm] = useState({
    title: "",
    description: "",
    category: "Academic",
  });

  // 🔐 Auth submit
  const handleAuth = async () => {
    try {
      const url = isLogin ? "/login" : "/register";
      const res = await API.post(url, form);

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  // 📄 Load grievances
  const fetchGrievances = async () => {
    const res = await API.get("/grievances");
    setGrievances(res.data);
  };

  useEffect(() => {
    if (token) fetchGrievances();
  }, [token]);

  // ➕ Add grievance
  const addGrievance = async () => {
    await API.post("/grievances", gForm);
    fetchGrievances();
  };

  // ❌ Delete
  const deleteGrievance = async (id) => {
    await API.delete(`/grievances/${id}`);
    fetchGrievances();
  };

  // 🔓 Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // ================= UI =================

  if (!token) {
    return (
      <div className="container">
        <h2>{isLogin ? "Login" : "Register"}</h2>

        {!isLogin && (
          <input
            placeholder="Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}

        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button onClick={handleAuth}>
          {isLogin ? "Login" : "Register"}
        </button>

        <p onClick={() => setIsLogin(!isLogin)} className="link">
          {isLogin ? "Create account" : "Already have account?"}
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <button onClick={logout}>Logout</button>

      {/* Add grievance */}
      <div className="form">
        <input
          placeholder="Title"
          onChange={(e) =>
            setGForm({ ...gForm, title: e.target.value })
          }
        />

        <input
          placeholder="Description"
          onChange={(e) =>
            setGForm({ ...gForm, description: e.target.value })
          }
        />

        <select
          onChange={(e) =>
            setGForm({ ...gForm, category: e.target.value })
          }
        >
          <option>Academic</option>
          <option>Hostel</option>
          <option>Transport</option>
          <option>Other</option>
        </select>

        <button onClick={addGrievance}>Submit</button>
      </div>

      {/* List */}
      {grievances.map((g) => (
        <div key={g._id} className="card">
          <h3>{g.title}</h3>
          <p>{g.description}</p>
          <span>{g.category}</span>
          <button onClick={() => deleteGrievance(g._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;