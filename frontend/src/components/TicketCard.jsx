import { useNavigate } from "react-router-dom";

function TicketCard({ ticket }) {
  const navigate = useNavigate();

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">

        <div className="d-flex justify-content-between">
          <h5>{ticket.title}</h5>

          <span
            className={`badge ${
              ticket.priority === "High"
                ? "bg-danger"
                : ticket.priority === "Medium"
                ? "bg-warning text-dark"
                : "bg-secondary"
            }`}
          >
            {ticket.priority}
          </span>
        </div>

        <p className="text-muted mb-2">
          Ticket ID: {ticket.id}
        </p>

        <p>{ticket.description}</p>

        <div className="mb-3">
          <span className="badge bg-primary me-2">
            {ticket.category}
          </span>

          <span className="badge bg-dark">
            {ticket.status}
          </span>
        </div>

        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate(`${ticket.id}`)}
        >
          View Ticket
        </button>

      </div>
    </div>
  );
}

export default TicketCard;