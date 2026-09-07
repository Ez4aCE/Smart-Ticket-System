import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function Dashboard() {
  return (
    <>
      <Navbar role="admin" />

      <div className="dashboard-layout">

        <Sidebar role="admin" />

        <main className="content">

          {/* Header */}

          <div className="dashboard-header">

            <div>
              <p className="page-label">
                ADMINISTRATION
              </p>

              <h2>
                Admin Dashboard
              </h2>

              <p>
                Monitor tickets, departments, staff workload and AI routing.
              </p>
            </div>

          </div>


          {/* Statistics */}

          <div className="row mt-4">

            <div className="col-md-3 mb-3">

              <div className="card dashboard-card">

                <div className="dashboard-card-icon blue">
                  🎫
                </div>

                <h6>
                  Total Tickets
                </h6>

                <h2>
                  1,250
                </h2>

                <small>
                  All support requests
                </small>

              </div>

            </div>


            <div className="col-md-3 mb-3">

              <div className="card dashboard-card">

                <div className="dashboard-card-icon orange">
                  ⏳
                </div>

                <h6>
                  Open Tickets
                </h6>

                <h2>
                  340
                </h2>

                <small>
                  Currently being handled
                </small>

              </div>

            </div>


            <div className="col-md-3 mb-3">

              <div className="card dashboard-card">

                <div className="dashboard-card-icon green">
                  ✓
                </div>

                <h6>
                  Resolved
                </h6>

                <h2>
                  560
                </h2>

                <small>
                  Successfully completed
                </small>

              </div>

            </div>


            <div className="col-md-3 mb-3">

              <div className="card dashboard-card">

                <div className="dashboard-card-icon purple">
                  ⚡
                </div>

                <h6>
                  Manual Triage
                </h6>

                <h2>
                  40
                </h2>

                <small>
                  Need admin review
                </small>

              </div>

            </div>

          </div>


          {/* Main Sections */}

          <div className="row mt-3">


            {/* Ticket Overview */}

            <div className="col-md-8">

              <div className="card staff-section-card">

                <div className="section-header">

                  <div>
                    <h5>
                      Ticket Overview
                    </h5>

                    <p>
                      Current support activity across the college
                    </p>
                  </div>

                  <button className="view-all-btn">
                    View All →
                  </button>

                </div>


                <div className="admin-ticket-row">

                  <div className="admin-ticket-icon">
                    💰
                  </div>

                  <div className="admin-ticket-info">

                    <strong>
                      Fees
                    </strong>

                    <span>
                      Finance Department
                    </span>

                  </div>

                  <div className="admin-ticket-count">
                    <strong>
                      185
                    </strong>

                    <span>
                      tickets
                    </span>
                  </div>

                </div>


                <div className="admin-ticket-row">

                  <div className="admin-ticket-icon">
                    📝
                  </div>

                  <div className="admin-ticket-info">

                    <strong>
                      Examination
                    </strong>

                    <span>
                      Examination Cell
                    </span>

                  </div>

                  <div className="admin-ticket-count">
                    <strong>
                      124
                    </strong>

                    <span>
                      tickets
                    </span>
                  </div>

                </div>


                <div className="admin-ticket-row">

                  <div className="admin-ticket-icon">
                    🏠
                  </div>

                  <div className="admin-ticket-info">

                    <strong>
                      Hostel
                    </strong>

                    <span>
                      Hostel Office
                    </span>

                  </div>

                  <div className="admin-ticket-count">
                    <strong>
                      98
                    </strong>

                    <span>
                      tickets
                    </span>
                  </div>

                </div>


                <div className="admin-ticket-row">

                  <div className="admin-ticket-icon">
                    💻
                  </div>

                  <div className="admin-ticket-info">

                    <strong>
                      IT / Network
                    </strong>

                    <span>
                      IT Support
                    </span>

                  </div>

                  <div className="admin-ticket-count">
                    <strong>
                      76
                    </strong>

                    <span>
                      tickets
                    </span>
                  </div>

                </div>

              </div>

            </div>


            {/* Right Side */}

            <div className="col-md-4">


              {/* AI Performance */}

              <div className="card staff-section-card">

                <div className="section-header">

                  <div>
                    <h5>
                      AI Routing
                    </h5>

                    <p>
                      Classification performance
                    </p>
                  </div>

                </div>


                <div className="ai-stat">

                  <div className="ai-stat-icon">
                    🤖
                  </div>

                  <div>
                    <strong>
                      94.6%
                    </strong>

                    <span>
                      Classification Accuracy
                    </span>
                  </div>

                </div>


                <div className="ai-stat">

                  <div className="ai-stat-icon">
                    🎯
                  </div>

                  <div>
                    <strong>
                      92.8%
                    </strong>

                    <span>
                      Routing Accuracy
                    </span>
                  </div>

                </div>


                <div className="ai-stat">

                  <div className="ai-stat-icon">
                    ⚡
                  </div>

                  <div>
                    <strong>
                      2.4h
                    </strong>

                    <span>
                      Average Resolution
                    </span>
                  </div>

                </div>

              </div>


              {/* Manual Triage */}

              <div className="card manual-triage-card">

                <div className="triage-icon">
                  ⚡
                </div>

                <div>

                  <h5>
                    Manual Triage
                  </h5>

                  <p>
                    40 tickets have low AI confidence
                    and require review.
                  </p>

                </div>

                <button>
                  Review →
                </button>

              </div>

            </div>

          </div>


          {/* Staff Capacity */}

          <div className="card staff-section-card admin-capacity-card">

            <div className="section-header">

              <div>

                <h5>
                  Department Staff Capacity
                </h5>

                <p>
                  Current workload distribution
                </p>

              </div>

            </div>


            <div className="capacity-table">

              <div className="capacity-row header">

                <span>
                  Department
                </span>

                <span>
                  Staff
                </span>

                <span>
                  Active Tickets
                </span>

                <span>
                  Capacity
                </span>

              </div>


              <div className="capacity-row">

                <span>
                  Finance
                </span>

                <span>
                  6
                </span>

                <span>
                  32
                </span>

                <span className="capacity-good">
                  72%
                </span>

              </div>


              <div className="capacity-row">

                <span>
                  Examination
                </span>

                <span>
                  5
                </span>

                <span>
                  24
                </span>

                <span className="capacity-good">
                  64%
                </span>

              </div>


              <div className="capacity-row">

                <span>
                  IT Support
                </span>

                <span>
                  4
                </span>

                <span>
                  31
                </span>

                <span className="capacity-warning">
                  86%
                </span>

              </div>


              <div className="capacity-row">

                <span>
                  Hostel
                </span>

                <span>
                  5
                </span>

                <span>
                  19
                </span>

                <span className="capacity-good">
                  58%
                </span>

              </div>

            </div>

          </div>


          {/* Bottom Information */}

          <div className="staff-info-bar">

            <span>
              💡
            </span>

            <div>

              <strong>
                AI-powered ticket assignment
              </strong>

              <p>
                The system automatically analyzes each ticket,
                predicts its category and priority, and assigns
                it to the most suitable department and staff member.
              </p>

            </div>

          </div>

        </main>

      </div>
    </>
  );
}

export default Dashboard;