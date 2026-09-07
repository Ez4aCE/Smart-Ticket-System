import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function CreateTicket() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! 👋 I'm your College Support Assistant.",
    },
    {
      id: 2,
      sender: "ai",
      text: (
        <>
          Tell me about any college-related problem you are facing. I can help
          with <strong>fees, examinations, hostel, scholarship, placement, IT,
          admission, transport</strong> and more.
        </>
      ),
    },
  ]);

  const [ticketCreated, setTicketCreated] = useState(false);


  const sendMessage = (text = message) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    /*
      UI DEMO ONLY

      Later this part will call your AI backend:

      POST /api/chat

      and receive:

      category
      priority
      department
      confidence
      ticketId
    */

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text:
            "I understand your problem. Let me analyze it and create a support ticket for you.",
        },
      ]);
    }, 600);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: "ai",
          type: "analysis",
        },
      ]);
    }, 1400);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          sender: "ai",
          text:
            "Your issue has been classified successfully. I have created a support ticket and routed it to the appropriate department.",
        },
      ]);

      setTicketCreated(true);
    }, 2200);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">

        <Sidebar role="student" />

        <main className="content chatbot-page">

          {/* ================= HEADER ================= */}

          <div className="chatbot-header">

            <div className="assistant-title">

              <div className="robot-avatar">
                🤖
              </div>

              <div>
                <h2>AI Student Assistant</h2>

                <p>
                  Describe your problem and I'll help you.
                </p>
              </div>

            </div>

            <div className="ai-online">
              <span></span>
              AI Online
            </div>

          </div>


          {/* ================= CHAT AREA ================= */}

          <div className="chat-container">

            <div className="chat-messages">

              {/* Messages */}

              {messages.map((msg) => (

                <div
                  key={msg.id}
                  className={
                    msg.sender === "user"
                      ? "chat-row user-row"
                      : "chat-row"
                  }
                >

                  {msg.sender === "ai" && (
                    <div className="small-robot">
                      🤖
                    </div>
                  )}

                  <div
                    className={
                      msg.sender === "user"
                        ? "message user-message"
                        : "message ai-message"
                    }
                  >

                    {msg.type === "analysis" ? (

                      <div className="analysis-card">

                        <div className="analysis-heading">
                          AI Analysis
                        </div>

                        <div className="analysis-item">
                          <span>Category</span>
                          <strong>Fees</strong>
                        </div>

                        <div className="analysis-item">
                          <span>Priority</span>

                          <span className="priority-high">
                            High
                          </span>
                        </div>

                        <div className="analysis-item">
                          <span>Department</span>
                          <strong>Finance</strong>
                        </div>

                        <div className="analysis-item">
                          <span>AI Confidence</span>
                          <strong>96%</strong>
                        </div>

                      </div>

                    ) : (
                      msg.text
                    )}

                  </div>

                </div>

              ))}


              {/* ================= TICKET CREATED ================= */}

              {ticketCreated && (

                <div className="ticket-created">

                  <div className="ticket-check">
                    ✓
                  </div>

                  <div className="ticket-content">

                    <h4>
                      Ticket Created Successfully
                    </h4>

                    <p>
                      Your issue has been automatically converted
                      into a support ticket.
                    </p>

                    <div className="ticket-grid">

                      <div>
                        <small>Ticket ID</small>
                        <strong>#TKT-1024</strong>
                      </div>

                      <div>
                        <small>Category</small>
                        <strong>Fees</strong>
                      </div>

                      <div>
                        <small>Priority</small>
                        <span className="priority-high">
                          High
                        </span>
                      </div>

                      <div>
                        <small>Department</small>
                        <strong>Finance</strong>
                      </div>

                      <div>
                        <small>Status</small>
                        <span className="status-assigned">
                          Assigned
                        </span>
                      </div>

                    </div>

                    <button
                      className="view-ticket-btn"
                      onClick={() =>
                        navigate("/student/tickets/TKT-1024")
                      }
                    >
                      View Ticket
                    </button>

                  </div>

                </div>

              )}

            </div>


            {/* ================= INPUT ================= */}

            <div className="chat-input-area">

              <div className="input-wrapper">

                <span className="attachment-icon">
                  📎
                </span>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                  rows="1"
                  maxLength="500"
                />

              </div>

              <button
                className="send-btn"
                onClick={() => sendMessage()}
                disabled={!message.trim()}
              >
                ➤
              </button>

            </div>

            <div className="character-count">
              {message.length}/500
            </div>


            {/* ================= DISCLAIMER ================= */}

            <div className="chat-disclaimer">
              ⓘ &nbsp; AI can make mistakes. Please verify important
              information with the appropriate college department.
            </div>

          </div>

        </main>


        {/* ================= RIGHT INFO PANEL ================= */}

        <aside className="assistant-info">

          <div className="big-robot">
            🤖
          </div>

          <h3>
            Your Smart Support Companion
          </h3>

          <p>
            Get instant help and let AI create a support
            ticket for you automatically.
          </p>


          {/* How it works */}

          <div className="how-card">

            <h4>
              💡 &nbsp; How it works?
            </h4>

            <div className="step">
              <span>1</span>
              <p>Describe your problem naturally</p>
            </div>

            <div className="step">
              <span>2</span>
              <p>
                AI understands and asks for details
                if needed
              </p>
            </div>

            <div className="step">
              <span>3</span>
              <p>
                AI analyzes and classifies the issue
              </p>
            </div>

            <div className="step">
              <span>4</span>
              <p>
                Ticket is created automatically
              </p>
            </div>

            <div className="step">
              <span>5</span>
              <p>
                You get a tracking ID
              </p>
            </div>

          </div>


          {/* Security */}

          <div className="security-card">

            <div className="security-icon">
              🛡️
            </div>

            <div>
              <strong>
                Your conversations are secure
              </strong>

              <p>
                and private.
              </p>
            </div>

          </div>

        </aside>

      </div>
    </>
  );
}

export default CreateTicket;