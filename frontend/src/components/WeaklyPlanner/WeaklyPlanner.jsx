import React, { useState } from 'react';

const RuralTeacherPlanner = () => {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState('english');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [customSubject, setCustomSubject] = useState('');
  const [chapterData, setChapterData] = useState({});
  const [apiResponse, setApiResponse] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Localization data
  const translations = {
    english: {
      title: "Weekly Lesson Planner",
      step1: "Select Grade",
      step2: "Choose Subjects",
      step3: "Enter Chapter Names",
      step4: "AI Distribution",
      step5: "Review & Save",
      next: "Next",
      back: "Back",
      save: "Save Plan",
      download: "Download PDF",
      edit: "Edit Again",
      grades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
      subjects: [
        { id: 'math', name: 'Mathematics', icon: '🧮', color: '#FFE5B4' },
        { id: 'science', name: 'Science', icon: '🔬', color: '#E1F5FE' },
        { id: 'language', name: 'Language', icon: '📚', color: '#E8F5E9' },
        { id: 'evs', name: 'EVS', icon: '🌍', color: '#FFF3E0' },
        { id: 'social', name: 'Social Studies', icon: '🏛️', color: '#F3E5F5' },
        { id: 'art', name: 'Art', icon: '🎨', color: '#FFF8E1' }
      ],
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      addCustom: "Add Custom Subject",
      generatePlan: "Generate Weekly Plan",
      generating: "AI is creating your weekly plan...",
      chapterInput: "Enter chapter name for each subject",
      typeChapter: "Enter the main chapter/topic you want to teach this week",
      example: "E.g.: Algebra, Photosynthesis, Ancient Civilizations...",
      aiDistribution: "AI will break down chapters into subtopics and distribute them across the week",
      weeklyOverview: "Weekly Lesson Plan",
      dayWiseBreakdown: "Day-wise Topics",
      noChapter: "No chapter added for this subject",
      topicBreakdown: "Topic Breakdown",
      rationale: "Distribution Logic"
    },
    hindi: {
      title: "साप्ताहिक पाठ योजनाकार",
      step1: "कक्षा चुनें",
      step2: "विषय चुनें",
      step3: "अध्याय नाम दर्ज करें",
      step4: "AI वितरण",
      step5: "समीक्षा करें और सहेजें",
      next: "अगला",
      back: "पीछे",
      save: "योजना सहेजें",
      download: "PDF डाउनलोड करें",
      edit: "फिर से संपादित करें",
      grades: ["कक्षा 1", "कक्षा 2", "कक्षा 3", "कक्षा 4", "कक्षा 5", "कक्षा 6", "कक्षा 7", "कक्षा 8", "कक्षा 9", "कक्षा 10", "कक्षा 11", "कक्षा 12"],
      subjects: [
        { id: 'math', name: 'गणित', icon: '🧮', color: '#FFE5B4' },
        { id: 'science', name: 'विज्ञान', icon: '🔬', color: '#E1F5FE' },
        { id: 'language', name: 'भाषा', icon: '📚', color: '#E8F5E9' },
        { id: 'evs', name: 'पर्यावरण अध्ययन', icon: '🌍', color: '#FFF3E0' },
        { id: 'social', name: 'सामाजिक अध्ययन', icon: '🏛️', color: '#F3E5F5' },
        { id: 'art', name: 'कला', icon: '🎨', color: '#FFF8E1' }
      ],
      days: ['सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार'],
      addCustom: "कस्टम विषय जोड़ें",
      generatePlan: "साप्ताहिक योजना बनाएं",
      generating: "AI आपकी साप्ताहिक योजना बना रहा है...",
      chapterInput: "प्रत्येक विषय के लिए अध्याय का नाम दर्ज करें",
      typeChapter: "वह मुख्य अध्याय/विषय दर्ज करें जो आप इस सप्ताह पढ़ाना चाहते हैं",
      example: "उदाहरण: बीजगणित, प्रकाश संश्लेषण, प्राचीन सभ्यताएं...",
      aiDistribution: "AI अध्यायों को उपविषयों में विभाजित करेगा और उन्हें सप्ताह भर वितरित करेगा",
      weeklyOverview: "साप्ताहिक पाठ योजना",
      dayWiseBreakdown: "दिन-वार विषय",
      noChapter: "इस विषय के लिए कोई अध्याय नहीं जोड़ा गया",
      topicBreakdown: "विषय विभाजन",
      rationale: "वितरण तर्क"
    }
  };

  const t = translations[language];

  // Handle grade selection
  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
  };

  // Handle subject selection
  const handleSubjectToggle = (subject) => {
    if (selectedSubjects.some(s => s.id === subject.id)) {
      setSelectedSubjects(selectedSubjects.filter(s => s.id !== subject.id));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  // Handle custom subject addition
  const handleAddCustomSubject = () => {
    if (customSubject.trim()) {
      const newSubject = {
        id: `custom-${Date.now()}`,
        name: customSubject,
        icon: '➕',
        color: '#F0F0F0',
        isCustom: true
      };
      setSelectedSubjects([...selectedSubjects, newSubject]);
      setCustomSubject('');
    }
  };

  // Handle chapter input
  const handleChapterChange = (subjectId, chapter) => {
    setChapterData({
      ...chapterData,
      [subjectId]: chapter
    });
  };

  // API call to generate weekly plan
  const generateWeeklyPlan = async () => {
    setIsGenerating(true);
    setError('');

    try {
      // Prepare input data for API
      const subjectsData = {};
      selectedSubjects.forEach(subject => {
        if (chapterData[subject.id]) {
          subjectsData[subject.name] = chapterData[subject.id];
        }
      });

      const requestData = {
        grade: selectedGrade,
        subjects: subjectsData
      };

      // Call your backend API
      const response = await fetch('http://127.0.0.1:8000/api/v1/planner/planner/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate weekly plan');
      }

      const data = await response.json();
      setApiResponse(data);
      setCurrentStep(4);

    } catch (error) {
      console.error('Error generating weekly plan:', error);
      setError('Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save plan
  const handleSavePlan = () => {
    const planData = {
      grade: selectedGrade,
      subjects: selectedSubjects,
      chapterData: chapterData,
      apiResponse: apiResponse,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('lessonPlan', JSON.stringify(planData));
    alert('Plan saved successfully!');
  };

  // Download PDF (simulated)
  const handleDownloadPDF = () => {
    alert('PDF download functionality would be implemented here');
  };

  // Render step indicator
  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        {[1, 2, 3, 4, 5].map(step => (
          <div 
            key={step} 
            className={`step ${currentStep === step ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
            onClick={() => setCurrentStep(step)}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">
              {step === 1 && t.step1}
              {step === 2 && t.step2}
              {step === 3 && t.step3}
              {step === 4 && t.step4}
              {step === 5 && t.step5}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Step 1: Grade Selection
  const renderGradeSelection = () => {
    return (
      <div className="step-content">
        <h2>{t.step1}</h2>
        <div className="grade-grid">
          {t.grades.map((grade, index) => (
            <button
              key={index}
              className={`grade-card ${selectedGrade === grade ? 'selected' : ''}`}
              onClick={() => handleGradeSelect(grade)}
            >
              {grade}
            </button>
          ))}
        </div>
        <div className="navigation">
          <button 
            className="btn-primary" 
            disabled={!selectedGrade}
            onClick={() => setCurrentStep(2)}
          >
            {t.next}
          </button>
        </div>
      </div>
    );
  };

  // Step 2: Subject Selection
  const renderSubjectSelection = () => {
    return (
      <div className="step-content">
        <h2>{t.step2}</h2>
        <div className="subject-grid">
          {t.subjects.map(subject => (
            <div
              key={subject.id}
              className={`subject-card ${selectedSubjects.some(s => s.id === subject.id) ? 'selected' : ''}`}
              onClick={() => handleSubjectToggle(subject)}
              style={{ backgroundColor: subject.color }}
            >
              <div className="subject-icon">{subject.icon}</div>
              <div className="subject-name">{subject.name}</div>
            </div>
          ))}
        </div>
        
        <div className="custom-subject">
          <h3>{t.addCustom}</h3>
          <div className="custom-input">
            <input
              type="text"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="Enter subject name"
            />
            <button onClick={handleAddCustomSubject}>+ Add</button>
          </div>
        </div>
        
        {selectedSubjects.length > 0 && (
          <div className="selected-subjects">
            <h3>Selected Subjects:</h3>
            <div className="selected-list">
              {selectedSubjects.map(subject => (
                <div key={subject.id} className="selected-tag">
                  {subject.icon} {subject.name}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="navigation">
          <button className="btn-secondary" onClick={() => setCurrentStep(1)}>
            {t.back}
          </button>
          <button 
            className="btn-primary" 
            disabled={selectedSubjects.length === 0}
            onClick={() => setCurrentStep(3)}
          >
            {t.next}
          </button>
        </div>
      </div>
    );
  };

  // Step 3: Chapter Input
  const renderChapterInput = () => {
    return (
      <div className="step-content">
        <h2>{t.step3}</h2>
        <p>{t.chapterInput}</p>
        <p className="ai-info">{t.aiDistribution}</p>
        
        {selectedSubjects.map(subject => (
          <div key={subject.id} className="chapter-input">
            <h3>{subject.icon} {subject.name}</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder={`${t.typeChapter}\n${t.example}`}
                value={chapterData[subject.id] || ''}
                onChange={(e) => handleChapterChange(subject.id, e.target.value)}
                className="chapter-input-field"
              />
            </div>
          </div>
        ))}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="navigation">
          <button className="btn-secondary" onClick={() => setCurrentStep(2)}>
            {t.back}
          </button>
          <button 
            className="btn-primary" 
            onClick={generateWeeklyPlan}
            disabled={isGenerating || Object.keys(chapterData).length === 0}
          >
            {isGenerating ? t.generating : t.generatePlan}
          </button>
        </div>
        
        {isGenerating && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{t.generating}</p>
          </div>
        )}
      </div>
    );
  };

  // Step 4: AI Distribution Results
  const renderAIDistribution = () => {
    if (!apiResponse) {
      return (
        <div className="step-content">
          <div className="error-message">No data available</div>
        </div>
      );
    }

    const { topic_breakdown, weekly_plan, rationale } = apiResponse;

    return (
      <div className="step-content">
        <h2>{t.step4}</h2>
        <p className="success-message">✓ AI has created your weekly lesson plan</p>
        
        {/* Topic Breakdown */}
        <div className="topic-breakdown">
          <h3>{t.topicBreakdown}</h3>
          {Object.entries(topic_breakdown).map(([subject, topics]) => (
            <div key={subject} className="subject-breakdown">
              <h4>{subject}</h4>
              <ul>
                {topics.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Weekly Plan */}
        <div className="weekly-plan">
          <h3>{t.weeklyOverview}</h3>
          
          {Object.entries(weekly_plan).map(([day, dayData]) => (
            <div key={day} className="day-plan">
              <div className="day-header">
                <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
              </div>
              <div className="day-subjects">
                {dayData.subjects.map((subject, index) => {
                  const subjectConfig = selectedSubjects.find(s => s.name === subject.subject_name);
                  return (
                    <div 
                      key={index} 
                      className="subject-slot"
                      style={{ borderLeft: `4px solid ${subjectConfig?.color || '#ccc'}` }}
                    >
                      <div className="subject-title">
                        <span className="subject-icon">{subjectConfig?.icon || '📚'}</span>
                        <span className="subject-name">{subject.subject_name}</span>
                        <span className="coverage-badge">{subject.coverage}</span>
                      </div>
                      <ul className="topic-list">
                        {subject.topics.map((topic, topicIndex) => (
                          <li key={topicIndex}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Rationale */}
        <div className="rationale-section">
          <h3>{t.rationale}</h3>
          <p>{rationale}</p>
        </div>
        
        <div className="navigation">
          <button className="btn-secondary" onClick={() => setCurrentStep(3)}>
            {t.back}
          </button>
          <button 
            className="btn-primary" 
            onClick={() => setCurrentStep(5)}
          >
            {t.next}
          </button>
        </div>
      </div>
    );
  };

  // Step 5: Review & Save
  const renderReviewSave = () => {
    if (!apiResponse) {
      return (
        <div className="step-content">
          <div className="error-message">No data available</div>
        </div>
      );
    }

    const { weekly_plan } = apiResponse;

    return (
      <div className="step-content">
        <h2>{t.step5}</h2>
        
        <div className="review-summary">
          <div className="summary-item">
            <strong>Grade:</strong> {selectedGrade}
          </div>
          <div className="summary-item">
            <strong>Subjects:</strong> {selectedSubjects.map(s => s.name).join(', ')}
          </div>
          <div className="summary-item">
            <strong>Chapters:</strong> {Object.values(chapterData).join(', ')}
          </div>
        </div>
        
        <div className="weekly-preview">
          <h3>{t.dayWiseBreakdown}</h3>
          
          <div className="days-grid">
            {Object.entries(weekly_plan).map(([day, dayData]) => (
              <div key={day} className="day-preview">
                <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                
                {dayData.subjects.map((subject, index) => {
                  const subjectConfig = selectedSubjects.find(s => s.name === subject.subject_name);
                  return (
                    <div 
                      key={index} 
                      className="subject-day" 
                      style={{ borderLeft: `4px solid ${subjectConfig?.color || '#ccc'}` }}
                    >
                      <div className="subject-title">
                        <span className="subject-icon-small">{subjectConfig?.icon || '📚'}</span>
                        <span>{subject.subject_name}</span>
                      </div>
                      <ul className="topic-list">
                        {subject.topics.map((topic, topicIndex) => (
                          <li key={topicIndex}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="btn-primary" onClick={handleSavePlan}>
            {t.save}
          </button>
          <button className="btn-outline" onClick={handleDownloadPDF}>
            {t.download}
          </button>
          <button className="btn-secondary" onClick={() => setCurrentStep(1)}>
            {t.edit}
          </button>
        </div>
      </div>
    );
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderGradeSelection();
      case 2: return renderSubjectSelection();
      case 3: return renderChapterInput();
      case 4: return renderAIDistribution();
      case 5: return renderReviewSave();
      default: return renderGradeSelection();
    }
  };

  return (
    <div className="rural-teacher-planner">
      <header className="app-header">
        <h1>{t.title}</h1>
        <div className="language-toggle">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="english">English</option>
            <option value="hindi">हिन्दी</option>
            <option value="marathi">मराठी</option>
          </select>
        </div>
      </header>
      
      {renderStepIndicator()}
      {renderCurrentStep()}
      
      <style jsx>{`
        .rural-teacher-planner {
          max-width: 100%;
          margin: 0 auto;
          padding: 16px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
          min-height: 100vh;
        }
        
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .app-header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.5rem;
        }
        
        .language-toggle select {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
          background-color: white;
          font-size: 0.9rem;
        }
        
        .step-indicator {
          display: flex;
          justify-content: space-between;
          margin-bottom: 32px;
          overflow-x: auto;
        }
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          min-width: 80px;
          cursor: pointer;
        }
        
        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          font-weight: bold;
          color: #757575;
        }
        
        .step.active .step-number {
          background-color: #4CAF50;
          color: white;
        }
        
        .step.completed .step-number {
          background-color: #8BC34A;
          color: white;
        }
        
        .step-label {
          font-size: 0.75rem;
          text-align: center;
          color: #757575;
        }
        
        .step.active .step-label {
          color: #4CAF50;
          font-weight: bold;
        }
        
        .step-content {
          background-color: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .step-content h2 {
          margin-top: 0;
          color: #2c3e50;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 12px;
        }
        
        .grade-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
          margin: 24px 0;
        }
        
        .grade-card {
          padding: 16px 8px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background-color: white;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .grade-card.selected {
          border-color: #4CAF50;
          background-color: #E8F5E9;
          color: #2E7D32;
        }
        
        .subject-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
          margin: 24px 0;
        }
        
        .subject-card {
          padding: 16px 8px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .subject-card.selected {
          border-color: #4CAF50;
          transform: scale(1.05);
        }
        
        .subject-icon {
          font-size: 2rem;
          margin-bottom: 8px;
        }
        
        .subject-name {
          font-weight: bold;
          font-size: 0.9rem;
        }
        
        .custom-subject {
          margin: 24px 0;
          padding: 16px;
          border: 1px dashed #ccc;
          border-radius: 8px;
        }
        
        .custom-input {
          display: flex;
          gap: 8px;
        }
        
        .custom-input input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        
        .custom-input button {
          padding: 10px 16px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .selected-subjects {
          margin: 24px 0;
        }
        
        .selected-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .selected-tag {
          padding: 8px 12px;
          background-color: #E3F2FD;
          border-radius: 20px;
          font-size: 0.9rem;
        }
        
        .chapter-input {
          margin-bottom: 24px;
          padding: 16px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        
        .chapter-input-field {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-family: inherit;
          font-size: 1rem;
        }
        
        .ai-info {
          background-color: #E3F2FD;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #2196F3;
          margin: 16px 0;
        }
        
        .error-message {
          background-color: #FFEBEE;
          color: #C62828;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #F44336;
          margin: 16px 0;
        }
        
        .loading-spinner {
          text-align: center;
          padding: 24px;
        }
        
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4CAF50;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 2s linear infinite;
          margin: 0 auto 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .success-message {
          background-color: #E8F5E9;
          color: #2E7D32;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #4CAF50;
          margin: 16px 0;
        }
        
        .topic-breakdown {
          margin: 24px 0;
        }
        
        .subject-breakdown {
          margin-bottom: 20px;
          padding: 16px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        
        .subject-breakdown h4 {
          margin: 0 0 12px 0;
          color: #2c3e50;
        }
        
        .subject-breakdown ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .subject-breakdown li {
          margin-bottom: 8px;
          line-height: 1.4;
        }
        
        .weekly-plan {
          margin: 24px 0;
        }
        
        .day-plan {
          margin-bottom: 24px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .day-header {
          padding: 16px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .day-header h4 {
          margin: 0;
          color: #2c3e50;
        }
        
        .day-subjects {
          padding: 16px;
        }
        
        .subject-slot {
          margin-bottom: 16px;
          padding: 12px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        
        .subject-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .coverage-badge {
          margin-left: auto;
          background-color: #4CAF50;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
        }
        
        .topic-list {
          margin: 0;
          padding-left: 20px;
          font-size: 0.9rem;
        }
        
        .topic-list li {
          margin-bottom: 4px;
        }
        
        .rationale-section {
          background-color: #FFF3E0;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #FF9800;
          margin: 24px 0;
        }
        
        .review-summary {
          background-color: #f9f9f9;
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }
        
        .summary-item {
          margin-bottom: 8px;
        }
        
        .weekly-preview {
          margin: 24px 0;
        }
        
        .days-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }
        
        .day-preview {
          background-color: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
        }
        
        .day-preview h4 {
          margin: 0 0 16px 0;
          color: #2c3e50;
          border-bottom: 2px solid #4CAF50;
          padding-bottom: 8px;
        }
        
        .subject-day {
          margin-bottom: 16px;
          padding: 12px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        
        .subject-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .subject-icon-small {
          font-size: 1.2rem;
        }
        
        .action-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 32px;
        }
        
        .navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 32px;
        }
        
        .btn-primary {
          padding: 12px 24px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: bold;
        }
        
        .btn-primary:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          padding: 12px 24px;
          background-color: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .btn-outline {
          padding: 12px 24px;
          background-color: white;
          border: 1px solid #4CAF50;
          color: #4CAF50;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .rural-teacher-planner {
            padding: 12px;
          }
          
          .app-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
          
          .step-indicator {
            gap: 4px;
          }
          
          .step-label {
            font-size: 0.7rem;
          }
          
          .grade-grid {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          }
          
          .subject-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          }
          
          .days-grid {
            grid-template-columns: 1fr;
          }
          
          .navigation {
            flex-direction: column;
            gap: 12px;
          }
          
          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default RuralTeacherPlanner;