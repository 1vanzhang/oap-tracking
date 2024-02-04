import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession, signIn } from "next-auth/react";

const Header: React.FC = () => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;

  const { data: session, status } = useSession();
  let right = null;

  if (!session) {
    right = <button onClick={() => signIn("google")}>Sign in</button>;
  } else {
    right = (
      <div>
        {session.user.name || session.user.email}
        <img
          src={session.user.image}
          alt=""
          style={{ borderRadius: "50%", width: "25px" }}
        />
        <Link
          href="/api/auth/signout"
          onClick={(e) => {
            e.preventDefault();
            signOut();
          }}
        >
          Sign out
        </Link>
      </div>
    );
  }

  return (
    <nav>
      <div>
        <Link href="/">Dashboard</Link>
        <Link href="/settings">Settings</Link>
      </div>

      <div style={{ marginLeft: "auto" }}>{right}</div>
      <style jsx>{`
        nav {
          display: flex;
          padding: 2rem;
          align-items: center;
          border-bottom: 1px solid white;
        }
      `}</style>
    </nav>
  );
};

export default Header;
