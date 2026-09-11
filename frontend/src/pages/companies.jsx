import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBuilding,
  FaMapMarkerAlt,
  FaUsers,
  FaBriefcase,
  FaChevronRight,
} from "react-icons/fa";
import API from "../api";

function Companies() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await API.get("/companies");

      setCompanies(response.data || []);
    } catch (error) {
      console.error("Failed to fetch companies:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to load companies."
      );
    } finally {
      setLoading(false);
    }
  };

  const viewCompanyJobs = (companyId) => {
    navigate(`/jobs?company=${companyId}`);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading companies...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div>
            <h1 style={styles.title}>Companies</h1>

            <p style={styles.subtitle}>
              Explore companies hiring through your college.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            style={styles.backButton}
          >
            <FaArrowLeft size={13} />
            Dashboard
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={styles.container}>
        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Recruiting Companies
            </h2>

            <p style={styles.sectionSubtitle}>
              Discover companies offering placement opportunities.
            </p>
          </div>

          <div style={styles.companyCount}>
            <FaBuilding size={13} />
            {companies.length} Companies
          </div>
        </div>

        {companies.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              <FaBuilding />
            </div>

            <h2 style={styles.emptyTitle}>
              No companies available
            </h2>

            <p style={styles.emptyText}>
              There are currently no recruiting companies available.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {companies.map((company) => (
              <div
                key={company._id}
                style={styles.card}
              >
                {/* Company Header */}
                <div style={styles.cardHeader}>
                  <div style={styles.companyIcon}>
                    <FaBuilding />
                  </div>

                  <div style={styles.companyInfo}>
                    <h3 style={styles.companyName}>
                      {company.name}
                    </h3>

                    <div style={styles.location}>
                      <FaMapMarkerAlt size={12} />

                      <span>
                        {company.location ||
                          "Location not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={styles.description}>
                  {company.description ||
                    company.industry ||
                    "Company offering placement opportunities."}
                </p>

                {/* Stats */}
                <div style={styles.stats}>
                  <div style={styles.stat}>
                    <div style={styles.statIcon}>
                      <FaBriefcase />
                    </div>

                    <div>
                      <strong style={styles.statValue}>
                        View
                      </strong>

                      <span style={styles.statLabel}>
                        Open Jobs
                      </span>
                    </div>
                  </div>

                  <div style={styles.stat}>
                    <div style={styles.statIcon}>
                      <FaUsers />
                    </div>

                    <div>
                      <strong style={styles.statValue}>
                        {company.industry || "Technology"}
                      </strong>

                      <span style={styles.statLabel}>
                        Industry
                      </span>
                    </div>
                  </div>
                </div>

                {/* Button */}
                <button
                  style={styles.viewButton}
                  onClick={() =>
                    viewCompanyJobs(company._id)
                  }
                >
                  View Opportunities
                  <FaChevronRight size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    fontFamily: "Arial, sans-serif",
  },

  navbar: {
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },

  navContent: {
    width: "100%",
    boxSizing: "border-box",
    padding: "25px 5%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    color: "#111827",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "15px",
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

  container: {
    width: "100%",
    boxSizing: "border-box",
    padding: "35px 5%",
  },

  message: {
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "14px 18px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontWeight: "600",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "25px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "23px",
    color: "#111827",
  },

  sectionSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },

  companyCount: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#eff6ff",
    color: "#2563eb",
    padding: "9px 13px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "22px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    boxShadow:
      "0 4px 15px rgba(0, 0, 0, 0.05)",
    boxSizing: "border-box",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  companyIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    flexShrink: 0,
  },

  companyInfo: {
    minWidth: 0,
  },

  companyName: {
    margin: 0,
    fontSize: "18px",
    color: "#111827",
    wordBreak: "break-word",
  },

  location: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "6px",
    color: "#6b7280",
    fontSize: "13px",
  },

  description: {
    color: "#6b7280",
    lineHeight: "1.6",
    fontSize: "14px",
    margin: "20px 0",
    minHeight: "45px",
  },

  stats: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },

  stat: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "9px",
    background: "#f8fafc",
    padding: "12px",
    borderRadius: "9px",
    minWidth: 0,
  },

  statIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "7px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "13px",
  },

  statValue: {
    display: "block",
    color: "#111827",
    fontSize: "14px",
  },

  statLabel: {
    display: "block",
    marginTop: "2px",
    color: "#6b7280",
    fontSize: "11px",
  },

  viewButton: {
    width: "100%",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "11px 15px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  empty: {
    background: "#ffffff",
    borderRadius: "14px",
    textAlign: "center",
    padding: "80px 20px",
    color: "#6b7280",
  },

  emptyIcon: {
    width: "64px",
    height: "64px",
    margin: "0 auto 22px",
    borderRadius: "16px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
  },

  emptyTitle: {
    margin: "0 0 10px",
    fontSize: "26px",
    color: "#111827",
  },

  emptyText: {
    margin: 0,
    fontSize: "18px",
    color: "#6b7280",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
    fontSize: "18px",
  },
};

export default Companies;