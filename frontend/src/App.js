import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Home from "./components/Home/Home";
import CollaborativeCanvas from "./components/Canvas/CollaborativeCanvas";
import QuestionGenerator from "./components/Features/QuestionGenerator";
import PPTSummarizer from "./components/Features/PPTSummarizer";
import WebScraper from "./components/Features/WebScraper";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/room/:id" element={<CollaborativeCanvas />} />
          <Route path="/questions" element={<QuestionGenerator />} />
          <Route path="/summarize" element={<PPTSummarizer />} />
          <Route path="/scrape" element={<WebScraper />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
