import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function ManualTriage() {
  return (
    <>
      <Navbar role="admin"/>

      <div className="dashboard-layout">
        <Sidebar role="admin"/>

        <main className="content">

          <h2>Manual Triage</h2>

          <div className="card shadow-sm p-4 mt-4">

            <h5>Ticket #TKT-1099</h5>

            <p>
              My registration is not working and I don't
              know which department handles this issue.
            </p>

            <hr />

            <p>
              <strong>AI Confidence:</strong>{" "}
              <span className="text-danger">
                48%
              </span>
            </p>

            <div className="mb-3">

              <label className="form-label">
                Category
              </label>

              <select className="form-select">
                <option>Select Category</option>
                <option>Fees</option>
                <option>Examination</option>
                <option>Hostel</option>
                <option>Placement</option>
                <option>Scholarship</option>
                <option>IT / Network</option>
                <option>Admission</option>
                <option>Transport</option>
              </select>

            </div>

            <div className="mb-3">

              <label className="form-label">
                Department
              </label>

              <select className="form-select">
                <option>Select Department</option>
                <option>Finance</option>
                <option>Exam Cell</option>
                <option>IT Support</option>
                <option>Hostel Office</option>
              </select>

            </div>

            <button className="btn btn-primary">
              Assign Ticket
            </button>

          </div>

        </main>
      </div>
    </>
  );
}

export default ManualTriage;