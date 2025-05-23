// src/app/tips/page.js
'use client'; // This page needs client-side features (State, Event Handlers)

import { useState } from 'react'; // Import useState

export default function FarmingTipsPage() {
  // Array of farming tips (can remain as static content)
  const farmingTips = [
    { id: 1, tip: "Ensure proper ventilation in barns to prevent respiratory issues." },
    { id: 2, tip: "Regularly test soil pH for optimal pasture growth." },
    { id: 3, tip: "Implement a consistent milking schedule for better milk production." },
    { id: 4, tip: "Monitor feed intake closely to detect early signs of illness." },
    { id: 5, tip: "Keep detailed records of breeding, health, and production for each animal." },
    { id: 6, tip: "Provide access to clean, fresh water at all times." },
    { id: 7, tip: "Rotate pastures to prevent overgrazing and reduce parasite load." },
    { id: 8, tip: "Learn to recognize common signs of stress or discomfort in your animals." },
  ];

  // State for the chatbot input and response
  const [userQuery, setUserQuery] = useState('');
  const [chatbotResponse, setChatbotResponse] = useState('Ask me a question about farming!');

  // Function to simulate a chatbot response
  const getSimulatedChatbotResponse = (query) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('feed') || lowerQuery.includes('feeding')) {
      return "Proper feeding is crucial. Monitor intake and provide balanced nutrition based on animal type and stage.";
    } else if (lowerQuery.includes('health') || lowerQuery.includes('illness') || lowerQuery.includes('sick')) {
      return "Look for changes in behavior, appetite, or physical signs. Early detection is key. Consult a vet for serious concerns.";
    } else if (lowerQuery.includes('breeding')) {
      return "Keep accurate breeding records. Understand heat cycles and consider genetic traits for improvement.";
    } else if (lowerQuery.includes('pasture') || lowerQuery.includes('grazing')) {
      return "Rotate pastures to manage grass health and reduce parasite exposure.";
    } else if (lowerQuery.includes('milk') || lowerQuery.includes('milking')) {
        return "Maintain a consistent schedule and hygiene for optimal milk production and quality.";
    } else if (lowerQuery.includes('water')) {
        return "Clean, fresh water must be available to animals at all times.";
    }
     else if (lowerQuery.includes('records') || lowerQuery.includes('data')) {
        return "Detailed records help track performance, health, and make informed decisions.";
    }
    else if (lowerQuery.includes('ventilation') || lowerQuery.includes('barn')) {
        return "Good barn ventilation is vital for air quality and preventing respiratory issues.";
    }
     else if (lowerQuery.includes('soil')) {
        return "Test soil pH and nutrients for healthy pasture growth.";
    }
    else if (lowerQuery.includes('stress')) {
        return "Recognize signs of stress like reduced appetite, changes in behavior, or vocalization.";
    }
    else if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
        return "Hello! How can I help you with farming tips today?";
    }
     else if (lowerQuery.includes('thank')) {
        return "You're welcome! Let me know if you have more questions.";
    }
    else {
      return "I can provide tips on feeding, health, breeding, pasture management, and more. What's your question?";
    }
  };

  // Function to handle sending the message
  const handleSendMessage = (event) => {
    event.preventDefault(); // Prevent form submission if using a form

    if (userQuery.trim() === '') {
      setChatbotResponse('Please type a question.');
      return;
    }

    // Get the simulated response
    const response = getSimulatedChatbotResponse(userQuery);
    setChatbotResponse(response);

    // Optional: Clear the input field after sending
    // setUserQuery('');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Farming Tips & Chatbot</h1>

      {/* Display the list of tips */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-8"> {/* Increased bottom margin */}
        <h2 className="text-xl font-bold mb-4">General Tips</h2>
        <ul className="list-disc list-inside space-y-3 text-gray-700">
          {farmingTips.map(tip => (
            <li key={tip.id} className="leading-relaxed">
              {tip.tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Chatbot Section */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-xl font-bold mb-4">Ask a Farming Question</h2>

          {/* Chatbot Response Area */}
          <div className="mb-4 p-3 bg-gray-100 rounded-md text-gray-800">
              <p className="font-semibold">Chatbot:</p>
              <p>{chatbotResponse}</p>
          </div>

          {/* User Input Area */}
          <div className="flex"> {/* Use flex to align input and button */}
              <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2" // Added mr-2 for spacing
                  type="text"
                  placeholder="Type your question here..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyPress={(e) => { // Allows sending message on Enter key press
                      if (e.key === 'Enter') {
                          handleSendMessage(e); // Pass the event object
                      }
                  }}
              />
              <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleSendMessage} // Use onClick for the button
              >
                  Send
              </button>
          </div>
           <p className="text-xs text-gray-500 mt-2">Note: This is a simulated chatbot and provides predefined responses.</p>
      </div>

    </div>
  );
}
