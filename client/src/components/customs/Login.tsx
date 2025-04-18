import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "./../auth/AuthProvider";
import { toast } from "sonner";

type props = {
  enableCreateAccount: boolean;
  enableOauth: boolean;
};

export default function Login({ enableCreateAccount, enableOauth }: props) {
  const navigate = useNavigate();

  const { login, user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [buttonEnabled, setButtonEnabled] = useState(true);
  const [loginFailureMessage, setLoginFailureMessage] = useState(null);

  useEffect(() => {
    if (loading) return
    // check if the user is already authenicated on load
    // if so kick them off
    if (user != undefined) {
      toast("You are already logged in. To log into another account, please sign out first.")
      navigate("/", { replace: true });
    }
  }, [user, loading]);

  function handleFormSubmit(
    e: React.MouseEvent,
    email: string,
    password: string
  ) {
    e.preventDefault();

    // reset login failure message
    setLoginFailureMessage(null);

    // blank out email & password in state
    setEmail("");
    setPassword("");

    // disable button
    setButtonEnabled(false);

    // submit the login and act based on response from server
    fetch(`${import.meta.env.VITE_API_ENDPOINT}/login`, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        username: email,
        password: password,
      }),
    }).then((response) => {
      setLoginFailureMessage(null);
      response.json().then((data) => {
        // TWO CASES
        // CASE #1 - ERROR FROM BACKEND (NON-200 HTTP STATUS)
        if (response.status != 200) {
          setButtonEnabled(true);
          setLoginFailureMessage(data.error_msg);
        }

        // CASE #2 - GOOD RESPONSE FROM BACKEND
        else {
          // was a success
          // handle the token here
          console.log(`success, your token is ${data.token}`);
          // note: email isn't required to be an email, could be a username
          // or in database terms, a PK for a user
          login(email, data.token);
          navigate("/", { replace: true });
        }
      });
    });
  }

  return (
    // 3 rows on desktop
    // 1 row on mobile
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4">
      <div className="dummy1"></div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Username / Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="test@trentwil.es"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  onClick={(e) => handleFormSubmit(e, email, password)}
                  disabled={!buttonEnabled}
                >
                  {buttonEnabled ? (
                    "Login"
                  ) : (
                    <>
                      <Loader2 className="animate-spin" /> Loading
                    </>
                  )}
                </Button>
                {enableCreateAccount ? (
                  <Button variant="outline" className="w-full">
                    Login with Google
                  </Button>
                ) : (
                  <></>
                )}
                {loginFailureMessage && (
                  <span style={{ color: "red" }}>{loginFailureMessage}</span>
                )}
              </div>
              {enableOauth ? (
                <div className="mt-4 text-center text-sm">
                  Don't have an account?{" "}
                  <a href="#" className="underline underline-offset-4">
                    Sign up
                  </a>
                </div>
              ) : (
                <></>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="dummy2"></div>
    </div>
  );
}
