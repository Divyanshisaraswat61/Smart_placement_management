import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrophy,
  FaBuilding,
  FaBriefcase,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCheckCircle,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaUser,
  FaEnvelope,
  FaClock,
  FaSave,
} from "react-icons/fa";
import API from "../api";

function Placement() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [editData, setEditData] = useState({});

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    let currentUser = {};

    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
        setUser(currentUser);
      } catch (error) {
        console.error("User data error:", error);
      }
    }

    fetchPlacements(currentUser);
  }, []);

  const fetchPlacements = async (currentUser = {}) => {
    try {
      setLoading(true);
      setError("");

      const isAdmin =
        currentUser?.role === "admin" ||
        currentUser?.role === "recruiter";

      const endpoint = isAdmin
        ? "/placements"
        : "/placements/my";

      const response = await API.get(endpoint);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data
        ? [response.data]
        : [];

      setPlacements(data);

      /*
       * Prepare editable data for admin
       */
      const initialEditData = {};

      data.forEach((placement) => {
        initialEditData[placement._id] = {
          package:
            placement.package ||
            placement.job?.salary ||
            "",
          joiningDate: placement.joiningDate
            ? new Date(
                placement.joiningDate
              )
                .toISOString()
                .split("T")[0]
            : "",
          status:
            placement.status ||
            "offer_received",
        };
      });

      setEditData(initialEditData);
    } catch (error) {
      console.error(
        "Placement fetch error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load placement details."
      );
    } finally {
      setLoading(false);
    }
  };

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "recruiter";

  /*
  ====================================================
  HANDLE EDIT
  ====================================================
  */

  const handleEditChange = (
    placementId,
    field,
    value
  ) => {
    setEditData((previous) => ({
      ...previous,
      [placementId]: {
        ...previous[placementId],
        [field]: value,
      },
    }));
  };

  /*
  ====================================================
  UPDATE PLACEMENT
  ====================================================
  */

  const updatePlacement = async (
    placementId
  ) => {
    try {
      setUpdatingId(placementId);
      setError("");

      const currentData =
        editData[placementId];

      await API.put(
        `/placements/${placementId}`,
        {
          package:
            currentData?.package || "",
          joiningDate:
            currentData?.joiningDate || null,
          status:
            currentData?.status ||
            "offer_received",
        }
      );

      alert(
        "Placement details updated successfully."
      );

      await fetchPlacements(user);
    } catch (error) {
      console.error(
        "Update placement error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update placement."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
  ====================================================
  FORMAT STATUS
  ====================================================
  */

  const formatStatus = (status) => {
    if (!status) {
      return "Offer Received";
    }

    return status
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
  };

  /*
  ====================================================
  STATUS STYLE
  ====================================================
  */

  const getStatusStyle = (status) => {
    const normalized =
      status?.toLowerCase();

    if (normalized === "joined") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (normalized === "withdrawn") {
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

  /*
  ====================================================
  FORMAT DATE
  ====================================================
  */

  const formatDate = (date) => {
    if (!date) {
      return "Not announced";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Not announced";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
  ====================================================
  LOADING
  ====================================================
  */

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingIcon}>
          <FaTrophy />
        </div>

        <p>
          Loading placement details...
        </p>
      </div>
    );
  }

  /*
  ====================================================
  MAIN
  ====================================================
  */

  return (
    <div style={styles.page}>

      {/* NAVBAR */}

      <nav style={styles.navbar}>

        <div style={styles.brand}>

          <div style={styles.logo}>
            <FaTrophy size={18} />
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

        <button
          onClick={() =>
            navigate("/dashboard")
          }
          style={styles.backButton}
        >
          <FaArrowLeft size={12} />
          Dashboard
        </button>

      </nav>

      {/* MAIN */}

      <main style={styles.container}>

        {/* HEADER */}

        <div style={styles.pageHeader}>

          <div>

            <p
              style={
                styles.smallText
              }
            >
              {isAdmin
                ? "PLACEMENT MANAGEMENT"
                : "PLACEMENT"}
            </p>

            <h1
              style={styles.heading}
            >
              Placement Details
            </h1>

            <p
              style={
                styles.description
              }
            >
              {isAdmin
                ? "Manage student placement records, package, joining date and placement status."
                : "View your placement, package and joining details."}
            </p>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div
            style={
              styles.errorBox
            }
          >
            {error}
          </div>
        )}

        {/* EMPTY */}

        {placements.length === 0 ? (

          <div
            style={
              styles.emptyCard
            }
          >

            <div
              style={
                styles.emptyIcon
              }
            >
              <FaClock />
            </div>

            <h2
              style={
                styles.emptyTitle
              }
            >
              {isAdmin
                ? "No Placement Records"
                : "Placement Pending"}
            </h2>

            <p
              style={
                styles.emptyText
              }
            >
              {isAdmin
                ? "No placement records have been created yet."
                : "Your placement details will appear here once a placement record is created."}
            </p>

            {isAdmin ? (
              <button
                onClick={() =>
                  navigate(
                    "/applications"
                  )
                }
                style={
                  styles.primaryButton
                }
              >
                <FaBriefcase
                  size={13}
                />
                View Applications
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
                <FaBriefcase
                  size={13}
                />
                Browse Jobs
              </button>
            )}

          </div>

        ) : (

          <div
            style={
              styles.placementList
            }
          >

            {placements.map(
              (placement) => {

                const companyName =
                  placement.company
                    ?.name ||
                  "Company";

                const jobTitle =
                  placement.job
                    ?.title ||
                  "Job Role";

                const packageValue =
                  placement.package ||
                  placement.job
                    ?.salary ||
                  "Not specified";

                const joiningDate =
                  placement.joiningDate;

                const location =
                  placement.company
                    ?.location ||
                  placement.job
                    ?.location ||
                  "Not specified";

                const status =
                  placement.status ||
                  "offer_received";

                const studentName =
                  placement.student
                    ?.name ||
                  "Student";

                const studentEmail =
                  placement.student
                    ?.email ||
                  "";

                const currentEdit =
                  editData[
                    placement._id
                  ] || {
                    package:
                      packageValue,
                    joiningDate: "",
                    status:
                      status,
                  };

                const isUpdating =
                  updatingId ===
                  placement._id;

                return (
                  <div
                    key={
                      placement._id
                    }
                    style={
                      styles.placementCard
                    }
                  >

                    {/* CARD HEADER */}

                    <div
                      style={
                        styles.cardHeader
                      }
                    >

                      <div
                        style={
                          styles.companySection
                        }
                      >

                        <div
                          style={
                            styles.companyIcon
                          }
                        >
                          <FaBuilding />
                        </div>

                        <div>

                          <h2
                            style={
                              styles.companyName
                            }
                          >
                            {
                              companyName
                            }
                          </h2>

                          <p
                            style={
                              styles.jobTitle
                            }
                          >
                            {jobTitle}
                          </p>

                        </div>

                      </div>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...getStatusStyle(
                            status
                          ),
                        }}
                      >
                        <FaCheckCircle
                          size={11}
                        />

                        {formatStatus(
                          status
                        )}
                      </span>

                    </div>

                    {/* DETAILS */}

                    <div
                      style={
                        styles.detailsGrid
                      }
                    >

                      <DetailBox
                        icon={
                          <FaBuilding />
                        }
                        label="COMPANY"
                        value={
                          companyName
                        }
                      />

                      <DetailBox
                        icon={
                          <FaBriefcase />
                        }
                        label="JOB ROLE"
                        value={
                          jobTitle
                        }
                      />

                      <DetailBox
                        icon={
                          <FaMoneyBillWave />
                        }
                        label="PACKAGE"
                        value={
                          packageValue
                        }
                      />

                      <DetailBox
                        icon={
                          <FaCalendarAlt />
                        }
                        label="JOINING DATE"
                        value={formatDate(
                          joiningDate
                        )}
                      />

                      <DetailBox
                        icon={
                          <FaMapMarkerAlt />
                        }
                        label="LOCATION"
                        value={
                          location
                        }
                      />

                      <DetailBox
                        icon={
                          <FaCheckCircle />
                        }
                        label="PLACEMENT STATUS"
                        value={formatStatus(
                          status
                        )}
                      />

                    </div>

                    {/* ADMIN STUDENT */}

                    {isAdmin && (
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

                        <div>

                          <span
                            style={
                              styles.detailLabel
                            }
                          >
                            STUDENT
                          </span>

                          <strong
                            style={
                              styles.studentName
                            }
                          >
                            {
                              studentName
                            }
                          </strong>

                          {studentEmail && (
                            <span
                              style={
                                styles.studentEmail
                              }
                            >
                              <FaEnvelope
                                size={10}
                              />

                              {
                                studentEmail
                              }
                            </span>
                          )}

                        </div>

                      </div>
                    )}

                    {/* ADMIN MANAGEMENT */}

                    {isAdmin && (
                      <div
                        style={
                          styles.managementSection
                        }
                      >

                        <div
                          style={
                            styles.managementHeader
                          }
                        >

                          <div>
                            <h3
                              style={
                                styles.managementTitle
                              }
                            >
                              Manage Placement
                            </h3>

                            <p
                              style={
                                styles.managementSubtitle
                              }
                            >
                              Update package,
                              joining date and
                              placement status.
                            </p>
                          </div>

                        </div>

                        <div
                          style={
                            styles.editGrid
                          }
                        >

                          {/* PACKAGE */}

                          <div
                            style={
                              styles.inputGroup
                            }
                          >

                            <label
                              style={
                                styles.inputLabel
                              }
                            >
                              Package
                            </label>

                            <input
                              type="text"
                              value={
                                currentEdit.package ||
                                ""
                              }
                              onChange={(e) =>
                                handleEditChange(
                                  placement._id,
                                  "package",
                                  e.target
                                    .value
                                )
                              }
                              placeholder="e.g. 8 LPA"
                              style={
                                styles.input
                              }
                            />

                          </div>

                          {/* JOINING DATE */}

                          <div
                            style={
                              styles.inputGroup
                            }
                          >

                            <label
                              style={
                                styles.inputLabel
                              }
                            >
                              Joining Date
                            </label>

                            <input
                              type="date"
                              value={
                                currentEdit.joiningDate ||
                                ""
                              }
                              onChange={(e) =>
                                handleEditChange(
                                  placement._id,
                                  "joiningDate",
                                  e.target
                                    .value
                                )
                              }
                              style={
                                styles.input
                              }
                            />

                          </div>

                          {/* STATUS */}

                          <div
                            style={
                              styles.inputGroup
                            }
                          >

                            <label
                              style={
                                styles.inputLabel
                              }
                            >
                              Placement Status
                            </label>

                            <select
                              value={
                                currentEdit.status ||
                                "offer_received"
                              }
                              onChange={(e) =>
                                handleEditChange(
                                  placement._id,
                                  "status",
                                  e.target
                                    .value
                                )
                              }
                              style={
                                styles.input
                              }
                            >

                              <option value="offer_received">
                                Offer Received
                              </option>

                              <option value="joined">
                                Joined
                              </option>

                              <option value="withdrawn">
                                Withdrawn
                              </option>

                            </select>

                          </div>

                        </div>

                        {/* SAVE */}

                        <button
                          onClick={() =>
                            updatePlacement(
                              placement._id
                            )
                          }
                          disabled={
                            isUpdating
                          }
                          style={{
                            ...styles.saveButton,
                            opacity:
                              isUpdating
                                ? 0.6
                                : 1,
                          }}
                        >

                          <FaSave
                            size={12}
                          />

                          {isUpdating
                            ? "Updating..."
                            : "Update Placement"}

                        </button>

                      </div>
                    )}

                    {/* JOB DESCRIPTION */}

                    {placement.job
                      ?.description && (
                      <div
                        style={
                          styles.descriptionSection
                        }
                      >

                        <h3>
                          Job Description
                        </h3>

                        <p>
                          {
                            placement
                              .job
                              .description
                          }
                        </p>

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

/* ================= DETAIL BOX ================= */

function DetailBox({
  icon,
  label,
  value,
}) {
  return (
    <div
      style={styles.detailBox}
    >

      <div
        style={
          styles.detailIcon
        }
      >
        {icon}
      </div>

      <div>

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

  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "35px 5%",
    boxSizing: "border-box",
  },

  pageHeader: {
    marginBottom: "25px",
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

  errorBox: {
    background: "#fee2e2",
    border:
      "1px solid #fecaca",
    color: "#b91c1c",
    padding: "14px 16px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  emptyCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "60px 25px",
    textAlign: "center",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.04)",
  },

  emptyIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto 15px",
    borderRadius: "15px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },

  emptyTitle: {
    margin: "0 0 8px",
    color: "#111827",
    fontSize: "22px",
  },

  emptyText: {
    maxWidth: "550px",
    margin:
      "0 auto 20px",
    color: "#6b7280",
    lineHeight: "1.6",
  },

  primaryButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "11px 17px",
    borderRadius: "9px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  placementList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  placementCard: {
    background: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.04)",
  },

  cardHeader: {
    padding: "22px 25px",
    borderBottom:
      "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: "15px",
  },

  companySection: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  companyIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "11px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  companyName: {
    margin: 0,
    fontSize: "19px",
    color: "#111827",
  },

  jobTitle: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  statusBadge: {
    padding: "7px 11px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    whiteSpace: "nowrap",
  },

  detailsGrid: {
    padding: "22px 25px",
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "15px",
  },

  detailBox: {
    background: "#f8fafc",
    borderRadius: "11px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  detailIcon: {
    width: "35px",
    height: "35px",
    borderRadius: "8px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "13px",
  },

  detailLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.6px",
    marginBottom: "4px",
  },

  detailValue: {
    display: "block",
    color: "#111827",
    fontSize: "14px",
  },

  studentSection: {
    margin:
      "0 25px 22px",
    padding: "15px",
    borderRadius: "11px",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  studentIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  studentName: {
    display: "block",
    color: "#111827",
    fontSize: "14px",
    marginBottom: "4px",
  },

  studentEmail: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#6b7280",
    fontSize: "12px",
  },

  managementSection: {
    margin:
      "0 25px 22px",
    padding: "20px",
    borderRadius: "12px",
    background: "#f8fafc",
    border:
      "1px solid #e5e7eb",
  },

  managementHeader: {
    marginBottom: "17px",
  },

  managementTitle: {
    margin: 0,
    fontSize: "16px",
    color: "#111827",
  },

  managementSubtitle: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: "12px",
  },

  editGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  inputLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#4b5563",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 11px",
    border:
      "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#111827",
    outline: "none",
    fontSize: "13px",
  },

  saveButton: {
    marginTop: "16px",
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
    fontSize: "12px",
  },

  descriptionSection: {
    borderTop:
      "1px solid #f1f5f9",
    padding:
      "20px 25px 25px",
  },

  loadingPage: {
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

export default Placement;