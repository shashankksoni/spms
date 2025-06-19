import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cfHandle: ''
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    getStudents();
  }, []);

  const getStudents = () => {
    axios.get('http://localhost:5000/api/students')
      .then(res => setStudents(res.data))
      .catch(err => console.log(err));
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
  e.preventDefault();

  // ✅ Basic validation
  if (!form.name || !form.email || !form.phone || !form.cfHandle) {
    alert('Please fill out all fields before submitting.');
    return;
  }

  if (editId) {
    axios.put(`http://localhost:5000/api/students/${editId}`, form)
      .then(() => {
        resetForm();
        getStudents();
      });
  } else {
    axios.post('http://localhost:5000/api/students', form)
      .then(() => {
        resetForm();
        getStudents();
      });
  }
};


  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', cfHandle: '' });
    setEditId(null);
  };

  const handleEdit = student => {
    setForm({
      name: student.name,
      email: student.email,
      phone: student.phone,
      cfHandle: student.cfHandle
    });
    setEditId(student._id);
  };

  const handleDelete = id => {
    if (window.confirm('Delete this student?')) {
      axios.delete(`http://localhost:5000/api/students/${id}`)
        .then(() => getStudents());
    }
  };
  

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        {editId ? 'Edit Student' : 'Add Student'}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded mb-6">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="p-2 border rounded"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="p-2 border rounded"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="p-2 border rounded"
        />
        <input
          name="cfHandle"
          value={form.cfHandle}
          onChange={handleChange}
          placeholder="Codeforces Handle"
          className="p-2 border rounded"
        />
        <div className="col-span-2 flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editId ? 'Update' : 'Add'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">

        <thead className="bg-gray-200">
            <tr>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Phone</th>
                <th className="border p-2 text-left">CF Handle</th>
                <th className="border p-2 text-left">Last Synced</th> {/* ✅ NEW */}
                <th className="border p-2 text-left">Actions</th>
            </tr>
        </thead>

<tbody>
  {students.map(student => (
    <tr key={student._id} className="hover:bg-gray-50">
      <td className="border p-2">{student.name}</td>
      <td className="border p-2">{student.email}</td>
      <td className="border p-2">{student.phone}</td>
      <td className="border p-2">{student.cfHandle}</td>

      {/* ✅ New Last Synced Column */}
      <td className="border p-2">
        {student.lastSynced
          ? new Date(student.lastSynced).toLocaleString()
          : 'N/A'}
      </td>

      <td className="border p-2 space-x-2">
        <Link
          to={`/student/${student._id}`}
          className="text-blue-600 hover:underline"
        >
          View
        </Link>
        <button
          onClick={() => handleEdit(student)}
          className="text-yellow-600 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(student._id)}
          className="text-red-600 hover:underline"
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>

      </table>
      </div>
    </div>
  );
}

export default StudentList;
