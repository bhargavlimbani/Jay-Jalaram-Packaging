import { useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import smallBoxImage from "../assets/small.png";
import mediumBoxImage from "../assets/Medium.png";
import largeBoxImage from "../assets/large.png";

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="brand-page">
      <Navbar />

      <section className="brand-container py-8 lg:py-12">
        <div className="brand-panel overflow-hidden">
          <div className="grid gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-14 lg:py-16">
            <div className="flex flex-col justify-center">
              <p className="brand-kicker">Ocean-Inspired Storefront</p>
              <h1 className="brand-title mt-4">
                Premium Corrugated Packaging With A Bold, Modern Frontend.
              </h1>
              <p className="brand-subtitle mt-5 max-w-2xl">
                Explore industrial boxes, shipping cartons, printed packaging, and custom-made orders
                in a storefront styled around your yellow brand identity.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/products" className="brand-button">
                  Explore Products
                </Link>
                <Link to="/order" className="brand-button-dark">
                  Request Custom Box
                </Link>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] bg-amber-50 p-4">
                  <p className="text-3xl font-black">4+</p>
                  <p className="mt-1 text-sm text-slate-600">Packaging categories</p>
                </div>
                <div className="rounded-[24px] bg-white p-4">
                  <p className="text-3xl font-black">Fast</p>
                  <p className="mt-1 text-sm text-slate-600">Admin-approved order workflow</p>
                </div>
                <div className="rounded-[24px] bg-white p-4">
                  <p className="text-3xl font-black">Custom</p>
                  <p className="mt-1 text-sm text-slate-600">Size and design-based manufacturing</p>
                </div>
              </div>

              {user?.role === "customer" && (
                <div className="mt-6 rounded-[22px] border border-amber-200 bg-amber-100/70 px-5 py-4 text-sm font-semibold text-amber-950">
                  Welcome back, {user.name}. Your cart-style order flow is ready in the customer dashboard.
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="brand-card-hover overflow-hidden rounded-[28px] bg-[var(--brand-primary-soft)] p-4">
                <img
                  src={mediumBoxImage}
                  alt="Medium Shipping Box"
                  className="h-64 w-full rounded-[24px] object-cover"
                />
                <div className="px-2 pb-2 pt-4">
                  <p className="brand-kicker">Featured Range</p>
                  <h3 className="mt-2 text-2xl font-black">Shipping Ready Boxes</h3>
                  <p className="mt-2 text-sm text-slate-700">
                    Durable packaging with a cleaner storefront presentation and stronger order journey.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                <img
                  src={smallBoxImage}
                  alt="Small Corrugated Box"
                  className="brand-card-hover h-40 w-full rounded-[24px] object-cover"
                />
                <img
                  src={largeBoxImage}
                  alt="Large Industrial Box"
                  className="brand-card-hover h-40 w-full rounded-[24px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-container py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              image: smallBoxImage,
              title: "Small Corrugated Box",
              text: "Lightweight protection for compact retail and courier packaging.",
            },
            {
              image: mediumBoxImage,
              title: "Medium Shipping Box",
              text: "Balanced for warehouse dispatch, ecommerce, and wholesale use.",
            },
            {
              image: largeBoxImage,
              title: "Large Industrial Box",
              text: "Heavy-duty board strength for demanding industrial handling.",
            },
          ].map((item) => (
            <div key={item.title} className="brand-panel brand-card-hover overflow-hidden p-4">
              <img
                src={item.image}
                alt={item.title}
                className="h-64 w-full rounded-[24px] object-cover"
              />
              <div className="p-2 pt-5">
                <p className="brand-kicker">Packaging Collection</p>
                <h3 className="mt-2 text-2xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="brand-container py-6">
        <div className="brand-panel grid gap-6 px-6 py-8 md:px-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="brand-kicker">Why Customers Stay</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              Designed for repeat ordering and custom manufacturing.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Browse packaging by category",
              "Add multiple products before placing one order",
              "Upload custom box design PDF files",
              "Track admin responses from your dashboard",
            ].map((point) => (
              <div key={point} className="rounded-[24px] bg-[var(--brand-surface-strong)] p-5 text-sm font-semibold">
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-6 bg-[var(--brand-ink)] py-14 text-white">
        <div className="brand-container grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="brand-kicker text-amber-300">Contact Us</p>
            <h2 className="mt-3 text-3xl font-black">Let’s build better packaging together.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Reach out for stock box orders, printed corrugated packaging, or custom size requirements.
            </p>
          </div>
          <div className="grid gap-4 text-sm text-slate-200">
            <p>Maheshbhai - 9429315940</p>
            <p>Bhargav - 6355990290</p>
            <p>Vijaybhai - 9909309111</p>
            <a
              href="https://maps.app.goo.gl/Kn4HBcCYZhP6kJVR7"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-[var(--brand-primary)] underline underline-offset-4"
            >
              Shapar Veraval, Rajkot, Gujarat - 360024
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
