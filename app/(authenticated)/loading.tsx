
import { Loader } from "@/components/ui/loader";

export default function Loading() {
	return (
		<div className="flex items-center justify-center w-full h-[calc(100vh-4rem)]">
			<Loader size="xl" />
		</div>
	);
}
