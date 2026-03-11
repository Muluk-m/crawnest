export default function AutomationPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Automation</h1>
        <button disabled className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md opacity-50 cursor-not-allowed">
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Task List */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Tasks</h2>
          <div className="bg-white rounded-lg border p-8 text-center">
            <div className="text-gray-400 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-1">No automated tasks</p>
            <p className="text-xs text-gray-400">Cron-based task scheduling coming soon.</p>
          </div>
        </section>

        {/* Schedule Config Placeholder */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Schedule</h2>
          <div className="bg-white rounded-lg border p-4 text-sm text-gray-400">
            Cron schedule configuration will be available in a future update.
          </div>
        </section>

        {/* Execution History Placeholder */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Execution History</h2>
          <div className="bg-white rounded-lg border p-4 text-sm text-gray-400">
            No execution history yet.
          </div>
        </section>
      </div>
    </div>
  );
}
