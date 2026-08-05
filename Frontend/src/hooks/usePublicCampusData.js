import { useEffect, useState } from "react";
import API from "../api";

const EMPTY = {
  college: {
    name: "Aspira College",
    campus: "Dolat Nagar, Gujrat",
    phone: "0319 8018795",
    email: "maazmehar9850@gmail.com",
  },
  students: 0,
  teachers: 0,
  courses: 0,
  enrollments: 0,
  assignments: 0,
  attendanceAccuracy: 0,
  avgMarks: 0,
  featuredCourses: [],
  faculty: [],
  classes: { labels: [], values: [] },
};

export function usePublicCampusData() {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await API.get("/public/stats");
        if (!ignore) {
          setData({ ...EMPTY, ...res.data, college: { ...EMPTY.college, ...(res.data.college || {}) } });
          setError("");
        }
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || "Failed to load campus data");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  return { data, loading, error };
}

export default usePublicCampusData;
