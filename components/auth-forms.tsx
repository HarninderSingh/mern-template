"use client"

import Link from "next/link"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { z } from "zod"

// Zod schemas for validation
const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
})

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export function SignupForm() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })
  const [errors, setErrors] = useState<z.ZodIssue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors([])

    try {
      signupSchema.parse(formData)
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "You can now log in with your new account.",
        })
        router.push("/login")
      } else {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          toast({
            title: "Registration Failed",
            description: data.message || "An unexpected error occurred.",
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setErrors(error.errors)
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        })
        console.error("Signup error:", error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (path: string) => {
    return errors.find((err) => err.path[0] === path)?.message
  }

  return (
    <Card className="w-full max-w-md bg-[#2D3748] text-white border-[#4A5568]">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Sign Up</CardTitle>
        <CardDescription className="text-gray-300">Create your account to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-white">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-[#1A202C] text-white border-[#4A5568] focus-visible:ring-[#63B3ED]"
            />
            {getErrorMessage("name") && <p className="text-sm text-red-400">{getErrorMessage("name")}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-[#1A202C] text-white border-[#4A5568] focus-visible:ring-[#63B3ED]"
            />
            {getErrorMessage("email") && <p className="text-sm text-red-400">{getErrorMessage("email")}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-[#1A202C] text-white border-[#4A5568] focus-visible:ring-[#63B3ED]"
            />
            {getErrorMessage("password") && <p className="text-sm text-red-400">{getErrorMessage("password")}</p>}
          </div>
          <Button type="submit" className="w-full bg-white text-gray-900 hover:bg-gray-100" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-300">
          Already have an account?{" "}
          <Link href="/login" className="underline text-blue-400 hover:text-blue-300">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState<z.ZodIssue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors([])
    setLoginError(null)

    try {
      loginSchema.parse(formData)
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (result?.error) {
        setLoginError("Invalid email or password.")
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
        })
        router.push("/dashboard")
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setErrors(error.errors)
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        })
        console.error("Login error:", error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  const getErrorMessage = (path: string) => {
    return errors.find((err) => err.path[0] === path)?.message
  }

  return (
    <Card className="w-full max-w-md bg-[#2D3748] text-white border-[#4A5568]">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Login</CardTitle>
        <CardDescription className="text-gray-300">Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-[#1A202C] text-white border-[#4A5568] focus-visible:ring-[#63B3ED]"
            />
            {getErrorMessage("email") && <p className="text-sm text-red-400">{getErrorMessage("email")}</p>}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Link href="/reset" className="ml-auto inline-block text-sm underline text-blue-400 hover:text-blue-300">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-[#1A202C] text-white border-[#4A5568] focus-visible:ring-[#63B3ED]"
            />
            {getErrorMessage("password") && <p className="text-sm text-red-400">{getErrorMessage("password")}</p>}
          </div>
          {loginError && <p className="text-sm text-red-400">{loginError}</p>}
          <Button type="submit" className="w-full bg-white text-gray-900 hover:bg-gray-100" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#4A5568]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#2D3748] px-2 text-gray-400">Or continue with</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full bg-[#1A202C] text-white border-[#4A5568] hover:bg-[#2D3748] hover:text-white"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.0003 4.75C14.0273 4.75 15.8003 5.45 17.2003 6.825L20.0373 4C17.9503 1.925 15.1373 0.75 12.0003 0.75C7.35033 0.75 3.35033 3.425 1.36233 7.5L4.60033 9.975C5.52533 7.225 8.50033 4.75 12.0003 4.75Z" />
            <path d="M23.25 12.25C23.25 11.5 23.1873 10.75 23.0623 10H12.0003V14.5H18.4753C18.1753 15.75 17.4003 16.825 16.3123 17.55L19.5623 20.025C21.5503 18.25 23.2503 15.25 23.2503 12.25H23.25Z" />
            <path d="M4.60025 14.025C4.35025 13.3 4.22525 12.575 4.22525 11.825C4.22525 11.075 4.35025 10.35 4.60025 9.625L1.35025 7.15C0.47525 8.925 0 10.825 0 12.825C0 14.825 0.47525 16.725 1.35025 18.5L4.60025 16.025C4.35025 15.3 4.22525 14.575 4.22525 13.825C4.22525 13.075 4.35025 12.35 4.60025 11.625L4.60025 14.025Z" />
            <path d="M12.0003 23.25C15.1373 23.25 17.9503 22.075 20.0373 20L17.2003 17.175C15.8003 18.55 14.0273 19.25 12.0003 19.25C8.50033 19.25 5.52533 16.775 4.60033 14.025L1.36233 16.5C3.35033 20.575 7.35033 23.25 12.0003 23.25Z" />
          </svg>
          Google
        </Button>
        <div className="mt-4 text-center text-sm text-gray-300">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline text-blue-400 hover:text-blue-300">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export function ForgotPasswordForm() {
  const [formData, setFormData] = useState({ email: "" })
  const [errors, setErrors] = useState<z.ZodIssue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors([])
    setMessage(null)

    try {
      forgotPasswordSchema.parse(formData)
      const response = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        toast({
          title: "Password Reset Link Sent",
          description: data.message,
        })
      } else {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          toast({
            title: "Error",
            description: data.message || "An unexpected error occurred.",
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setErrors(error.errors)
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        })
        console.error("Forgot password error:", error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (path: string) => {
    return errors.find((err) => err.path[0] === path)?.message
  }

  return (
    <Card className="w-full max-w-md bg-[#2D3748] text-white border-[#4A5568]">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Forgot Password</CardTitle>
        <CardDescription className="text-gray-300">Enter your email to receive a password reset link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-[#1A202C] text-white border-[#4A5568] focus-visible:ring-[#63B3ED]"
            />
            {getErrorMessage("email") && <p className="text-sm text-red-400">{getErrorMessage("email")}</p>}
          </div>
          {message && <p className="text-sm text-green-400">{message}</p>}
          <Button type="submit" className="w-full bg-white text-gray-900 hover:bg-gray-100" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-300">
          Remembered your password?{" "}
          <Link href="/login" className="underline text-blue-400 hover:text-blue-300">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" })
  const [errors, setErrors] = useState<z.ZodIssue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors([])
    setMessage(null)

    try {
      resetPasswordSchema.parse(formData)
      const response = await fetch(`/api/reset/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: formData.password }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        toast({
          title: "Password Reset Successful",
          description: data.message,
        })
        router.push("/login")
      } else {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          toast({
            title: "Error",
            description: data.message || "An unexpected error occurred.",
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setErrors(error.errors)
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        })
        console.error("Reset password error:", error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (path: string) => {
    return errors.find((err) => err.path[0] === path)?.message
  }

  return (
    <Card className="w-full max-w-md bg-[#2D3748] text-white border-[#4A5568]">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Reset Password</CardTitle>
        <CardDescription className="text-gray-300">Enter your new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-white">
              New Password
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-[#1A202C] text-white border-[#4A5568] focus-visible:ring-[#63B3ED]"
            />
            {getErrorMessage("password") && <p className="text-sm text-red-400">{getErrorMessage("password")}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword" className="text-white">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-[#1A202C] text-white border-[#4A5568] focus-visible:ring-[#63B3ED]"
            />
            {getErrorMessage("confirmPassword") && (
              <p className="text-sm text-red-400">{getErrorMessage("confirmPassword")}</p>
            )}
          </div>
          {message && <p className="text-sm text-green-400">{message}</p>}
          <Button type="submit" className="w-full bg-white text-gray-900 hover:bg-gray-100" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
