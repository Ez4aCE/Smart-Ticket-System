import { useNavigate } from "react-router-dom";

function Navbar({ role }) {
  const navigate = useNavigate();

  // Get the real user from localStorage
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();

  const actualRole = role || storedUser?.role?.toLowerCase() || "student";

  const roleInfo = {
    student: {
      name: storedUser?.full_name || "Student",
      avatar: "S",
    },
    staff: {
      name: storedUser?.full_name || "Staff",
      avatar: "P",
    },
    admin: {
      name: storedUser?.full_name || "Administrator",
      avatar: "A",
    },
  };

  const currentRole = roleInfo[actualRole] || roleInfo.student;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="top-navbar">

      {/* Logo */}

      <div className="navbar-brand-area">

        <div className="navbar-logo">
          🎓
        </div>

        <span>
          Smart Student Support
        </span>

      </div>


      {/* Right Side */}

      <div className="navbar-right">

        <div className="navbar-user">

          <div className="navbar-avatar">
            {currentRole.avatar}
          </div>

          <span>
            {currentRole.name}
          </span>

          <span className="dropdown-arrow">
            ▾
          </span>

        </div>


        {/* Logout */}

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          ⇥
          <span>
            Logout
          </span>
        </button>

      </div>

    </nav>
  );
}

export default Navbar;