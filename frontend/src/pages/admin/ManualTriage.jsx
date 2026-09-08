import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getTickets, getDepartments, triageTicket } from "../../services/api";
import { useNavigate } from "react-router-dom";

function TriageCard({ ticket, departments, onUpdated }) {
  const navigate = useNavigate();
  const [departmentId, setDepartmentId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const confidence = ticket.ai_confidence;
  const confidencePct =
    confidence != null ? `${Math.round(confidence * 100)}%` : "N/A";
  const confidenceClass =
    confidence == null || confidence < 0.5
      ? "text-danger"
      : confidence < 0.75
      ? "text-warning"
      : "text-success";

  const descriptionPreview =
    ticket.description && ticket.description.length > 100
      ? ticket.description.slice(0, 100) + "..."
      : ticket.description || "—";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!departmentId) {
      setError("Please select a department to assign.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await triageTicket(ticket.id, { 
        department_id: departmentId,
        reason: reason.trim() || "Manually routed by admin." 
      });
      onUpdated();
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to route ticket."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span className="fw-semibold text-primary">
          #{ticket.ticket_number || ticket.id}
        </span>
        <span className="badge bg-secondary">{ticket.status}</span>
        <button className="btn btn-sm btn-link ms-2" onClick={() => navigate(`/admin/tickets/${ticket.id}`)}>View Details</button>
      </div>

      <div className="card-body">
        <h6 className="card-title mb-1">{ticket.title || "Untitled"}</h6>
        <p className="text-muted small mb-3">{descriptionPreview}</p>

        <p className="mb-3">
          <strong>AI Confidence:</strong>{" "}
          <span className={`fw-bold ${confidenceClass}`}>{confidencePct}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="row g-3 align-items-end">
            <div className="col-sm-4">
              <label className="form-label fw-semibold mb-1">
                Route to Department <span className="text-danger">*</span>
              </label>
              <select
                className="form-select form-select-sm"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={submitting}
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-6">
              <label className="form-label fw-semibold mb-1">
                Reason (Optional)
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. Needs specialized review"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="col-sm-2">
              <button
                type="submit"
                className="btn btn-primary btn-sm w-100"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    />
                    Saving…
                  </>
                ) : (
                  "Route Ticket"
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mt-3 py-2 mb-0 small">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function ManualTriage() {
  const [tickets, setTickets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const [ticketsData, deptsData] = await Promise.all([
        getTickets(),
        getDepartments()
      ]);
      const needsTriage = ticketsData.filter(
        (t) =>
          t.status === "MANUAL_TRIAGE" ||
          (t.status === "NEW" &&
            (t.ai_confidence == null || t.ai_confidence < 0.75))
      );
      setTickets(needsTriage);
      setDepartments(deptsData);
    } catch (err) {
      setFetchError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to fetch tickets or departments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Navbar role="admin" />

      <div className="dashboard-layout">
        <Sidebar role="admin" />

        <main className="content">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">Manual Triage</h2>
              <p className="text-muted small mb-0">
                Tickets with status <strong>MANUAL_TRIAGE</strong> and AI confidence below{" "}
                <strong>75%</strong> require human review before assignment.
              </p>
            </div>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "↻ Refresh"
              )}
            </button>
          </div>

          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary me-3" role="status" />
              <span className="text-muted">Loading tickets…</span>
            </div>
          )}

          {!loading && fetchError && (
            <div className="alert alert-danger">
              <strong>Error:</strong> {fetchError}
            </div>
          )}

          {!loading && !fetchError && tickets.length === 0 && (
            <div className="text-center py-5">
              <div className="display-6 mb-3">✅</div>
              <h5 className="text-muted">No tickets need manual triage</h5>
              <p className="text-muted small">
                All new tickets have sufficient AI confidence or have already
                been processed.
              </p>
            </div>
          )}

          {!loading && !fetchError && tickets.length > 0 && (
            <>
              <p className="text-muted small mb-3">
                Showing{" "}
                <span className="fw-semibold text-dark">{tickets.length}</span>{" "}
                ticket{tickets.length !== 1 ? "s" : ""} awaiting triage.
              </p>
              {tickets.map((ticket) => (
                <TriageCard
                  key={ticket.id}
                  ticket={ticket}
                  departments={departments}
                  onUpdated={loadData}
                />
              ))}
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default ManualTriage;
