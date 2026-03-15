import Image from "next/image";
import * as Icons from "react-icons/fa";
import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";

interface DynamicTopBarIconProps {
	name: string | null;
	width?: string | number;
	height?: string | number;
	className?: ClassValue;
}

const DynamicTopBarIcon = ({
	name,
	width,
	height,
	className,
}: DynamicTopBarIconProps) => {
	// @ts-ignore
	const IconComponent = Icons[name];
	if (IconComponent === null || IconComponent === undefined)
		return (
			<Image
				alt="workspace_icon"
				src={"/assets/axon_logo.svg"}
				height={17}
				width={17}
				draggable={false}
				className={cn(className)}
			/>
		);

	return (
		<IconComponent
			width={width}
			height={height}
			stroke-width="2"
			className={`${cn(className)} stroke-2`}
		/>
	);
};

export default DynamicTopBarIcon;
