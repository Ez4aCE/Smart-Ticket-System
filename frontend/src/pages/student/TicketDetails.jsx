import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import "./TicketDetails.css";

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">

        <Sidebar role="student" />

        <main className="ticket-details-page">

          {/* =====================================
              PAGE HEADER
          ===================================== */}

          <div className="ticket-details-header">

            <div>

              <button
                className="back-ticket-btn"
                onClick={() => navigate("/student/tickets")}
              >
                ← Back to My Tickets
              </button>

              <div className="ticket-title-row">

                <div className="ticket-header-icon">
                  🎫
                </div>

                <div>
                  <p className="ticket-label">
                    SUPPORT TICKET
                  </p>

                  <h1>
                    Ticket #{id}
                  </h1>
                </div>

              </div>

            </div>


            <div className="ticket-header-status">

              <span className="live-dot"></span>

              In Progress

            </div>

          </div>


          {/* =====================================
              MAIN GRID
          ===================================== */}

          <div className="ticket-details-grid">


            {/* =================================
                LEFT CONTENT
            ================================= */}

            <div className="ticket-details-main">


              {/* ISSUE CARD */}

              <div className="ticket-info-card">

                <div className="ticket-card-header">

                  <div>

                    <span className="card-label">
                      ISSUE
                    </span>

                    <h2>
                      Semester fee payment not reflected
                    </h2>

                  </div>

                  <span className="priority-large high">
                    High Priority
                  </span>

                </div>


                <div className="ticket-description">

                  <p>
                    I paid my semester fees, but the payment
                    is still not reflected in the student portal.
                    The amount has already been deducted from
                    my bank account.
                  </p>

                </div>


                <div className="ticket-created-info">

                  <span>
                    Created on Sep 7, 2026
                  </span>

                  <span>
                    •
                  </span>

                  <span>
                    Last updated 2 hours ago
                  </span>

                </div>

              </div>


              {/* =================================
                  TICKET INFORMATION
              ================================= */}

              <div className="ticket-info-card">

                <div className="simple-card-header">

                  <div>
                    <span className="card-label">
                      TICKET INFORMATION
                    </span>

                    <h3>
                      Request Details
                    </h3>
                  </div>

                </div>


                <div className="ticket-information-grid">

                  <div className="information-item">

                    <span className="information-icon">
                      📂
                    </span>

                    <div>

                      <small>
                        Category
                      </small>

                      <strong>
                        Fees
                      </strong>

                    </div>

                  </div>


                  <div className="information-item">

                    <span className="information-icon">
                      🏢
                    </span>

                    <div>

                      <small>
                        Department
                      </small>

                      <strong>
                        Finance
                      </strong>

                    </div>

                  </div>


                  <div className="information-item">

                    <span className="information-icon">
                      👤
                    </span>

                    <div>

                      <small>
                        Assigned Staff
                      </small>

                      <strong>
                        Priya
                      </strong>

                    </div>

                  </div>


                  <div className="information-item">

                    <span className="information-icon">
                      ⏱
                    </span>

                    <div>

                      <small>
                        Response Time
                      </small>

                      <strong>
                        2.4 hours
                      </strong>

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================
                  AI ANALYSIS
              ================================= */}

              <div className="ai-analysis-card">

                <div className="ai-analysis-header">

                  <div className="ai-analysis-icon">
                    🤖
                  </div>

                  <div>

                    <span>
                      AI ANALYSIS
                    </span>

                    <h3>
                      Ticket automatically classified
                    </h3>

                  </div>

                  <div className="confidence-badge">
                    96% Confidence
                  </div>

                </div>


                <div className="ai-analysis-result">

                  <div>
                    <small>
                      Detected Category
                    </small>

                    <strong>
                      Fees
                    </strong>
                  </div>

                  <div>
                    <small>
                      Detected Priority
                    </small>

                    <strong className="red-text">
                      High
                    </strong>
                  </div>

                  <div>
                    <small>
                      Routed To
                    </small>

                    <strong>
                      Finance Department
                    </strong>
                  </div>

                </div>

              </div>


              {/* =================================
                  TICKET TIMELINE
              ================================= */}

              <div className="ticket-info-card timeline-card">

                <div className="simple-card-header">

                  <div>
                    <span className="card-label">
                      ACTIVITY
                    </span>

                    <h3>
                      Ticket Progress
                    </h3>
                  </div>

                </div>


                <div className="ticket-timeline">


                  {/* Created */}

                  <div className="timeline-item completed">

                    <div className="timeline-icon">
                      ✓
                    </div>

                    <div className="timeline-content">

                      <strong>
                        Ticket Created
                      </strong>

                      <p>
                        Your support request was successfully
                        submitted.
                      </p>

                      <small>
                        Sep 7, 2026 • 10:32 AM
                      </small>

                    </div>

                  </div>


                  {/* AI */}

                  <div className="timeline-item completed">

                    <div className="timeline-icon">
                      🤖
                    </div>

                    <div className="timeline-content">

                      <strong>
                        AI Classification Completed
                      </strong>

                      <p>
                        AI identified the issue as Fees and
                        assigned High priority.
                      </p>

                      <small>
                        Sep 7, 2026 • 10:32 AM
                      </small>

                    </div>

                  </div>


                  {/* Department */}

                  <div className="timeline-item completed">

                    <div className="timeline-icon">
                      🏢
                    </div>

                    <div className="timeline-content">

                      <strong>
                        Assigned to Finance
                      </strong>

                      <p>
                        Ticket was automatically routed to
                        the Finance Department.
                      </p>

                      <small>
                        Sep 7, 2026 • 10:33 AM
                      </small>

                    </div>

                  </div>


                  {/* Staff */}

                  <div className="timeline-item current">

                    <div className="timeline-icon">
                      👤
                    </div>

                    <div className="timeline-content">

                      <div className="timeline-title-line">

                        <strong>
                          Staff Working on Request
                        </strong>

                        <span>
                          Current
                        </span>

                      </div>

                      <p>
                        Priya from the Finance Department is
                        currently reviewing your request.
                      </p>

                      <small>
                        Sep 7, 2026 • 11:15 AM
                      </small>

                    </div>

                  </div>


                  {/* Resolved */}

                  <div className="timeline-item pending">

                    <div className="timeline-icon">
                      ✓
                    </div>

                    <div className="timeline-content">

                      <strong>
                        Ticket Resolved
                      </strong>

                      <p>
                        Waiting for the department to resolve
                        the issue.
                      </p>

                    </div>

                  </div>


                  {/* Closed */}

                  <div className="timeline-item pending">

                    <div className="timeline-icon">
                      ✓
                    </div>

                    <div className="timeline-content">

                      <strong>
                        Ticket Closed
                      </strong>

                      <p>
                        You will be able to close the ticket
                        after resolution.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================
                RIGHT SIDEBAR
            ================================= */}

            <aside className="ticket-details-side">


              {/* STATUS CARD */}

              <div className="ticket-side-card">

                <span className="card-label">
                  CURRENT STATUS
                </span>

                <div className="current-status">

                  <div className="status-large-icon">
                    ⏳
                  </div>

                  <div>

                    <strong>
                      In Progress
                    </strong>

                    <span>
                      Staff is working on it
                    </span>

                  </div>

                </div>

                <div className="status-progress">

                  <div className="progress-line">

                    <span></span>

                  </div>

                  <div className="progress-labels">

                    <span>
                      Created
                    </span>

                    <span>
                      Working
                    </span>

                    <span>
                      Resolved
                    </span>

                  </div>

                </div>

              </div>


              {/* ASSIGNED STAFF */}

              <div className="ticket-side-card">

                <span className="card-label">
                  ASSIGNED STAFF
                </span>

                <div className="assigned-person">

                  <div className="staff-avatar">
                    P
                  </div>

                  <div>

                    <strong>
                      Priya
                    </strong>

                    <span>
                      Finance Department
                    </span>

                  </div>

                </div>

                <div className="staff-capacity">

                  <span>
                    Workload
                  </span>

                  <strong>
                    Balanced
                  </strong>

                </div>

              </div>


              {/* HELP CARD */}

              <div className="ticket-help-card">

                <div className="help-ai-icon">
                  🤖
                </div>

                <h3>
                  Need more help?
                </h3>

                <p>
                  You can continue your conversation with
                  the AI Assistant if you have more information
                  about this issue.
                </p>

                <button
                  onClick={() =>
                    navigate("/student/create-ticket")
                  }
                >
                  Talk to AI →
                </button>

              </div>


            </aside>

          </div>


          {/* =====================================
              FOOTER INFO
          ===================================== */}

          <div className="ticket-bottom-info">

            <span>
              🔒
            </span>

            <p>
              Your ticket information is private and can only
              be accessed by you and authorized college staff.
            </p>

          </div>

        </main>

      </div>
    </>
  );
}

export default TicketDetails;