import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { getContestHistory } from '../services/codeforcesService';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [allContests, setAllContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [filterDays, setFilterDays] = useState(90);

  useEffect(() => {
    const fetchStudentAndContests = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/students/${id}`);
        setStudent(res.data);

        const contests = await getContestHistory(res.data.cfHandle);
        setAllContests(contests);
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchStudentAndContests();
  }, [id]);

  useEffect(() => {
    const filtered = allContests.filter(c => {
      const contestDate = new Date(c.ratingUpdateTimeSeconds * 1000);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - filterDays);
      return contestDate >= cutoff;
    });

    setFilteredContests(filtered);
  }, [filterDays, allContests]);

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
  <div className="text-gray-700">
    <p>
      No contest data available for <strong>{student.cfHandle}</strong> in the selected range.
    </p>
    <p className="text-sm text-gray-500">
      They might not have participated in any rated contests in the last {filterDays} days.
    </p>
  </div>
) : (
  <div style={{ width: '100%', height: 300 }}>
    <ResponsiveContainer>
      <LineChart data={filteredContests}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="contestName"
          tick={{ fontSize: 10 }}
          interval={0}
          angle={-45}
          height={100}
        />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="newRating" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  </div>
)}

    </div>
  );
};

export default StudentProfile;
