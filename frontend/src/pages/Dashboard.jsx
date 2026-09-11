import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaClipboardList,
  FaCalendarCheck,
  FaStar,
  FaTrophy,
  FaUser,
  FaBuilding,
  FaArrowRight,
  FaSignOutAlt,
} from "react-icons/fa";
import API from "../api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [placement, setPlacement] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user");

    let currentUser = {};

    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
        setUser(currentUser);
      } catch (error) {
        console.error(
          "User data error:",
          error
        );
      }
    }

    fetchDashboardData(currentUser);
  }, []);

  const fetchDashboardData = async (
    currentUser = {}
  ) => {
    try {
      setLoading(true);

      const isAdmin =
        currentUser?.role === "admin" ||
        currentUser?.role === "recruiter";

      const applicationsEndpoint =
        isAdmin
          ? "/applications"
          : "/applications/my";

      const interviewsEndpoint =
        isAdmin
          ? "/interviews"
          : "/interviews/my";

      const placementEndpoint =
        isAdmin
          ? "/placements"
          : "/placements/my";

      const [
        applicationsRes,
        interviewsRes,
        placementRes,
      ] = await Promise.allSettled([
        API.get(
          applicationsEndpoint
        ),
        API.get(
          interviewsEndpoint
        ),
        API.get(
          placementEndpoint
        ),
      ]);

      /* ================= APPLICATIONS ================= */

      if (
        applicationsRes.status ===
        "fulfilled"
      ) {
        const applicationData =
          applicationsRes.value
            .data;

        setApplications(
          Array.isArray(
            applicationData
          )
            ? applicationData
            : applicationData
            ? [applicationData]
            : []
        );
      } else {
        console.error(
          "Applications API error:",
          applicationsRes.reason
        );
      }

      /* ================= INTERVIEWS ================= */

      if (
        interviewsRes.status ===
        "fulfilled"
      ) {
        const interviewData =
          interviewsRes.value
            .data;

        setInterviews(
          Array.isArray(
            interviewData
          )
            ? interviewData
            : interviewData
            ? [interviewData]
            : []
        );
      } else {
        console.error(
          "Interviews API error:",
          interviewsRes.reason
        );
      }

      /* ================= PLACEMENTS ================= */

      if (
        placementRes.status ===
        "fulfilled"
      ) {
        const placementData =
          placementRes.value
            .data;

        setPlacement(
          Array.isArray(
            placementData
          )
            ? placementData
            : placementData
            ? [placementData]
            : []
        );
      } else {
        console.error(
          "Placement API error:",
          placementRes.reason
        );
      }
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/login");
  };

  /* ================= ROLE ================= */

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "recruiter";

  /* ================= SHORTLISTED ================= */

  const shortlistedCount =
    applications.filter(
      (app) =>
        app.status?.toLowerCase() ===
        "shortlisted"
    ).length;

  /* ================= PLACEMENT STATUS ================= */

  const hasPlacement =
    Array.isArray(placement) &&
    placement.length > 0;

  const placementValue = isAdmin
    ? "Manage"
    : hasPlacement
    ? "Placed"
    : "Pending";

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div style={styles.loading}>
        <div
          style={
            styles.loadingIcon
          }
        >
          <FaBriefcase />
        </div>

        <p>
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* ================= NAVBAR ================= */}

      <nav style={styles.navbar}>

        <div style={styles.brand}>

          <div style={styles.logo}>
            <FaBriefcase
              size={19}
            />
          </div>

          <div>

            <h2
              style={
                styles.brandTitle
              }
            >
              Smart Placement
            </h2>

            <span
              style={
                styles.brandSubtitle
              }
            >
              Management System
            </span>

          </div>

        </div>

        <div
          style={styles.navRight}
        >

          <button
            onClick={() =>
              navigate(
                isAdmin
                  ? "/dashboard"
                  : "/profile"
              )
            }
            style={
              styles.profileButton
            }
          >

            <FaUser
              size={13}
            />

            {user?.name ||
              "User"}

          </button>

          <button
            onClick={logout}
            style={styles.logout}
          >

            <FaSignOutAlt
              size={13}
            />

            Logout

          </button>

        </div>

      </nav>

      {/* ================= MAIN ================= */}

      <main
        style={styles.container}
      >

        {/* ================= WELCOME ================= */}

        <section
          style={styles.welcome}
        >

          <div>

            <p
              style={
                styles.smallText
              }
            >
              {isAdmin
                ? "ADMIN DASHBOARD"
                : "STUDENT DASHBOARD"}
            </p>

            <h1
              style={styles.heading}
            >
              Welcome back,{" "}
              {user?.name ||
                "User"}
            </h1>

            <p
              style={
                styles.description
              }
            >
              {isAdmin
                ? "Manage placement activities from one place."
                : "Track your placement journey from one place."}
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/jobs")
            }
            style={
              styles.findJobsButton
            }
          >

            <FaBriefcase
              size={14}
            />

            Find Jobs

            <FaArrowRight
              size={12}
            />

          </button>

        </section>

        {/* ================= STATS ================= */}

        <div
          style={styles.statsGrid}
        >

          <StatCard
            title="Applications"
            value={
              applications.length
            }
            icon={
              <FaClipboardList />
            }
            onClick={() =>
              navigate(
                "/applications"
              )
            }
          />

          <StatCard
            title="Interviews"
            value={
              interviews.length
            }
            icon={
              <FaCalendarCheck />
            }
            onClick={() =>
              navigate(
                "/interviews"
              )
            }
          />

          <StatCard
            title="Shortlisted"
            value={
              shortlistedCount
            }
            icon={<FaStar />}
            onClick={() =>
              navigate(
                "/applications?status=shortlisted"
              )
            }
          />

          <StatCard
            title="Placement"
            value={
              placementValue
            }
            icon={
              <FaTrophy />
            }
            onClick={() =>
              navigate(
                "/placements"
              )
            }
          />

        </div>

        {/* ================= QUICK ACTIONS ================= */}

        <section
          style={
            styles.quickSection
          }
        >

          <div>

            <h2
              style={
                styles.sectionTitle
              }
            >
              Quick Actions
            </h2>

            <p
              style={
                styles.sectionSubtitle
              }
            >
              {isAdmin
                ? "Manage placement activities quickly."
                : "Access your placement activities quickly."}
            </p>

          </div>

          <div
            style={
              styles.quickGrid
            }
          >

            {/* BROWSE JOBS */}

            <QuickAction
              icon={
                <FaBriefcase />
              }
              title="Browse Jobs"
              description="Find available placement opportunities"
              onClick={() =>
                navigate("/jobs")
              }
            />

            {/* APPLICATIONS */}

            <QuickAction
              icon={
                <FaClipboardList />
              }
              title={
                isAdmin
                  ? "Manage Applications"
                  : "My Applications"
              }
              description={
                isAdmin
                  ? "Review and manage student applications"
                  : "Track your submitted applications"
              }
              onClick={() =>
                navigate(
                  "/applications"
                )
              }
            />

            {/* INTERVIEWS */}

            <QuickAction
              icon={
                <FaCalendarCheck />
              }
              title={
                isAdmin
                  ? "Manage Interviews"
                  : "My Interviews"
              }
              description={
                isAdmin
                  ? "Manage scheduled interviews"
                  : "Check your upcoming interviews"
              }
              onClick={() =>
                navigate(
                  "/interviews"
                )
              }
            />

            {/* COMPANIES */}

            <QuickAction
              icon={
                <FaBuilding />
              }
              title="Companies"
              description="Explore recruiting companies"
              onClick={() =>
                navigate(
                  "/companies"
                )
              }
            />

            {/* STUDENTS */}

            <QuickAction
              icon={
                <FaUser />
              }
              title={
                isAdmin
                  ? "Manage Students"
                  : "My Profile"
              }
              description={
                isAdmin
                  ? "View and manage registered students"
                  : "View and manage your profile"
              }
              onClick={() =>
                navigate(
                  isAdmin
                    ? "/manage-students"
                    : "/profile"
                )
              }
            />

          </div>

        </section>

        {/* ================= RECENT APPLICATIONS ================= */}

        <section
          style={styles.card}
        >

          <div
            style={
              styles.cardHeader
            }
          >

            <div>

              <h2
                style={
                  styles.cardTitle
                }
              >
                Recent Applications
              </h2>

              <p
                style={
                  styles.cardSubtitle
                }
              >
                {isAdmin
                  ? "Latest student job applications"
                  : "Your latest job applications"}
              </p>

            </div>

            <button
              onClick={() =>
                navigate(
                  "/applications"
                )
              }
              style={
                styles.viewButton
              }
            >

              View All

              <FaArrowRight
                size={11}
              />

            </button>

          </div>

          {applications.length ===
          0 ? (

            <div
              style={styles.empty}
            >

              <div
                style={
                  styles.emptyIcon
                }
              >
                <FaClipboardList />
              </div>

              <p>
                {isAdmin
                  ? "No student applications yet."
                  : "No applications yet."}
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/jobs"
                  )
                }
                style={
                  styles.primaryButton
                }
              >

                <FaBriefcase
                  size={13}
                />

                Browse Jobs

              </button>

            </div>

          ) : (

            <div
              style={
                styles.applicationList
              }
            >

              {applications
                .slice(0, 5)
                .map(
                  (
                    application
                  ) => {

                    const jobTitle =
                      application
                        .job
                        ?.title ||
                      application.jobTitle ||
                      "Job Application";

                    const companyName =
                      application
                        .job
                        ?.company
                        ?.name ||
                      application
                        .company
                        ?.name ||
                      application.company ||
                      "Company";

                    const studentName =
                      application
                        .student
                        ?.name ||
                      application
                        .student
                        ?.email ||
                      "Student";

                    const status =
                      application.status ||
                      "Applied";

                    return (
                      <div
                        key={
                          application._id
                        }
                        style={
                          styles.applicationItem
                        }
                      >

                        <div
                          style={
                            styles.applicationIcon
                          }
                        >
                          <FaBriefcase />
                        </div>

                        <div
                          style={
                            styles.applicationInfo
                          }
                        >

                          <strong>
                            {
                              jobTitle
                            }
                          </strong>

                          <span>
                            {isAdmin
                              ? studentName
                              : companyName}
                          </span>

                          {isAdmin && (
                            <small
                              style={
                                styles.companyText
                              }
                            >
                              {
                                companyName
                              }
                            </small>
                          )}

                        </div>

                        <span
                          style={{
                            ...styles.applicationStatus,
                            ...getStatusStyle(
                              status
                            ),
                          }}
                        >
                          {formatStatus(
                            status
                          )}
                        </span>

                      </div>
                    );
                  }
                )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  title,
  value,
  icon,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      style={styles.statCard}
    >

      <div
        style={styles.statIcon}
      >
        {icon}
      </div>

      <div
        style={styles.statContent}
      >

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

      </div>

      <FaArrowRight
        size={12}
        style={
          styles.statArrow
        }
      />

    </button>
  );
}

