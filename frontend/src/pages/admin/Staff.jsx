import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function Staff() {
  const staff = [
    {
      name: "Priya Sharma",
      department: "Finance",
      workload: 3,
      capacity: 10,
    },
    {
      name: "Rahul Kumar",
      department: "Finance",
      workload: 8,
      capacity: 10,
    },
    {
      name: "Amit Singh",
      department: "IT Support",
      workload: 6,
      capacity: 10,
    },
  ];

  return (
    <>
      <Navbar role="admin"/>

      <div className="dashboard-layout">
        <Sidebar role="admin"/>

        <main className="content">

          <h2>Staff Management</h2>

          <div className="table-responsive mt-4">

            <table className="table table-hover">

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Active Tickets</th>
                  <th>Capacity</th>
                </tr>
              </thead>

              <tbody>

                {staff.map((member) => (
                  <tr key={member.name}>

                    <td>{member.name}</td>

                    <td>{member.department}</td>

                    <td>{member.workload}</td>

                    <td>
                      {member.workload}/{member.capacity}

                      <div className="progress mt-1">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${
                              (member.workload /
                                member.capacity) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </main>
      </div>
    </>
  );
}

export default Staff;