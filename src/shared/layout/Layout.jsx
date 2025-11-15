import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ExpenseAssistantChatbot from '../components/ExpenseAssistantChatbot';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          {children}
        </main>
      </div>
      <ExpenseAssistantChatbot />
    </div>
  );
};

export default Layout;