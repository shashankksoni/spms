import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';

import { getContestHistory } from '../services/codeforcesService';
import { getAcceptedProblems } from '../services/problemService';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);

  const [allContests, setAllContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [filterDays, setFilterDays] = useState(90);

  const [acceptedProblems, setAcceptedProblems] = useState([]);
  const [problemFilterDays, setProblemFilterDays] = useState(30);
  const [stats, setStats] = useState({
    total: 0,
    hardest: null,
    averageRating: 0,
    avgPerDay: 0,
  });

  // Fetch student and Codeforces data
  useEffect(() => {
    const fetchStudentAndContests = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/students/${id}`);
        setStudent(res.data);

        const contests = await getContestHistory(res.data.cfHandle);
        setAllContests(contests);

        const problems = await getAcceptedProblems(res.data.cfHandle);
        setAcceptedProblems(problems);
      } catch (err) {
        console.error('Error fetching data:', err.message);
      }
    };

    fetchStudentAndContests();
  }, [id]);

  // Filter contest data
  useEffect(() => {
    const filtered = allContests.filter((c) => {
      const contestDate = new Date(c.ratingUpdateTimeSeconds * 1000);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - filterDays);
      return contestDate >= cutoff;
    });

    setFilteredContests(filtered);
  }, [filterDays, allContests]);

  // Calculate problem solving stats
  useEffect(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - problemFilterDays);

    const filtered = acceptedProblems.filter((p) => p.date >= cutoff);

    const total = filtered.length;
    const hardest = filtered.reduce((max, p) => (p.rating > (max?.rating || 0) ? p : max), null);
    const averageRating = total
      ? Math.round(filtered.reduce((sum, p) => sum + (p.rating || 0), 0) / total)
      : 0;
    const avgPerDay = Math.round((total / problemFilterDays) * 10) / 10;

    setStats({ total, hardest, averageRating, avgPerDay });
  }, [problemFilterDays, acceptedProblems]);

  if (!student) return <div className="p-4">Loading student data...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-2">{student.name}'s Profile</h1>
      <p>Email: {student.email}</p>
      <p>Phone: {student.phone}</p>
      <p>Codeforces Handle: {student.cfHandle}</p>
      <p>Current Rating: {student.currentRating || 'N/A'}</p>
      <p>Max Rating: {student.maxRating || 'N/A'}</p>

      <h2 className="mt-6 text-lg font-semibold">Contest History</h2>

      <div className="mb-4">
        <label className="mr-2">Filter:</label>
        <select
          value={filterDays}
          onChange={(e) => setFilterDays(Number(e.target.value))}
          className="border px-2 py-1"
        >
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last 365 days</option>
        </select>
      </div>

      {filteredContests.length === 0 ? (
        <p>No contest data available for the selected range.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredContests}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="contestName" tick={{ fontSize: 10 }} interval={0} angle={-45} height={100} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="newRating" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* ✅ Problem Solving Stats Section */}
      <h2 className="mt-10 text-lg font-semibold">Problem Solving Data</h2>

      <div className="mb-4">
        <label className="mr-2">Filter:</label>
        <select
          value={problemFilterDays}
          onChange={(e) => setProblemFilterDays(Number(e.target.value))}
          className="border px-2 py-1"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border p-4 rounded bg-gray-50">
          <p className="font-medium">Total Problems Solved:</p>
          <p>{stats.total}</p>
        </div>
        <div className="border p-4 rounded bg-gray-50">
          <p className="font-medium">Most Difficult Solved:</p>
          <p>{stats.hardest ? `${stats.hardest.name} (${stats.hardest.rating})` : 'N/A'}</p>
        </div>
        <div className="border p-4 rounded bg-gray-50">
          <p className="font-medium">Average Problem Rating:</p>
          <p>{stats.averageRating}</p>
        </div>
        <div className="border p-4 rounded bg-gray-50">
          <p className="font-medium">Average per Day:</p>
          <p>{stats.avgPerDay}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
