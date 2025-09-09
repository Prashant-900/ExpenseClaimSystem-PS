import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ExpenseAssistantChatbot from '../components/ExpenseAssistantChatbot';

const Layout = ({ children }) => {
  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <ExpenseAssistantChatbot />
    </div>
  );
};

export default Layout;