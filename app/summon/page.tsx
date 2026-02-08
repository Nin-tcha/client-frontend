import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";

export default function SummonPage() {
  return (
    <Card>
      <CardHeader>
        <h1>Summon</h1>
      </CardHeader>
      <CardContent >
        <h3>Fake image</h3>
        <Image className="h-80 w-full border-2 border-black" src={`/pixelated_turtle.png`} alt="pixelated turtle" width={64} height={64}/>
        <p>Invoke new monsters here.</p>
        <Button>Invoke</Button>
      </CardContent>
    </Card>
  );
}
