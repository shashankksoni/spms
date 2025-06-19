import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { getContestHistory, getAcceptedProblems } from '../services/codeforcesService';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [allContests, setAllContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [filterDays, setFilterDays] = useState(90);
  const [acceptedProblems, setAcceptedProblems] = useState([]);
  const [problemFilterDays, setProblemFilterDays] = useState(30);
  const [stats, setStats] = useState({ total: 0, hardest: null, averageRating: 0, avgPerDay: 0 });

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
        console.error('Error:', err);
      }
    };

    fetchStudentAndContests();
  }, [id]);

  useEffect(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - problemFilterDays);

    const filtered = acceptedProblems.filter(p => p.date >= cutoff);

    const total = filtered.length;
    const hardest = filtered.reduce((max, p) => (p.rating > (max?.rating || 0) ? p : max), null);
    const averageRating = total ? Math.round(filtered.reduce((sum, p) => sum + (p.rating || 0), 0) / total) : 0;
    const avgPerDay = Math.round((total / problemFilterDays) * 10) / 10;

    setStats({ total, hardest, averageRating, avgPerDay });
  }, [problemFilterDays, acceptedProblems]);

  useEffect(() => {
    const filtered = allContests.filter(c => {
      const contestDate = new Date(c.ratingUpdateTimeSeconds * 1000);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - filterDays);
      return contestDate >= cutoff;
    });

    setFilteredContests(filtered);
  }, [filterDays, allContests]);

  const getRatingBuckets = (problems) => {
    const buckets = {};
    problems.forEach(p => {
      const rating = p.rating || 0;
      const bucket = Math.floor(rating / 200) * 200;
      const label = `${bucket}-${bucket + 199}`;
      buckets[label] = (buckets[label] || 0) + 1;
    });

    return Object.entries(buckets)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  };

  const getHeatmapData = () => {
    const dataMap = {};
    acceptedProblems.forEach(p => {
      const dateStr = p.date.toISOString().split('T')[0];
      dataMap[dateStr] = (dataMap[dateStr] || 0) + 1;
    });

    return Object.entries(dataMap).map(([date, count]) => ({ date, count }));
  };

  const ratingData = getRatingBuckets(
    acceptedProblems.filter(p => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - problemFilterDays);
      return p.date >= cutoff;
    })
  );

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

      <h2 className="mt-6 text-lg font-semibold">Problem Solving Data</h2>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm">Total Solved</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm">Hardest Problem</p>
          <p className="text-xl font-bold">{stats.hardest?.name || 'N/A'}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm">Avg Rating</p>
          <p className="text-xl font-bold">{stats.averageRating}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm">Avg/Day</p>
          <p className="text-xl font-bold">{stats.avgPerDay}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2">Problems Solved by Rating</h2>
      {ratingData.length === 0 ? (
        <p>No problem data to show.</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ratingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      )}

      <h2 className="text-lg font-semibold mt-6">Submission Heatmap</h2>
      <CalendarHeatmap
        startDate={new Date(new Date().setDate(new Date().getDate() - 180))}
        endDate={new Date()}
        values={getHeatmapData()}
        classForValue={(value) => {
          if (!value) return 'color-empty';
          if (value.count > 10) return 'color-scale-4';
          if (value.count > 6) return 'color-scale-3';
          if (value.count > 3) return 'color-scale-2';
          return 'color-scale-1';
        }}
        tooltipDataAttrs={value => ({
          'data-tip': `${value.date}: ${value.count || 0} submissions`,
        })}
      />
    </div>
  );
};

export default StudentProfile;
