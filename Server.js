import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🧾 Fake ticket database (edit this with your real QR values)
const tickets = {
  // Put your real QR data as keys here
  // Example:
  // "0383862400": { movie: "Rental Family", seat: "G12", time: "2025-12-05 21:30", status: "valid" }
  "SAMPLE_QR_1": {
    movie: "Rental Family",
    seat: "G12",
    time: "2025-12-05 21:30",
    status: "valid"
  },
  "SAMPLE_QR_2": {
    movie: "Another Movie",
    seat: "B05",
    time: "2025-12-06 18:00",
    status: "used"
  }
};

// 🔹 API: Validate ticket from QR
app.post("/validate-ticket", (req, res) => {
  const { qrData } = req.body || {};
  if (!qrData) {
    return res.status(400).json({
      valid: false,
      message: "qrData is required"
    });
  }

  const ticket = tickets[qrData];

  if (!ticket) {
    return res.json({
      valid: false,
      message: "Ticket not found",
      metadata: null
    });
  }

  const isValid = ticket.status === "valid";

  res.json({
    valid: isValid,
    message: isValid ? "Ticket is valid and active." : `Ticket status: ${ticket.status}`,
    metadata: {
      qrData,
      ...ticket
    }
  });
});

// 🔹 Web page: list all tickets
app.get("/tickets", (req, res) => {
  const rows = Object.entries(tickets)
    .map(([qr, t]) => {
      return `
        <tr>
          <td>${qr}</td>
          <td>${t.movie}</td>
          <td>${t.seat}</td>
          <td>${t.time}</td>
          <td>${t.status}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Ticket Dashboard</title>
      <style>
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #050505;
          color: #f8f8f8;
          padding: 20px;
        }
        h1 {
          margin-top: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
          background: #121212;
        }
        th, td {
          border: 1px solid #333;
          padding: 8px 10px;
          font-size: 0.9rem;
        }
        th {
          background: #1f1f1f;
          text-align: left;
        }
        tr:nth-child(even) {
          background: #1a1a1a;
        }
      </style>
    </head>
    <body>
      <h1>Ticket Dashboard</h1>
      <p>All tickets known by this backend:</p>
      <table>
        <thead>
          <tr>
            <th>QR Data</th>
            <th>Movie</th>
            <th>Seat</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows || "<tr><td colspan='5'>No tickets defined.</td></tr>"}
        </tbody>
      </table>
    </body>
    </html>
  `;

  res.send(html);
});

app.get("/", (req, res) => {
  res.send("Ticket backend is running. Go to /tickets to see the dashboard.");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
