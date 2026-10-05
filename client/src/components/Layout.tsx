import { Link, Outlet } from "react-router"

export default function Layout(){
    return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-3">
          <Link to="/" className="font-heading text-lg font-semibold">
            Steam Tracker
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
    )
}