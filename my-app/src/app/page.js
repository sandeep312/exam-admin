export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">
        Exam Admin Platform
      </h1>

      <p className="text-gray-600">
        Manage exams, question banks, and students
      </p>

      <div className="flex gap-4 mt-6">
        <a
          href="/login"
          className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          Admin Login
        </a>

        <a
          href="/student"
          className="rounded border px-6 py-3 hover:bg-gray-100"
        >
          Student Login
        </a>
      </div>
    </main>
  );
}
