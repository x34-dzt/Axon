"use client";

import { type FormEvent, useState } from "react";
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

const SignUpCard = () => {
  const router = useRouter();
  const [localUsername, setLocalUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { isLoading, error, signUp, message } = useAuthStore();

  const sendData = async (e: FormEvent) => {
    e.preventDefault();
    //using the custom hook for
    const authenticated = await signUp(email, localUsername, password);
    if (authenticated) {
      router.push("/");
    }
  };

  return (
    <Card className="px-[20px] text-white border-neutral-700 bg-customMain rounded-[12px] py-[40px] w-[450px]">
      <CardHeader>
        <CardTitle className="text-center text-[20px]">
          Sign up to axon
        </CardTitle>
        <CardDescription className="text-center">
          Already have an account? &nbsp;
          <Link href="/auth/sign-in" className=" hover:underline">
            Sign in
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={sendData} className="w-full gap-[15px] flex flex-col ">
          <Input
            className=" bg-neutral-900 border-neutral-700 text-[15px] rounded-[8px]  focus-visible:ring-0 focus-visible:ring-transparent"
            type="email"
            disabled={isLoading}
            value={email}
            placeholder="Enter your email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            className="  bg-neutral-900 border-neutral-700 text-[15px] rounded-[8px] focus-visible:ring-0 focus-visible:ring-transparent"
            type="text"
            disabled={isLoading}
            value={localUsername}
            placeholder="Enter your username"
            required
            onChange={(e) => setLocalUsername(e.target.value)}
          />
          <Input
            className=" bg-neutral-900 border-neutral-700 text-[15px]  rounded-[8px] focus-visible:ring-0 focus-visible:ring-transparent"
            type="password"
            disabled={isLoading}
            value={password}
            placeholder="Enter your password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="axon" disabled={isLoading}>
            {isLoading ? "Submitting" : "Submit"}
          </Button>
        </form>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {message !== null && (
          <p className="text-green-500 text-center">Signed up successfully</p>
        )}
      </CardContent>
      <CardContent>
        <Separator className="bg-neutral-700" />
      </CardContent>
      <CardFooter>Kindly remember your password meow :3</CardFooter>
    </Card>
  );
};

export default SignUpCard;
