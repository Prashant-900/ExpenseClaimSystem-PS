import { useAuthStore } from './features/authentication/authStore';

const TestForm = () => {
  const { user } = useAuthStore();
  
  return (
    <div style={{ padding: '20px', border: '2px solid red' }}>
      <h1>TEST FORM LOADED!</h1>
      <div>User: {JSON.stringify(user)}</div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>Student Information</h3>
        <div>
          <label>Roll Number:</label>
          <input 
            type="text" 
            value={user?.studentId || 'B21001'} 
            disabled 
            style={{ backgroundColor: '#e0e0e0', margin: '5px' }}
          />
        </div>
        <div>
          <label>Student Name:</label>
          <input 
            type="text" 
            value={user?.name || 'Student Name'} 
            disabled 
            style={{ backgroundColor: '#e0e0e0', margin: '5px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TestForm;