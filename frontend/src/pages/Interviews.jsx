import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaVideo,
  FaBuilding,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaEdit,
  FaTimes,
  FaSave,
} from "react-icons/fa";

function Interviews() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingInterview, setEditingInterview] = useState(null);
  const [saving, setSaving] = useState(false);

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin =
    currentUser?.role === "admin" ||
    currentUser?.role === "recruiter";

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setError("");

      const endpoint = isAdmin
        ? "/interviews"
        : "/interviews/my";

      const response = await API.get(endpoint);

      console.log("Interview API response:", response.data);

      setInterviews(response.data);
    } catch (error) {
      console.error("Failed to fetch interviews:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load interviews."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return {
          background: "#dcfce7",
          color: "#15803d",
        };

      case "cancelled":
        return {
          background: "#fee2e2",
          color: "#dc2626",
        };

      default:
        return {
          background: "#ede9fe",
          color: "#7c3aed",
        };
    }
  };

  const joinInterview = (meetingLink) => {
    if (!meetingLink) {
      alert("Interview meeting link is not available yet.");
      return;
    }

    window.open(
      meetingLink,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const viewLocation = (location) => {
    if (!location) {
      alert("Interview location is not available yet.");
      return;
    }

    const mapsUrl =
      `https://www.google.com/maps/search/?api=1&query=` +
      encodeURIComponent(location);

    window.open(
      mapsUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // Open edit form
  const openEditForm = (interview) => {
    setEditingInterview({
      ...interview,
      scheduledAt: interview.scheduledAt
        ? new Date(interview.scheduledAt)
            .toISOString()
            .slice(0, 16)
        : "",
      mode: interview.mode || "online",
      meetingLink: interview.meetingLink || "",
      location: interview.location || "",
      status: interview.status || "scheduled",
      feedback: interview.feedback || "",
    });
  };

  // Close edit form
  const closeEditForm = () => {
    if (saving) return;

    setEditingInterview(null);
  };

  // Handle form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditingInterview((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save interview
  const handleUpdateInterview = async (e) => {
    e.preventDefault();

    if (!editingInterview) return;

    try {
      setSaving(true);
      setError("");

      const updateData = {
        scheduledAt: editingInterview.scheduledAt,
        mode: editingInterview.mode,
        status: editingInterview.status,
        feedback: editingInterview.feedback,
      };

      if (editingInterview.mode === "online") {
        updateData.meetingLink =
          editingInterview.meetingLink;
        updateData.location = "";
      } else {
        updateData.location =
          editingInterview.location;
        updateData.meetingLink = "";
      }

      const response = await API.put(
        `/interviews/${editingInterview._id}`,
        updateData
      );

      console.log(
        "Interview updated:",
        response.data
      );

      setEditingInterview(null);

      await fetchInterviews();

      alert("Interview updated successfully.");
    } catch (error) {
      console.error(
        "Failed to update interview:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update interview."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading interviews...
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <nav style={styles.navbar}>

        <button
          onClick={() => navigate("/dashboard")}
          style={styles.backButton}
        >
          <FaArrowLeft size={13} />
          <span>Dashboard</span>
        </button>

        <h2 style={styles.navTitle}>
          <FaVideo size={17} />
          {isAdmin ? "All Interviews" : "My Interviews"}
        </h2>

        <div style={styles.navSpace} />

      </nav>

      <main style={styles.container}>

        {/* HEADING */}
        <div style={styles.heading}>

          <h1 style={styles.headingTitle}>
            {isAdmin
              ? "Interview Management"
              : "Interview Schedule"}
          </h1>

          <p style={styles.headingSubtitle}>
            {isAdmin
              ? "View and manage all scheduled placement interviews."
              : "Keep track of your upcoming placement interviews."}
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* EMPTY */}
        {interviews.length === 0 ? (

          <div style={styles.empty}>

            <div style={styles.emptyIcon}>
              <FaVideo />
            </div>

            <h2 style={styles.emptyTitle}>
              No interviews scheduled
            </h2>

            <p style={styles.emptyText}>
              {isAdmin
                ? "Scheduled interviews will appear here."
                : "Your scheduled interviews will appear here."}
            </p>

            {!isAdmin && (
              <button
                onClick={() => navigate("/jobs")}
                style={styles.jobsButton}
              >
                <FaBuilding size={14} />
                Browse Jobs
              </button>
            )}

          </div>

        ) : (

          <div style={styles.list}>

            {interviews.map((interview) => {

              const job =
                interview.application?.job;

              const student =
                interview.application?.student;

              const interviewDate = new Date(
                interview.scheduledAt
              );

              const date =
                interviewDate.toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }
                );

              const time =
                interviewDate.toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

              const location =
                interview.mode === "online"
                  ? interview.meetingLink
                    ? "Online · Meeting Link Available"
                    : "Online"
                  : interview.location ||
                    "Location not specified";

              return (
                <div
                  key={interview._id}
                  style={styles.card}
                >

                  {/* CARD HEADER */}
                  <div style={styles.cardHeader}>

                    <div style={styles.companyIcon}>
                      <FaBuilding />
                    </div>

                    <div style={styles.jobInfo}>

                      <h2 style={styles.jobTitle}>
                        {job?.title ||
                          "Job Position"}
                      </h2>

                      <p style={styles.company}>
                        {isAdmin
                          ? student?.name ||
                            "Student"
                          : "Placement Interview"}
                      </p>

                      {isAdmin &&
                        student?.email && (
                          <p
                            style={
                              styles.studentEmail
                            }
                          >
                            {student.email}
                          </p>
                        )}

                    </div>

                    <span
                      style={{
                        ...styles.status,
                        ...getStatusStyle(
                          interview.status
                        ),
                      }}
                    >
                      {interview.status
                        ? interview.status
                            .charAt(0)
                            .toUpperCase() +
                          interview.status.slice(1)
                        : "Upcoming"}
                    </span>

                  </div>

                  {/* DETAILS */}
                  <div style={styles.details}>

                    <div style={styles.detailItem}>

                      <div style={styles.detailIcon}>
                        <FaCalendarAlt />
                      </div>

                      <div>
                        <small style={styles.label}>
                          Date
                        </small>

                        <strong
                          style={
                            styles.detailValue
                          }
                        >
                          {date}
                        </strong>
                      </div>

                    </div>

                    <div style={styles.detailItem}>

                      <div style={styles.detailIcon}>
                        <FaClock />
                      </div>

                      <div>
                        <small style={styles.label}>
                          Time
                        </small>

                        <strong
                          style={
                            styles.detailValue
                          }
                        >
                          {time}
                        </strong>
                      </div>

                    </div>

                    <div style={styles.detailItem}>

                      <div style={styles.detailIcon}>
                        <FaMapMarkerAlt />
                      </div>

                      <div>
                        <small style={styles.label}>
                          Mode / Location
                        </small>

                        <strong
                          style={
                            styles.detailValue
                          }
                        >
                          {location}
                        </strong>
                      </div>

                    </div>

                  </div>

                  {/* BUTTONS */}
                  <div style={styles.bottom}>

                    {isAdmin && (
                      <button
                        onClick={() =>
                          openEditForm(
                            interview
                          )
                        }
                        style={
                          styles.editButton
                        }
                      >
                        <FaEdit size={13} />
                        Edit Interview
                      </button>
                    )}

                    {interview.mode ===
                    "online" ? (

                      <button
                        onClick={() =>
                          joinInterview(
                            interview.meetingLink
                          )
                        }
                        style={
                          styles.joinButton
                        }
                      >
                        <FaVideo size={13} />

                        {isAdmin
                          ? "Open Meeting"
                          : "Join Interview"}

                        <FaExternalLinkAlt
                          size={10}
                        />
                      </button>

                    ) : (

                      <button
                        onClick={() =>
                          viewLocation(
                            interview.location
                          )
                        }
                        style={
                          styles.locationButton
                        }
                      >
                        <FaMapMarkerAlt
                          size={13}
                        />
                        View Location
                      </button>

                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </main>

      {/* EDIT MODAL */}
      {editingInterview && (
        <div style={styles.overlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>
                <h2 style={styles.modalTitle}>
                  Edit Interview
                </h2>

                <p
                  style={
                    styles.modalSubtitle
                  }
                >
                  Update interview details
                </p>
              </div>

              <button
                onClick={closeEditForm}
                style={styles.closeButton}
                disabled={saving}
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={handleUpdateInterview}
            >

              {/* DATE & TIME */}
              <div style={styles.formGroup}>

                <label style={styles.formLabel}>
                  Date & Time
                </label>

                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={
                    editingInterview.scheduledAt
                  }
                  onChange={
                    handleEditChange
                  }
                  required
                  style={styles.input}
                />

              </div>

              {/* MODE */}
              <div style={styles.formGroup}>

                <label style={styles.formLabel}>
                  Interview Mode
                </label>

                <select
                  name="mode"
                  value={
                    editingInterview.mode
                  }
                  onChange={
                    handleEditChange
                  }
                  style={styles.input}
                >
                  <option value="online">
                    Online
                  </option>

                  <option value="offline">
                    Offline
                  </option>
                </select>

              </div>

              {/* ONLINE */}
              {editingInterview.mode ===
                "online" && (

                <div style={styles.formGroup}>

                  <label
                    style={styles.formLabel}
                  >
                    Meeting Link
                  </label>

                  <input
                    type="url"
                    name="meetingLink"
                    placeholder="https://meet.google.com/..."
                    value={
                      editingInterview.meetingLink
                    }
                    onChange={
                      handleEditChange
                    }
                    style={styles.input}
                  />

                  <small
                    style={
                      styles.formHint
                    }
                  >
                    Enter the actual meeting
                    URL.
                  </small>

                </div>
              )}

              {/* OFFLINE */}
              {editingInterview.mode ===
                "offline" && (

                <div style={styles.formGroup}>

                  <label
                    style={styles.formLabel}
                  >
                    Interview Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    placeholder="College Seminar Hall"
                    value={
                      editingInterview.location
                    }
                    onChange={
                      handleEditChange
                    }
                    style={styles.input}
                  />

                </div>
              )}

              {/* STATUS */}
              <div style={styles.formGroup}>

                <label style={styles.formLabel}>
                  Status
                </label>

                <select
                  name="status"
                  value={
                    editingInterview.status
                  }
                  onChange={
                    handleEditChange
                  }
                  style={styles.input}
                >
                  <option value="scheduled">
                    Scheduled
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>

              </div>

              {/* FEEDBACK */}
              <div style={styles.formGroup}>

                <label style={styles.formLabel}>
                  Feedback
                </label>

                <textarea
                  name="feedback"
                  placeholder="Enter interview feedback..."
                  value={
                    editingInterview.feedback
                  }
                  onChange={
                    handleEditChange
                  }
                  rows="4"
                  style={
                    styles.textarea
                  }
                />

              </div>

              {/* ACTIONS */}
              <div style={styles.modalActions}>

                <button
                  type="button"
                  onClick={
                    closeEditForm
                  }
                  disabled={saving}
                  style={
                    styles.cancelButton
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={
                    styles.saveButton
                  }
                >
                  <FaSave size={13} />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    fontFamily: "Arial, sans-serif",
    color: "#111827",
  },

  navbar: {
    minHeight: "70px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "0 5%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxSizing: "border-box",
  },

  backButton: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    padding: "10px 15px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  navTitle: {
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "20px",
  },

  navSpace: {
    width: "110px",
  },

  container: {
    width: "100%",
    boxSizing: "border-box",
    padding: "35px 5%",
  },

  heading: {
    marginBottom: "25px",
  },

  headingTitle: {
    margin: 0,
    fontSize: "30px",
    color: "#111827",
  },

  headingSubtitle: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: "16px",
  },

  errorBox: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "14px 18px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    boxSizing: "border-box",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  companyIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "11px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
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

  company: {
    margin: "5px 0 0",
    color: "#2563eb",
    fontWeight: "600",
  },

  studentEmail: {
    margin: "3px 0 0",
    color: "#6b7280",
    fontSize: "12px",
  },

  status: {
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  details: {
    display: "flex",
    flexWrap: "wrap",
    gap: "18px",
    margin: "24px 0",
    padding: "18px 0",
    borderTop: "1px solid #f1f5f9",
    borderBottom: "1px solid #f1f5f9",
  },

  detailItem: {
    flex: "1 1 200px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    minWidth: 0,
  },

  detailIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "13px",
  },

  label: {
    display: "block",
    color: "#9ca3af",
    fontSize: "11px",
    marginBottom: "4px",
    fontWeight: "500",
  },

  detailValue: {
    display: "block",
    color: "#374151",
    fontSize: "13px",
    lineHeight: "1.4",
  },

  bottom: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    flexWrap: "wrap",
  },

  editButton: {
    border: "1px solid #c7d2fe",
    background: "#eef2ff",
    color: "#4338ca",
    padding: "10px 16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  joinButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  locationButton: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    padding: "10px 16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  empty: {
    background: "#ffffff",
    borderRadius: "14px",
    textAlign: "center",
    padding: "75px 20px",
  },

  emptyIcon: {
    width: "65px",
    height: "65px",
    margin: "0 auto 20px",
    borderRadius: "16px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "22px",
  },

  emptyText: {
    margin: "10px 0 0",
    color: "#6b7280",
  },

  jobsButton: {
    marginTop: "18px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "11px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontFamily: "Arial, sans-serif",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
    boxSizing: "border-box",
  },

  modal: {
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "26px",
    boxSizing: "border-box",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  },

  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "24px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "24px",
    color: "#111827",
  },

  modalSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  closeButton: {
    width: "36px",
    height: "36px",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#6b7280",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  formGroup: {
    marginBottom: "18px",
  },

  formLabel: {
    display: "block",
    marginBottom: "7px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#374151",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "11px 12px",
    fontSize: "14px",
    outline: "none",
    background: "#ffffff",
    color: "#111827",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "11px 12px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    fontFamily: "Arial, sans-serif",
    color: "#111827",
  },

  formHint: {
    display: "block",
    marginTop: "6px",
    color: "#9ca3af",
    fontSize: "12px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "25px",
    paddingTop: "18px",
    borderTop: "1px solid #f1f5f9",
  },

  cancelButton: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    padding: "11px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  saveButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "11px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};

export default Interviews;