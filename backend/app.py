# Python Backend - Flask API for AI Chat
# Requirements: flask, flask-cors, requests, sqlalchemy

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from datetime import datetime
import json
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
CORS(app)

# HuggingFace API Configuration
# Get your free API key from https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY = os.environ.get("HUGGINGFACE_API_KEY", "")
HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1"

# Resume Data - Edit this with your information
RESUME_DATA = {
    "name": "Jakka Chenchu Prasad",
    "title": "BTECH Undergraduate",
    "location": "Andhra Pradesh, India",
    "email": "chenchuprasad72@gmail.com",
    "phone": "+91 9347774361",
    "linkedin": "https://www.linkedin.com/in/jakka-prasad/",
    "github": "https://github.com/PRASADAUCSE",
    "summary": "I'm a BTECH undergraduate seeking an entry level position to apply my technical skills and theoretical knowledge in practical scenarios for contributing innovative solutions and continual learning in the field.",
    "education": [
        {
            "degree": "Bachelor's Degree",
            "institution": "Andhra University",
            "period": "2022 - 2026",
            "details": "CGPA: 8.35"
        },
        {
            "degree": "Intermediate",
            "institution": "Sri Prakash Junior College",
            "period": "2020 - 2022",
            "details": "CGPA: 9"
        },
        {
            "degree": "10th Standard",
            "institution": "Sri Chaitanya",
            "period": "2019 - 2020",
            "details": "CGPA: 10"
        }
    ],
    "skills": {
        "Programming": ["Java", "MySQL"],
        "Web Technologies": ["HTML", "CSS", "JavaScript", "Redux"],
        "Core Competencies": ["OS", "DBMS"],
        "Tools": ["GitHub", "VS Code"]
    },
    "experience": [
        {
            "role": "Frontend Developer Intern",
            "company": "Plasmid",
            "period": "Aug 2024 - Oct 2024",
            "description": "Worked with a team of four to develop a responsive food ordering web application using ReactJS and JavaScript, focusing on features like restaurant listings, menu browsing, and cart management."
        },
        {
            "role": "Teaching Assistant",
            "company": "Mentiby",
            "period": "Apr 2025 - Aug 2025",
            "description": "Served as a teaching assistant responsible for clarifying complex aptitude concepts and guiding students through problem-solving techniques to strengthen understanding."
        }
    ],
    "projects": [
        {
            "name": "Movies Recommendation System",
            "period": "Apr 2025 - May 2025",
            "link": "https://netflix-gpt-dg8x.vercel.app/",
            "description": "Developed a responsive movie platform with React, delivering a Netflix-like browsing experience by integrating multiple APIs and GPT API for intelligent search and personalized recommendations. Implemented Firebase authentication for secure user access, managed global state with Redux Toolkit, and optimized performance through reusable components and modular code.",
            "technologies": ["React", "Redux Toolkit", "Firebase", "GPT API"]
        },
        {
            "name": "Wikipedia Search Application",
            "period": "Dec 2024",
            "link": "https://prasadwiksearch.ccbp.tech/",
            "description": "Built a responsive search application using HTML, CSS, Bootstrap, and JavaScript to deliver curated Wikipedia results with a clean, adaptive UI. Implemented asynchronous Fetch API calls for real-time search and enabled seamless navigation to detailed Wikipedia pages in new tabs.",
            "technologies": ["HTML", "CSS", "Bootstrap", "JavaScript", "Fetch API"]
        },
        {
            "name": "Todos Application",
            "period": "Dec 2024",
            "link": "https://chenchutodoapp.ccbp.tech/",
            "description": "Built a responsive todos application using React, HTML, CSS, and JavaScript to manage tasks with features like task creation, editing, deletion, and filtering. Implemented local storage for persistent data management and a clean UI with intuitive controls.",
            "technologies": ["React", "HTML", "CSS", "JavaScript", "Local Storage"]
        },
        {
            "name": "AI resume analyzer",
            "period": "Dec 2024",
            "link": "https://resume-analyzer-eight-rho.vercel.app/",
            "description": "Developed a responsive resume analyzer application using React, Tailwind CSS, and JavaScript to analyze resumes and provide feedback on strengths and weaknesses. Implemented local storage for persistent data management and a clean UI with intuitive controls.",
            "technologies": ["React", "Tailwind CSS", "JavaScript", "Local Storage"]
        }
    ],
    "achievements": [
        "Awarded First Prize at the College's Department Day Hackathon, demonstrating exceptional problem-solving and innovative application of technical skills."
    ]
}

# System prompt for the AI
SYSTEM_PROMPT = """You are an AI assistant for a personal portfolio website. Your role is to help visitors learn about the person described in the resume provided below. 

You should:
- Answer questions about the person's skills, experience, education, and projects
- Be friendly, professional, and concise
- If you don't know something, admit it honestly
- Use the resume information to provide accurate responses

Resume Data:
{resume_json}

Always respond in a helpful and conversational manner. If the user asks about something not in the resume, be honest that you can only answer questions about what's in the resume."""


def format_resume_for_prompt():
    """Format resume data as JSON string for the AI prompt"""
    return json.dumps(RESUME_DATA, indent=2)


