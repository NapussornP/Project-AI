import React from "react";
import Nav from "../Nav";

function Dashboard() {
  return (
    <section className="flex gap-6">
      <Nav />
      <div className="m-3 text-xl text-purple-800 font-semibold">
        Dashboard Page
        <img src="4.jpg" alt="aa" />
      </div>
    </section>
  );
}

export default Dashboard;
