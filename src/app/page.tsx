export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">
        Welcome to the Chat Application
      </h1>
      <p className="text-lg mb-4">
        Connect with your friends and start chatting!
      </p>
      <div className="flex space-x-4">
        <a href="/login">
          <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Log In
          </button>
        </a>
        <a href="/signup">
          <button className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
            Sign Up
          </button>
        </a>
      </div>
    </div>
  );
}
