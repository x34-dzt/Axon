import SignInCard from "@/components/auth/SignIn";

const Page = () => {
  return (
    <section className="h-screen bg-neutral-950 text-white relative overflow-hidden w-full flex items-center justify-center">
      <div className="flex relative z-[100] flex-col gap-[4px]">
        <p className="text-[15px] flex gap-[7px]">
          <img src={"/assets/axon_logo.svg"} alt="axon_logo" />
          <span>Axon</span>
        </p>
        <h1 className="text-3xl font-bold mb-[30px] ">Welcome to axon</h1>
        <SignInCard />
      </div>
    </section>
  );
};

const CoolBlurBackground = () => {
  return (
    <>
      <img
        className="h-screen select-none left-0 absolute z-[1]"
        draggable={false}
        src="/assets/blur_left.png"
        alt="blur_left"
      />
      <img
        className="h-screen select-none right-0 absolute z-[1]"
        draggable={false}
        src="/assets/blur_right.png"
        alt="blur_left"
      />
    </>
  );
};

export default Page;
