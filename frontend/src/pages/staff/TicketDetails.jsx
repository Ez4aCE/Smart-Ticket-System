import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getTicket, updateTicket, updateTicketDetails } from "../../services/api";
import api from "../../services/api";

// ── helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  OPEN:        { label: "Open",        cls: "bg-primary"           },
  IN_PROGRESS: { label: "In Progress", cls: "bg-warning text-dark" },
  RESOLVED:    { label: "Resolved",    cls: "bg-success"           },
  CLOSED:      { label: "Closed",      cls: "bg-secondary"         },
  PENDING:     { label: "Pending",     cls: "bg-info text-dark"    },
};

const PRIORITY_CONFIG = {
  LOW:      { label: "Low",      cls: "bg-success"           },
  MEDIUM:   { label: "Medium",   cls: "bg-warning text-dark" },
  HIGH:     { label: "High",     cls: "bg-danger"            },
  CRITICAL: { label: "Critical", cls: "bg-danger"            },
};

const statusBadge = (status = "") => {
  const cfg = STATUS_CONFIG[status?.toUpperCase()] ?? { label: status, cls: "bg-secondary" };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
};

const priorityBadge = (priority = "") => {
  const cfg = PRIORITY_CONFIG[priority?.toUpperCase()] ?? { label: priority, cls: "bg-secondary" };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
};

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

// ── component ─────────────────────────────────────────────────────────────────

