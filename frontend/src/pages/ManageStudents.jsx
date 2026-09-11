import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaBuilding,
  FaBriefcase,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaSyncAlt,
} from "react-icons/fa";
import API from "../api";

function ManageStudents() {
  const navigate = useNavigate();

  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/placements");

      const data = response.data;

      setPlacements(
        Array.isArray(data)
          ? data
          : data
          ? [data]
          : []
      );
    } catch (err) {
      console.error("Placements fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load student placement data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const updateStatus = async (placementId, status) => {
    try {
      setUpdatingId(placementId);

      const currentPlacement = placements.find(
        (item) => item._id === placementId
      );

      await API.put(`/placements/${placementId}`, {
        package: currentPlacement?.package || "",
        joiningDate:
          currentPlacement?.joiningDate || null,
        status,
      });

      setPlacements((previous) =>
        previous.map((item) =>
          item._id === placementId
            ? {
                ...item,
                status,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Placement status update error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to update placement status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "joined") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "withdrawn") {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Offer Received";
    }

    if (status === "offer_received") {
      return "Offer Received";
    }

    if (status === "joined") {
      return "Joined";
    }

    if (status === "withdrawn") {
      return "Withdrawn";
    }

    return status;
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div style={styles.page}>

      {/* ================= HEADER ================= */}

      <header style={styles.header}>

        <div style={styles.headerLeft}>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            style={styles.backButton}
          >
            <FaArrowLeft size={13} />
            Dashboard
          </button>

          <div>
            <h1 style={styles.title}>
              Manage Students
            </h1>

            <p style={styles.subtitle}>
              Manage student placement and joining
              status
            </p>
          </div>

        </div>

        <button
          onClick={fetchPlacements}
          style={styles.refreshButton}
          disabled={loading}
        >
          <FaSyncAlt
            size={13}
            style={
              loading
                ? styles.spinning
                : undefined
            }
          />
          Refresh
        </button>

      </header>

      {/* ================= MAIN ================= */}

      <main style={styles.container}>

        {/* SUMMARY */}

        <div style={styles.summaryGrid}>

          <SummaryCard
            title="Total Students"
            value={placements.length}
            icon={<FaUser />}
          />

          <SummaryCard
            title="Offer Received"
            value={
              placements.filter(
                (item) =>
                  item.status ===
                  "offer_received"
              ).length
            }
            icon={<FaBriefcase />}
          />

          <SummaryCard
            title="Joined"
            value={
              placements.filter(
                (item) =>
                  item.status ===
                  "joined"
              ).length
            }
            icon={<FaCheckCircle />}
          />

          <SummaryCard
            title="Withdrawn"
            value={
              placements.filter(
                (item) =>
                  item.status ===
                  "withdrawn"
              ).length
            }
            icon={<FaTimesCircle />}
          />

        </div>

        {/* ERROR */}

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* ================= STUDENTS ================= */}

        <section style={styles.card}>

          <div style={styles.cardHeader}>

            <div>
              <h2 style={styles.cardTitle}>
                Student Placement Records
              </h2>

              <p style={styles.cardSubtitle}>
                Mark whether a selected student
                has joined the company or withdrawn.
              </p>
            </div>

            <span style={styles.countBadge}>
              {placements.length} Records
            </span>

          </div>

          {loading ? (

            <div style={styles.loading}>
              <FaSyncAlt
                size={24}
                style={styles.loadingIcon}
              />

              <p>
                Loading student records...
              </p>
            </div>

          ) : placements.length === 0 ? (

            <div style={styles.empty}>

              <div style={styles.emptyIcon}>
                <FaUser />
              </div>

              <h3>
                No placement records found
              </h3>

              <p>
                Students will appear here after
                their applications are selected.
              </p>

              <button
                onClick={() =>
                  navigate("/applications")
                }
                style={styles.primaryButton}
              >
                <FaBriefcase size={13} />
                View Applications
              </button>

            </div>

          ) : (

            <div style={styles.studentList}>

              {placements.map((placement) => {

                const student =
                  placement.student || {};

                const company =
                  placement.company || {};

                const job =
                  placement.job || {};

                const currentStatus =
                  placement.status ||
                  "offer_received";

                const isUpdating =
                  updatingId ===
                  placement._id;

                return (
                  <div
                    key={placement._id}
                    style={styles.studentCard}
                  >

                    {/* STUDENT INFO */}

                    <div
                      style={styles.studentInfo}
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
                          styles.studentDetails
                        }
                      >

                        <h3>
                          {student.name ||
                            "Student"}
                        </h3>

                        <p>
                          {student.email ||
                            "Email not available"}
                        </p>

                      </div>

                    </div>

                    {/* COMPANY */}

                    <div
                      style={styles.infoBlock}
                    >

                      <span
                        style={
                          styles.infoLabel
                        }
                      >
                        Company
                      </span>

                      <div
                        style={
                          styles.infoValue
                        }
                      >
                        <FaBuilding
                          size={12}
                        />

                        {company.name ||
                          "Company"}
                      </div>

                    </div>

                    {/* JOB */}

                    <div
                      style={styles.infoBlock}
                    >

                      <span
                        style={
                          styles.infoLabel
                        }
                      >
                        Position
                      </span>

                      <div
                        style={
                          styles.infoValue
                        }
                      >
                        <FaBriefcase
                          size={12}
                        />

                        {job.title ||
                          "Job Position"}
                      </div>

                    </div>

                    {/* PACKAGE */}

                    <div
                      style={styles.infoBlock}
                    >

                      <span
                        style={
                          styles.infoLabel
                        }
                      >
                        Package
                      </span>

                      <strong
                        style={
                          styles.packageValue
                        }
                      >
                        {placement.package ||
                          "Not specified"}
                      </strong>

                    </div>

                    {/* JOINING DATE */}

                    <div
                      style={styles.infoBlock}
                    >

                      <span
                        style={
                          styles.infoLabel
                        }
                      >
                        Joining Date
                      </span>

                      <strong
                        style={
                          styles.dateValue
                        }
                      >
                        {formatDate(
                          placement.joiningDate
                        )}
                      </strong>

                    </div>

                    {/* STATUS */}

                    <div
                      style={styles.statusSection}
                    >

                      <span
                        style={
                          styles.infoLabel
                        }
                      >
                        Current Status
                      </span>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...getStatusStyle(
                            currentStatus
                          ),
                        }}
                      >
                        {formatStatus(
                          currentStatus
                        )}
                      </span>

                    </div>

                    {/* ACTIONS */}

                    <div
                      style={styles.actions}
                    >

                      <button
                        onClick={() =>
                          updateStatus(
                            placement._id,
                            "joined"
                          )
                        }
                        disabled={isUpdating}
                        style={{
                          ...styles.joinButton,
                          opacity:
                            isUpdating
                              ? 0.6
                              : 1,
                        }}
                      >
                        <FaCheckCircle
                          size={13}
                        />

                        {isUpdating &&
                        currentStatus !==
                          "joined"
                          ? "Updating..."
                          : "Mark Joined"}
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(
                            placement._id,
                            "withdrawn"
                          )
                        }
                        disabled={isUpdating}
                        style={{
                          ...styles.withdrawButton,
                          opacity:
                            isUpdating
                              ? 0.6
                              : 1,
                        }}
                      >
                        <FaTimesCircle
                          size={13}
                        />

                        {isUpdating &&
                        currentStatus !==
                          "withdrawn"
                          ? "Updating..."
                          : "Mark Withdrawn"}
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

/* ================= SUMMARY CARD ================= */

function SummaryCard({
  title,
  value,
  icon,
}) {
  return (
    <div style={styles.summaryCard}>

      <div style={styles.summaryIcon}>
        {icon}
      </div>

      <div>
        <span
          style={styles.summaryTitle}
        >
          {title}
        </span>

        <strong
          style={styles.summaryValue}
        >
          {value}
        </strong>
      </div>

    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    fontFamily:
      "Arial, sans-serif",
  },

  header: {
    minHeight: "76px",
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

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  backButton: {
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

  title: {
    margin: 0,
    fontSize: "24px",
    color: "#111827",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  refreshButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 15px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  spinning: {
    animation:
      "spin 1s linear infinite",
  },

  container: {
    width: "100%",
    padding: "30px 5%",
    boxSizing: "border-box",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  summaryCard: {
    background: "#ffffff",
    borderRadius: "13px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.04)",
  },

  summaryIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryTitle: {
    display: "block",
    color: "#6b7280",
    fontSize: "12px",
    marginBottom: "4px",
  },

  summaryValue: {
    display: "block",
    color: "#111827",
    fontSize: "22px",
  },

  errorBox: {
    background: "#fee2e2",
    color: "#b91c1c",
    border:
      "1px solid #fecaca",
    padding: "13px 15px",
    borderRadius: "9px",
    marginBottom: "18px",
    fontSize: "14px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "15px",
    padding: "24px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.04)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: "20px",
    marginBottom: "20px",
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

  countBadge: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "7px 11px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },

  studentList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  studentCard: {
    border:
      "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px",
    display: "grid",
    gridTemplateColumns:
      "1.5fr 1fr 1fr 0.8fr 1fr 1fr 1.6fr",
    alignItems: "center",
    gap: "16px",
  },

  studentInfo: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    minWidth: 0,
  },

  studentIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  studentDetails: {
    minWidth: 0,
  },

  infoBlock: {
    minWidth: 0,
  },

  infoLabel: {
    display: "block",
    color: "#9ca3af",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "6px",
    fontWeight: "700",
  },

  infoValue: {
    color: "#374151",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  packageValue: {
    color: "#111827",
    fontSize: "13px",
  },

  dateValue: {
    color: "#374151",
    fontSize: "13px",
  },

  statusSection: {
    minWidth: 0,
  },

  statusBadge: {
    display: "inline-block",
    padding: "6px 9px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },

  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  joinButton: {
    border: "none",
    background: "#16a34a",
    color: "#ffffff",
    padding: "8px 10px",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "700",
  },

  withdrawButton: {
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    padding: "8px 10px",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "700",
  },

  loading: {
    minHeight: "250px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
  },

  loadingIcon: {
    color: "#2563eb",
    animation:
      "spin 1s linear infinite",
  },

  empty: {
    textAlign: "center",
    padding: "50px 20px",
    color: "#6b7280",
  },

  emptyIcon: {
    width: "55px",
    height: "55px",
    margin: "0 auto 13px",
    borderRadius: "12px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
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
};

export default ManageStudents;