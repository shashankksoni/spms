import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cfHandle: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    axios.get('http://localhost:5000/api/students')
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/students', formData)
      .then(() => {
        setFormData({ name: '', email: '', phone: '', cfHandle: '' });
        fetchStudents(); // refresh table
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student List</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6 bg-gray-100 p-4 rounded">
        <div className="grid grid-cols-2 gap-4">
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="p-2 border rounded" />
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="p-2 border rounded" />
          <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="p-2 border rounded" />
          <input name="cfHandle" placeholder="Codeforces Handle" value={formData.cfHandle} onChange={handleChange} className="p-2 border rounded" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Student</button>
      </form>

      {/* Table */}
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">CF Handle</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td className="p-2 border">{s.name}</td>
              <td className="p-2 border">{s.email}</td>
              <td className="p-2 border">{s.phone}</td>
              <td className="p-2 border">{s.cfHandle}</td>
              <td className="p-2 border">
                <Link to={`/student/${s._id}`} className="text-blue-600">View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentList;
