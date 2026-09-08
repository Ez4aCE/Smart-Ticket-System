import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getTickets } from "../../services/api";

function Tickets() {
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
        (ticket.ticket_number || ticket.id || "")
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
      <Navbar role="staff" />
      <div className="dashboard-layout">
        <Sidebar role="staff" />
        <main className="content">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Department Tickets</h2>
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
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} onClick={() => navigate(`/staff/tickets/${ticket.id}`)} style={{cursor: 'pointer'}}>
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
                        <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); navigate(`/staff/tickets/${ticket.id}`); }}>
                            View
                          </button>
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

export default Tickets;