def call_huggingface_api(messages: list) -> Optional[str]:
    """Call HuggingFace API with the given messages"""
    if not HUGGINGFACE_API_KEY:
        # Use fallback response
        return get_fallback_response(messages[-1]['content'] if messages else "")
    
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Format messages for HuggingFace API
    conversation = ""
    for msg in messages:
        if msg["role"] == "system":
            conversation += f"System: {msg['content']}\n"
        elif msg["role"] == "user":
            conversation += f"User: {msg['content']}\n"
        elif msg["role"] == "assistant":
            conversation += f"Assistant: {msg['content']}\n"
    
    conversation += "Assistant:"
    
    data = {
        "inputs": conversation,
        "parameters": {
            "max_new_tokens": 500,
            "temperature": 0.7
        }
    }
    
    try:
        response = requests.post(HUGGINGFACE_API_URL, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        # Extract response from HuggingFace format
        if isinstance(result, list) and len(result) > 0:
            generated_text = result[0].get('generated_text', '')
            # Extract only the assistant response part
            if 'Assistant:' in generated_text:
                assistant_response = generated_text.split('Assistant:')[-1].strip()
                return assistant_response
        return get_fallback_response(messages[-1]['content'] if messages else "")
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
        # Use fallback response on any error
        return get_fallback_response(messages[-1]['content'] if messages else "")

def get_fallback_response(user_message: str) -> str:
    """Generate response based on resume data and general queries"""
    message_lower = user_message.lower()
    
    # Skills response
    if any(word in message_lower for word in ["skill", "technology", "tech", "programming", "know", "proficient", "language"]):
        skills_list = []
        for category, items in RESUME_DATA.get("skills", {}).items():
            skills_list.extend(items)
        return f"I'm skilled in: {', '.join(skills_list)}. I specialize in various programming languages, web technologies, and tools for full-stack development."
    
    # Projects response
    if any(word in message_lower for word in ["project", "portfolio", "work", "built", "developed", "created"]):
        projects = RESUME_DATA.get("projects", [])
        if projects:
            project_info = []
            for p in projects:
                project_info.append(f"{p['name']} - {p['description'][:100]}...")
            return "\n".join(project_info[:2])
        return "I have several projects showcasing my development skills!"
    
    # Experience response
    if any(word in message_lower for word in ["experience", "internship", "job", "work", "position", "role"]):
        exp = RESUME_DATA.get("experience", [])
        if exp:
            exp_text = f"I have experience as:\n"
            for e in exp:
                exp_text += f"- {e['role']} at {e['company']} ({e['period']}): {e['description']}\n"
            return exp_text
        return "I have hands-on experience in web development and building applications."
    
    # Education response
    if any(word in message_lower for word in ["education", "degree", "university", "study", "school", "college"]):
        edu = RESUME_DATA.get("education", [])
        if edu:
            edu_text = "My education:\n"
            for e in edu:
                edu_text += f"- {e['degree']} at {e['institution']} ({e['period']})\n"
            return edu_text
        return "I'm a BTECH undergraduate with a strong foundation in computer science."
    
    # About response
    if any(word in message_lower for word in ["who", "about", "tell me", "yourself", "name", "introduce"]):
        return f"Hi! I'm {RESUME_DATA.get('name', 'a developer')}. {RESUME_DATA.get('summary', 'I am a passionate developer.')}"
    
    # Contact response
    if any(word in message_lower for word in ["contact", "email", "phone", "reach", "connect", "linkedin", "github"]):
        contact_info = f"You can reach me at:\n- Email: {RESUME_DATA.get('email', 'N/A')}\n- Phone: {RESUME_DATA.get('phone', 'N/A')}\n- LinkedIn: {RESUME_DATA.get('linkedin', 'N/A')}\n- GitHub: {RESUME_DATA.get('github', 'N/A')}"
        return contact_info
    
    # Achievements response
    if any(word in message_lower for word in ["achievement", "award", "accomplishment", "award", "prize"]):
        achievements = RESUME_DATA.get("achievements", [])
        if achievements:
            return "My achievements:\n- " + "\n- ".join(achievements)
        return "I'm proud of my academic and professional accomplishments."
    
    # General greeting/help
    if any(word in message_lower for word in ["hello", "hi", "hey", "help", "what can", "what do"]):
        return "Hello! I'm an AI assistant on this portfolio. I can tell you about my background, skills, experience, projects, education, and achievements. What would you like to know?"
    
    # Default response
    return f"That's an interesting question! While I may not have a specific answer about '{user_message}', I can tell you about my background, skills, experience, projects, and education. Feel free to ask about any of those topics!"


@app.route('/api/resume', methods=['GET'])
def get_resume():
    """Get the resume data"""
    return jsonify(RESUME_DATA)


@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages"""
    data = request.get_json()
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400
    
    # Add system prompt with resume
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT.format(resume_json=format_resume_for_prompt())},
        {"role": "user", "content": user_message}
    ]
    
    # Get chat history for context
    history = data.get('history', [])
    if history:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT.format(resume_json=format_resume_for_prompt())}
        ] + history[-10:] + [{"role": "user", "content": user_message}]
    
    response = call_huggingface_api(messages)
    
    return jsonify({
        'message': response,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'api_key_configured': bool(HUGGINGFACE_API_KEY)
    })


if __name__ == '__main__':
    print("=" * 50)
    print("Portfolio AI Chat Backend")
    print("=" * 50)
    print(f"API Key configured: {bool(HUGGINGFACE_API_KEY)}")
    print("Starting server on http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, port=5000, host='0.0.0.0')
