import { Navbar, Sidebar, QuestionList } from '@/components';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Layout */}
      <div className="flex max-w-[1600px] mx-auto">
        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to FixBuddy
            </h1>
            <p className="text-gray-600">
              Get expert help with your home appliance repairs
            </p>
          </div>

          {/* Question List with Pagination */}
          <QuestionList initialSort="newest" limit={20} />
        </main>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
}
