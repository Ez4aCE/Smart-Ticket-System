import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getTicket, addComment, reopenTicket } from "../../services/api";
import "./TicketDetails.css";

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reopening, setReopening] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const data = await getTicket(id);
      setTicket(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load ticket details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setSubmittingComment(true);
      await addComment(id, newComment);
      setNewComment("");
      await fetchTicket();
    } catch (err) {
      alert("Failed to add comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReopen = async () => {
    const reason = prompt("Reason for reopening:");
    if (!reason) return;
    try {
      setReopening(true);
      await reopenTicket(id, reason);
      await fetchTicket();
    } catch (err) {
      alert("Failed to reopen ticket.");
    } finally {
      setReopening(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-layout">
          <Sidebar role="student" />
          <main className="ticket-details-page d-flex justify-content-center align-items-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error || !ticket) {
    return (
      <>
        <Navbar />
        <div className="dashboard-layout">
          <Sidebar role="student" />
          <main className="ticket-details-page p-4">
            <div className="alert alert-danger">{error || "Ticket not found."}</div>
            <button className="btn btn-outline-secondary mt-3" onClick={() => navigate("/student/tickets")}>Back to My Tickets</button>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar role="student" />
        <main className="ticket-details-page content p-4">
          <div className="ticket-details-header mb-4">
            <button className="back-ticket-btn btn btn-link p-0 mb-3 text-decoration-none" onClick={() => navigate("/student/tickets")}>
              &larr; Back to My Tickets
            </button>
            <div className="ticket-title-row d-flex align-items-center">
              <div className="ticket-header-icon me-3 fs-3">🎫</div>
              <div>
                <p className="ticket-label text-muted mb-0 small text-uppercase">SUPPORT TICKET</p>
                <h1 className="mb-0 fs-3">Ticket #{ticket.ticket_number || ticket.id}</h1>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h4 className="card-title">{ticket.title}</h4>
                  <p className="card-text text-muted mb-4"><small>Created on {new Date(ticket.created_at).toLocaleString()}</small></p>
                  
                  <h6>Description</h6>
                  <div className="p-3 bg-light rounded mb-4" style={{ whiteSpace: 'pre-wrap' }}>
                    {ticket.description}
                  </div>

                  <hr />
                  
                  <h5 className="mb-3">Comments</h5>
                  {ticket.comments && ticket.comments.length > 0 ? (
                    <div className="comments-list mb-4">
                      {ticket.comments.map(c => (
                        <div key={c.id} className="comment-item p-3 mb-2 bg-light border rounded">
                          <div className="d-flex justify-content-between mb-2">
                            <strong>{c.author_name || "Unknown"}</strong>
                            <small className="text-muted">{new Date(c.created_at).toLocaleString()}</small>
                          </div>
                          <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{c.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No comments yet.</p>
                  )}

                  <form onSubmit={handleAddComment} className="mt-3">
                    <div className="mb-3">
                      <label className="form-label">Add a comment</label>
                      <textarea 
                        className="form-control" 
                        rows="3" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={submittingComment}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={submittingComment}>
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Ticket Details</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <small className="text-muted d-block">Status</small>
                    <span className={`badge bg-${ticket.status === 'RESOLVED' ? 'success' : ticket.status === 'NEW' ? 'primary' : 'secondary'} fs-6 mt-1`}>
                      {ticket.status}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted d-block">Priority</small>
                    <span className={`badge bg-${ticket.priority === 'CRITICAL' ? 'danger' : ticket.priority === 'HIGH' ? 'warning' : 'info'} mt-1`}>
                      {ticket.priority || 'NORMAL'}
                    </span>
                  </div>

                  {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
                    <div className="mb-3 mt-4">
                      <button 
                        className="btn btn-warning w-100" 
                        onClick={handleReopen}
                        disabled={reopening}
                      >
                        {reopening ? "Reopening..." : "Reopen Ticket"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Status History</h5>
                </div>
                <div className="card-body">
                  {ticket.status_history && ticket.status_history.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {ticket.status_history.map(h => (
                        <li key={h.id} className="list-group-item px-0 border-0 border-bottom">
                          <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1">{h.new_status}</h6>
                            <small className="text-muted">{new Date(h.created_at).toLocaleDateString()}</small>
                          </div>
                          {h.reason && <small className="mb-1 d-block text-muted">Reason: {h.reason}</small>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">No history available.</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>
    </>
  );
}

export default TicketDetails;