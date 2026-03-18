/**
 * Footer component — matches legacy FooterLayout2.js exactly.
 * Simple dark bar (50px height) with links on left, social + copyright on right.
 */

import { Link } from "@tanstack/react-router";
import { Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="w-full"
      style={{
        background: "#212121",
        height: 50,
        fontSize: "0.8em",
        padding: "0 80px",
        color: "#dddddd",
        display: "flex",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      {/* Left: Navigation Links */}
      <div
        style={{
          width: "70%",
          display: "flex",
          fontSize: "1.2em",
          marginTop: 16,
          gap: 0,
          alignItems: "baseline",
        }}
      >
        <Link to="/terms" className="text-[#dddddd] hover:underline">
          Terms
        </Link>
        <span>&nbsp; | &nbsp;</span>
        <Link to="/privacy" className="text-[#dddddd] hover:underline">
          Privacy
        </Link>
        <span>&nbsp; | &nbsp;</span>
        <a href="/accessibility" className="text-[#dddddd] hover:underline">
          Accessibility
        </a>
        <span>&nbsp; | &nbsp;</span>
        <a
          href="/contact"
          className="text-[#dddddd] hover:underline cursor-pointer"
        >
          Contact us
        </a>
        <span>&nbsp; | &nbsp;</span>
        <a
          href="https://ezcheck.me/blog"
          className="text-[#dddddd] hover:underline"
        >
          Blog
        </a>
        <span className="hidden sm:inline">&nbsp; | &nbsp;</span>
        <a
          href="/help"
          className="text-[#dddddd] hover:underline cursor-pointer hidden sm:inline"
        >
          Help &amp; FAQs
        </a>
      </div>

      {/* Right: Social Icons + Copyright */}
      <div
        style={{
          textAlign: "right",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <a
          href="https://www.facebook.com/EZCheck.me"
          target="_blank"
          rel="noopener noreferrer"
          title="Facebook"
          className="hover:opacity-80"
        >
          <Facebook
            className="h-5 w-5 text-[#dddddd]"
            style={{ marginTop: 2 }}
          />
        </a>
        <a
          href="https://www.twitter.com/ezcheckme"
          target="_blank"
          rel="noopener noreferrer"
          title="Twitter"
          className="hover:opacity-80"
        >
          <Twitter
            className="h-5 w-5 text-[#dddddd]"
            style={{ marginTop: 2 }}
          />
        </a>
        <div style={{ fontSize: "1.1em" }}>
          &copy; {new Date().getFullYear()} EZCheck.me
        </div>
      </div>
    </footer>
  );
}
