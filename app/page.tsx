"use client";

import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function Page() {
	return (
		<>
			<Card>
				<CardContent className="h-80">
					Fake Image
					<Image src={`/pixelated_turtle.png`} alt="pixelated turtle" width={64} height={64}/>
				</CardContent>
			</Card>
		</>
	);
}
