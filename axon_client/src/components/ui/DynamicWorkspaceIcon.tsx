import Image from "next/image";
import * as Icons from "react-icons/fa";
import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";

interface DynamicWorkspaceIconProps {
	name: string | null;
	width?: string | number;
	height?: string | number;
	className?: ClassValue;
	IconClassName?: ClassValue;
}

const DynamicWorkspaceIcon = ({ name, width, height, className, IconClassName }: DynamicWorkspaceIconProps) => {
	// @ts-ignore
	const IconComponent = Icons[name];
	if (IconComponent === null || IconComponent === undefined)
		return (
			<Image
				alt="workspace_icon"
				src={"/assets/axon_logo.svg"}
				height={25}
				width={25}
				draggable={false}
				className={cn(className, "translate-x-2")}
			/>
		);

	return (
		<IconComponent
			width={width}
			height={height}
			stroke="2"
			className={`scale-125 -translate-y-1 ${cn(IconClassName)}`}
		/>
	);
};

export default DynamicWorkspaceIcon;
