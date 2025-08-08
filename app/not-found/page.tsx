import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
        Oops! The page you are looking for doesn’t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
