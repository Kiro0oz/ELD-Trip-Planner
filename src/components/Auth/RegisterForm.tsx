import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import { Link } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { UserPlus } from "lucide-react";
import type { RegisterData } from "../../context/AuthContext";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const licenseRegex = /^[A-Z0-9]{6,12}$/;

const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    license_number: z
      .string()
      .regex(
        licenseRegex,
        "License must be 6-12 characters of uppercase letters and numbers"
      ),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const { register } = useAuth();

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await register(registerData as RegisterData);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <form
      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            {...registerForm.register("username")}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {registerForm.formState.errors.username && (
            <p className="mt-1 text-sm text-red-600">
              {registerForm.formState.errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="license"
            className="block text-sm font-medium text-gray-700"
          >
            License Number
          </label>
          <input
            {...registerForm.register("license_number")}
            type="text"
            placeholder="e.g., CDL123456"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 uppercase"
          />
          {registerForm.formState.errors.license_number && (
            <p className="mt-1 text-sm text-red-600">
              {registerForm.formState.errors.license_number.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            {...registerForm.register("first_name")}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {registerForm.formState.errors.first_name && (
            <p className="mt-1 text-sm text-red-600">
              {registerForm.formState.errors.first_name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            {...registerForm.register("last_name")}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {registerForm.formState.errors.last_name && (
            <p className="mt-1 text-sm text-red-600">
              {registerForm.formState.errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          Phone Number
        </label>
        <Controller
          name="phone"
          control={registerForm.control}
          render={({ field: { onChange, value } }) => (
            <PhoneInput
              international
              defaultCountry="EG"
              value={value}
              onChange={onChange}
              className="mt-1"
            />
          )}
        />
        {registerForm.formState.errors.phone && (
          <p className="mt-1 text-sm text-red-600">
            {registerForm.formState.errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <input
          {...registerForm.register("email")}
          type="email"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {registerForm.formState.errors.email && (
          <p className="mt-1 text-sm text-red-600">
            {registerForm.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          {...registerForm.register("password")}
          type="password"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {registerForm.formState.errors.password && (
          <p className="mt-1 text-sm text-red-600">
            {registerForm.formState.errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm Password
        </label>
        <input
          {...registerForm.register("confirmPassword")}
          type="password"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {registerForm.formState.errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {registerForm.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <UserPlus className="w-5 h-5 mr-2" />
        Create Account
      </button>
    </form>
  );
};

export default RegisterForm;
