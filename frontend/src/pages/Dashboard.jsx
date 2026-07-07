
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

function Dashboard() {
  const username = localStorage.getItem("username");
  const user_id = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState("");
  const [transactions, setTransactions] = useState([]);

  const BASE_URL = "http://13.207.189.198:5000";

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = income - expense;

  // 🔹 1. Fetch expenses on page load
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/expenses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success) {
        setTransactions(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };
  // 🔹 2. Add expense (API call)
  const handleAdd = async () => {
    if (!title || !amount || !date) return;

    try {
      const res = await fetch(`${BASE_URL}/add-expense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id,
          title,
          amount,
          type,
          date
        })
      });

      const data = await res.json();

      if (data.success) {
        fetchExpenses(); // refresh list
        setTitle("");
        setAmount("");
        setDate("");
      }

    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 3. Delete expense (API call)
  const handleDelete = async (id) => {
    try {
      await fetch(`${BASE_URL}/delete-expense/${id}`, {
        method: "DELETE"
      });

      fetchExpenses(); // refresh list
    } catch (err) {
      console.error(err);
    }

  
  };

  return (
    <div className="dashboard">

      <Navbar />

      <h2 className="welcome">
        Hello {username}, this is your expense dashboard 👋
      </h2>

      <div className="summary">
        <div className="card-box">
          <h4>Balance</h4>
          <p>₹{balance}</p>
        </div>

        <div className="card-box">
          <h4 className="income">Income</h4>
          <p>₹{income}</p>
        </div>

        <div className="card-box">
          <h4 className="expense">Expense</h4>
          <p>₹{expense}</p>
        </div>
      </div>

      {/* Add Form */}
      <div className="form-card">
        <h3>Add Transaction</h3>

        <input
          className="input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="input"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          className="input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <select
          className="input"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <button className="btn" onClick={handleAdd}>
          Add
        </button>
      </div>

      {/* Transactions */}
      <div className="transaction-list">
        <h3>Transactions</h3>

        {transactions.length === 0 && <p>No transactions yet</p>}

        {transactions.map((t) => (
          <div className="transaction-item" key={t.id}>
            <span>
              {t.title} - ₹{t.amount} ({t.type}) | {
              new Date(t.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
              })
            }
            </span>

            <button
              className="delete-btn"
              onClick={() => handleDelete(t.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Dashboard;
