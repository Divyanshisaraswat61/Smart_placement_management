import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const CreateJob = () => {
    const navigate = useNavigate();

    const [companies, setCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [creating, setCreating] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        company: "",
        title: "",
        description: "",
        eligibleBranches: "",
        minimumCGPA: "",
        maximumBacklogs: "0",
        requiredSkills: "",
        graduationYear: "",
        salary: "",
        applicationDeadline: "",
        status: "open",
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoadingCompanies(true);
            setError("");

            const response = await API.get("/companies");

            setCompanies(response.data || []);
        } catch (err) {
            console.error("Failed to fetch companies:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to load companies."
            );
        } finally {
            setLoadingCompanies(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!formData.company) {
            setError("Please select a company.");
            return;
        }

        if (!formData.title.trim()) {
            setError("Please enter the job title.");
            return;
        }

        if (!formData.graduationYear) {
            setError("Please enter the graduation year.");
            return;
        }

        try {
            setCreating(true);

            const jobData = {
                company: formData.company,

                title: formData.title.trim(),

                description: formData.description.trim(),

                eligibleBranches: formData.eligibleBranches
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),

                minimumCGPA:
                    formData.minimumCGPA === ""
                        ? 0
                        : Number(formData.minimumCGPA),

                maximumBacklogs:
                    formData.maximumBacklogs === ""
                        ? 0
                        : Number(formData.maximumBacklogs),

                requiredSkills: formData.requiredSkills
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),

                graduationYear: Number(formData.graduationYear),

                salary: formData.salary.trim(),

                applicationDeadline:
                    formData.applicationDeadline || undefined,

                status: formData.status,
            };

            const response = await API.post("/jobs", jobData);

            setMessage(
                response.data?.message ||
                    "Job created successfully!"
            );

            setFormData({
                company: "",
                title: "",
                description: "",
                eligibleBranches: "",
                minimumCGPA: "",
                maximumBacklogs: "0",
                requiredSkills: "",
                graduationYear: "",
                salary: "",
                applicationDeadline: "",
                status: "open",
            });

            setTimeout(() => {
                navigate("/jobs");
            }, 1000);
        } catch (err) {
            console.error("Create job error:", err);

            setError(
                err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Failed to create job."
            );
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="mx-auto max-w-5xl">

                {/* Header */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-4 text-sm font-medium text-gray-600 hover:text-blue-600"
                    >
                        ← Back
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Create New Job
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Add a new placement opportunity for students.
                    </p>
                </div>

                {/* Success */}
                {message && (
                    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                        ✓ {message}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
                >

                    {/* Basic Information */}
                    <div>
                        <h2 className="mb-5 text-xl font-bold text-gray-900">
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            {/* Company */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Company *
                                </label>

                                <select
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    disabled={loadingCompanies}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        {loadingCompanies
                                            ? "Loading companies..."
                                            : "Select Company"}
                                    </option>

                                    {companies.map((company) => (
                                        <option
                                            key={company._id}
                                            value={company._id}
                                        >
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Job Title */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Job Title *
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Software Developer"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-6">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Job Description
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Enter job description, responsibilities and role details..."
                            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Eligibility */}
                    <div className="mt-8">
                        <h2 className="mb-5 text-xl font-bold text-gray-900">
                            Eligibility Criteria
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            {/* Branches */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Eligible Branches
                                </label>

                                <input
                                    type="text"
                                    name="eligibleBranches"
                                    value={formData.eligibleBranches}
                                    onChange={handleChange}
                                    placeholder="CSE, IT, ECE"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                <p className="mt-1 text-xs text-gray-500">
                                    Separate branches with commas.
                                </p>
                            </div>

                            {/* Skills */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Required Skills
                                </label>

                                <input
                                    type="text"
                                    name="requiredSkills"
                                    value={formData.requiredSkills}
                                    onChange={handleChange}
                                    placeholder="React, Node.js, MongoDB"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                <p className="mt-1 text-xs text-gray-500">
                                    Separate skills with commas.
                                </p>
                            </div>

                            {/* CGPA */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Minimum CGPA
                                </label>

                                <input
                                    type="number"
                                    name="minimumCGPA"
                                    value={formData.minimumCGPA}
                                    onChange={handleChange}
                                    min="0"
                                    max="10"
                                    step="0.01"
                                    placeholder="7.00"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Backlogs */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Maximum Backlogs
                                </label>

                                <input
                                    type="number"
                                    name="maximumBacklogs"
                                    value={formData.maximumBacklogs}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="0"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Graduation Year */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Graduation Year *
                                </label>

                                <input
                                    type="number"
                                    name="graduationYear"
                                    value={formData.graduationYear}
                                    onChange={handleChange}
                                    placeholder="2027"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Salary */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Salary / Package
                                </label>

                                <input
                                    type="text"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="e.g. 6 LPA"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Application Details */}
                    <div className="mt-8">
                        <h2 className="mb-5 text-xl font-bold text-gray-900">
                            Application Details
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            {/* Deadline */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Application Deadline
                                </label>

                                <input
                                    type="date"
                                    name="applicationDeadline"
                                    value={formData.applicationDeadline}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Job Status
                                </label>

                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="open">
                                        Open
                                    </option>

                                    <option value="closed">
                                        Closed
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

                        <button
                            type="button"
                            onClick={() => navigate("/jobs")}
                            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={creating}
                            className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {creating
                                ? "Creating..."
                                : "Create Job"}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJob;