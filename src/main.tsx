import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";

import Home from "./Home";
import Room from "./Room";
import Write from "./Write";
import View from "./View";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room" element={<Room />} />
        <Route path="/write" element={<Write />} />
        <Route path="/view" element={<View />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
