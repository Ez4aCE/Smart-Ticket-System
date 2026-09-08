import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getTickets } from "../../services/api";

function AdminTickets() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getTickets();
        setTickets(data);
      } catch (err) {
        console.error("Failed to fetch tickets", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        (ticket.ticket_number || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (ticket.title || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  return (
    <>
      <Navbar role="admin" />
      <div className="dashboard-layout">
        <Sidebar role="admin" />
        <main className="content">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <p className="page-label text-muted small text-uppercase mb-1">ADMINISTRATION</p>
              <h2>All Tickets</h2>
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by ticket number or title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="NEW">New</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-5 text-muted">No tickets found.</div>
          ) : (
            <div className="card shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Ticket ID</th>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>AI Confidence</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr 
                        key={ticket.id} 
                        style={{cursor: 'pointer'}} 
                        onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                      >
                        <td><strong>{ticket.ticket_number}</strong></td>
                        <td>{ticket.title}</td>
                        <td>
                          <span className={`badge bg-${ticket.priority === 'CRITICAL' ? 'danger' : ticket.priority === 'HIGH' ? 'warning' : 'info'}`}>
                            {ticket.priority || 'NORMAL'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${ticket.status === 'RESOLVED' ? 'success' : ticket.status === 'NEW' ? 'primary' : 'secondary'}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td>{ticket.ai_confidence ? Math.round(ticket.ai_confidence * 100) + '%' : 'N/A'}</td>
                        <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
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

export default AdminTickets;
