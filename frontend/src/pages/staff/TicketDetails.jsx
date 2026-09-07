import { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function TicketDetails() {
  const { id } = useParams();

  const [comment, setComment] = useState("");

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
                Ticket #{id}
              </h2>

              <p>
                Review and manage this student support request.
              </p>
            </div>

          </div>


          {/* Ticket Details */}

          <div className="card shadow-sm p-4 mt-4">

            <div className="d-flex justify-content-between align-items-start">

              <div>
                <h4 className="mb-2">
                  Fee payment not reflected
                </h4>

                <p className="text-muted mb-0">
                  TKT-{id.replace("TKT-", "")} • Fees • Today
                </p>
              </div>

              <span className="badge bg-warning text-dark">
                In Progress
              </span>

            </div>

            <hr />


            {/* Ticket Information */}

            <div className="row">

              <div className="col-md-6 mb-3">

                <strong>
                  Category
                </strong>

                <p className="mb-0">
                  Fees
                </p>

              </div>


              <div className="col-md-6 mb-3">

                <strong>
                  Priority
                </strong>

                <p className="mb-0">
                  <span className="badge bg-danger">
                    High
                  </span>
                </p>

              </div>


              <div className="col-md-6 mb-3">

                <strong>
                  AI Confidence
                </strong>

                <p className="mb-0">
                  94%
                </p>

              </div>


              <div className="col-md-6 mb-3">

                <strong>
                  Student
                </strong>

                <p className="mb-0">
                  Student #001
                </p>

              </div>


              <div className="col-md-6 mb-3">

                <strong>
                  Department
                </strong>

                <p className="mb-0">
                  Finance
                </p>

              </div>


              <div className="col-md-6 mb-3">

                <strong>
                  Assigned Staff
                </strong>

                <p className="mb-0">
                  You
                </p>

              </div>

            </div>


            <hr />


            {/* Student Problem */}

            <div className="mb-4">

              <h5>
                Student's Problem
              </h5>

              <div className="p-3 bg-light rounded">

                <p className="mb-0">
                  I paid my semester fees, but the payment
                  is not reflected in the college portal.
                  Please check my payment status.
                </p>

              </div>

            </div>


            {/* Comment */}

            <div className="mb-3">

              <label className="form-label">
                Add Comment
              </label>

              <textarea
                className="form-control"
                rows="4"
                placeholder="Write an update for the student..."
                value={comment}
                onChange={(e) =>
                  setComment(e.target.value)
                }
              />

            </div>


            {/* Actions */}

            <div className="d-flex gap-2">

              <button className="btn btn-primary">
                Add Comment
              </button>

              <button className="btn btn-success">
                ✓ Resolve Ticket
              </button>

              <button className="btn btn-warning">
                Reassign
              </button>

            </div>

          </div>

        </main>

      </div>
    </>
  );
}

export default TicketDetails;