import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = axios.create({
  baseURL: "https://fsd-mse2-shivanshidhyani178-1.onrender.com/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [grievances, setGrievances] = useState([]);
  const [gForm, setGForm] = useState({ title: "", description: "", category: "Academic" });
  const [searchTitle, setSearchTitle] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "Academic", status: "Pending" });

  // Auth
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

  // Fetch all grievances
  const fetchGrievances = async () => {
    try {
      const res = await API.get("/grievances");
      setGrievances(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch");
    }
  };

  useEffect(() => {
    if (token) fetchGrievances();
  }, [token]);

  // Add grievance
  const addGrievance = async () => {
    try {
      await API.post("/grievances", gForm);
      setGForm({ title: "", description: "", category: "Academic" });
      fetchGrievances();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add");
    }
  };

  // Delete grievance
  const deleteGrievance = async (id) => {
    try {
      await API.delete(`/grievances/${id}`);
      fetchGrievances();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  // Search
  const handleSearch = async () => {
    if (!searchTitle.trim()) {
      alert("Enter a title to search");
      return;
    }
    try {
      const res = await API.get(`/grievances/search?title=${searchTitle}`);
      setSearchResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Search failed");
    }
  };

  const clearSearch = () => {
    setSearchTitle("");
    setSearchResult(null);
  };

  // Open edit form
  const openEdit = (g) => {
    setEditId(g._id);
    setEditForm({
      title: g.title,
      description: g.description,
      category: g.category,
      status: g.status,
    });
  };

  // Submit update
  const handleUpdate = async () => {
    try {
      await API.put(`/grievances/${editId}`, editForm);
      setEditId(null);
      fetchGrievances();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // ================= AUTH UI =================

  if (!token) {
    return (
      <div className="container">
        <h2>{isLogin ? "Login" : "Register"}</h2>

        {!isLogin && (
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button onClick={handleAuth}>{isLogin ? "Login" : "Register"}</button>

        <p onClick={() => setIsLogin(!isLogin)} className="link">
          {isLogin ? "Create account" : "Already have account?"}
        </p>
      </div>
    );
  }

  // ================= DASHBOARD UI =================

  const displayList = searchResult !== null ? searchResult : grievances;

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <button className="btn-logout" onClick={logout}>Logout</button>

      {/* Add Grievance Form */}
      <div className="form">
        <input
          placeholder="Title"
          value={gForm.title}
          onChange={(e) => setGForm({ ...gForm, title: e.target.value })}
        />
        <input
          placeholder="Description"
          value={gForm.description}
          onChange={(e) => setGForm({ ...gForm, description: e.target.value })}
        />
        <select
          value={gForm.category}
          onChange={(e) => setGForm({ ...gForm, category: e.target.value })}
        >
          <option>Academic</option>
          <option>Hostel</option>
          <option>Transport</option>
          <option>Other</option>
        </select>
        <button onClick={addGrievance}>Submit</button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          placeholder="Search by title..."
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        {searchResult !== null && (
          <button className="btn-clear" onClick={clearSearch}>Clear</button>
        )}
      </div>

      {/* Edit Form — shown when edit is open */}
      {editId && (
        <div className="edit-form">
          <h3>Edit Grievance</h3>
          <input
            placeholder="Title"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
          <input
            placeholder="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
          <select
            value={editForm.category}
            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
          >
            <option>Academic</option>
            <option>Hostel</option>
            <option>Transport</option>
            <option>Other</option>
          </select>
          <select
            value={editForm.status}
            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
          >
            <option>Pending</option>
            <option>Resolved</option>
          </select>
          <button onClick={handleUpdate}>Update</button>
          <button className="btn-cancel" onClick={() => setEditId(null)}>Cancel</button>
        </div>
      )}

      {/* Grievance List */}
      {displayList.length === 0 ? (
        <p className="no-data">No grievances found.</p>
      ) : (
        displayList.map((g) => (
          <div key={g._id} className="card">
            <h3>{g.title}</h3>
            <p>{g.description}</p>
            <div className="card-footer">
              <span className="badge">{g.category}</span>
              <span className={`status ${g.status === "Resolved" ? "resolved" : "pending"}`}>
                {g.status}
              </span>
            </div>
            <div className="card-actions">
              <button className="btn-edit" onClick={() => openEdit(g)}>Edit</button>
              <button className="btn-delete" onClick={() => deleteGrievance(g._id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default App;