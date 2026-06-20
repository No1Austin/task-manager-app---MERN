export default function DashboardLayout({ sidebar, children, rightPanel }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#070b1a] text-white">
      <div className="grid h-full w-full lg:grid-cols-[240px_minmax(0,1fr)]">
        {sidebar}

        <main className="h-screen min-w-0 overflow-y-auto overflow-x-hidden bg-[#070b1a] px-4 py-4 md:px-6">
          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <section className="min-w-0 space-y-6">{children}</section>

            <aside className="hidden min-w-0 space-y-6 xl:block">
              {rightPanel}
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}