function TicketDetails({ role = "staff" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  console.log("TicketDetails role:", role); // Force HMR update

  const [ticket,         setTicket        ] = useState(null);
  const [loading,        setLoading       ] = useState(true);
  const [error,          setError         ] = useState("");

  // comment state
  const [comment,        setComment       ] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError,   setCommentError  ] = useState("");
  const [commentSuccess, setCommentSuccess] = useState("");

  // status update state
  const [newStatus,      setNewStatus     ] = useState("");
  const [reason,         setReason        ] = useState("");
  const [statusLoading,  setStatusLoading ] = useState(false);
  const [statusError,    setStatusError   ] = useState("");
  const [statusSuccess,  setStatusSuccess ] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", priority: "", category: "", department: "" });

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchTicket = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTicket(id);
      setTicket(data);
      setEditForm({
        title: data.title || "",
        description: data.description || "",
        priority: data.priority || "",
        category: data.category || "",
        department: data.department || "",
      });
    } catch (err) {
      setError(err?.response?.data?.detail ?? "Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTicketDetails(id, editForm);
      setIsEditing(false);
      fetchTicket();
    } catch (err) {
      alert("Failed to update ticket details");
    }
  };

  // ── add comment ───────────────────────────────────────────────────────────
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommentLoading(true);
    setCommentError("");
    setCommentSuccess("");
    try {
      await api.post(`/tickets/${id}/comments`, { comment: comment.trim() });
      setComment("");
      setCommentSuccess("Comment added successfully.");
      await fetchTicket();
    } catch (err) {
      setCommentError(err?.response?.data?.detail ?? "Failed to add comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  // ── update status ─────────────────────────────────────────────────────────
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    setStatusLoading(true);
    setStatusError("");
    setStatusSuccess("");
    try {
      const payload = { status: newStatus };
      if (reason.trim()) payload.reason = reason.trim();
      await updateTicket(id, payload);
      setStatusSuccess(`Status updated to ${newStatus.replace("_", " ")}.`);
      setNewStatus("");
      setReason("");
      await fetchTicket();
    } catch (err) {
      setStatusError(err?.response?.data?.detail ?? "Failed to update status.");
    } finally {
      setStatusLoading(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar role={role} />

      <div className="dashboard-layout">
        <Sidebar role={role} />

        <main className="content">

          {/* ── Page Header ──────────────────────────────────────── */}
          <div className="dashboard-header">
            <div>
              <p className="page-label">{role === "admin" ? "ADMIN PORTAL" : "STAFF PORTAL"}</p>
              <h2>Ticket Details</h2>
              <p className="text-muted mb-0">
                Review and manage this student support request.
              </p>
            </div>
            <button
              className="btn btn-outline-secondary btn-sm mt-2"
              onClick={() => navigate(role === "admin" ? "/admin/tickets" : "/staff/tickets")}
            >
              ← Back to Tickets
            </button>
          </div>

          {/* ── Loading ───────────────────────────────────────────── */}
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary me-3" role="status" />
              <span className="text-muted">Loading ticket…</span>
            </div>
          )}

          {/* ── Fetch Error ───────────────────────────────────────── */}
          {!loading && error && (
            <div className="alert alert-danger mt-4" role="alert">
              {error}
            </div>
          )}

          {/* ── Main Content ─────────────────────────────────────── */}
          {!loading && ticket && (
            <>

              {/* ── Ticket Info Card ──────────────────────────────────────── */}
              <div className="card shadow-sm p-4 mt-4">

                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <h4 className="mb-1">{ticket.title}</h4>
                    <p className="text-muted mb-0">
                      {ticket.ticket_number} &nbsp;•&nbsp; {fmtDate(ticket.created_at)}
                    </p>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {statusBadge(ticket.status)}
                    {priorityBadge(ticket.priority)}
                    {role === "admin" && (
                      <button className="btn btn-sm btn-outline-primary ms-3" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? "Cancel Edit" : "Edit Ticket"}
                      </button>
                    )}
                  </div>
                </div>

                <hr />

                {isEditing ? (
                  <form onSubmit={handleEditSubmit}>
                    <div className="row g-3 mb-3">
                      <div className="col-md-12">
                        <label className="form-label">Title</label>
                        <input type="text" className="form-control" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Priority</label>
                        <select className="form-select" value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})}>
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Category</label>
                        <input type="text" className="form-control" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Department</label>
                        <input type="text" className="form-control" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" rows="4" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}></textarea>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-success">Save Changes</button>
                  </form>
                ) : (
                  <>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <strong>AI Confidence</strong>
                        <p className="mb-0">
                          {ticket.ai_confidence != null
                            ? `${Math.round(ticket.ai_confidence * 100)}%`
                            : "N/A"}
                        </p>
                      </div>

                      <div className="col-md-6 mb-3">
                        <strong>Assigned Staff</strong>
                        <p className="mb-0">
                          {ticket.current_assignment?.staff_name ?? (
                            <span className="text-muted">Unassigned</span>
                          )}
                        </p>
                      </div>

                      {ticket.category && (
                        <div className="col-md-6 mb-3">
                          <strong>Category</strong>
                          <p className="mb-0">{ticket.category}</p>
                        </div>
                      )}

                      {ticket.department && (
                        <div className="col-md-6 mb-3">
                          <strong>Department</strong>
                          <p className="mb-0">{ticket.department}</p>
                        </div>
                      )}
                    </div>

                    <hr />

                    <div>
                      <h6 className="fw-semibold mb-2">Description</h6>
                      <div className="p-3 bg-light rounded">
                        <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                          {ticket.description}
                        </p>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* ── Update Status Card ───────────────────────────── */}
              <div className="card shadow-sm p-4 mt-3">
                <h5 className="mb-3">Update Status</h5>

                {statusError   && <div className="alert alert-danger  py-2">{statusError  }</div>}
                {statusSuccess && <div className="alert alert-success py-2">{statusSuccess}</div>}

                <form onSubmit={handleUpdateStatus}>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                      <label className="form-label">New Status</label>
                      <select
                        className="form-select"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        required
                      >
                        <option value="">— Select status —</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Reason <span className="text-muted">(optional)</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Issue confirmed and fixed"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                    </div>

                    <div className="col-md-2">
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={statusLoading || !newStatus}
                      >
                        {statusLoading
                          ? <span className="spinner-border spinner-border-sm" />
                          : "Update"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* ── Status History Timeline ──────────────────────── */}
              {Array.isArray(ticket.status_history) && ticket.status_history.length > 0 && (
                <div className="card shadow-sm p-4 mt-3">
                  <h5 className="mb-3">Status History</h5>
                  <ul className="list-unstyled mb-0">
                    {ticket.status_history.map((entry, idx) => (
                      <li key={idx} className="d-flex gap-3 mb-3">
                        <div className="d-flex flex-column align-items-center">
                          <div
                            className="rounded-circle bg-primary"
                            style={{ width: 12, height: 12, marginTop: 4, flexShrink: 0 }}
                          />
                          {idx < ticket.status_history.length - 1 && (
                            <div
                              className="bg-secondary"
                              style={{ width: 2, flexGrow: 1, minHeight: 24 }}
                            />
                          )}
                        </div>

                        <div className="pb-2">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            {statusBadge(entry.status)}
                            <small className="text-muted">{fmtDate(entry.changed_at)}</small>
                          </div>
                          {entry.changed_by && (
                            <small className="text-muted d-block">by {entry.changed_by}</small>
                          )}
                          {entry.reason && (
                            <p className="mb-0 mt-1 text-muted" style={{ fontSize: "0.85rem" }}>
                              {entry.reason}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Comments ─────────────────────────────────────── */}
              <div className="card shadow-sm p-4 mt-3 mb-4">
                <h5 className="mb-3">Comments</h5>

                {Array.isArray(ticket.comments) && ticket.comments.length > 0 ? (
                  <div className="mb-4">
                    {ticket.comments.map((c, idx) => (
                      <div
                        key={c.id ?? idx}
                        className="p-3 mb-2 bg-light rounded border-start border-4 border-primary"
                      >
                        <div className="d-flex justify-content-between mb-1 flex-wrap gap-1">
                          <strong style={{ fontSize: "0.9rem" }}>
                            {c.author_name ?? c.author ?? "Staff"}
                          </strong>
                          <small className="text-muted">{fmtDate(c.created_at)}</small>
                        </div>
                        <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                          {c.comment ?? c.content ?? c.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-4">No comments yet.</p>
                )}

                <h6 className="fw-semibold mb-2">Add Comment</h6>

                {commentError   && <div className="alert alert-danger  py-2">{commentError  }</div>}
                {commentSuccess && <div className="alert alert-success py-2">{commentSuccess}</div>}

                <form onSubmit={handleAddComment}>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Write an update or note for the student…"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={commentLoading || !comment.trim()}
                  >
                    {commentLoading
                      ? <><span className="spinner-border spinner-border-sm me-2" />Posting…</>
                      : "Post Comment"}
                  </button>
                </form>
              </div>

            </>
          )}

        </main>
      </div>
    </>
  );
}

export default TicketDetails;


