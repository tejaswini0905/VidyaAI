import React, { useState } from 'react';

const PaperEvaluationSystem = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [questionPaper, setQuestionPaper] = useState({
    title: '',
    paper: null
  });
  const [evaluationData, setEvaluationData] = useState({
    question_paper_id: '',
    student_name: '',
    grade: '',
    answer_sheet: null
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle question paper upload
  const handlePaperUpload = async (e) => {
    e.preventDefault();
    if (!questionPaper.title || !questionPaper.paper) {
      setMessage('Please provide both title and question paper file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', questionPaper.title);
    formData.append('paper', questionPaper.paper);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/assessment/upload-paper/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Question paper uploaded successfully!');
        setQuestionPaper({ title: '', paper: null });
        setEvaluationData(prev => ({
          ...prev,
          question_paper_id: data.paper_id
        }));
        setActiveTab('evaluate');
      } else {
        setMessage(data.error || 'Upload failed');
      }
    } catch (error) {
      setMessage('Error uploading paper');
    } finally {
      setLoading(false);
    }
  };

  // Handle answer sheet evaluation
  const handleEvaluation = async (e) => {
    e.preventDefault();
    if (!evaluationData.question_paper_id || !evaluationData.student_name || 
        !evaluationData.grade || !evaluationData.answer_sheet) {
      setMessage('Please fill all fields');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('question_paper_id', evaluationData.question_paper_id);
    formData.append('student_name', evaluationData.student_name);
    formData.append('grade', evaluationData.grade);
    formData.append('answer_sheet', evaluationData.answer_sheet);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/assessment/check-paper/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        setMessage('Evaluation completed successfully!');
        setEvaluationData({
          question_paper_id: '',
          student_name: '',
          grade: '',
          answer_sheet: null
        });
      } else {
        setMessage(data.error || 'Evaluation failed');
      }
    } catch (error) {
      setMessage('Error evaluating paper');
    } finally {
      setLoading(false);
    }
  };

  // File input handler
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (field === 'paper') {
      setQuestionPaper(prev => ({ ...prev, paper: file }));
    } else {
      setEvaluationData(prev => ({ ...prev, answer_sheet: file }));
    }
  };

  // Input change handler
  const handleInputChange = (e, form) => {
    const { name, value } = e.target;
    if (form === 'paper') {
      setQuestionPaper(prev => ({ ...prev, [name]: value }));
    } else {
      setEvaluationData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div style={styles.container}>
      {/* Header with Blue Gradient */}
      <a
        href="/teacher"
        className="fixed top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-md"
      >
        Home
      </a>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Paper Evaluation System</h1>
          <p style={styles.subtitle}>AI-powered answer sheet evaluation</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Navigation Tabs */}
        <div style={styles.tabContainer}>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'upload' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('upload')}
          >
            📄 Upload Question Paper
          </button>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'evaluate' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('evaluate')}
          >
            ✏️ Evaluate Answer Sheet
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div style={{
            ...styles.message,
            ...(message.includes('success') ? styles.successMessage : styles.errorMessage)
          }}>
            {message}
          </div>
        )}

        <div style={styles.content}>
          {/* Upload Question Paper Form */}
          {activeTab === 'upload' && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Upload Question Paper</h2>
              <form onSubmit={handlePaperUpload} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Paper Title</label>
                  <input
                    type="text"
                    name="title"
                    value={questionPaper.title}
                    onChange={(e) => handleInputChange(e, 'paper')}
                    style={styles.input}
                    placeholder="Enter paper title"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Question Paper File</label>
                  <div style={styles.fileUpload}>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'paper')}
                      style={styles.fileInput}
                    />
                    <div style={styles.fileLabel}>
                      {questionPaper.paper ? questionPaper.paper.name : 'Choose file...'}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  style={styles.primaryButton}
                  disabled={loading}
                >
                  {loading ? '📤 Uploading...' : '📤 Upload Paper'}
                </button>
              </form>
            </div>
          )}

          {/* Evaluate Answer Sheet Form */}
          {activeTab === 'evaluate' && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Evaluate Answer Sheet</h2>
              <form onSubmit={handleEvaluation} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Question Paper ID</label>
                  <input
                    type="text"
                    name="question_paper_id"
                    value={evaluationData.question_paper_id}
                    onChange={(e) => handleInputChange(e, 'evaluate')}
                    style={styles.input}
                    placeholder="Enter paper ID from upload"
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Student Name</label>
                    <input
                      type="text"
                      name="student_name"
                      value={evaluationData.student_name}
                      onChange={(e) => handleInputChange(e, 'evaluate')}
                      style={styles.input}
                      placeholder="Student name"
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Grade</label>
                    <input
                      type="text"
                      name="grade"
                      value={evaluationData.grade}
                      onChange={(e) => handleInputChange(e, 'evaluate')}
                      style={styles.input}
                      placeholder="Grade/Class"
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Answer Sheet File</label>
                  <div style={styles.fileUpload}>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'answer_sheet')}
                      style={styles.fileInput}
                    />
                    <div style={styles.fileLabel}>
                      {evaluationData.answer_sheet ? evaluationData.answer_sheet.name : 'Choose answer sheet...'}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  style={styles.primaryButton}
                  disabled={loading}
                >
                  {loading ? '⏳ Evaluating...' : '✅ Evaluate Paper'}
                </button>
              </form>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Evaluation Results</h2>
              <div style={styles.resultGrid}>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Student</span>
                  <span style={styles.resultValue}>{result.student}</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Grade</span>
                  <span style={styles.resultValue}>{result.grade}</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Total Marks</span>
                  <span style={styles.resultValue}>
                    {result.total_marks} / {result.max_possible_marks}
                  </span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Percentage</span>
                  <span style={styles.resultValue}>
                    {((result.total_marks / result.max_possible_marks) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Feedback Section */}
              <div style={styles.feedbackSection}>
                <h3 style={styles.feedbackTitle}>Feedback</h3>
                <div style={styles.feedbackList}>
                  {result.feedback && result.feedback.map((item, index) => (
                    <div key={index} style={styles.feedbackItem}>
                      <span style={styles.feedbackNumber}>Q{index + 1}</span>
                      <span style={styles.feedbackText}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Full Page Blue & White Theme Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
    padding: '40px 0',
    color: 'white',
    textAlign: 'center'
  },
  headerContent: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: '0 0 12px 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  subtitle: {
    fontSize: '1.2rem',
    fontWeight: '400',
    margin: '0',
    opacity: '0.9'
  },
  mainContent: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    borderRadius: '12px',
    padding: '6px',
    marginBottom: '32px',
    border: '1px solid #e2e8f0'
  },
  tab: {
    flex: 1,
    padding: '16px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    color: '#64748b',
    transition: 'all 0.3s ease',
    border: '2px solid transparent'
  },
  activeTab: {
    backgroundColor: '#ffffff',
    color: '#1e40af',
    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.15)',
    border: '2px solid #3b82f6'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 28px 0',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  label: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151'
  },
  input: {
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    backgroundColor: '#ffffff',
    transition: 'all 0.3s ease'
  },
  fileUpload: {
    position: 'relative',
    display: 'inline-block',
    width: '100%'
  },
  fileInput: {
    position: 'absolute',
    left: '0',
    top: '0',
    opacity: '0',
    width: '100%',
    height: '100%',
    cursor: 'pointer'
  },
  fileLabel: {
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    backgroundColor: '#ffffff',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  primaryButton: {
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '16px',
    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)'
  },
  message: {
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    fontSize: '16px',
    fontWeight: '500',
    textAlign: 'center',
    border: '2px solid transparent'
  },
  successMessage: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    borderColor: '#bbf7d0'
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    borderColor: '#fecaca'
  },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '32px'
  },
  resultItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    textAlign: 'center'
  },
  resultLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  resultValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b'
  },
  feedbackSection: {
    borderTop: '2px solid #f1f5f9',
    paddingTop: '32px'
  },
  feedbackTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 20px 0',
    textAlign: 'center'
  },
  feedbackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  feedbackItem: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    borderLeft: '4px solid #3b82f6',
    alignItems: 'flex-start'
  },
  feedbackNumber: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#3b82f6',
    minWidth: '35px',
    padding: '4px 8px',
    backgroundColor: '#dbeafe',
    borderRadius: '6px',
    textAlign: 'center'
  },
  feedbackText: {
    fontSize: '15px',
    color: '#475569',
    lineHeight: '1.5',
    flex: 1
  }
};

export default PaperEvaluationSystem;