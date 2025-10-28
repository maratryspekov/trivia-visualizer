import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Question = {
  category: string;
  difficulty: string;
  question: string;
};

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch("https://opentdb.com/api.php?amount=50");
        const data = await response.json();

        if (data.results && Array.isArray(data.results)) {
          setQuestions(data.results);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!questions.length) {
    return <p>No data available. Please try again later.</p>;
  }

  // get unique categories
  const categories = Array.from(new Set(questions.map((q) => q.category)));

  // decode HTML entities (like &amp; → &)
  function decodeHtml(html: string) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  // count questions per category
  const categoryData = categories.map((cat) => {
    const count = questions.filter((q) => q.category === cat).length;
    return { category: decodeHtml(cat), count };
  });

  // ount questions per difficulty (with optional category filter)
  const difficulties = ["easy", "medium", "hard"];
  const difficultyData = difficulties.map((level) => {
    const filteredQuestions =
      selectedCategory === "All"
        ? questions
        : questions.filter((q) => q.category === selectedCategory);
    const count = filteredQuestions.filter(
      (q) => q.difficulty === level
    ).length;
    return { difficulty: level, count };
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Trivia Visualization</h1>

      {/* Category filter */}
      <h2>Filter by Category</h2>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        style={{ padding: "8px", marginBottom: "30px" }}
      >
        <option value="All">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {decodeHtml(cat)}
          </option>
        ))}
      </select>

      {/* Chart 1: questions per category */}
      <h2>Questions by Category</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={categoryData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            angle={-30}
            textAnchor="end"
            interval={0}
            height={100}
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      {/* Chart 2: questions per difficulty */}
      <h2>Questions by Difficulty</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={difficultyData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="difficulty" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;
