import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getTickets } from "../../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getTickets();
        setAllTickets(data);
      } catch (err) {
        console.error("Error fetching tickets", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const recentTickets = allTickets.slice(0, 5);

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">

        <Sidebar role="student" />

        <main className="student-dashboard">

          {/* =====================================
              WELCOME SECTION
          ===================================== */}

          <div className="welcome-section">

            <div>
              <p className="welcome-small">
                STUDENT PORTAL
              </p>

              <h1>
                Welcome back! 👋👋
              </h1>

              <p className="welcome-description">
                How can we help you today?
                Ask our AI Assistant about any college-related issue.
              </p>
            </div>

            <button
              className="ask-ai-btn"
              onClick={() => navigate("/student/create-ticket")}
            >
              <span>🤖</span>
              Ask AI Assistant
            </button>

          </div>


          {/* =====================================
              STATISTICS (computed from live data)
          ===================================== */}

          <div className="dashboard-stats">

            <div className="stat-card">
              <div className="stat-icon blue">🎫</div>
              <div className="stat-content">
                <span>Total Tickets</span>
                <h2>{loading ? "..." : allTickets.length}</h2>
                <small>All your support requests</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">⏳</div>
              <div className="stat-content">
                <span>In Progress</span>
                <h2>{loading ? "..." : allTickets.filter(t => t.status === "IN_PROGRESS" || t.status === "ASSIGNED").length}</h2>
                <small>Currently being handled</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">✓</div>
              <div className="stat-content">
                <span>Resolved</span>
                <h2>{loading ? "..." : allTickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED").length}</h2>
                <small>Successfully completed</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">⚡</div>
              <div className="stat-content">
                <span>New</span>
                <h2>{loading ? "..." : allTickets.filter(t => t.status === "NEW").length}</h2>
                <small>Awaiting assignment</small>
              </div>
            </div>

          </div>


          {/* =====================================
              MAIN CONTENT GRID
          ===================================== */}

          <div className="dashboard-main-grid">


            {/* =================================
                RECENT TICKETS
            ================================= */}

            <div className="recent-tickets-card">

              <div className="section-header">

                <div>
                  <h3>
                    Recent Tickets
                  </h3>

                  <p>
                    Track your latest support requests
                  </p>
                </div>

                <button
                  className="view-all-btn"
                  onClick={() =>
                    navigate("/student/tickets")
                  }
                >
                  View All
                  <span>→</span>
                </button>

              </div>


              <div className="tickets-list">

                {loading ? <div className="p-4">Loading your tickets...</div> : recentTickets.length === 0 ? <div className="p-4">No recent tickets found.</div> : recentTickets.map((ticket) => (
                  <div
                    className="dashboard-ticket"
                    key={ticket.id}
                    onClick={() =>
                      navigate(
                        `/student/tickets/${ticket.id}`
                      )
                    }
                  >
                    <div className="ticket-left">
                      <div className="ticket-number">
                        #
                      </div>
                      <div className="ticket-details">
                        <h4>
                          {ticket.title}
                        </h4>
                        <div className="ticket-meta">
                          <span>
                            {ticket.ticket_number || ticket.id}
                          </span>
                          <span className="dot">
                            •
                          </span>
                          <span>
                            {ticket.category || "General"}
                          </span>
                          <span className="dot">
                            •
                          </span>
                          <span>
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>


                    <div className="ticket-right">

                      <span
                        className={`priority-badge ${
                          (ticket.priority || "normal").toLowerCase()
                        }`}
                      >
                        {ticket.priority || "NORMAL"}
                      </span>

                      <span
                        className={`status-badge ${
                          (ticket.status || "new")
                            .toLowerCase()
                            .replace(" ", "-")
                        }`}
                      >
                        {ticket.status}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>


            {/* =================================
                AI SUPPORT CARD
            ================================= */}

            <div className="ai-support-card">

              <div className="ai-card-top">

                <div className="ai-large-icon">
                  🤖
                </div>

                <div className="ai-online-small">
                  <span></span>
                  Online
                </div>

              </div>


              <h3>
                Need Help?
              </h3>

              <p>
                You don't need to know which department
                handles your problem. Just explain it to
                our AI Assistant.
              </p>


              <div className="ai-features">

                <div>
                  <span>✓</span>
                  Understands your problem
                </div>

                <div>
                  <span>✓</span>
                  Automatically creates tickets
                </div>

                <div>
                  <span>✓</span>
                  Routes to the right department
                </div>

                <div>
                  <span>✓</span>
                  Tracks your request
                </div>

              </div>


              <button
                className="ai-start-btn"
                onClick={() =>
                  navigate("/student/create-ticket")
                }
              >
                Start Conversation
                <span>→</span>
              </button>

            </div>

          </div>


          {/* =====================================
              LOWER SECTION
          ===================================== */}

          <div className="dashboard-lower-grid">


            {/* =================================
                TICKET STATUS
            ================================= */}

            <div className="status-overview-card">

              <div className="section-header">

                <div>
                  <h3>
                    Ticket Overview
                  </h3>

                  <p>
                    Your support activity
                  </p>
                </div>

              </div>


              <div className="status-overview">

                <div className="status-circle">

                  <div>
                    <strong>
                      12
                    </strong>

                    <span>
                      Total
                    </span>
                  </div>

                </div>


                <div className="status-items">

                  <div className="status-item">

                    <span className="status-dot open"></span>

                    <div>
                      <strong>3</strong>
                      <span>In Progress</span>
                    </div>

                  </div>


                  <div className="status-item">

                    <span className="status-dot resolved"></span>

                    <div>
                      <strong>9</strong>
                      <span>Resolved</span>
                    </div>

                  </div>


                  <div className="status-item">

                    <span className="status-dot assigned"></span>

                    <div>
                      <strong>1</strong>
                      <span>Assigned</span>
                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================
                SUPPORT TOPICS
            ================================= */}

            <div className="support-topics-card">

              <div className="section-header">

                <div>
                  <h3>
                    What can I help with?
                  </h3>

                  <p>
                    Popular support categories
                  </p>
                </div>

              </div>


              <div className="topic-grid">

                <button
                  onClick={() =>
                    navigate("/student/create-ticket")
                  }
                >
                  <span>💳</span>
                  Fees
                </button>

                <button
                  onClick={() =>
                    navigate("/student/create-ticket")
                  }
                >
                  <span>🎓</span>
                  Examination
                </button>

                <button
                  onClick={() =>
                    navigate("/student/create-ticket")
                  }
                >
                  <span>🏠</span>
                  Hostel
                </button>

                <button
                  onClick={() =>
                    navigate("/student/create-ticket")
                  }
                >
                  <span>💼</span>
                  Placement
                </button>

                <button
                  onClick={() =>
                    navigate("/student/create-ticket")
                  }
                >
                  <span>🖥️</span>
                  IT Support
                </button>

                <button
                  onClick={() =>
                    navigate("/student/create-ticket")
                  }
                >
                  <span>📚</span>
                  Scholarship
                </button>

              </div>

            </div>

          </div>


          {/* =====================================
              FOOTER MESSAGE
          ===================================== */}

          <div className="dashboard-info">

            <span className="info-icon">
              ✨
            </span>

            <div>

              <strong>
                Smart support powered by AI
              </strong>

              <p>
                Your issue is automatically analyzed,
                prioritized and routed to the appropriate
                college department.
              </p>

            </div>

          </div>

        </main>

      </div>
    </>
  );
}

export default Dashboard;