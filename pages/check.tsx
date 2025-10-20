import { useEffect, useState } from "react";

export default function CheckDB() {
  const [msg, setMsg] = useState("Checking...");

  useEffect(() => {
    fetch("/api/checkdb")
      .then(res => res.json())
      .then(data => setMsg(data.message))
      .catch(() => setMsg("Error connecting to database"));
  }, []);

  return (
    <div style={{ padding: 20, fontSize: 18 }}>
      <h1>{msg}</h1>
    </div>
  );
}
