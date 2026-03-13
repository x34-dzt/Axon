import RenderBlog from "@/components/AxonEditor/RenderBlog";
import BlogCover from "@/components/ui/BlogCover";
import axios from "axios";

const getBlog = async (blogId: string) => {
  try {
    const response = await axios.get(
      `${process.env.API_URL}/api/blogs/${blogId}`,
    );
    const { data } = response.data;
    return data;
  } catch (error) {
    return null;
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const { blogId } = await params;
  const data = await getBlog(blogId);
  return {
    title: data?.workspaceId?.title ? `${data.workspaceId.title} ` : "Axon",
  };
}

const Blog = async ({ params }: { params: Promise<{ blogId: string }> }) => {
  const { blogId } = await params;
  const data = await getBlog(blogId);

  if (!data) {
    return (
      <div className="min-h-screen w-full bg-customPrimary">
        <header className="h-[50px] sticky top-0 bg-customPrimary/80 backdrop-blur-lg z-[40] flex justify-center">
          <BlogHeader
            createdAt={null}
            gradient={{ from: "#0077FF", to: "#42FED2" }}
          />
        </header>
        <p className="text-center mt-2">There is no blog on id {blogId}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen  w-full bg-customPrimary">
      <header className="h-[50px] sticky top-0 bg-customPrimary/80 backdrop-blur-lg z-[40] flex justify-center">
        <BlogHeader
          createdAt={data.createdAt}
          gradient={
            data.workspaceId.gradient || { from: "#0077FF", to: "#42FED2" }
          }
        />
      </header>
      {data?.content ? (
        <>
          <main className="mb-[200px] mt-[20px] relative z-0">
            <BlogCover
              cover={data.workspaceId.cover}
              icon={data.workspaceId.icon}
              title={data.workspaceId.title}
              yPos={data.workspaceId.coverPos}
              gradient={data.workspaceId.gradient}
            />
            <RenderBlog
              blogContent={data.content.content}
              title={data.workspaceId.title}
            />
          </main>
        </>
      ) : (
        <>
          <p className="text-center mt-2">There is no blog on id {blogId}</p>
        </>
      )}
    </div>
  );
};

const BlogHeader = ({
  createdAt,
  gradient,
}: {
  createdAt: string | null;
  gradient: { from: string; to: string };
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-center  justify-between w-full md:px-[20px] px-[16px]">
      <div className="flex gap-[8px] items-center">
        <img src={"/assets/axon_logo.svg"} alt="axon_logo" />
        <span className="font-bold text-[20px]">Axon</span>
      </div>
      <div className="flex gap-2 items-center">
        <span>{formatDate(createdAt)}</span>
        <div
          className="w-[26px] h-[26px] rounded-full bg-gradient-to-r"
          style={{
            backgroundImage: `linear-gradient(to right, ${gradient.from}, ${gradient.to})`,
          }}
        />
      </div>
    </div>
  );
};

export default Blog;
