import { useState, useEffect } from 'react';
import API from '../../../shared/services/axios';
import { SCHOOLS } from '../../../utils/schools';

const SchoolAdministrationDashboard = () => {
  const [schoolAdmins, setSchoolAdmins] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [deanSRIC, setDeanSRIC] = useState('');
  const [director, setDirector] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [adminsRes, facultyRes] = await Promise.all([
        API.get('/admin/school-admins'),
        API.get('/users/list?role=Faculty')
      ]);
      setSchoolAdmins(adminsRes.data);
      setFacultyList(facultyRes.data);
      
      // Find institute-wide assignments
      const instituteAdmin = adminsRes.data.find(a => a.school === 'Institute');
      if (instituteAdmin) {
        setDeanSRIC(instituteAdmin.deanSRICId || '');
        setDirector(instituteAdmin.directorId || '');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSchoolChair = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/school-admins/chair', {
        school: selectedSchool,
        userId: selectedFaculty
      });
      alert('School Chairperson assigned successfully');
      fetchData();
      setSelectedSchool('');
      setSelectedFaculty('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign school chair');
    }
  };

  const handleAssignDeanSRIC = async () => {
    try {
      await API.post('/admin/school-admins/dean-sric', { userId: deanSRIC });
      alert('Dean SRIC assigned successfully');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign Dean SRIC');
    }
  };

  const handleAssignDirector = async () => {
    try {
      await API.post('/admin/school-admins/director', { userId: director });
      alert('Director assigned successfully');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign Director');
    }
  };

  const getFacultyBySchool = (school) => {
    return facultyList.filter(f => f.department === school);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">School Administration Management</h2>

        {/* Warning if no faculty */}
        {facultyList.length === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">⚠️ No Faculty Members Found</p>
            <p className="text-yellow-700 text-sm mt-1">
              Please register faculty members first using emails ending with <code className="bg-yellow-100 px-1 rounded">@faculty.iitmandi.ac.in</code>
            </p>
          </div>
        )}

        {/* Institute-wide Positions */}
        <div className="mb-8 border-b pb-6">
          <h3 className="text-xl font-semibold mb-4">Institute-wide Positions</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Dean SRIC</label>
              <div className="flex gap-2">
                <select
                  value={deanSRIC}
                  onChange={(e) => setDeanSRIC(e.target.value)}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map(f => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.department}) - {f.email}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignDeanSRIC}
                  disabled={!deanSRIC}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Director</label>
              <div className="flex gap-2">
                <select
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map(f => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.department}) - {f.email}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignDirector}
                  disabled={!director}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* School Chairpersons */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Assign School Chairpersons</h3>
          
          <form onSubmit={handleAssignSchoolChair} className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">School</label>
                <select
                  value={selectedSchool}
                  onChange={(e) => {
                    setSelectedSchool(e.target.value);
                    setSelectedFaculty('');
                  }}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select School</option>
                  {SCHOOLS.map(school => (
                    <option key={school.value} value={school.value}>
                      {school.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Faculty (School Chairperson)</label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                  disabled={!selectedSchool}
                >
                  <option value="">Select Faculty from {selectedSchool || 'school'}</option>
                  {selectedSchool && getFacultyBySchool(selectedSchool).map(f => (
                    <option key={f._id} value={f._id}>
                      {f.name} - {f.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Assign School Chairperson
            </button>
          </form>

          {/* Current Assignments */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">Current School Chairpersons</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border text-left">School</th>
                    <th className="px-4 py-2 border text-left">Chairperson Name</th>
                    <th className="px-4 py-2 border text-left">Email</th>
                    <th className="px-4 py-2 border text-left">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {SCHOOLS.map(school => {
                    const admin = schoolAdmins.find(a => a.school === school.value);
                    return (
                      <tr key={school.value}>
                        <td className="px-4 py-2 border">{school.value}</td>
                        <td className="px-4 py-2 border">
                          {admin?.schoolChairId?.name || <span className="text-gray-400">Not assigned</span>}
                        </td>
                        <td className="px-4 py-2 border">
                          {admin?.schoolChairId?.email || '-'}
                        </td>
                        <td className="px-4 py-2 border">
                          {admin?.schoolChairId?.department || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolAdministrationDashboard;
