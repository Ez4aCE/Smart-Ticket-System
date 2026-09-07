import { useNavigate } from "react-router-dom";

function Navbar({ role = "student" }) {
  const navigate = useNavigate();

  const roleInfo = {
    student: {
      name: "Student",
      avatar: "S",
    },
    staff: {
      name: "Staff",
      avatar: "P",
    },
    admin: {
      name: "Administrator",
      avatar: "A",
    },
  };

  const currentRole = roleInfo[role] || roleInfo.student;

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
          onClick={() => navigate("/login")}
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