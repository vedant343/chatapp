export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#ECE5DD]">
      <h1 className="text-5xl font-bold mb-6 text-[#075E54]">
        Welcome to ChatAPP
      </h1>
      <p className="text-xl mb-6 text-[#128C7E]">
        Connect with your friends and start chatting instantly!
      </p>
      <div className="flex space-x-4">
        <a href="/login">
          <button className="bg-[#075E54] text-white py-2 px-6 rounded-full hover:bg-[#064C44] transition duration-300">
            Log In
          </button>
        </a>
        <a href="/signup">
          <button className="bg-[#25D366] text-white py-2 px-6 rounded-full hover:bg-[#1DA851] transition duration-300">
            Sign Up
          </button>
        </a>
      </div>
    </div>
  );
}
