import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

const pressStart2P = Press_Start_2P({
	subsets: ["latin"],
	weight: "400",
});

export const metadata: Metadata = {
	title: "Nintcha",
	description: "Nintcha - Gacha Game Client",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${pressStart2P.className} bg-background`}>
				<div className="mx-auto max-w-md min-h-screen px-4 py-6 flex flex-col gap-4">
					<Header />
					<main className="flex-1">{children}</main>
					<Footer />
				</div>
			</body>
		</html>
	);
}
