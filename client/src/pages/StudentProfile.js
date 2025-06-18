import { getContestHistory } from '../services/codeforcesService';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [allContests, setAllContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);


  useEffect(() => {
  const fetchStudentAndContests = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/students/${id}`);
      setStudent(res.data);

      const contests = await getContestHistory(res.data.cfHandle);
      setAllContests(contests);
      setFilteredContests(contests); // We'll filter this later
    } catch (err) {
      console.error('Error:', err);
    }
  };

  fetchStudentAndContests();
}, [id]);


  if (!student) return <div className="p-4">Loading student data...</div>;

  return (
  <div className="p-4">
    <h1 className="text-xl font-semibold mb-2">{student.name}'s Profile</h1>
    <p>Email: {student.email}</p>
    <p>Phone: {student.phone}</p>
    <p>Codeforces Handle: {student.cfHandle}</p>
    <p>Current Rating: {student.currentRating || 'N/A'}</p>
    <p>Max Rating: {student.maxRating || 'N/A'}</p>

    {/* ✅ Temporary contest output */}
    <h2 className="mt-6 text-lg font-semibold">Contest History</h2>
    <ul className="list-disc ml-6 mt-2">
      {filteredContests.map((c, index) => (
        <li key={index}>
          {c.contestName} – Rating: {c.oldRating} → {c.newRating}
        </li>
      ))}
    </ul>
  </div>
);
}
export default StudentProfile;
