import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getStaff, getDepartments, createStaff } from "../../services/api";

function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newStaff, setNewStaff] = useState({ full_name: "", email: "", password: "", department_id: "", employee_code: "" });

  const fetchData = async () => {
    try {
      const [staffData, deptData] = await Promise.all([
        getStaff(),
        getDepartments()
      ]);
      setStaffList(staffData);
      setDepartments(deptData);
      
      if (deptData.length > 0 && !newStaff.department_id) {
        setNewStaff(prev => ({ ...prev, department_id: deptData[0].id }));
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load staff data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await createStaff(newStaff);
      setNewStaff({ full_name: "", email: "", password: "", department_id: departments[0]?.id || "", employee_code: "" });
      setShowAdd(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add staff.");
    }
  };

  const getDeptName = (deptId) => {
    const d = departments.find(d => d.id === deptId);
    return d ? d.name : "Unknown";
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
              <h2>Staff Directory</h2>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? "Cancel" : "+ Add Staff"}
            </button>
          </div>

          {showAdd && (
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <form onSubmit={handleAdd} className="row g-3">
                  <div className="col-md-3">
                    <input type="text" className="form-control" placeholder="Full Name" value={newStaff.full_name} onChange={e => setNewStaff({...newStaff, full_name: e.target.value})} required />
                  </div>
                  <div className="col-md-3">
                    <input type="email" className="form-control" placeholder="Email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} required />
                  </div>
                  <div className="col-md-2">
                    <input type="password" className="form-control" placeholder="Password" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} required />
                  </div>
                  <div className="col-md-2">
                    <select className="form-select" value={newStaff.department_id} onChange={e => setNewStaff({...newStaff, department_id: e.target.value})} required>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-1">
                    <input type="text" className="form-control" placeholder="Emp Code" value={newStaff.employee_code} onChange={e => setNewStaff({...newStaff, employee_code: e.target.value})} required />
                  </div>
                  <div className="col-md-1">
                    <button type="submit" className="btn btn-success w-100">Add</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">Loading staff...</div>
          ) : error ? (
            <div className="text-danger p-4">{error}</div>
          ) : (
            <div className="card shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Employee Code</th>
                      <th>Capacity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((staff, idx) => (
                      <tr key={idx}>
                        <td><strong>{staff.full_name}</strong></td>
                        <td>{staff.email}</td>
                        <td>{getDeptName(staff.department_id)}</td>
                        <td>{staff.employee_code}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{height: "6px"}}>
                              <div className="progress-bar bg-success" style={{width: '20%'}}></div>
                            </div>
                            <small className="text-muted">Max: {staff.max_capacity}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${staff.is_available ? 'success' : 'danger'}`}>
                            {staff.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default Staff;