import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar role="staff" />

      <div className="dashboard-layout">
        <Sidebar role="staff" />

        <main className="content">
          {/* Header */}

          <div className="dashboard-header">
            <div>
              <p className="page-label">STAFF PORTAL</p>

              <h2>Staff Dashboard</h2>

              <p>Manage your assigned student support requests.</p>
            </div>
          </div>

          {/* Statistics */}

          <div className="row mt-4">
            <div className="col-md-3 mb-3">
              <div className="card dashboard-card">
                <div className="dashboard-card-icon blue">🎫</div>

                <h6>Active Tickets</h6>

                <h2>8</h2>

                <small>Currently assigned to you</small>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card dashboard-card">
                <div className="dashboard-card-icon red">🔥</div>

                <h6>High Priority</h6>

                <h2>2</h2>

                <small>Require immediate attention</small>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card dashboard-card">
                <div className="dashboard-card-icon green">✓</div>

                <h6>Resolved</h6>

                <h2>25</h2>

                <small>Successfully completed</small>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card dashboard-card">
                <div className="dashboard-card-icon purple">⚡</div>

                <h6>My Capacity</h6>

                <h2>8/10</h2>

                <small>2 slots available</small>
              </div>
            </div>
          </div>

          {/* Main Staff Section */}

          <div className="row mt-3">
            {/* Assigned Tickets */}

            <div className="col-md-8">
              <div className="card staff-section-card">
                <div className="section-header">
                  <div>
                    <h5>Assigned Tickets</h5>

                    <p>Recent tickets assigned to you</p>
                  </div>

                  <button
                    className="view-all-btn"
                    onClick={() => navigate("/staff/tickets")}
                  >
                    View All →
                  </button>
                </div>

                {/* Ticket 1 */}

                <div className="staff-ticket">
                  <div className="staff-ticket-icon">🎫</div>

                  <div className="staff-ticket-info">
                    <strong>Semester fee payment not reflected</strong>

                    <span>TKT-1024 • Fees • Today</span>
                  </div>

                  <span className="priority-badge high">High</span>

                  <span className="status-badge in-progress">In Progress</span>
                </div>

                {/* Ticket 2 */}

                <div className="staff-ticket">
                  <div className="staff-ticket-icon">🎫</div>

                  <div className="staff-ticket-info">
                    <strong>Payment receipt not generated</strong>

                    <span>TKT-1020 • Fees • Today</span>
                  </div>

                  <span className="priority-badge medium">Medium</span>

                  <span className="status-badge assigned">Assigned</span>
                </div>

                {/* Ticket 3 */}

                <div className="staff-ticket">
                  <div className="staff-ticket-icon">🎫</div>

                  <div className="staff-ticket-info">
                    <strong>Scholarship payment clarification</strong>

                    <span>TKT-1017 • Scholarship • Yesterday</span>
                  </div>

                  <span className="priority-badge low">Low</span>

                  <span className="status-badge resolved">Resolved</span>
                </div>

                {/* Ticket 4 */}

                <div className="staff-ticket">
                  <div className="staff-ticket-icon">🎫</div>

                  <div className="staff-ticket-info">
                    <strong>Fee refund request</strong>

                    <span>TKT-1015 • Fees • Sep 5</span>
                  </div>

                  <span className="priority-badge high">High</span>

                  <span className="status-badge in-progress">In Progress</span>
                </div>
              </div>
            </div>

            {/* Right Side */}

            <div className="col-md-4">
              {/* Capacity */}

              <div className="card staff-section-card">
                <div className="section-header">
                  <div>
                    <h5>My Workload</h5>

                    <p>Current ticket capacity</p>
                  </div>
                </div>

                <div className="capacity-number">
                  <strong>8</strong>

                  <span>/ 10 tickets</span>
                </div>

                <div className="capacity-bar">
                  <div></div>
                </div>

                <div className="capacity-info">
                  <span>Current workload</span>

                  <strong>80%</strong>
                </div>

                <div className="capacity-message">
                  ✓ You can receive 2 more tickets
                </div>
              </div>

              {/* AI Assignment */}

              <div className="card ai-routing-card">
                <div className="ai-routing-icon">🤖</div>

                <h5>AI Auto-Assignment</h5>

                <p>
                  Tickets are automatically assigned based on department,
                  priority and staff capacity.
                </p>

                <div className="routing-item">✓ Category matched</div>

                <div className="routing-item">✓ Priority considered</div>

                <div className="routing-item">✓ Workload balanced</div>
              </div>
            </div>
          </div>

          {/* Bottom Info */}

          <div className="staff-info-bar">
            <span>💡</span>

            <div>
              <strong>Keep your tickets updated</strong>

              <p>
                Update the ticket status and add comments so students can track
                their request progress.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;
