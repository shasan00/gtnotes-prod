import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"
import { useState } from "react"

export default function SignupForm({
  className,
  ...props

}: React.ComponentProps<"div">) {

  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "username") {
      setUsername(value)
    } else if (name === "first_name") {
      setFirstName(value)
    } else if (name === "last_name") {
      setLastName(value)
    } else if (name === "email") {
      setEmail(value)
    } else if (name === "password") {
      setPassword(value)
    } else if (name === "confirmPassword") {
      setConfirmPassword(value)
    }
  }

  // Traditional signup removed; only Google OAuth
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  const handleGoogleClick = () => {
    window.location.href = "/api/auth/google/signup";
  };

  const handleMicrosoftClick = () => {
    window.location.href = "/api/auth/microsoft/signup";
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>Sign up with Google or Microsoft</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full" onClick={handleGoogleClick}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign in with Google
                </Button>
                <Button variant="outline" className="w-full" onClick={handleMicrosoftClick}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <rect width="10" height="10" x="2" y="2" fill="#F25022" />
                    <rect width="10" height="10" x="12" y="2" fill="#7FBA00" />
                    <rect width="10" height="10" x="2" y="12" fill="#00A4EF" />
                    <rect width="10" height="10" x="12" y="12" fill="#FFB900" />
                  </svg>
                  Sign in with Microsoft
                </Button>
              </div>
              <div className="grid gap-6">
                <div className="text-sm text-muted-foreground text-center">
                  Account creation is available via Google or Microsoft.
                </div>
                <Button disabled={isLoading} type="button" className="w-full bg-gt-gold hover:bg-yellow-600" onClick={handleGoogleClick}>
                  Continue with Google
                </Button>
                <Button disabled={isLoading} type="button" className="w-full bg-gt-gold hover:bg-yellow-600" onClick={handleMicrosoftClick}>
                  Continue with Microsoft
                </Button>
                {error && <p className="text-red-600 text-sm">{error}</p>}
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="sign-in" className="underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
