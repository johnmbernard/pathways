import { Link } from "react-router-dom";

export default function TopNav() {
  return (
    <nav className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-blue-600 text-xl">📊</span>
        <Link to="/" className="font-semibold text-lg">
          Pathways
        </Link>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <Link to="/projects" className="hover:text-blue-600">
          Projects
        </Link>

        <Link to="/organization/create" className="hover:text-blue-600">
          Organization
        </Link>

        <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md">
          Sign Out
        </button>
      </div>
    </nav>
  );
}
