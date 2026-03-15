import Image from "next/image";
import * as Icons from "react-icons/fa";
import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";

interface DynamicIconProps {
	name: string | null;
	width?: string | number;
	height?: string | number;
	className?: ClassValue;
}

const DynamicIcon = ({ name, width, height, className }: DynamicIconProps) => {
	// @ts-ignore
	const IconComponent = Icons[name];
	if (IconComponent === null || IconComponent === undefined)
		return (
			<Image
				alt="workspace_icon"
				src={"/assets/axon_logo.svg"}
				height={18}
				width={18}
				draggable={false}
				className={cn(className)}
			/>
		);

	return (
		<IconComponent
			width={width}
			height={height}
			stroke="2"
			className={`scale-125 -translate-y-1 ${cn(className)}`}
		/>
	);
};

export default DynamicIcon;
