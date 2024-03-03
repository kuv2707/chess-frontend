import Link from "next/link";

// import Layout from './layout'

export default function Home() {
  return (
    <>
      <div className="container">
        <h2 className="text-3xl font-bold mt-8 text-white">
          Welcome to the Chess Platform
        </h2>
        <p className="mt-4 text-white">
          This is a chess platform where users can compete with each
          other and with the Stockfish engine. 
          <br></br>
          Enjoy playing chess and
          improving your skills!
        </p>
        <div className="mt-4">
          <Link
            href="/play"
            className=" inline-block px-6 py-3 rounded-md text-lg font-medium text-white bg-blue-800 mt-10 hover:bg-gray-700"
          >
            Play
          </Link>
        </div>
      </div>
    </>
  );
}
