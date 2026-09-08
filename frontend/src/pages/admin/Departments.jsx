import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getDepartments, createDepartment } from "../../services/api";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", code: "", description: "" });

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load department data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await createDepartment(newDept);
      setNewDept({ name: "", code: "", description: "" });
      setShowAdd(false);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add department.");
    }
  };

  return (
    <>
      <Navbar role="admin" />
      <div className="dashboard-layout">
        <Sidebar role="admin" />
        <main className="content">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <p className="page-label text-muted small text-uppercase mb-1">ADMINISTRATION</p>
              <h2>Departments</h2>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? "Cancel" : "+ Add Department"}
            </button>
          </div>

          {showAdd && (
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <form onSubmit={handleAdd} className="row g-3">
                  <div className="col-md-4">
                    <input type="text" className="form-control" placeholder="Dept Name" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} required />
                  </div>
                  <div className="col-md-3">
                    <input type="text" className="form-control" placeholder="Code (e.g. FIN)" value={newDept.code} onChange={e => setNewDept({...newDept, code: e.target.value})} required />
                  </div>
                  <div className="col-md-4">
                    <input type="text" className="form-control" placeholder="Description" value={newDept.description} onChange={e => setNewDept({...newDept, description: e.target.value})} />
                  </div>
                  <div className="col-md-1">
                    <button type="submit" className="btn btn-success w-100">Add</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">Loading departments...</div>
          ) : error ? (
            <div className="text-danger p-4">{error}</div>
          ) : (
            <div className="row mt-4">
              {departments.map((dept, index) => (
                <div className="col-md-4 col-lg-3 mb-4" key={index}>
                  <div className="card shadow-sm h-100">
                    <div className="card-body text-center">
                      <div className="fs-1 mb-3">🏢</div>
                      <h5 className="card-title">{dept.name}</h5>
                      <p className="text-muted small mb-0">{dept.description || "No description"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default Departments;