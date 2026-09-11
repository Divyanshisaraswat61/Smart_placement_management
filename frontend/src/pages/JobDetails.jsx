import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBriefcase,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaGraduationCap,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import API from "../api";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Current logged-in user
  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const currentUser = getCurrentUser();

  const isAdmin =
    currentUser?.role === "admin" ||
    currentUser?.role === "recruiter";

  // Fetch job details
  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/jobs/${id}`);

      setJob(response.data);
    } catch (error) {
      console.error("Failed to fetch job:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load job details."
      );
    } finally {
      setLoading(false);
    }
  };

  // Apply for job - ONLY STUDENTS
  const applyForJob = async () => {
    // Extra safety check
    if (isAdmin) {
      setError(
        "Admins and recruiters cannot apply for jobs."
      );
      return;
    }

    try {
      setApplying(true);
      setMessage("");
      setError("");

      await API.post(`/applications/apply/${id}`);

      setMessage(
        "Application submitted successfully!"
      );
    } catch (error) {
      console.error("Application error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to apply for this job."
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingBox}>
          Loading job details...
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div style={styles.page}>
        <div style={styles.topBar}>
          <button
            onClick={() => navigate("/jobs")}
            style={styles.backButton}
          >
            <FaArrowLeft size={13} />
            Back to Jobs
          </button>
        </div>

        <div style={styles.errorContainer}>
          <div style={styles.errorBox}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingBox}>
          Job not found.
        </div>
      </div>
    );
  }

  const companyName =
    job.company?.name || "Company";

  const companyInitial =
    companyName.charAt(0).toUpperCase();

  const requiredSkills =
    Array.isArray(job.requiredSkills)
      ? job.requiredSkills
      : [];

  const eligibleBranches =
    Array.isArray(job.eligibleBranches)
      ? job.eligibleBranches
      : [];

  const deadline = job.applicationDeadline
    ? new Date(
        job.applicationDeadline
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not specified";

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.topBar}>
        <button
          onClick={() => navigate("/jobs")}
          style={styles.backButton}
        >
          <FaArrowLeft size={13} />
          Back to Jobs
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          style={styles.dashboardButton}
        >
          Dashboard
        </button>
      </div>

      <main style={styles.container}>

        {/* Hero */}
        <section style={styles.hero}>

          <div style={styles.companyIcon}>
            {companyInitial}
          </div>

          <div style={styles.heroContent}>

            <p style={styles.companyName}>
              {companyName}
            </p>

            <h1 style={styles.jobTitle}>
              {job.title}
            </h1>

            <div style={styles.heroDetails}>

              <span style={styles.heroDetail}>
                <FaMapMarkerAlt />
                {job.location || "Location not specified"}
              </span>

              <span style={styles.heroDetail}>
                <FaRupeeSign />
                {job.salary || "Salary not specified"}
              </span>

              <span style={styles.heroDetail}>
                <FaBriefcase />
                {job.jobType || "Full Time"}
              </span>

            </div>

          </div>

        </section>

        {/* Messages */}
        {message && (
          <div style={styles.successMessage}>
            <FaCheckCircle />
            {message}
          </div>
        )}

        {error && job && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <div style={styles.contentGrid}>

          {/* Main Content */}
          <div style={styles.mainContent}>

            {/* Description */}
            <section style={styles.card}>

              <h2 style={styles.sectionTitle}>
                Job Description
              </h2>

              <p style={styles.description}>
                {job.description ||
                  "No job description available."}
              </p>

            </section>

            {/* Eligibility */}
            <section style={styles.card}>

              <h2 style={styles.sectionTitle}>
                Eligibility Criteria
              </h2>

              <div style={styles.criteriaGrid}>

                <div style={styles.criteriaItem}>
                  <FaGraduationCap
                    style={styles.criteriaIcon}
                  />

                  <div>
                    <span style={styles.criteriaLabel}>
                      Graduation Year
                    </span>

                    <strong>
                      {job.graduationYear ||
                        "Not specified"}
                    </strong>
                  </div>
                </div>

                <div style={styles.criteriaItem}>
                  <FaGraduationCap
                    style={styles.criteriaIcon}
                  />

                  <div>
                    <span style={styles.criteriaLabel}>
                      Minimum CGPA
                    </span>

                    <strong>
                      {job.minimumCGPA ?? 0}
                    </strong>
                  </div>
                </div>

                <div style={styles.criteriaItem}>
                  <FaBriefcase
                    style={styles.criteriaIcon}
                  />

                  <div>
                    <span style={styles.criteriaLabel}>
                      Maximum Backlogs
                    </span>

                    <strong>
                      {job.maximumBacklogs ?? 0}
                    </strong>
                  </div>
                </div>

                <div style={styles.criteriaItem}>
                  <FaMapMarkerAlt
                    style={styles.criteriaIcon}
                  />

                  <div>
                    <span style={styles.criteriaLabel}>
                      Eligible Branches
                    </span>

                    <strong>
                      {eligibleBranches.length > 0
                        ? eligibleBranches.join(", ")
                        : "All branches"}
                    </strong>
                  </div>
                </div>

              </div>

            </section>

            {/* Required Skills */}
            <section style={styles.card}>

              <h2 style={styles.sectionTitle}>
                Required Skills
              </h2>

              {requiredSkills.length > 0 ? (
                <div style={styles.skills}>
                  {requiredSkills.map(
                    (skill, index) => (
                      <span
                        key={index}
                        style={styles.skill}
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p style={styles.noSkills}>
                  No specific skills mentioned.
                </p>
              )}

            </section>

          </div>

          {/* Side Panel */}
          <aside style={styles.sidebar}>

            <div style={styles.applyCard}>

              <div style={styles.statusBadge}>
                {job.status === "open"
                  ? "Applications Open"
                  : "Applications Closed"}
              </div>

              <h2 style={styles.applyTitle}>
                {isAdmin
                  ? "Job Management"
                  : "Interested in this opportunity?"}
              </h2>

              <p style={styles.applyText}>
                {isAdmin
                  ? "You are viewing this job as an administrator or recruiter."
                  : "Review the eligibility criteria before submitting your application."}
              </p>

              {/* ADMIN / RECRUITER */}
              {isAdmin ? (
                <div style={styles.adminNotice}>
                  <FaBriefcase />
                  <div>
                    <strong>Admin / Recruiter</strong>
                    <span>
                      You cannot apply for jobs using this account.
                    </span>
                  </div>
                </div>
              ) : (
                /* STUDENT */
                <button
                  onClick={applyForJob}
                  disabled={
                    applying ||
                    job.status !== "open"
                  }
                  style={{
                    ...styles.applyButton,
                    opacity:
                      applying ||
                      job.status !== "open"
                        ? 0.6
                        : 1,
                    cursor:
                      applying ||
                      job.status !== "open"
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {applying
                    ? "Applying..."
                    : job.status === "open"
                    ? "Apply Now"
                    : "Applications Closed"}
                </button>
              )}

              <div style={styles.deadline}>
                <FaClock />

                <div>
                  <span>
                    Application Deadline
                  </span>

                  <strong>
                    {deadline}
                  </strong>
                </div>
              </div>

            </div>

            {/* Job Summary */}
            <div style={styles.summaryCard}>

              <h3 style={styles.summaryTitle}>
                Job Summary
              </h3>

              <div style={styles.summaryRow}>
                <span>Company</span>
                <strong>{companyName}</strong>
              </div>

              <div style={styles.summaryRow}>
                <span>Salary</span>
                <strong>
                  {job.salary || "Not specified"}
                </strong>
              </div>

              <div style={styles.summaryRow}>
                <span>Location</span>
                <strong>
                  {job.location || "Not specified"}
                </strong>
              </div>

              <div style={styles.summaryRow}>
                <span>Job Type</span>
                <strong>
                  {job.jobType || "Full Time"}
                </strong>
              </div>

            </div>

          </aside>

        </div>

      </main>
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

  topBar: {
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "18px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backButton: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    padding: "10px 15px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  dashboardButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  container: {
    width: "100%",
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "35px 5%",
    boxSizing: "border-box",
  },

  hero: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "30px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow:
      "0 4px 18px rgba(0, 0, 0, 0.05)",
    marginBottom: "22px",
  },

  companyIcon: {
    width: "72px",
    height: "72px",
    borderRadius: "15px",
    background: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "bold",
    flexShrink: 0,
  },

  heroContent: {
    flex: 1,
  },

  companyName: {
    margin: "0 0 6px",
    color: "#2563eb",
    fontSize: "15px",
    fontWeight: "700",
  },

  jobTitle: {
    margin: 0,
    fontSize: "30px",
    lineHeight: "1.2",
  },

  heroDetails: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    marginTop: "15px",
  },

  heroDetail: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#6b7280",
    fontSize: "14px",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) 350px",
    gap: "22px",
    alignItems: "start",
  },

  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "26px",
    boxShadow:
      "0 4px 15px rgba(0, 0, 0, 0.04)",
  },

  sectionTitle: {
    margin: "0 0 18px",
    fontSize: "21px",
  },

  description: {
    margin: 0,
    color: "#4b5563",
    lineHeight: "1.8",
    fontSize: "15px",
    whiteSpace: "pre-line",
  },

  criteriaGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  criteriaItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "10px",
  },

  criteriaIcon: {
    color: "#2563eb",
    marginTop: "2px",
    fontSize: "18px",
  },

  criteriaLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: "12px",
    marginBottom: "5px",
  },

  skills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  skill: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "8px 12px",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: "600",
  },

  noSkills: {
    margin: 0,
    color: "#6b7280",
  },

  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  applyCard: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "25px",
    boxShadow:
      "0 4px 15px rgba(0, 0, 0, 0.05)",
  },

  statusBadge: {
    display: "inline-block",
    background: "#ecfdf5",
    color: "#047857",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "16px",
  },

  applyTitle: {
    margin: "0 0 10px",
    fontSize: "21px",
  },

  applyText: {
    margin: "0 0 20px",
    color: "#6b7280",
    lineHeight: "1.6",
    fontSize: "14px",
  },

  applyButton: {
    width: "100%",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "13px 18px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px",
  },

  adminNotice: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    padding: "14px",
    display: "flex",
    gap: "11px",
    alignItems: "flex-start",
    color: "#374151",
    marginBottom: "18px",
  },

  adminNoticeIcon: {
    color: "#2563eb",
  },

  deadline: {
    marginTop: "18px",
    paddingTop: "18px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#6b7280",
  },

  summaryCard: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    boxShadow:
      "0 4px 15px rgba(0, 0, 0, 0.04)",
  },

  summaryTitle: {
    margin: "0 0 18px",
    fontSize: "18px",
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    padding: "12px 0",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "13px",
  },

  successMessage: {
    background: "#ecfdf5",
    color: "#047857",
    padding: "14px 18px",
    borderRadius: "9px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    fontWeight: "600",
  },

  errorMessage: {
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "14px 18px",
    borderRadius: "9px",
    marginBottom: "20px",
  },

  errorContainer: {
    maxWidth: "900px",
    margin: "50px auto",
    padding: "20px",
  },

  errorBox: {
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
  },

  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f7fb",
    fontFamily: "Arial, sans-serif",
  },

  loadingBox: {
    background: "#ffffff",
    padding: "25px 35px",
    borderRadius: "10px",
    boxShadow:
      "0 4px 15px rgba(0, 0, 0, 0.05)",
    color: "#4b5563",
  },
};

export default JobDetails;