import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api";

const Jobs = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const companyId = searchParams.get("company");

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [applyingJobId, setApplyingJobId] = useState(null);

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const isAdmin =
        user?.role === "admin" ||
        user?.role === "recruiter";

    useEffect(() => {
        fetchJobs();
    }, [companyId]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError("");

            let response;

            if (companyId) {
                response = await API.get(
                    `/jobs/company/${companyId}`
                );
            } else {
                response = await API.get("/jobs");
            }

            setJobs(response.data || []);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to load jobs."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId) => {
        try {
            setApplyingJobId(jobId);
            setError("");
            setSuccess("");

            const response = await API.post(
                `/applications/apply/${jobId}`
            );

            setSuccess(
                response.data?.message ||
                    "Application submitted successfully!"
            );

            setTimeout(() => {
                setSuccess("");
            }, 4000);
        } catch (err) {
            console.error("Apply error:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to apply for this job."
            );

            setTimeout(() => {
                setError("");
            }, 4000);
        } finally {
            setApplyingJobId(null);
        }
    };

    const handleViewDetails = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };

    const handleViewAllJobs = () => {
        navigate("/jobs");
    };

    const formatDate = (date) => {
        if (!date) return "Not specified";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-10">
                <div className="mx-auto max-w-7xl">
                    <div className="flex min-h-[400px] items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

                            <p className="text-gray-600">
                                Loading jobs...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                            Placement Opportunities
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Explore the latest job opportunities
                            available for students.
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/create-job")
                            }
                            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            + Create New Job
                        </button>
                    )}
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 font-medium text-green-700">
                        ✓ {success}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">
                        {error}
                    </div>
                )}

                {/* Company Filter */}
                {companyId && (
                    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-semibold text-blue-900">
                                Showing jobs for selected company
                            </p>

                            <p className="text-sm text-blue-700">
                                You are viewing jobs belonging to
                                this company.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleViewAllJobs}
                            className="w-fit rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-100"
                        >
                            View All Jobs
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!error && jobs.length === 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
                            💼
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900">
                            No Jobs Found
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-gray-500">
                            There are currently no placement
                            opportunities available.
                        </p>

                        {isAdmin && !companyId && (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/create-job")
                                }
                                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                            >
                                + Create First Job
                            </button>
                        )}
                    </div>
                )}

                {/* Jobs */}
                {jobs.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {jobs.map((job) => {
                            const companyName =
                                job.company?.name ||
                                "Company Not Available";

                            const location =
                                job.location ||
                                job.company?.location ||
                                "Location not specified";

                            const isClosed =
                                job.status === "closed";

                            return (
                                <div
                                    key={job._id}
                                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                >
                                    {/* Card Header */}
                                    <div className="border-b border-gray-100 p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="mb-1 text-sm font-semibold text-blue-600">
                                                    {companyName}
                                                </p>

                                                <h2 className="text-xl font-bold text-gray-900">
                                                    {job.title}
                                                </h2>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                                    isClosed
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-green-100 text-green-700"
                                                }`}
                                            >
                                                {isClosed
                                                    ? "Closed"
                                                    : "Open"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-6">

                                        {job.description && (
                                            <p className="mb-5 line-clamp-3 text-sm leading-6 text-gray-600">
                                                {job.description}
                                            </p>
                                        )}

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                            {/* Location */}
                                            <div className="rounded-xl bg-gray-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Location
                                                </p>

                                                <p className="mt-1 font-semibold text-gray-800">
                                                    {location}
                                                </p>
                                            </div>

                                            {/* Salary */}
                                            <div className="rounded-xl bg-gray-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Salary / Package
                                                </p>

                                                <p className="mt-1 font-semibold text-gray-800">
                                                    {job.salary ||
                                                        "Not specified"}
                                                </p>
                                            </div>

                                            {/* CGPA */}
                                            <div className="rounded-xl bg-gray-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Minimum CGPA
                                                </p>

                                                <p className="mt-1 font-semibold text-gray-800">
                                                    {job.minimumCGPA ??
                                                        0}
                                                </p>
                                            </div>

                                            {/* Backlogs */}
                                            <div className="rounded-xl bg-gray-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Max Backlogs
                                                </p>

                                                <p className="mt-1 font-semibold text-gray-800">
                                                    {job.maximumBacklogs ??
                                                        0}
                                                </p>
                                            </div>

                                            {/* Graduation */}
                                            <div className="rounded-xl bg-gray-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Graduation Year
                                                </p>

                                                <p className="mt-1 font-semibold text-gray-800">
                                                    {job.graduationYear ||
                                                        "Not specified"}
                                                </p>
                                            </div>

                                            {/* Deadline */}
                                            <div className="rounded-xl bg-gray-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Application Deadline
                                                </p>

                                                <p className="mt-1 font-semibold text-gray-800">
                                                    {formatDate(
                                                        job.applicationDeadline
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Branches */}
                                        {job.eligibleBranches?.length >
                                            0 && (
                                            <div className="mt-5">
                                                <p className="mb-2 text-sm font-semibold text-gray-700">
                                                    Eligible Branches
                                                </p>

                                                <div className="flex flex-wrap gap-2">
                                                    {job.eligibleBranches.map(
                                                        (
                                                            branch,
                                                            index
                                                        ) => (
                                                            <span
                                                                key={`${branch}-${index}`}
                                                                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                                                            >
                                                                {
                                                                    branch
                                                                }
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Skills */}
                                        {job.requiredSkills?.length >
                                            0 && (
                                            <div className="mt-5">
                                                <p className="mb-2 text-sm font-semibold text-gray-700">
                                                    Required Skills
                                                </p>

                                                <div className="flex flex-wrap gap-2">
                                                    {job.requiredSkills.map(
                                                        (
                                                            skill,
                                                            index
                                                        ) => (
                                                            <span
                                                                key={`${skill}-${index}`}
                                                                className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
                                                            >
                                                                {skill}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 p-5 sm:flex-row sm:justify-end">

                                        {/* Student */}
                                        {!isAdmin && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewDetails(
                                                            job._id
                                                        )
                                                    }
                                                    className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                                                >
                                                    View Details
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        isClosed ||
                                                        applyingJobId ===
                                                            job._id
                                                    }
                                                    onClick={() =>
                                                        handleApply(
                                                            job._id
                                                        )
                                                    }
                                                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                                                >
                                                    {applyingJobId ===
                                                    job._id
                                                        ? "Applying..."
                                                        : isClosed
                                                        ? "Applications Closed"
                                                        : "Apply Now"}
                                                </button>
                                            </>
                                        )}

                                        {/* Admin / Recruiter */}
                                        {isAdmin && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleViewDetails(
                                                        job._id
                                                    )
                                                }
                                                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                            >
                                                View Job
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Jobs;