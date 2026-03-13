"use client";

import { type FormEvent, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

const SignInCard = () => {
  const { isLoading, error, message, login, logout } = useAuthStore();

  // User sign in data
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const [signInMessage, setSignInMessage] = useState<string | null>("");
  // handling submission of data
  const handleSubmitData = async (e: FormEvent) => {
    e.preventDefault();
    const authenticated = await login(email, password);
    if (authenticated) {
      router.push("/");
    }
  };

  const handleSignInMessage = () => {
    setSignInMessage(message);
    setTimeout(() => {
      setSignInMessage("");
    }, 1000);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    handleSignInMessage();
  }, [message]);

  return (
    <Card className="px-[20px] border-neutral-700 text-white bg-customMain rounded-[12px] py-[40px] w-[450px]">
      <CardHeader>
        <CardTitle className="text-center text-[20px]">
          Sign in to axon
        </CardTitle>
        <CardDescription className="text-center">
          Don&apos;t have an account? &nbsp;
          <Link href="/auth/sign-up" className="hover:underline">
            Sign up
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmitData}
          className="w-full gap-[15px] flex flex-col"
        >
          <Input
            className="bg-neutral-900 text-[15px] border-neutral-700 rounded-[8px] focus-visible:ring-0 focus-visible:ring-transparent"
            type="email"
            disabled={isLoading}
            placeholder="Enter your email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            className="bg-neutral-900 text-[15px] border-neutral-700 rounded-[8px] focus-visible:ring-0 focus-visible:ring-transparent"
            type="password"
            disabled={isLoading}
            placeholder="Enter your password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="axon" disabled={false}>
            {isLoading ? "Signing in.." : "Sign in"}
          </Button>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {signInMessage && (
            <p className="text-green-500 text-center">{signInMessage}</p>
          )}
        </form>
      </CardContent>
      <CardContent>
        <Separator className="bg-neutral-700" />
      </CardContent>
      <CardFooter>
        {/* <Button
					type="button"
					className="w-full relative"
					variant="axon"
					disabled={false}
				>
					<div className="absolute left-[15px]">
						<FcGoogle />
					</div>
					Sign in with Google
				</Button> */}
      </CardFooter>
    </Card>
  );
};

export default SignInCard;
