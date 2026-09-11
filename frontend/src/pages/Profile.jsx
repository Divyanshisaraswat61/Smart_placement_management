import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaUniversity,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import API from "../api";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    college: "",
    branch: "",
    graduationYear: "",
    cgpa: "",
    backlogs: 0,
    skills: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/students/profile");

      setProfile(response.data);

      setFormData({
        college: response.data.college || "",
        branch: response.data.branch || "",
        graduationYear: response.data.graduationYear || "",
        cgpa: response.data.cgpa || "",
        backlogs: response.data.backlogs ?? 0,
        skills: response.data.skills
          ? response.data.skills.join(", ")
          : "",
        phone: response.data.phone || "",
        bio: response.data.bio || "",
      });

      setIsEditing(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setProfile(null);
        setIsEditing(true);
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to load profile."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== "");

      const data = {
        college: formData.college.trim(),
        branch: formData.branch.trim(),
        graduationYear: Number(formData.graduationYear),
        cgpa: Number(formData.cgpa),
        backlogs: Number(formData.backlogs),
        skills: skillsArray,
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
      };

      if (!data.college || !data.branch) {
        setError("College and branch are required.");
        setSaving(false);
        return;
      }

      if (
        !data.graduationYear ||
        data.graduationYear < 2000
      ) {
        setError("Please enter a valid graduation year.");
        setSaving(false);
        return;
      }

      if (
        data.cgpa < 0 ||
        data.cgpa > 10
      ) {
        setError("CGPA must be between 0 and 10.");
        setSaving(false);
        return;
      }

      if (data.backlogs < 0) {
        setError("Backlogs cannot be negative.");
        setSaving(false);
        return;
      }

      let response;

      if (profile) {
        response = await API.put(
          "/students/profile",
          data
        );

        setProfile(response.data.profile);

        setSuccess(
          "Profile updated successfully!"
        );
      } else {
        response = await API.post(
          "/students/profile",
          data
        );

        setProfile(response.data.profile);

        setSuccess(
          "Profile created successfully!"
        );
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Profile save error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to save profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading profile...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <button
          onClick={() => navigate("/dashboard")}
          style={styles.backButton}
        >
          <FaArrowLeft size={13} />
          Dashboard
        </button>

        <h2 style={styles.navTitle}>
          My Profile
        </h2>

        <div style={{ width: "110px" }} />
      </nav>

      <main style={styles.container}>
        {/* Error */}
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}

        {/* CREATE / EDIT FORM */}
        {isEditing ? (
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <div>
                <h1 style={styles.formTitle}>
                  {profile
                    ? "Edit Profile"
                    : "Create Student Profile"}
                </h1>

                <p style={styles.formSubtitle}>
                  Complete your profile to apply for
                  placement opportunities.
                </p>
              </div>

              <div style={styles.avatar}>
                <FaUser />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.grid}>
                {/* College */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    <FaUniversity />
                    College
                  </label>

                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="Enter your college"
                    required
                    style={styles.input}
                  />
                </div>

                {/* Branch */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    <FaGraduationCap />
                    Branch
                  </label>

                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    placeholder="e.g. CSE"
                    required
                    style={styles.input}
                  />
                </div>

                {/* Graduation Year */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    Graduation Year
                  </label>

                  <input
                    type="number"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    placeholder="e.g. 2027"
                    min="2000"
                    max="2100"
                    required
                    style={styles.input}
                  />
                </div>

                {/* CGPA */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    CGPA
                  </label>

                  <input
                    type="number"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleChange}
                    placeholder="e.g. 8.2"
                    min="0"
                    max="10"
                    step="0.01"
                    required
                    style={styles.input}
                  />
                </div>

                {/* Backlogs */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    Backlogs
                  </label>

                  <input
                    type="number"
                    name="backlogs"
                    value={formData.backlogs}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    style={styles.input}
                  />
                </div>

                {/* Phone */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    <FaPhone />
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    style={styles.input}
                  />
                </div>

                {/* Skills */}
                <div
                  style={{
                    ...styles.field,
                    gridColumn: "1 / -1",
                  }}
                >
                  <label style={styles.label}>
                    Skills
                  </label>

                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, MongoDB, Java"
                    style={styles.input}
                  />

                  <small style={styles.hint}>
                    Separate multiple skills using commas.
                  </small>
                </div>

                {/* Bio */}
                <div
                  style={{
                    ...styles.field,
                    gridColumn: "1 / -1",
                  }}
                >
                  <label style={styles.label}>
                    Bio
                  </label>

                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell something about yourself..."
                    rows="4"
                    style={styles.textarea}
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                {profile && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setError("");
                      setSuccess("");
                    }}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  style={styles.saveButton}
                >
                  <FaSave size={13} />

                  {saving
                    ? "Saving..."
                    : profile
                    ? "Update Profile"
                    : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* PROFILE HEADER */}
            <div style={styles.profileCard}>
              <div style={styles.avatar}>
                <FaUser />
              </div>

              <h1>
                {profile?.user?.name ||
                  user?.name ||
                  "Student"}
              </h1>

              <p style={styles.role}>
                Student
              </p>

              <p style={styles.email}>
                <FaEnvelope size={13} />
                {profile?.user?.email ||
                  user?.email ||
                  "No email"}
              </p>

              <button
                style={styles.editButton}
                onClick={() => {
                  setSuccess("");
                  setError("");
                  setIsEditing(true);
                }}
              >
                <FaEdit size={13} />
                Edit Profile
              </button>
            </div>

            {/* PROFILE INFO */}
            <div style={styles.infoCard}>
              <div style={styles.sectionHeader}>
                <h2>
                  Personal & Academic Information
                </h2>

                <button
                  onClick={() => setIsEditing(true)}
                  style={styles.smallEditButton}
                >
                  <FaEdit size={12} />
                  Edit
                </button>
              </div>

              <div style={styles.grid}>
                <Info
                  icon={<FaEnvelope />}
                  label="Email"
                  value={
                    profile?.user?.email ||
                    user?.email ||
                    "Not provided"
                  }
                />

                <Info
                  icon={<FaPhone />}
                  label="Phone"
                  value={
                    profile?.phone ||
                    "Not provided"
                  }
                />

                <Info
                  icon={<FaUniversity />}
                  label="College"
                  value={
                    profile?.college ||
                    "Not provided"
                  }
                />

                <Info
                  icon={<FaGraduationCap />}
                  label="Branch"
                  value={
                    profile?.branch ||
                    "Not provided"
                  }
                />

                <Info
                  icon={<FaGraduationCap />}
                  label="Graduation Year"
                  value={
                    profile?.graduationYear ||
                    "Not provided"
                  }
                />

                <Info
                  icon={<FaGraduationCap />}
                  label="CGPA"
                  value={
                    profile?.cgpa ??
                    "Not provided"
                  }
                />

                <Info
                  icon={<FaGraduationCap />}
                  label="Backlogs"
                  value={
                    profile?.backlogs ?? 0
                  }
                />

                <Info
                  icon={<FaMapMarkerAlt />}
                  label="Placement Status"
                  value={
                    profile?.placementStatus ||
                    "seeking"
                  }
                />

                <div
                  style={{
                    ...styles.infoItem,
                    gridColumn: "1 / -1",
                  }}
                >
                  <div style={styles.infoIcon}>
                    <FaGraduationCap />
                  </div>

                  <div>
                    <span style={styles.infoLabel}>
                      Skills
                    </span>

                    <div style={styles.skills}>
                      {profile?.skills?.length > 0
                        ? profile.skills.map(
                            (skill, index) => (
                              <span
                                key={index}
                                style={styles.skill}
                              >
                                {skill}
                              </span>
                            )
                          )
                        : "No skills added"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    ...styles.infoItem,
                    gridColumn: "1 / -1",
                  }}
                >
                  <div style={styles.infoIcon}>
                    <FaUser />
                  </div>

                  <div>
                    <span style={styles.infoLabel}>
                      Bio
                    </span>

                    <p style={styles.bio}>
                      {profile?.bio ||
                        "No bio added"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div style={styles.infoItem}>
      <div style={styles.infoIcon}>
        {icon}
      </div>

      <div>
        <span style={styles.infoLabel}>
          {label}
        </span>

        <p style={styles.infoValue}>
          {value}
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#111827",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    color: "#6b7280",
  },

  navbar: {
    height: "70px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 30px",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  backButton: {
    border: "none",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#374151",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  navTitle: {
    fontSize: "20px",
    fontWeight: "700",
    margin: 0,
  },

  container: {
    width: "min(1000px, calc(100% - 40px))",
    margin: "35px auto",
  },

  error: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
  },

  success: {
    background: "#f0fdf4",
    color: "#15803d",
    border: "1px solid #bbf7d0",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
  },

  profileCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "35px 25px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
    marginBottom: "22px",
  },

  avatar: {
    width: "75px",
    height: "75px",
    borderRadius: "50%",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    margin: "0 auto 15px",
  },

  role: {
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: "600",
    margin: "5px 0",
  },

  email: {
    color: "#6b7280",
    fontSize: "14px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "7px",
    margin: "8px 0 18px",
  },

  editButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
  },

  infoCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  smallEditButton: {
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#2563eb",
    padding: "8px 13px",
    borderRadius: "7px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "600",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  infoItem: {
    display: "flex",
    gap: "13px",
    alignItems: "flex-start",
    padding: "15px",
    background: "#f9fafb",
    borderRadius: "10px",
  },

  infoIcon: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "8px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  infoLabel: {
    display: "block",
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "4px",
  },

  infoValue: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
  },

  skills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
  },

  skill: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "5px 9px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },

  bio: {
    margin: 0,
    color: "#374151",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  formCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  formTitle: {
    margin: 0,
    fontSize: "25px",
  },

  formSubtitle: {
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "7px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    outline: "none",
  },

  hint: {
    color: "#9ca3af",
    fontSize: "11px",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "28px",
  },

  cancelButton: {
    padding: "11px 18px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  saveButton: {
    padding: "11px 20px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },
};

export default Profile;