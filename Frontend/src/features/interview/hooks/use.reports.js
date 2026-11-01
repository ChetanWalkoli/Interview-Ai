import { useState, useCallback, useContext } from "react";
import { InterviewContext } from "../interview.context.def";
import { getInterviewById } from "../services/interview.api";

/**
 * Custom hook to manage fetching, caching, and reviewing interview reports
 */
export const useReports = () => {
    const context = useContext(InterviewContext);

    if (!context) {
        throw new Error("useReports must be used within an InterviewProvider");
    }

    const {
        allReports,
        reportsLoading,
        fetchReports
    } = context;

    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedLoading, setSelectedLoading] = useState(false);
    const [reportError, setReportError] = useState(null);

    /**
     * Fetch all reports with duplicate prevention
     * @param {boolean} [forceRefresh=false]
     */
    const loadReports = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh && allReports && allReports.length > 0) {
            return allReports;
        }

        setReportError(null);
        try {
            return await fetchReports();
        } catch (err) {
            setReportError(err.message || "Failed to load reports");
            return [];
        }
    }, [allReports, fetchReports]);

    /**
     * Fetch a specific report by ID (checks in-memory cache first to avoid duplicate network calls)
     * @param {string} reportId
     */
    const loadReportById = useCallback(async (reportId) => {
        if (!reportId) return null;

        // Check if report is already present in allReports cache
        const cached = allReports.find((r) => r._id === reportId);
        if (cached) {
            setSelectedReport(cached);
            return cached;
        }

        setSelectedLoading(true);
        setReportError(null);

        try {
            const data = await getInterviewById(reportId);
            const report = data.interviewReport;
            setSelectedReport(report);
            return report;
        } catch (err) {
            const message = err.message || "Failed to retrieve report";
            setReportError(message);
            throw new Error(message, { cause: err });
        } finally {
            setSelectedLoading(false);
        }
    }, [allReports]);

    /**
     * Force refresh reports collection (e.g. following interview completion)
     */
    const refreshReports = useCallback(async () => {
        return await loadReports(true);
    }, [loadReports]);

    return {
        reports: allReports,
        loading: reportsLoading,
        error: reportError,
        selectedReport,
        selectedLoading,
        loadReports,
        loadReportById,
        refreshReports,
        clearSelectedReport: () => setSelectedReport(null)
    };
};

