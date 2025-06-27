import React, { useState } from "react";
import api from "../../utils/api";

const QuestionGenerator = () => {
  const [syllabus, setSyllabus] = useState(null);
  const [pyqs, setPyqs] = useState(null);
  const [questions, setQuestions] = useState("");

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("syllabus", syllabus);
    formData.append("pyqs", pyqs);

    try {
      const res = await api.post("/api/questions", formData);
      setQuestions(res.data.questions || res.data); // adapt to actual return
    } catch (err) {
      alert("Error generating questions");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Generate Questions</h2>
      <input type="file" onChange={(e) => setSyllabus(e.target.files[0])} />
      <input type="file" onChange={(e) => setPyqs(e.target.files[0])} />
      <button
        onClick={handleSubmit}
        className="mt-2 bg-blue-500 px-4 py-2 text-white"
      >
        Generate
      </button>
      {questions && <pre className="mt-4 whitespace-pre-wrap">{questions}</pre>}
    </div>
  );
};

export default QuestionGenerator;
