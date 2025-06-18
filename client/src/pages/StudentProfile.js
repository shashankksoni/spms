import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/students/${id}`);
        setStudent(res.data);
      } catch (err) {
        console.error('Error fetching student:', err);
      }
    };

    fetchStudent();
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
    </div>
  );
};

export default StudentProfile;
