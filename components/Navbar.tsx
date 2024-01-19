import Link from 'next/link';

const Navbar = () => {
    return (
        <nav className="bg-gradient-to-r from-blue-900 to-purple-900 p-5">
            <ul className="flex space-x-4">
                <li>
                    <Link href="/">
                        Home
                    </Link>
                </li>
                <li>
                    <Link href="/about">
                        About
                    </Link>
                </li>
                <li>
                    <Link href="/chessboard">
                        Game
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
