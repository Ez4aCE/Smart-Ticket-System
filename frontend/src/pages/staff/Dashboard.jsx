import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getTickets } from "../../services/api";
import "./Dashboard.css";

/* ── helpers ──────────────────────────────────────────── */

function statusBadgeClass(status) {
  switch (status) {
    case "IN_PROGRESS": return "status-badge in-progress";
    case "ASSIGNED":    return "status-badge assigned";
    case "RESOLVED":    return "status-badge resolved";
    default:            return "status-badge";
  }
}

function priorityBadgeClass(priority) {
  switch ((priority || "").toUpperCase()) {
    case "HIGH":   return "priority-badge high";
    case "MEDIUM": return "priority-badge medium";
    case "LOW":    return "priority-badge low";
    default:       return "priority-badge";
  }
}

function formatStatus(status) {
  return (status || "").replace(/_/g, " ");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ── component ────────────────────────────────────────── */

function Dashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getTickets()
      .then((data) => {
        setTickets(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || "Failed to load tickets.");
      })
      .finally(() => setLoading(false));
  }, []);

  /* derived stats */
  const stats = {
    total:       tickets.length,
    new:         tickets.filter((t) => t.status === "NEW").length,
    assigned:    tickets.filter((t) => t.status === "ASSIGNED").length,
    in_progress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved:    tickets.filter((t) => t.status === "RESOLVED").length,
  };

  /* 5 most-recent tickets */
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

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

          {/* ── Stat cards ─────────────────────────────────── */}
          <div className="row mt-4">
            {/* Total Assigned */}
            <div className="col-md-3 mb-3">
              <div className="card dashboard-card">
                <div className="dashboard-card-icon blue">🎫</div>
                <h6>Total Assigned</h6>
                {loading ? (
                  <h2 className="placeholder-glow">
                    <span className="placeholder col-3" />
                  </h2>
                ) : (
                  <h2>{stats.total}</h2>
                )}
                <small>All tickets assigned to you</small>
              </div>
            </div>

            {/* In Progress */}
            <div className="col-md-3 mb-3">
              <div className="card dashboard-card">
                <div className="dashboard-card-icon orange">⚙️</div>
                <h6>In Progress</h6>
                {loading ? (
                  <h2 className="placeholder-glow">
                    <span className="placeholder col-3" />
                  </h2>
                ) : (
                  <h2>{stats.in_progress}</h2>
                )}
                <small>Currently being worked on</small>
              </div>
            </div>

            {/* Resolved */}
            <div className="col-md-3 mb-3">
              <div className="card dashboard-card">
                <div className="dashboard-card-icon green">✓</div>
                <h6>Resolved</h6>
                {loading ? (
                  <h2 className="placeholder-glow">
                    <span className="placeholder col-3" />
                  </h2>
                ) : (
                  <h2>{stats.resolved}</h2>
                )}
                <small>Successfully completed</small>
              </div>
            </div>

            {/* New */}
            <div className="col-md-3 mb-3">
              <div className="card dashboard-card">
                <div className="dashboard-card-icon purple">🆕</div>
                <h6>New</h6>
                {loading ? (
                  <h2 className="placeholder-glow">
                    <span className="placeholder col-3" />
                  </h2>
                ) : (
                  <h2>{stats.new}</h2>
                )}
                <small>Awaiting action</small>
              </div>
            </div>
          </div>

          {/* ── Recent tickets table ────────────────────────── */}
          <div className="row mt-3">
            <div className="col-12">
              <div className="card staff-section-card">
                <div className="section-header">
                  <div>
                    <h5>Recent Tickets</h5>
                    <p>Your 5 most recently assigned tickets</p>
                  </div>
                  <button
                    className="view-all-btn"
                    onClick={() => navigate("/staff/tickets")}
                  >
                    View All →
                  </button>
                </div>

                {/* Error state */}
                {error && (
                  <div className="alert alert-danger py-2" role="alert">
                    {error}
                  </div>
                )}

                {/* Loading state */}
                {loading && !error && (
                  <div className="text-center py-4 text-muted">
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Loading tickets…
                  </div>
                )}

                {/* Empty state */}
                {!loading && !error && recentTickets.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    No tickets assigned to you yet.
                  </div>
                )}

                {/* Table */}
                {!loading && !error && recentTickets.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ fontSize: "11px" }}>#</th>
                          <th style={{ fontSize: "11px" }}>Title</th>
                          <th style={{ fontSize: "11px" }}>Status</th>
                          <th style={{ fontSize: "11px" }}>Priority</th>
                          <th style={{ fontSize: "11px" }}>Created</th>
                          <th style={{ fontSize: "11px" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTickets.map((ticket) => (
                          <tr key={ticket.id}>
                            <td
                              style={{
                                fontSize: "11px",
                                color: "#8995a7",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {ticket.ticket_number || `#${ticket.id}`}
                            </td>
                            <td
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#26364d",
                                maxWidth: "260px",
                              }}
                            >
                              <div
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={ticket.title}
                              >
                                {ticket.title}
                              </div>
                            </td>
                            <td>
                              <span className={statusBadgeClass(ticket.status)}>
                                {formatStatus(ticket.status)}
                              </span>
                            </td>
                            <td>
                              <span
                                className={priorityBadgeClass(ticket.priority)}
                              >
                                {ticket.priority || "—"}
                              </span>
                            </td>
                            <td
                              style={{
                                fontSize: "11px",
                                color: "#8995a7",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatDate(ticket.created_at)}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                style={{ fontSize: "10px", padding: "3px 10px" }}
                                onClick={() =>
                                  navigate(`/staff/tickets/${ticket.id}`)
                                }
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom info bar */}
          <div className="staff-info-bar mt-3">
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

