import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function Tickets() {
  const navigate = useNavigate();

  const tickets = [
    {
      id: "TKT-1001",
      title: "Fee payment not reflected",
      category: "Fees",
      priority: "High",
      status: "In Progress",
    },
    {
      id: "TKT-1002",
      title: "Fee receipt unavailable",
      category: "Fees",
      priority: "Medium",
      status: "Assigned",
    },
  ];

  return (
    <>
      {/* Staff Navbar */}
      <Navbar role="staff" />

      <div className="dashboard-layout">

        {/* Staff Sidebar */}
        <Sidebar role="staff" />

        <main className="content">

          {/* Page Header */}

          <div className="dashboard-header">

            <div>
              <p className="page-label">
                STAFF PORTAL
              </p>

              <h2>
                Assigned Tickets
              </h2>

              <p>
                View and manage support tickets assigned to you.
              </p>
            </div>

          </div>


          {/* Ticket Summary */}

          <div className="row mt-4">

            <div className="col-md-4 mb-3">

              <div className="card dashboard-card">

                <div className="dashboard-card-icon blue">
                  🎫
                </div>

                <h6>
                  Assigned Tickets
                </h6>

                <h2>
                  8
                </h2>

                <small>
                  Currently assigned to you
                </small>

              </div>

            </div>


            <div className="col-md-4 mb-3">

              <div className="card dashboard-card">

                <div className="dashboard-card-icon red">
                  🔥
                </div>

                <h6>
                  High Priority
                </h6>

                <h2>
                  2
                </h2>

                <small>
                  Require immediate attention
                </small>

              </div>

            </div>


            <div className="col-md-4 mb-3">

              <div className="card dashboard-card">

                <div className="dashboard-card-icon green">
                  ✓
                </div>

                <h6>
                  Resolved Today
                </h6>

                <h2>
                  3
                </h2>

                <small>
                  Successfully completed
                </small>

              </div>

            </div>

          </div>


          {/* Tickets Table */}

          <div className="card mt-3">

            <div className="p-4">

              <div className="section-header">

                <div>
                  <h5>
                    My Assigned Tickets
                  </h5>

                  <p>
                    Recent support requests assigned to you
                  </p>
                </div>

              </div>


              <div className="table-responsive">

                <table className="table align-middle">

                  <thead>

                    <tr>
                      <th>ID</th>
                      <th>Issue</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>

                  </thead>


                  <tbody>

                    {tickets.map((ticket) => (

                      <tr key={ticket.id}>

                        <td>
                          <strong>
                            {ticket.id}
                          </strong>
                        </td>


                        <td>
                          {ticket.title}
                        </td>


                        <td>
                          {ticket.category}
                        </td>


                        <td>

                          <span
                            className={`priority-badge ${
                              ticket.priority.toLowerCase()
                            }`}
                          >
                            {ticket.priority}
                          </span>

                        </td>


                        <td>

                          <span
                            className={`status-badge ${
                              ticket.status
                                .toLowerCase()
                                .replace(" ", "-")
                            }`}
                          >
                            {ticket.status}
                          </span>

                        </td>


                        <td>

                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() =>
                              navigate(
                                `/staff/tickets/${ticket.id}`
                              )
                            }
                          >
                            Open
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </main>

      </div>
    </>
  );
}

export default Tickets;