import dynamic from "next/dynamic";
const DynamicSearchWorkspace = dynamic(
  () => import("@/components/ui/SearchWorkspace"),
);
const DynamicAxonWorkspace = dynamic(
  () => import("@/components/workspace/AxonWorkspace"),
);

const Page = async ({
  params,
}: {
  params: Promise<{ id: string; type: string }>;
}) => {
  const { id, type } = await params;
  return (
    <div className=" bg-customMain  text-white w w-full">
      <DynamicSearchWorkspace />
      <DynamicAxonWorkspace workspaceId={id} workspaceType={type} />
    </div>
  );
};

export default Page;
