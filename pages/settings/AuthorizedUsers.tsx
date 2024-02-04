import React from "react";

export type AuthorizedUser = {
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  users: AuthorizedUser[];
};

export default function AuthorizedUsers({ users }: Props) {
  const [name, setName] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  return (
    <div>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={async () => {
          await fetch("/api/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email }),
          });
          window.location.reload();
        }}
      >
        Add User
      </button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.email}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.createdAt.toISOString()}</td>
              <td>{user.updatedAt.toISOString()}</td>
              <td>
                <button
                  onClick={async () => {
                    await fetch("/api/user", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: user.email }),
                    });
                    window.location.reload();
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
