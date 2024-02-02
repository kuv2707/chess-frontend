import React from 'react';
import Layout from './../layout';

const AboutPage: React.FC = () => {
    return (
		
			<div className="container mx-auto my-5 text-white">
				<h1 className="text-4xl font-bold mb-4">About</h1>
				<p className="text-lg">
					This is a nextjs chess frontend. It uses a custom chess engine, written in rust, to calculate moves.
				</p>
			</div>
	);
};

export default AboutPage;
