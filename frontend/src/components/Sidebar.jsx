import { NavLink } from "react-router-dom";

function Sidebar({ role = "student" }) {
  const menuItems = {
    student: [
      {
        name: "Dashboard",
        path: "/student/dashboard",
        icon: "⌂",
      },
      {
        name: "AI Assistant",
        path: "/student/create-ticket",
        icon: "🤖",
      },
      {
        name: "My Tickets",
        path: "/student/tickets",
        icon: "▤",
      },
    ],

    staff: [
      {
        name: "Dashboard",
        path: "/staff/dashboard",
        icon: "⌂",
      },
      {
        name: "Assigned Tickets",
        path: "/staff/tickets",
        icon: "▤",
      },
    ],

    admin: [
      {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: "⌂",
      },
      {
        name: "All Tickets",
        path: "/admin/tickets",
        icon: "▤",
      },
      {
        name: "Departments",
        path: "/admin/departments",
        icon: "▦",
      },
      {
        name: "Staff",
        path: "/admin/staff",
        icon: "♙",
      },
      {
        name: "Manual Triage",
        path: "/admin/triage",
        icon: "⚡",
      },
    ],
  };

  const roleDetails = {
    student: {
      title: "Student Portal",
      subtitle: "Support Center",
      logo: "🎓",
      userLetter: "S",
      userName: "Student",
      userSubtitle: "Student Account",
    },

    staff: {
      title: "Staff Portal",
      subtitle: "Department Support",
      logo: "👨‍💼",
      userLetter: "P",
      userName: "Staff Member",
      userSubtitle: "Department Staff",
    },

    admin: {
      title: "Admin Portal",
      subtitle: "Administration",
      logo: "⚙️",
      userLetter: "A",
      userName: "Administrator",
      userSubtitle: "Admin Account",
    },
  };

  const items = menuItems[role] || menuItems.student;

  const details =
    roleDetails[role] || roleDetails.student;

  return (
    <aside className="sidebar">

      {/* =====================================
          PORTAL HEADER
      ===================================== */}

      <div className="sidebar-header">

        <div className="sidebar-logo">
          {details.logo}
        </div>

        <div>

          <h5>
            {details.title}
          </h5>

          <span>
            {details.subtitle}
          </span>

        </div>

      </div>


      {/* =====================================
          MENU
      ===================================== */}

      <div className="sidebar-menu">

        <p className="menu-label">
          MENU
        </p>

        {items.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-item ${
                isActive ? "active" : ""
              }`
            }
          >

            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>
              {item.name}
            </span>

          </NavLink>

        ))}

      </div>


      {/* =====================================
          STUDENT AI HELP
      ===================================== */}

      {role === "student" && (

        <div className="sidebar-help">

          <div className="help-icon">
            🤖
          </div>

          <div>

            <strong>
              Need help?
            </strong>

            <p>
              Ask our AI Assistant
            </p>

          </div>

        </div>

      )}


      {/* =====================================
          STAFF HELP
      ===================================== */}

      {role === "staff" && (

        <div className="sidebar-help">

          <div className="help-icon">
            🎫
          </div>

          <div>

            <strong>
              Assigned Tickets
            </strong>

            <p>
              8 tickets require attention
            </p>

          </div>

        </div>

      )}


      {/* =====================================
          ADMIN HELP
      ===================================== */}

      {role === "admin" && (

        <div className="sidebar-help">

          <div className="help-icon">
            ⚡
          </div>

          <div>

            <strong>
              Manual Triage
            </strong>

            <p>
              Review low-confidence tickets
            </p>

          </div>

        </div>

      )}


      {/* =====================================
          USER
      ===================================== */}

      <div className="sidebar-user">

        <div className="user-avatar">
          {details.userLetter}
        </div>

        <div className="user-info">

          <strong>
            {details.userName}
          </strong>

          <span>
            {details.userSubtitle}
          </span>

        </div>

        <span className="user-more">
          ⋮
        </span>

      </div>

    </aside>
  );
}

export default Sidebar;