/* ================= QUICK ACTION ================= */

function QuickAction({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      style={
        styles.quickCard
      }
    >

      <div
        style={
          styles.quickIcon
        }
      >
        {icon}
      </div>

      <div
        style={
          styles.quickContent
        }
      >

        <h3>{title}</h3>

        <p>
          {description}
        </p>

      </div>

      <FaArrowRight
        size={12}
        style={
          styles.quickArrow
        }
      />

    </button>
  );
}

/* ================= STATUS ================= */

function formatStatus(status) {
  if (!status) {
    return "Applied";
  }

  return status
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}

function getStatusStyle(status) {
  const normalized =
    status?.toLowerCase();

  if (
    normalized ===
    "shortlisted"
  ) {
    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  if (
    normalized === "rejected"
  ) {
    return {
      background: "#fee2e2",
      color: "#b91c1c",
    };
  }

  if (
    normalized === "selected"
  ) {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  return {
    background: "#eff6ff",
    color: "#2563eb",
  };
}

/* ================= STYLES ================= */

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    fontFamily:
      "Arial, sans-serif",
  },

  navbar: {
    minHeight: "70px",
    background: "#ffffff",
    borderBottom:
      "1px solid #e5e7eb",
    padding: "0 5%",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: "20px",
    boxSizing: "border-box",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logo: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  brandTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#111827",
  },

  brandSubtitle: {
    fontSize: "11px",
    color: "#6b7280",
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  profileButton: {
    border:
      "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#374151",
    padding: "9px 13px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  logout: {
    border: "none",
    background: "#111827",
    color: "#ffffff",
    padding: "9px 14px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  container: {
    width: "100%",
    boxSizing: "border-box",
    padding: "35px 5%",
  },

  welcome: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: "20px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.04)",
    marginBottom: "22px",
  },

  smallText: {
    margin: "0 0 8px",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  heading: {
    margin: 0,
    fontSize: "30px",
    color: "#111827",
  },

  description: {
    margin: "8px 0 0",
    color: "#6b7280",
  },

  findJobsButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "12px 17px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "22px",
  },

  statCard: {
    border: "none",
    background: "#ffffff",
    borderRadius: "14px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    textAlign: "left",
    cursor: "pointer",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.04)",
    position: "relative",
  },

  statIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  statContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  statArrow: {
    marginLeft: "auto",
    color: "#9ca3af",
  },

  quickSection: {
    marginBottom: "22px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#111827",
  },

  sectionSubtitle: {
    margin: "6px 0 18px",
    color: "#6b7280",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(5, minmax(0, 1fr))",
    gap: "14px",
  },

  quickCard: {
    border:
      "1px solid #e5e7eb",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "18px",
    textAlign: "left",
    cursor: "pointer",
    minWidth: 0,
  },

  quickIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },

  quickContent: {
    minHeight: "70px",
  },

  quickArrow: {
    color: "#9ca3af",
  },

  card: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.04)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: "15px",
    marginBottom: "18px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  viewButton: {
    border:
      "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#2563eb",
    padding: "8px 12px",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  applicationList: {
    display: "flex",
    flexDirection: "column",
  },

  applicationItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 0",
    borderBottom:
      "1px solid #f1f5f9",
  },

  applicationIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  applicationInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  companyText: {
    color: "#9ca3af",
    fontSize: "11px",
  },

  applicationStatus: {
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },

  empty: {
    textAlign: "center",
    padding: "35px 20px",
    color: "#6b7280",
  },

  emptyIcon: {
    width: "50px",
    height: "50px",
    margin: "0 auto 12px",
    borderRadius: "12px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  primaryButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 15px",
    borderRadius: "8px",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
  },

  loadingIcon: {
    color: "#2563eb",
    fontSize: "28px",
    marginBottom: "8px",
  },
};

export default Dashboard;