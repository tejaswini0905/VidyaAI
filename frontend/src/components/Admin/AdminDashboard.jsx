import React, { useState, useEffect } from 'react';

const StatCard = ({ title, value, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="text-sm text-gray-500 mb-2">{title}</div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {trend && (
          <div className={`text-sm px-2 py-1 rounded-md ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const tableRows = [
    { name: 'John Michael', role: 'Manager', review: 'positive', email: 'john@user.com', joined: '23/04/18', id: '43431' },
    { name: 'Alexa Liras', role: 'Programator', review: 'positive', email: 'alexa@user.com', joined: '11/01/19', id: '93021' },
    { name: 'Laurent Perrier', role: 'Executive', review: 'neutral', email: 'laurent@user.com', joined: '19/09/17', id: '10392' },
    { name: 'Michael Levi', role: 'Backend developer', review: 'positive', email: 'michael@user.com', joined: '24/12/08', id: '34002' },
    { name: 'Richard Gran', role: 'Manager', review: 'negative', email: 'richard@user.com', joined: '04/10/21', id: '91879' },
    { name: 'Miriam Eric', role: 'Programator', review: 'positive', email: 'miriam@user.com', joined: '14/09/20', id: '23042' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-3xl md:text-4xl font-bold text-indigo-600">VidyaAI</h1>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="/" className="text-gray-700 hover:text-indigo-600 text-sm font-medium">Home</a>
              <a href="/login" className="text-gray-700 hover:text-indigo-600 text-sm font-medium">Login</a>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">New report</button>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-indigo-600 focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className={`md:hidden transition-all duration-300 ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-4 pt-2 pb-3 space-y-2 bg-white shadow-lg">
            <a href="/" className="block text-gray-700 hover:text-indigo-600 text-base">Home</a>
            <a href="/login" className="block text-gray-700 hover:text-indigo-600 text-base">Login</a>
            <button className="w-full text-left bg-indigo-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700">New report</button>
          </div>
        </div>
      </nav>

      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Sahayak Admin Dashboard</h2>
          <p className="text-gray-600 mt-2">Overview of teachers, students engagement and support queries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="transform transition-all duration-300 hover:-translate-y-1">
            <StatCard title="Active Teachers" value="1,284" trend={8} />
          </div>
          <div className="transform transition-all duration-300 hover:-translate-y-1">
            <StatCard title="Students" value="24,910" trend={5} />
          </div>
          <div className="transform transition-all duration-300 hover:-translate-y-1">
            <StatCard title="Queries Resolved" value="5,432" trend={12} />
          </div>
          <div className="transform transition-all duration-300 hover:-translate-y-1">
            <StatCard title="Avg. Satisfaction" value="95%" trend={2} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Teachers list</h3>
            <div className="flex gap-3">
              <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Search" />
              <button className="px-3 py-2 rounded-lg border text-sm border-gray-200 hover:bg-gray-50">Export</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Function</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {tableRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200" />
                        <div className="text-sm font-medium text-gray-900">{row.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.role}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 text-sm ${row.review === 'positive' ? 'text-green-600' : row.review === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                        <span className={`w-2 h-2 rounded-full ${row.review === 'positive' ? 'bg-green-500' : row.review === 'negative' ? 'bg-red-500' : 'bg-gray-400'}`} />
                        {row.review}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.joined}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Students Engagement</h4>
            <div className="h-40 bg-gradient-to-r from-indigo-100 via-indigo-50 to-indigo-100 rounded-lg" />
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Query Resolved</h4>
            <div className="h-40 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 rounded-lg" />
          </div>
        </div>
      </main>

      <footer className="mt-16 py-8 text-center text-gray-500">
        <p>© 2024 VidyaAI Admin</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;


