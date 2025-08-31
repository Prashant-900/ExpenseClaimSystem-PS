import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ChatBot from '../chatbot/ChatBot';

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
      <ChatBot />
    </div>
  );
};

export default Layout;