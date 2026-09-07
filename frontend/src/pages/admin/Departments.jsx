import { useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import "./Departments.css";

function Departments() {
  const [departments, setDepartments] = useState([
    {
      name: "Finance",
      description: "Fees, payments and refunds",
      icon: "💰",
      tickets: 185,
      staff: 6,
    },
    {
      name: "Examination",
      description: "Exams, hall tickets and results",
      icon: "📝",
      tickets: 124,
      staff: 5,
    },
    {
      name: "Hostel",
      description: "Rooms, maintenance and facilities",
      icon: "🏠",
      tickets: 98,
      staff: 5,
    },
    {
      name: "Placement",
      description: "Placement drives and registrations",
      icon: "💼",
      tickets: 86,
      staff: 4,
    },
    {
      name: "Scholarship",
      description: "Scholarship applications and queries",
      icon: "🎓",
      tickets: 72,
      staff: 3,
    },
    {
      name: "IT Support",
      description: "Network, Wi-Fi and technical issues",
      icon: "💻",
      tickets: 76,
      staff: 4,
    },
    {
      name: "Admission",
      description: "Applications and admission queries",
      icon: "📋",
      tickets: 64,
      staff: 4,
    },
    {
      name: "Transport",
      description: "Bus passes and transportation",
      icon: "🚌",
      tickets: 45,
      staff: 3,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");

  const handleAddDepartment = (e) => {
    e.preventDefault();

    if (!newDepartment.trim()) {
      return;
    }

    const department = {
      name: newDepartment.trim(),
      description: "New college support department",
      icon: "🏢",
      tickets: 0,
      staff: 0,
    };

    setDepartments([...departments, department]);

    setNewDepartment("");
    setShowModal(false);
  };

  return (
    <>
      <Navbar role="admin" />

      <div className="dashboard-layout">

        <Sidebar role="admin" />

        <main className="content">

          {/* ================================
              HEADER
          ================================= */}

          <div className="departments-header">

            <div>
              <p className="page-label">
                ADMINISTRATION
              </p>

              <h1>
                Departments
              </h1>

              <p>
                Manage college departments responsible for student support.
              </p>
            </div>

            <button
              className="add-department-btn"
              onClick={() => setShowModal(true)}
            >
              <span>+</span>
              Add Department
            </button>

          </div>


          {/* ================================
              SUMMARY
          ================================= */}

          <div className="department-summary">

            <div className="summary-item">

              <div className="summary-icon">
                🏢
              </div>

              <div>
                <span>Total Departments</span>
                <strong>{departments.length}</strong>
              </div>

            </div>


            <div className="summary-item">

              <div className="summary-icon">
                🎫
              </div>

              <div>
                <span>Total Active Tickets</span>
                <strong>750</strong>
              </div>

            </div>


            <div className="summary-item">

              <div className="summary-icon">
                👥
              </div>

              <div>
                <span>Total Staff</span>
                <strong>34</strong>
              </div>

            </div>

          </div>


          {/* ================================
              DEPARTMENT GRID
          ================================= */}

          <div className="departments-section">

            <div className="section-title">

              <div>
                <h3>
                  All Departments
                </h3>

                <p>
                  Departments available for AI ticket routing
                </p>
              </div>

              <span>
                {departments.length} Departments
              </span>

            </div>


            <div className="department-grid">

              {departments.map((department) => (

                <div
                  className="department-card"
                  key={department.name}
                >

                  {/* Top */}

                  <div className="department-card-top">

                    <div className="department-icon">
                      {department.icon}
                    </div>

                    <div className="department-ticket-count">
                      {department.tickets} tickets
                    </div>

                  </div>


                  {/* Content */}

                  <div className="department-card-content">

                    <h4>
                      {department.name}
                    </h4>

                    <p>
                      {department.description}
                    </p>

                  </div>


                  {/* Footer */}

                  <div className="department-card-footer">

                    <div className="staff-count">
                      👤 {department.staff} Staff
                    </div>

                    <button>
                      Manage →
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* ================================
              AI ROUTING INFO
          ================================= */}

          <div className="department-info">

            <div className="department-info-icon">
              🤖
            </div>

            <div>

              <strong>
                AI Department Routing
              </strong>

              <p>
                The AI analyzes student requests and automatically
                identifies the most suitable department based on
                the issue category.
              </p>

            </div>

          </div>


          {/* ================================
              ADD DEPARTMENT MODAL
          ================================= */}

          {showModal && (

            <div
              className="department-modal-overlay"
              onClick={() => setShowModal(false)}
            >

              <div
                className="department-modal"
                onClick={(e) => e.stopPropagation()}
              >

                <div className="modal-header">

                  <div>
                    <h3>
                      Add Department
                    </h3>

                    <p>
                      Create a new support department.
                    </p>
                  </div>

                  <button
                    className="modal-close"
                    onClick={() => setShowModal(false)}
                  >
                    ×
                  </button>

                </div>


                <form onSubmit={handleAddDepartment}>

                  <div className="modal-body">

                    <label>
                      Department Name
                    </label>

                    <input
                      type="text"
                      placeholder="Example: Library"
                      value={newDepartment}
                      onChange={(e) =>
                        setNewDepartment(e.target.value)
                      }
                      autoFocus
                    />

                  </div>


                  <div className="modal-footer">

                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="save-department-btn"
                    >
                      Add Department
                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

        </main>

      </div>
    </>
  );
}

export default Departments;