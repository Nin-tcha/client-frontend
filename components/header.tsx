import { Card, CardContent, CardHeader } from "./ui/card";
import { ProgressBar } from "./ui/progress-bar";

export function Header() {
  return (
    <header>
      <Card>
        <CardHeader>
          <h2>[pseudo]</h2>
        </CardHeader>
        <CardContent>
          <ProgressBar value={100} max={100} label="stamina" />
        </CardContent>
      </Card>
    </header>
  );
}