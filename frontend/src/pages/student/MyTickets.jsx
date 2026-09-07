import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function MyTickets() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const tickets = [
    {
      id: "TKT-1024",
      title: "Semester fee payment not reflected",
      category: "Fees",
      department: "Finance",
      priority: "High",
      status: "In Progress",
      date: "Sep 7, 2026",
      updated: "2 hours ago",
    },
    {
      id: "TKT-1023",
      title: "Unable to connect to college Wi-Fi",
      category: "IT Support",
      department: "IT Support",
      priority: "Medium",
      status: "Resolved",
      date: "Sep 6, 2026",
      updated: "Yesterday",
    },
    {
      id: "TKT-1022",
      title: "Hostel room fan is not working",
      category: "Hostel",
      department: "Hostel Office",
      priority: "Medium",
      status: "Assigned",
      date: "Sep 4, 2026",
      updated: "3 days ago",
    },
    {
      id: "TKT-1021",
      title: "Scholarship eligibility clarification",
      category: "Scholarship",
      department: "Scholarship Office",
      priority: "Low",
      status: "Resolved",
      date: "Sep 2, 2026",
      updated: "5 days ago",
    },
    {
      id: "TKT-1020",
      title: "Unable to register for placement drive",
      category: "Placement",
      department: "Placement Cell",
      priority: "Medium",
      status: "Resolved",
      date: "Aug 30, 2026",
      updated: "1 week ago",
    },
  ];

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {

      const matchesSearch =
        ticket.id
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        ticket.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        ticket.category
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">

        <Sidebar role="student" />

        <main className="tickets-page">

          {/* =====================================
              PAGE HEADER
          ===================================== */}

          <div className="tickets-page-header">

            <div>

              <p className="page-label">
                SUPPORT CENTER
              </p>

              <h1>
                My Tickets
              </h1>

              <p>
                View and track all your support requests in one place.
              </p>

            </div>

            <button
              className="ask-ai-ticket-btn"
              onClick={() =>
                navigate("/student/create-ticket")
              }
            >
              <span>🤖</span>
              Ask AI Assistant
            </button>

          </div>


          {/* =====================================
              STAT CARDS
          ===================================== */}

          <div className="ticket-stat-grid">

            <div className="ticket-stat-card">

              <div className="ticket-stat-icon blue">
                🎫
              </div>

              <div>
                <span>Total Tickets</span>
                <strong>12</strong>
              </div>

            </div>


            <div className="ticket-stat-card">

              <div className="ticket-stat-icon orange">
                ⏳
              </div>

              <div>
                <span>In Progress</span>
                <strong>3</strong>
              </div>

            </div>


            <div className="ticket-stat-card">

              <div className="ticket-stat-icon purple">
                📌
              </div>

              <div>
                <span>Assigned</span>
                <strong>1</strong>
              </div>

            </div>


            <div className="ticket-stat-card">

              <div className="ticket-stat-icon green">
                ✓
              </div>

              <div>
                <span>Resolved</span>
                <strong>9</strong>
              </div>

            </div>

          </div>


          {/* =====================================
              TICKET LIST CARD
          ===================================== */}

          <div className="tickets-list-card">

            {/* Toolbar */}

            <div className="tickets-toolbar">

              <div>

                <h3>
                  All Support Tickets
                </h3>

                <p>
                  {filteredTickets.length} tickets found
                </p>

              </div>


              <div className="ticket-actions">

                {/* Search */}

                <div className="ticket-search">

                  <span>
                    🔍
                  </span>

                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />

                </div>


                {/* Filter */}

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="ticket-filter"
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="Assigned">
                    Assigned
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Resolved">
                    Resolved
                  </option>
                </select>

              </div>

            </div>


            {/* =====================================
                DESKTOP TABLE
            ===================================== */}

            <div className="tickets-table-wrapper">

              <table className="tickets-table">

                <thead>

                  <tr>

                    <th>
                      Ticket
                    </th>

                    <th>
                      Issue
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Priority
                    </th>

                    <th>
                      Department
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Updated
                    </th>

                    <th>
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredTickets.map((ticket) => (

                    <tr
                      key={ticket.id}
                      onClick={() =>
                        navigate(
                          `/student/tickets/${ticket.id}`
                        )
                      }
                    >

                      {/* Ticket ID */}

                      <td>

                        <div className="ticket-id-wrapper">

                          <div className="ticket-list-icon">
                            🎫
                          </div>

                          <div>

                            <strong>
                              #{ticket.id.replace("TKT-", "TKT-")}
                            </strong>

                            <small>
                              {ticket.date}
                            </small>

                          </div>

                        </div>

                      </td>


                      {/* Issue */}

                      <td>

                        <div className="issue-cell">

                          <strong>
                            {ticket.title}
                          </strong>

                          <small>
                            Last updated {ticket.updated}
                          </small>

                        </div>

                      </td>


                      {/* Category */}

                      <td>

                        <span className="category-tag">
                          {ticket.category}
                        </span>

                      </td>


                      {/* Priority */}

                      <td>

                        <span
                          className={`priority-badge ${
                            ticket.priority.toLowerCase()
                          }`}
                        >
                          {ticket.priority}
                        </span>

                      </td>


                      {/* Department */}

                      <td>

                        <span className="department-text">
                          {ticket.department}
                        </span>

                      </td>


                      {/* Status */}

                      <td>

                        <span
                          className={`status-badge ${
                            ticket.status
                              .toLowerCase()
                              .replace(" ", "-")
                          }`}
                        >
                          <span className="status-mini-dot"></span>

                          {ticket.status}

                        </span>

                      </td>


                      {/* Updated */}

                      <td>

                        <span className="updated-text">
                          {ticket.updated}
                        </span>

                      </td>


                      {/* Arrow */}

                      <td>

                        <span className="ticket-arrow">
                          →
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>


              {/* Empty Result */}

              {filteredTickets.length === 0 && (

                <div className="no-tickets">

                  <div>
                    🔍
                  </div>

                  <h4>
                    No tickets found
                  </h4>

                  <p>
                    Try changing your search or filter.
                  </p>

                </div>

              )}

            </div>

          </div>


          {/* =====================================
              AI INFORMATION
          ===================================== */}

          <div className="tickets-ai-info">

            <div className="tickets-ai-icon">
              🤖
            </div>

            <div>

              <strong>
                Need help with a new issue?
              </strong>

              <p>
                Don't create a ticket manually. Explain your
                problem to the AI Assistant and it will
                automatically classify, prioritize and route
                your request.
              </p>

            </div>

            <button
              onClick={() =>
                navigate("/student/create-ticket")
              }
            >
              Start Chat →
            </button>

          </div>

        </main>

      </div>
    </>
  );
}

export default MyTickets;