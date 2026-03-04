import RegistrationForm from "@/components/RegistrationForm";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Abstract Background */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Logo */}
        <div className="absolute top-0 left-0 -mt-6 -ml-2 md:-mt-8 md:-ml-4">
          <Image
            src="/tbn-logo.png"
            alt="TBN Logo"
            width={240}
            height={80}
            className="h-10 md:h-14 w-auto object-contain"
            priority
          />
        </div>

        <div className="text-center mb-12 pt-16 md:pt-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-3 font-outfit">
            TBN Specialist Directory Listing
          </h1>
          <p className="text-xl md:text-2xl text-[var(--primary)] font-medium max-w-2xl mx-auto tracking-wide">
            Join the TBN Collective
          </p>
        </div>

        <div className="bg-[var(--surface)] shadow-2xl rounded-2xl overflow-hidden border border-[var(--border)] glass-panel">
          <div className="p-8 md:p-12">
            <RegistrationForm />
          </div>
        </div>
      </div>
    </main>
  );
}
