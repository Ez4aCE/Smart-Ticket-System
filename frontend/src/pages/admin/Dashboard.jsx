import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getDashboardSummary, getTickets } from "../../services/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive summary stats from a raw tickets array (fallback path). */
function deriveStatsFromTickets(tickets) {
  const counts = {
    total_tickets: tickets.length,
    new: 0,
    assigned: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  };
  const deptMap = {};

  tickets.forEach((t) => {
    const status = (t.status || "").toLowerCase().replace(" ", "_");
    if (status in counts) counts[status]++;

    const dept = t.department || t.category || "Unknown";
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });

  return {
    ...counts,
    departments: Object.entries(deptMap).map(([department, ticket_count]) => ({
      department,
      ticket_count,
    })),
    staff_workload: [],
  };
}

/** Bootstrap colour class based on workload percentage. */
function workloadColor(pct) {
  if (pct >= 90) return "danger";
  if (pct >= 70) return "warning";
  return "success";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({ icon, iconColor, label, value, sub }) {
  return (
    <div className="col-md-3 mb-3">
      <div className="card dashboard-card">
        <div className={`dashboard-card-icon ${iconColor}`}>{icon}</div>
        <h6>{label}</h6>
        <h2>{value ?? "—"}</h2>
        <small className="text-muted">{sub}</small>
      </div>
    </div>
  );
}

function DepartmentTable({ departments }) {
  if (!departments || departments.length === 0) {
    return (
      <p className="text-muted small mb-0">No department data available.</p>
    );
  }
  return (
    <table className="table table-sm table-hover mb-0">
      <thead className="table-light">
        <tr>
          <th>Department</th>
          <th className="text-end">Tickets</th>
        </tr>
      </thead>
      <tbody>
        {departments.map((d, i) => (
          <tr key={i}>
            <td>{d.department}</td>
            <td className="text-end fw-semibold">{d.ticket_count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StaffWorkloadTable({ staff }) {
  if (!staff || staff.length === 0) {
    return (
      <p className="text-muted small mb-0">No staff workload data available.</p>
    );
  }
  return (
    <table className="table table-sm table-hover mb-0 align-middle">
      <thead className="table-light">
        <tr>
          <th>Name</th>
          <th>Workload</th>
          <th className="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        {staff.map((s, i) => {
          const pct =
            s.max_capacity > 0
              ? Math.min(
                  Math.round((s.active_tickets / s.max_capacity) * 100),
                  100
                )
              : 0;
          const color = workloadColor(pct);
          return (
            <tr key={i}>
              <td>{s.name}</td>
              <td style={{ minWidth: "160px" }}>
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="progress flex-grow-1"
                    style={{ height: "8px" }}
                  >
                    <div
                      className={`progress-bar bg-${color}`}
                      role="progressbar"
                      style={{ width: `${pct}%` }}
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <span
                    className="text-muted small"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {s.active_tickets}/{s.max_capacity}
                  </span>
                </div>
              </td>
              <td className="text-center">
                <span
                  className={`badge bg-${
                    s.is_available ? "success" : "secondary"
                  }`}
                >
                  {s.is_available ? "Available" : "Busy"}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Primary path — admin summary endpoint (requires admin JWT)
        const data = await getDashboardSummary();
        if (!cancelled) {
          setSummary(data);
          setUsingFallback(false);
        }
      } catch {
        // Fallback — derive stats locally from the tickets list
        try {
          const tickets = await getTickets();
          if (!cancelled) {
            const list = Array.isArray(tickets)
              ? tickets
              : tickets.tickets ?? [];
            setSummary(deriveStatsFromTickets(list));
            setUsingFallback(true);
          }
        } catch (fallbackErr) {
          if (!cancelled) {
            setError(
              fallbackErr?.response?.data?.detail ||
                fallbackErr.message ||
                "Failed to load dashboard data."
            );
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Navbar role="admin" />

      <div className="dashboard-layout">
        <Sidebar role="admin" />

        <main className="content">

          {/* Header */}
          <div className="dashboard-header">
            <div>
              <p className="page-label">ADMINISTRATION</p>
              <h2>Admin Dashboard</h2>
              <p>Monitor tickets, departments, staff workload and AI routing.</p>
            </div>
          </div>

          {/* Fallback notice */}
          {usingFallback && !loading && (
            <div
              className="alert alert-warning py-2 mt-3 mb-0 small"
              role="alert"
            >
              ⚠️ Showing derived stats from ticket list — full admin summary
              unavailable.
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="d-flex align-items-center gap-2 mt-4 text-muted">
              <div
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
              <span>Loading dashboard…</span>
            </div>
          )}

          {/* Error alert */}
          {!loading && error && (
            <div className="alert alert-danger mt-4" role="alert">
              {error}
            </div>
          )}

          {/* Dashboard content */}
          {!loading && !error && summary && (
            <>
              {/* Stat cards */}
              <div className="row mt-4">
                <StatCard
                  icon="🎫"
                  iconColor="blue"
                  label="Total Tickets"
                  value={summary.total_tickets}
                  sub="All support requests"
                />
                <StatCard
                  icon="📋"
                  iconColor="orange"
                  label="Assigned"
                  value={summary.assigned}
                  sub="Awaiting staff action"
                />
                <StatCard
                  icon="⚙️"
                  iconColor="purple"
                  label="In Progress"
                  value={summary.in_progress}
                  sub="Currently being handled"
                />
                <StatCard
                  icon="✅"
                  iconColor="green"
                  label="Resolved"
                  value={summary.resolved}
                  sub="Successfully completed"
                />
              </div>

              {/* Tables row */}
              <div className="row mt-3">

                {/* Department breakdown */}
                <div className="col-md-5 mb-3">
                  <div className="card staff-section-card h-100">
                    <div className="section-header">
                      <div>
                        <h5>Department Breakdown</h5>
                        <p>Ticket volume by department</p>
                      </div>
                    </div>
                    <DepartmentTable departments={summary.departments} />
                  </div>
                </div>

                {/* Staff workload */}
                <div className="col-md-7 mb-3">
                  <div className="card staff-section-card h-100">
                    <div className="section-header">
                      <div>
                        <h5>Staff Workload</h5>
                        <p>Active tickets vs. capacity per staff member</p>
                      </div>
                    </div>
                    <StaffWorkloadTable staff={summary.staff_workload} />
                  </div>
                </div>

              </div>

              {/* Bottom info bar */}
              <div className="staff-info-bar mt-2">
                <span>💡</span>
                <div>
                  <strong>AI-powered ticket assignment</strong>
                  <p>
                    The system automatically analyzes each ticket, predicts its
                    category and priority, and assigns it to the most suitable
                    department and staff member.
                  </p>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </>
  );
}

export default Dashboard;
