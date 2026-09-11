import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBriefcase,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendarCheck,
  FaMapMarkerAlt,
} from "react-icons/fa";
import API from "../api";

function Applications() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "recruiter";

  const statusFilter =
    searchParams.get("status")?.toLowerCase() || "";

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint = isAdmin
        ? "/applications"
        : "/applications/my";

      const response = await API.get(endpoint);

      let data = Array.isArray(response.data)
        ? response.data
        : [];

      // Shortlisted filter for both admin and student
      if (statusFilter === "shortlisted") {
        data = data.filter(
          (application) =>
            application.status?.toLowerCase() ===
            "shortlisted"
        );
      }

      setApplications(data);
    } catch (error) {
      console.error(
        "Applications error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to fetch applications"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ====================================================
  UPDATE APPLICATION STATUS
  ====================================================
  */

  const updateStatus = async (
    applicationId,
    status
  ) => {
    try {
      setUpdatingId(applicationId);
      setError("");

      /*
       * STEP 1
       * Update application status
       */
      await API.put(
        `/applications/${applicationId}/status`,
        {
          status,
        }
      );

      /*
       * STEP 2
       * If student is selected,
       * create placement record.
       */
      if (status === "selected") {
        try {
          await API.post(
            `/placements/create/${applicationId}`,
            {}
          );

          alert(
            "Student selected and placement record created successfully."
          );
        } catch (placementError) {
          /*
           * Application is already selected.
           * Placement creation can fail if it already exists.
           */
          const message =
            placementError.response?.data?.message ||
            "";

          if (
            message
              .toLowerCase()
              .includes("already exists")
          ) {
            alert(
              "Student is already selected and placement record already exists."
            );
          } else {
            console.error(
              "Placement creation error:",
              placementError
            );

            alert(
              "Student selected, but placement record could not be created. Please open Placement Management and create it manually."
            );
          }
        }
      }

      await fetchApplications();
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update application status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
  ====================================================
  SCHEDULE INTERVIEW
  ====================================================
  */

  const scheduleInterview = (
    application
  ) => {
    if (
      application.status?.toLowerCase() !==
      "shortlisted"
    ) {
      alert(
        "Interview can only be scheduled for shortlisted students."
      );
      return;
    }

    navigate(
      `/interviews?applicationId=${application._id}`
    );
  };

  const pageTitle =
    statusFilter === "shortlisted"
      ? "Shortlisted Applications"
      : isAdmin
      ? "Student Applications"
      : "My Applications";

  const pageDescription =
    statusFilter === "shortlisted"
      ? "View your shortlisted job applications."
      : isAdmin
      ? "Review applications and update their placement status."
      : "View the status of your job applications.";

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <nav style={styles.navbar}>

        <button
          onClick={() =>
            navigate("/dashboard")
          }
          style={styles.backButton}
        >
          <FaArrowLeft size={13} />
          Dashboard
        </button>

        <div style={styles.navCenter}>

          <h2 style={styles.navTitle}>
            {pageTitle}
          </h2>

          <p style={styles.navSubtitle}>
            {isAdmin
              ? "Placement Management"
              : "Application Tracking"}
          </p>

        </div>

        <div style={styles.navSpacer} />

      </nav>

      {/* MAIN */}
      <main style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>

          <div>

            <p style={styles.smallText}>
              {isAdmin
                ? statusFilter === "shortlisted"
                  ? "SHORTLISTED"
                  : "PLACEMENT MANAGEMENT"
                : statusFilter === "shortlisted"
                ? "SHORTLISTED"
                : "APPLICATIONS"}
            </p>

            <h1 style={styles.heading}>
              {pageTitle}
            </h1>

            <p style={styles.description}>
              {pageDescription}
            </p>

          </div>

          <div style={styles.countBox}>

            <strong
              style={styles.countNumber}
            >
              {applications.length}
            </strong>

            <span style={styles.countLabel}>
              {statusFilter === "shortlisted"
                ? "Shortlisted"
                : "Applications"}
            </span>

          </div>

        </div>

        {/* FILTER INFO */}
        {statusFilter === "shortlisted" && (
          <div
            style={styles.filterBar}
          >

            <div>
              <strong>
                Shortlisted Applications
              </strong>

              <span>
                {" "}
                Showing only applications
                with shortlisted status.
              </span>
            </div>

            <button
              onClick={() =>
                navigate("/applications")
              }
              style={
                styles.clearFilterButton
              }
            >
              View All Applications
            </button>

          </div>
        )}

        {/* ERROR */}
        {error && (
          <div style={styles.error}>
            <FaTimesCircle />
            <span>{error}</span>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div style={styles.loading}>

            <FaBriefcase size={28} />

            <p>
              Loading applications...
            </p>

          </div>
        ) : applications.length === 0 ? (
          <div style={styles.empty}>

            <div style={styles.emptyIcon}>
              <FaBriefcase />
            </div>

            <h3>
              {statusFilter === "shortlisted"
                ? "No shortlisted applications"
                : "No applications found"}
            </h3>

            <p>
              {statusFilter === "shortlisted"
                ? isAdmin
                  ? "No students have been shortlisted yet."
                  : "You do not have any shortlisted applications yet."
                : isAdmin
                ? "Students have not submitted any applications yet."
                : "You have not applied for any jobs yet."}
            </p>

            {statusFilter === "shortlisted" ? (
              <button
                onClick={() =>
                  navigate("/applications")
                }
                style={
                  styles.primaryButton
                }
              >
                <FaBriefcase size={13} />
                View All Applications
              </button>
            ) : (
              <button
                onClick={() =>
                  navigate("/jobs")
                }
                style={
                  styles.primaryButton
                }
              >
                <FaBriefcase size={13} />
                Browse Jobs
              </button>
            )}

          </div>
        ) : (
          <div style={styles.list}>

            {applications.map(
              (application) => {

                const studentName =
                  application.student?.name ||
                  application.student?.email ||
                  "Student";

                const studentEmail =
                  application.student?.email ||
                  "";

                const jobTitle =
                  application.job?.title ||
                  application.jobTitle ||
                  "Job";

                const companyName =
                  application.job?.company?.name ||
                  application.company?.name ||
                  application.company ||
                  "Company";

                const location =
                  application.job?.location ||
                  application.job?.company?.location ||
                  "Location not specified";

                const status =
                  application.status ||
                  "applied";

                const normalizedStatus =
                  status.toLowerCase();

                const isUpdating =
                  updatingId ===
                  application._id;

                return (
                  <div
                    key={application._id}
                    style={
                      styles.applicationCard
                    }
                  >

                    {/* TOP */}
                    <div
                      style={
                        styles.cardTop
                      }
                    >

                      <div
                        style={
                          styles.jobIcon
                        }
                      >
                        <FaBriefcase />
                      </div>

                      <div
                        style={
                          styles.jobInfo
                        }
                      >

                        <h2
                          style={
                            styles.jobTitle
                          }
                        >
                          {jobTitle}
                        </h2>

                        <p
                          style={
                            styles.companyName
                          }
                        >
                          {companyName}
                        </p>

                        <div
                          style={
                            styles.location
                          }
                        >
                          <FaMapMarkerAlt
                            size={11}
                          />

                          {location}
                        </div>

                      </div>

                      <StatusBadge
                        status={status}
                      />

                    </div>

                    {/* STUDENT */}
                    <div
                      style={
                        styles.studentSection
                      }
                    >

                      <div
                        style={
                          styles.studentIcon
                        }
                      >
                        <FaUser />
                      </div>

                      <div
                        style={
                          styles.studentInfo
                        }
                      >

                        <span
                          style={
                            styles.label
                          }
                        >
                          Student
                        </span>

                        <strong
                          style={
                            styles.studentName
                          }
                        >
                          {isAdmin
                            ? studentName
                            : user?.name || "You"}
                        </strong>

                        {isAdmin &&
                          studentEmail && (
                            <p
                              style={
                                styles.email
                              }
                            >
                              {studentEmail}
                            </p>
                          )}

                      </div>

                    </div>

                    {/* DETAILS */}
                    <div
                      style={
                        styles.detailsGrid
                      }
                    >

                      <Detail
                        label="Status"
                        value={formatStatus(
                          status
                        )}
                      />

                      <Detail
                        label="Applied On"
                        value={
                          application.createdAt
                            ? new Date(
                                application.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "N/A"
                        }
                      />

                      <Detail
                        label="Salary"
                        value={
                          application.job
                            ?.salary ||
                          "Not specified"
                        }
                      />

                    </div>

                    {/* ADMIN ACTIONS */}
                    {isAdmin && (
                      <div
                        style={
                          styles.actions
                        }
                      >

                        <div
                          style={
                            styles.actionTitle
                          }
                        >
                          Update Application
                        </div>

                        <div
                          style={
                            styles.actionButtons
                          }
                        >

                          <button
                            onClick={() =>
                              updateStatus(
                                application._id,
                                "shortlisted"
                              )
                            }
                            disabled={
                              isUpdating
                            }
                            style={{
                              ...styles.actionButton,
                              ...styles.shortlistButton,
                              opacity:
                                isUpdating
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            <FaCheckCircle />
                            Shortlist
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(
                                application._id,
                                "rejected"
                              )
                            }
                            disabled={
                              isUpdating
                            }
                            style={{
                              ...styles.actionButton,
                              ...styles.rejectButton,
                              opacity:
                                isUpdating
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            <FaTimesCircle />
                            Reject
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(
                                application._id,
                                "selected"
                              )
                            }
                            disabled={
                              isUpdating ||
                              normalizedStatus ===
                                "selected"
                            }
                            style={{
                              ...styles.actionButton,
                              ...styles.selectButton,
                              opacity:
                                isUpdating ||
                                normalizedStatus ===
                                  "selected"
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            <FaCheckCircle />
                            {normalizedStatus ===
                            "selected"
                              ? "Selected"
                              : "Select"}
                          </button>

                          {normalizedStatus ===
                            "shortlisted" && (
                            <button
                              onClick={() =>
                                scheduleInterview(
                                  application
                                )
                              }
                              style={{
                                ...styles.actionButton,
                                ...styles.interviewButton,
                              }}
                            >
                              <FaCalendarCheck />
                              Schedule Interview
                            </button>
                          )}

                        </div>

                        {normalizedStatus ===
                          "selected" && (
                          <button
                            onClick={() =>
                              navigate(
                                "/placements"
                              )
                            }
                            style={
                              styles.placementButton
                            }
                          >
                            <FaCheckCircle />
                            Manage Placement
                          </button>
                        )}

                      </div>
                    )}

                    {/* STUDENT VIEW */}
                    {!isAdmin && (
                      <div
                        style={
                          styles.studentStatus
                        }
                      >

                        <div>

                          <span
                            style={
                              styles.interviewLabel
                            }
                          >
                            Interview
                          </span>

                          <strong>
                            {application.interview
                              ? "Interview Scheduled"
                              : normalizedStatus ===
                                "shortlisted"
                              ? "Awaiting Schedule"
                              : normalizedStatus ===
                                "rejected"
                              ? "Not Applicable"
                              : normalizedStatus ===
                                "selected"
                              ? "Selected"
                              : "Not Scheduled"}
                          </strong>

                        </div>

                        {application.job?._id && (
                          <button
                            onClick={() =>
                              navigate(
                                `/jobs/${application.job._id}`
                              )
                            }
                            style={
                              styles.viewJobButton
                            }
                          >
                            View Job
                            <FaBriefcase
                              size={11}
                            />
                          </button>
                        )}

                      </div>
                    )}

                  </div>
                );
              }
            )}

          </div>
        )}

      </main>

    </div>
  );
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }) {
  const normalized =
    status?.toLowerCase();

  let style =
    styles.appliedStatus;

  let icon = <FaClock />;

  if (
    normalized === "shortlisted"
  ) {
    style =
      styles.shortlistedStatus;
    icon = <FaCheckCircle />;
  }

  if (
    normalized === "rejected"
  ) {
    style =
      styles.rejectedStatus;
    icon = <FaTimesCircle />;
  }

  if (
    normalized === "selected" ||
    normalized === "placed"
  ) {
    style =
      styles.selectedStatus;
    icon = <FaCheckCircle />;
  }

  return (
    <span
      style={{
        ...styles.statusBadge,
        ...style,
      }}
    >
      {icon}
      {formatStatus(status)}
    </span>
  );
}

/* ================= FORMAT STATUS ================= */

function formatStatus(status) {
  if (!status) return "Applied";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

/* ================= DETAIL ================= */

function Detail({
  label,
  value,
}) {
  return (
    <div style={styles.detail}>

      <span
        style={
          styles.detailLabel
        }
      >
        {label}
      </span>

      <strong
        style={
          styles.detailValue
        }
      >
        {value}
      </strong>

    </div>
  );
}

/* ================= STYLES ================= */

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    fontFamily: "Arial, sans-serif",
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

  backButton: {
    border:
      "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    padding: "10px 15px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  navCenter: {
    textAlign: "center",
  },

  navTitle: {
    margin: 0,
    fontSize: "21px",
    color: "#111827",
  },

  navSubtitle: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: "12px",
  },

  navSpacer: {
    width: "100px",
  },

  container: {
    width: "100%",
    boxSizing: "border-box",
    padding: "35px 5%",
  },

  header: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "28px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "22px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.04)",
  },

  smallText: {
    margin: "0 0 7px",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  heading: {
    margin: 0,
    fontSize: "28px",
    color: "#111827",
  },

  description: {
    margin: "7px 0 0",
    color: "#6b7280",
  },

  countBox: {
    minWidth: "100px",
    padding: "15px 20px",
    borderRadius: "12px",
    background: "#eff6ff",
    color: "#2563eb",
    textAlign: "center",
  },

  countNumber: {
    display: "block",
    fontSize: "25px",
  },

  countLabel: {
    display: "block",
    marginTop: "3px",
    fontSize: "11px",
    fontWeight: "600",
  },

  filterBar: {
    background: "#eff6ff",
    border:
      "1px solid #dbeafe",
    borderRadius: "10px",
    padding: "13px 16px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: "15px",
  },

  clearFilterButton: {
    border:
      "1px solid #bfdbfe",
    background: "#ffffff",
    color: "#2563eb",
    padding: "8px 12px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "14px",
    borderRadius: "10px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    fontWeight: "600",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  applicationCard: {
    background: "#ffffff",
    borderRadius: "15px",
    padding: "24px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.04)",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    paddingBottom: "20px",
    borderBottom:
      "1px solid #f1f5f9",
  },

  jobIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "11px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    flexShrink: 0,
  },

  jobInfo: {
    flex: 1,
    minWidth: 0,
  },

  jobTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#111827",
  },

  companyName: {
    margin: "5px 0",
    color: "#4b5563",
    fontSize: "14px",
    fontWeight: "600",
  },

  location: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#6b7280",
    fontSize: "12px",
  },

  studentSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "18px 0",
  },

  studentIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#f1f5f9",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  studentInfo: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    display: "block",
    color: "#9ca3af",
    fontSize: "11px",
    marginBottom: "3px",
  },

  studentName: {
    color: "#111827",
    fontSize: "14px",
  },

  email: {
    margin: "3px 0 0",
    color: "#6b7280",
    fontSize: "12px",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "20px",
  },

  detail: {
    background: "#f8fafc",
    padding: "13px",
    borderRadius: "9px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  detailLabel: {
    color: "#9ca3af",
    fontSize: "11px",
  },

  detailValue: {
    color: "#374151",
    fontSize: "13px",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 11px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  appliedStatus: {
    background: "#eff6ff",
    color: "#2563eb",
  },

  shortlistedStatus: {
    background: "#fef3c7",
    color: "#92400e",
  },

  rejectedStatus: {
    background: "#fee2e2",
    color: "#b91c1c",
  },

  selectedStatus: {
    background: "#dcfce7",
    color: "#166534",
  },

  actions: {
    borderTop:
      "1px solid #f1f5f9",
    paddingTop: "18px",
  },

  actionTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#374151",
    marginBottom: "10px",
  },

  actionButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
  },

  actionButton: {
    border: "none",
    padding: "9px 13px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  shortlistButton: {
    background: "#fef3c7",
    color: "#92400e",
  },

  rejectButton: {
    background: "#fee2e2",
    color: "#b91c1c",
  },

  selectButton: {
    background: "#dcfce7",
    color: "#166534",
  },

  interviewButton: {
    background: "#2563eb",
    color: "#ffffff",
  },

  placementButton: {
    marginTop: "12px",
    border: "none",
    background: "#111827",
    color: "#ffffff",
    padding: "10px 14px",
    borderRadius: "8px",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  studentStatus: {
    borderTop:
      "1px solid #f1f5f9",
    paddingTop: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: "15px",
  },

  interviewLabel: {
    display: "block",
    color: "#9ca3af",
    fontSize: "11px",
    marginBottom: "4px",
  },

  viewJobButton: {
    border:
      "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#2563eb",
    padding: "9px 13px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  loading: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
  },

  empty: {
    background: "#ffffff",
    borderRadius: "15px",
    textAlign: "center",
    padding: "60px 20px",
    color: "#6b7280",
  },

  emptyIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto 15px",
    borderRadius: "14px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },

  primaryButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
  },
};

export default Applications;