import React, { useState } from "react";
import api from "../../utils/api";

const QuestionGenerator = () => {
  const [input, setInput] = useState("");
  const [questions, setQuestions] = useState([]);

  const handleGenerate = async () => {
    const res = await api.post("/tools/questions", { text: input });
    setQuestions(res.data.questions);
  };

  return (
    <div>
      <textarea
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste PYQs and syllabus"
      />
      <button onClick={handleGenerate}>Generate Questions</button>
      <ul>
        {questions.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionGenerator;
