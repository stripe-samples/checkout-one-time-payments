import Image from "next/image";
import Link from "next/link";

export default function CanceledPage() {
  return (
    <main className="flex min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-6 text-red-600">
              Your payment was canceled
            </h1>

            <Link
              href="/"
              className="block w-full bg-stripe-purple text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
            >
              Restart demo
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-1 items-center justify-center bg-stripe-dark p-8">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Image
              key={i}
              src={`https://picsum.photos/280/320?random=${i}`}
              alt={`Photo ${i}`}
              width={140}
              height={160}
              className="rounded-md"
              unoptimized
            />
          ))}
        </div>
      </div>
    </main>
  );
}
