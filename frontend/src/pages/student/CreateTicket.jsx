import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { analyzeTicket, createTicket } from "../../services/api";

function CreateTicket() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I'm your College Support Assistant.",
    },
    {
      id: 2,
      sender: "ai",
      text: "Tell me about the problem you are facing (e.g., 'Semester fee payment completed but not reflected').",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [draftIssue, setDraftIssue] = useState(null);
  const [ticketCreated, setTicketCreated] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    const textToAnalyze = message;
    setMessage("");
    setIsTyping(true);

    try {
      // 1. Ask AI to analyze the ticket and suggest a resolution
      const analysis = await analyzeTicket(
        "Student Issue",
        textToAnalyze
      );

      setDraftIssue({ title: "Student Issue", description: textToAnalyze, analysis });

      const resolutionText = analysis.resolution_suggestion?.resolution || 
                             "I could not find an exact match, but I can route this to the correct department.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          type: "analysis",
          analysis: analysis
        },
        {
          id: Date.now() + 2,
          sender: "ai",
          text: analysis.resolution_suggestion?.resolution 
                ? `I found a similar issue. The previous resolution was:\n"${resolutionText}"\n\nWould you like to try this?`
                : `${resolutionText}\n\nWould you like me to raise a ticket for this?`,
          type: "resolution_prompt"
        }
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "I'm sorry, I couldn't analyze that right now. Would you like me to just create a ticket?",
          type: "resolution_prompt"
        },
      ]);
      setDraftIssue({ title: "Student Issue", description: textToAnalyze, analysis: null });
    } finally {
      setIsTyping(false);
    }
  };

  const handleResolveChoice = async (solved) => {
    if (solved) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "user", text: "Yes, this resolved my issue!" },
        { id: Date.now() + 1, sender: "ai", text: "Great! Let me know if you need anything else." }
      ]);
      setDraftIssue(null);
    } else {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "user", text: "No, it still isn't resolved." },
      ]);
      
      setIsTyping(true);
      try {
        const result = await createTicket(draftIssue.title, draftIssue.description);
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: "I have created a support ticket and routed it to the appropriate department.",
          },
        ]);
        setTicketCreated(result);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: "ai", text: "Sorry, there was an error creating your ticket." }
        ]);
      } finally {
        setIsTyping(false);
      }
    }
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
          <div className="chatbot-header">
            <div className="assistant-title">
              <div className="robot-avatar">🤖</div>
              <div>
                <h2>AI Student Assistant</h2>
                <p>Describe your problem and I'll help you.</p>
              </div>
            </div>
            <div className="ai-online"><span></span>AI Online</div>
          </div>

          <div className="chat-container">
            <div className="chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={msg.sender === "user" ? "chat-row user-row" : "chat-row"}>
                  {msg.sender === "ai" && <div className="small-robot">🤖</div>}
                  <div className={msg.sender === "user" ? "message user-message" : "message ai-message"}>
                    
                    {msg.type === "analysis" ? (
                      <div className="analysis-card">
                        <div className="analysis-heading">AI Analysis</div>
                        <div className="analysis-item"><span>Category</span><strong>{msg.analysis.category}</strong></div>
                        <div className="analysis-item"><span>Priority</span><strong>{msg.analysis.priority}</strong></div>
                        <div className="analysis-item"><span>Department</span><strong>{msg.analysis.department}</strong></div>
                        <div className="analysis-item"><span>AI Confidence</span><strong>{Math.round(msg.analysis.confidence * 100)}%</strong></div>
                      </div>
                    ) : msg.type === "resolution_prompt" ? (
                      <div className="resolution-prompt">
                        <p style={{whiteSpace: "pre-wrap"}}>{msg.text}</p>
                        <div className="mt-3 d-flex gap-2">
                          <button className="btn btn-success btn-sm" onClick={() => handleResolveChoice(true)}>Yes, this solved it</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleResolveChoice(false)}>No, raise a ticket</button>
                        </div>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chat-row">
                  <div className="small-robot">🤖</div>
                  <div className="message ai-message"><em>Thinking...</em></div>
                </div>
              )}

              {ticketCreated && (
                <div className="ticket-created mt-4">
                  <div className="ticket-check">✅</div>
                  <div className="ticket-content">
                    <h4>Ticket Created Successfully</h4>
                    <p>Your issue has been automatically converted into a support ticket.</p>
                    <div className="ticket-grid">
                      <div><small>Ticket ID</small><strong>{ticketCreated.ticket_number}</strong></div>
                      <div><small>Category</small><strong>{draftIssue?.analysis?.category || ticketCreated.category}</strong></div>
                      <div><small>Priority</small><span className="priority-high">{draftIssue?.analysis?.priority || ticketCreated.priority}</span></div>
                      <div><small>Department</small><strong>{draftIssue?.analysis?.department || ticketCreated.department_name}</strong></div>
                      <div><small>Status</small><span className="status-assigned">{ticketCreated.status}</span></div>
                    </div>
                    <button className="view-ticket-btn" onClick={() => navigate(`/student/tickets`)}>
                      View My Tickets
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!draftIssue && !ticketCreated && (
              <div className="chat-input-area">
                <div className="input-wrapper">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                    rows="1"
                    maxLength="500"
                  />
                </div>
                <button className="send-btn" onClick={() => sendMessage()} disabled={!message.trim()}>
                  Send
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default CreateTicket;