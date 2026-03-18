import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="neuro p-10 max-w-lg w-full">
        <SignupForm />
      </div>
    </main>
  );
}
