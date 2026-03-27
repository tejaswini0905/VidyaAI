import React, { useState, useEffect } from 'react';

const ActivitiesDashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paperDetails, setPaperDetails] = useState(null);
  const [loadingPaperDetails, setLoadingPaperDetails] = useState(false);
  const [diagrams, setDiagrams] = useState([]);
  const [loadingDiagrams, setLoadingDiagrams] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState(null);

  // API Base URLs
  const ASSESSMENT_API_BASE_URL = 'http://127.0.0.1:8000/api/v1/assessment';
  const VISUAL_API_BASE_URL = 'http://127.0.0.1:8000/api/v1/visual';

  // Fetch all checked answer sheets from backend
  const fetchCheckedAnswerSheets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${ASSESSMENT_API_BASE_URL}/get-paper/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch checked answer sheets');
      }
      
      const data = await response.json();
      
      if (data.message && data.data) {
        // Transform API response to match our activity format
        const transformedActivities = data.data.map((sheet, index) => ({
          id: sheet.answer_sheet_id,
          type: 'paper_checked',
          title: `Answer Sheet - ${sheet.student_name}`,
          description: `Evaluated answer sheet for ${sheet.question_paper_title}`,
          date: sheet.checked_at?.split(' ')[0] || '2024-01-01',
          time: sheet.checked_at?.split(' ')[1] || '12:00',
          status: 'completed',
          metrics: {
            student_name: sheet.student_name,
            grade: sheet.grade,
            marks_obtained: sheet.marks_obtained,
            paper_title: sheet.question_paper_title
          },
          details: {
            subject: sheet.question_paper_title,
            class: `Grade ${sheet.grade}`,
            uploaded_by: sheet.uploaded_by,
            checked_at: sheet.checked_at,
            answer_sheet_url: sheet.answer_sheet_url
          },
          answer_sheet_id: sheet.answer_sheet_id,
          extracted_text_preview: sheet.extracted_text_preview
        }));
        
        setActivities(transformedActivities);
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (err) {
      console.error('Error fetching checked answer sheets:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all created diagrams from backend
  const fetchDiagrams = async () => {
    try {
      setLoadingDiagrams(true);
      const response = await fetch(`${VISUAL_API_BASE_URL}/get-diagrams/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch diagrams');
      }
      
      const data = await response.json();
      
      if (data.message && data.data) {
        // Transform API response to match our activity format
        const transformedDiagrams = data.data.map((diagram, index) => ({
          id: diagram.id,
          type: 'diagram_generated',
          title: `Diagram ${diagram.id}`,
          description: `Educational diagram created by ${diagram.uploaded_by}`,
          date: new Date().toISOString().split('T')[0], // Use current date since API doesn't provide date
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'completed',
          metrics: {
            uploaded_by: diagram.uploaded_by,
            diagram_id: diagram.id
          },
          details: {
            uploaded_by: diagram.uploaded_by,
            image_url: diagram.image_url
          },
          image_url: diagram.image_url,
          uploaded_by: diagram.uploaded_by
        }));
        
        setDiagrams(transformedDiagrams);
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (err) {
      console.error('Error fetching diagrams:', err);
      setDiagrams([]);
    } finally {
      setLoadingDiagrams(false);
    }
  };

  // Fetch detailed answer sheet information
  const fetchAnswerSheetDetails = async (answerSheetId) => {
    try {
      setLoadingPaperDetails(true);
      const response = await fetch(`${ASSESSMENT_API_BASE_URL}/get-checked-answer-sheet/${answerSheetId}/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch answer sheet details');
      }
      
      const data = await response.json();
      setPaperDetails(data);
      return data;
    } catch (err) {
      console.error('Error fetching answer sheet details:', err);
      const sheet = activities.find(a => a.answer_sheet_id === answerSheetId);
      if (sheet) {
        setPaperDetails({
          message: "Answer sheet details",
          data: sheet
        });
      }
      return null;
    } finally {
      setLoadingPaperDetails(false);
    }
  };

  // Initialize activities and diagrams
  useEffect(() => {
    fetchCheckedAnswerSheets();
    fetchDiagrams();
  }, []);

  // Get activity type display info
  const getActivityTypeInfo = (type) => {
    const typeInfo = {
      paper_checked: { 
        label: 'Papers Checked', 
        icon: '📝', 
        color: '#3B82F6',
        description: 'Answer sheets evaluated and graded'
      },
      worksheet_generated: { 
        label: 'Worksheets Generated', 
        icon: '📄', 
        color: '#10B981',
        description: 'Practice sheets and question papers created'
      },
      diagram_generated: { 
        label: 'Diagrams Created', 
        icon: '🔬', 
        color: '#8B5CF6',
        description: 'Educational diagrams and visual aids'
      }
    };
    return typeInfo[type] || { label: 'Activity', icon: '📋', color: '#6B7280', description: 'Teaching activity' };
  };

  // Get activities by type
  const getActivitiesByType = (type) => {
    if (type === 'diagram_generated') {
      return diagrams;
    }
    return activities.filter(activity => activity.type === type);
  };

  // Get activity type statistics
  const getActivityTypeStats = () => {
    const types = ['paper_checked', 'worksheet_generated', 'diagram_generated'];
    return types.map(type => {
      const typeActivities = getActivitiesByType(type);
      const typeInfo = getActivityTypeInfo(type);
      
      return {
        type,
        count: typeActivities.length,
        label: typeInfo.label,
        icon: typeInfo.icon,
        color: typeInfo.color,
        description: typeInfo.description,
        recentActivity: typeActivities[0] // Most recent activity
      };
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Get HH:MM format
  };

  // Handle activity type card click
  const handleActivityTypeClick = async (type) => {
    if (type === 'paper_checked') {
      setLoading(true);
      await fetchCheckedAnswerSheets();
      setLoading(false);
    } else if (type === 'diagram_generated') {
      setLoading(true);
      await fetchDiagrams();
      setLoading(false);
    }
    setSelectedActivityType(type);
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setSelectedActivityType(null);
    setPaperDetails(null);
    setSelectedDiagram(null);
  };

  // Handle individual answer sheet click to see detailed view
  const handleAnswerSheetClick = async (activity) => {
    if (activity.answer_sheet_id) {
      await fetchAnswerSheetDetails(activity.answer_sheet_id);
    }
  };

  // Handle individual diagram click to see detailed view
  const handleDiagramClick = (diagram) => {
    setSelectedDiagram(diagram);
  };

  // Stats data based on actual API data
  const stats = [
    {
      label: 'Total Papers Checked',
      value: getActivitiesByType('paper_checked').length.toString(),
      change: '+0%',
      icon: '📝',
      color: '#3B82F6'
    },
    {
      label: 'Students Evaluated',
      value: activities.length.toString(),
      change: '+0%',
      icon: '👨‍🎓',
      color: '#F59E0B'
    },
    {
      label: 'Diagrams Created',
      value: diagrams.length.toString(),
      change: '+0%',
      icon: '🔬',
      color: '#8B5CF6'
    },
    {
      label: 'Different Papers',
      value: [...new Set(activities.map(a => a.metrics.paper_title))].length.toString(),
      change: '+0%',
      icon: '📑',
      color: '#10B981'
    }
  ];

  // If diagram details are loaded, show detailed diagram view
  if (selectedDiagram) {
    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <button onClick={handleBackToDashboard} style={styles.backButton}>
              ← Back to Diagrams
            </button>
            <h1 style={styles.title}>Diagram Details</h1>
            <p style={styles.subtitle}>Educational visual aid created by {selectedDiagram.uploaded_by}</p>
          </div>
        </div>

        <div style={styles.mainContent}>
          {/* Diagram Summary */}
          <div style={styles.diagramSummary}>
            <div style={styles.diagramSummaryCard}>
              <div style={styles.diagramSummaryIcon}>
                <span style={{ fontSize: '48px' }}>🔬</span>
              </div>
              <div style={styles.diagramSummaryContent}>
                <h2 style={styles.diagramSummaryTitle}>Diagram {selectedDiagram.id}</h2>
                <p style={styles.diagramSummaryDescription}>
                  Created by {selectedDiagram.uploaded_by}
                </p>
                <div style={styles.diagramStats}>
                  <div style={styles.diagramStat}>
                    <span style={styles.diagramStatValue}>#{selectedDiagram.id}</span>
                    <span style={styles.diagramStatLabel}>Diagram ID</span>
                  </div>
                  <div style={styles.diagramStat}>
                    <span style={styles.diagramStatValue}>{selectedDiagram.uploaded_by}</span>
                    <span style={styles.diagramStatLabel}>Created By</span>
                  </div>
                  <div style={styles.diagramStat}>
                    <span style={styles.diagramStatValue}>
                      {formatDate(selectedDiagram.date)} at {formatTime(selectedDiagram.time)}
                    </span>
                    <span style={styles.diagramStatLabel}>Created On</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Diagram Content */}
          <div style={styles.diagramSection}>
            <h2 style={styles.sectionTitle}>Diagram Preview</h2>
            
            <div style={styles.diagramContent}>
              <div style={styles.diagramCard}>
                <div style={styles.diagramHeader}>
                  <h3 style={styles.diagramTitle}>
                    Educational Diagram
                  </h3>
                  <div style={styles.diagramBadge}>
                    <span style={styles.diagramType}>Visual Aid</span>
                  </div>
                </div>

                <div style={styles.diagramDetails}>
                  <div style={styles.detailGrid}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Diagram ID:</span>
                      <span style={styles.detailValue}>{selectedDiagram.id}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Created By:</span>
                      <span style={styles.detailValue}>{selectedDiagram.uploaded_by}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Created On:</span>
                      <span style={styles.detailValue}>
                        {formatDate(selectedDiagram.date)} at {formatTime(selectedDiagram.time)}
                      </span>
                    </div>
                  </div>

                  {/* Diagram Image */}
                  <div style={styles.diagramImageSection}>
                    <h4 style={styles.sectionSubtitle}>Diagram Preview</h4>
                    {selectedDiagram.image_url ? (
                      <div style={styles.imageContainer}>
                        <img 
                          src={selectedDiagram.image_url} 
                          alt={`Diagram ${selectedDiagram.id}`}
                          style={styles.diagramImage}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div style={styles.imageFallback}>
                          <span style={styles.fallbackIcon}>🖼️</span>
                          <p style={styles.fallbackText}>
                            <a 
                              href={selectedDiagram.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={styles.downloadLink}
                            >
                              View Diagram
                            </a>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.noImage}>
                        <span style={styles.noImageIcon}>🖼️</span>
                        <p style={styles.noImageText}>No diagram image available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If paper details are loaded, show detailed answer sheet view
  if (paperDetails) {
    const sheetData = paperDetails.data;
    
    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <button onClick={handleBackToDashboard} style={styles.backButton}>
              ← Back to Papers
            </button>
            <h1 style={styles.title}>Answer Sheet Details</h1>
            <p style={styles.subtitle}>Detailed evaluation results</p>
          </div>
        </div>

        <div style={styles.mainContent}>
          {loadingPaperDetails ? (
            <div style={styles.loadingState}>
              <div style={styles.loadingSpinner}></div>
              <p>Loading answer sheet details...</p>
            </div>
          ) : (
            <>
              {/* Answer Sheet Summary */}
              <div style={styles.paperSummary}>
                <div style={styles.paperSummaryCard}>
                  <div style={styles.paperSummaryIcon}>
                    <span style={{ fontSize: '48px' }}>📝</span>
                  </div>
                  <div style={styles.paperSummaryContent}>
                    <h2 style={styles.paperSummaryTitle}>{sheetData.metrics?.paper_title || sheetData.title}</h2>
                    <p style={styles.paperSummaryDescription}>
                      Evaluated for {sheetData.metrics?.student_name} • Grade {sheetData.metrics?.grade}
                    </p>
                    <div style={styles.paperStats}>
                      <div style={styles.paperStat}>
                        <span style={styles.paperStatValue}>{sheetData.metrics?.marks_obtained || 0}</span>
                        <span style={styles.paperStatLabel}>Marks Obtained</span>
                      </div>
                      <div style={styles.paperStat}>
                        <span style={styles.paperStatValue}>{sheetData.metrics?.grade}</span>
                        <span style={styles.paperStatLabel}>Grade</span>
                      </div>
                      <div style={styles.paperStat}>
                        <span style={styles.paperStatValue}>
                          {formatDate(sheetData.date)} at {formatTime(sheetData.time)}
                        </span>
                        <span style={styles.paperStatLabel}>Checked On</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Answer Sheet Content */}
              <div style={styles.submissionsSection}>
                <h2 style={styles.sectionTitle}>Answer Sheet Content</h2>
                
                <div style={styles.answerSheetContent}>
                  <div style={styles.answerSheetCard}>
                    <div style={styles.answerSheetHeader}>
                      <h3 style={styles.answerSheetTitle}>
                        {sheetData.metrics?.student_name}'s Answer Sheet
                      </h3>
                      <div style={styles.marksBadge}>
                        <span style={styles.marksValue}>{sheetData.metrics?.marks_obtained || 0}</span>
                        <span style={styles.marksLabel}>Marks</span>
                      </div>
                    </div>

                    <div style={styles.answerSheetDetails}>
                      <div style={styles.detailGrid}>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Student Name:</span>
                          <span style={styles.detailValue}>{sheetData.metrics?.student_name}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Grade:</span>
                          <span style={styles.detailValue}>{sheetData.metrics?.grade}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Paper Title:</span>
                          <span style={styles.detailValue}>{sheetData.metrics?.paper_title}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Uploaded By:</span>
                          <span style={styles.detailValue}>{sheetData.details?.uploaded_by}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Checked At:</span>
                          <span style={styles.detailValue}>
                            {sheetData.details?.checked_at || `${sheetData.date} ${sheetData.time}`}
                          </span>
                        </div>
                      </div>

                      {/* Answer Sheet Image */}
                      <div style={styles.answerSheetImageSection}>
                        <h4 style={styles.sectionSubtitle}>Answer Sheet Image</h4>
                        {sheetData.details?.answer_sheet_url ? (
                          <div style={styles.imageContainer}>
                            <img 
                              src={`http://127.0.0.1:8000${sheetData.details.answer_sheet_url}`} 
                              alt="Answer Sheet"
                              style={styles.answerSheetImage}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div style={styles.imageFallback}>
                              <span style={styles.fallbackIcon}>📄</span>
                              <p style={styles.fallbackText}>
                                <a 
                                  href={`http://127.0.0.1:8000${sheetData.details.answer_sheet_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={styles.downloadLink}
                                >
                                  View Answer Sheet
                                </a>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div style={styles.noImage}>
                            <span style={styles.noImageIcon}>🖼️</span>
                            <p style={styles.noImageText}>No answer sheet image available</p>
                          </div>
                        )}
                      </div>

                      {/* Extracted Text */}
                      {sheetData.extracted_text_preview && (
                        <div style={styles.extractedTextSection}>
                          <h4 style={styles.sectionSubtitle}>Extracted Text Preview</h4>
                          <div style={styles.textPreviewContainer}>
                            <p style={styles.extractedText}>
                              {sheetData.extracted_text_preview.length > 500 
                                ? sheetData.extracted_text_preview.substring(0, 500) + '...'
                                : sheetData.extracted_text_preview
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // If an activity type is selected, show all activities of that type
  if (selectedActivityType) {
    const typeActivities = getActivitiesByType(selectedActivityType);
    const typeInfo = getActivityTypeInfo(selectedActivityType);

    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <button onClick={handleBackToDashboard} style={styles.backButton}>
              ← Back to Dashboard
            </button>
            <h1 style={styles.title}>{typeInfo.label}</h1>
            <p style={styles.subtitle}>{typeInfo.description}</p>
          </div>
        </div>

        <div style={styles.mainContent}>
          {loading ? (
            <div style={styles.loadingState}>
              <div style={styles.loadingSpinner}></div>
              <p>Loading activities...</p>
            </div>
          ) : (
            <>
              {/* Type Summary */}
              <div style={styles.typeSummary}>
                <div style={{
                  ...styles.typeSummaryCard,
                  backgroundColor: `${typeInfo.color}20`,
                  borderColor: typeInfo.color
                }}>
                  <div style={styles.typeSummaryIcon}>
                    <span style={{ fontSize: '48px' }}>{typeInfo.icon}</span>
                  </div>
                  <div style={styles.typeSummaryContent}>
                    <h2 style={styles.typeSummaryTitle}>{typeActivities.length} {typeInfo.label}</h2>
                    <p style={styles.typeSummaryDescription}>
                      Total {typeInfo.label.toLowerCase()} in your teaching activities
                    </p>
                  </div>
                </div>
              </div>

              {/* Activities List */}
              <div style={styles.activitiesSection}>
                <h2 style={styles.sectionTitle}>All {typeInfo.label}</h2>
                
                {typeActivities.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>{typeInfo.icon}</div>
                    <h3 style={styles.emptyTitle}>No {typeInfo.label.toLowerCase()} found</h3>
                    <p style={styles.emptyText}>
                      {typeInfo.type === 'paper_checked' 
                        ? "No answer sheets have been checked yet."
                        : typeInfo.type === 'diagram_generated'
                        ? "No diagrams have been created yet."
                        : `You haven't completed any ${typeInfo.label.toLowerCase()} yet.`
                      }
                    </p>
                  </div>
                ) : (
                  <div style={styles.activitiesGrid}>
                    {typeActivities.map(activity => (
                      <div 
                        key={activity.id} 
                        style={{
                          ...styles.activityCard,
                          cursor: activity.type === 'paper_checked' || activity.type === 'diagram_generated' ? 'pointer' : 'default'
                        }}
                        onClick={() => {
                          if (activity.type === 'paper_checked') {
                            handleAnswerSheetClick(activity);
                          } else if (activity.type === 'diagram_generated') {
                            handleDiagramClick(activity);
                          }
                        }}
                      >
                        <div style={styles.activityHeader}>
                          <div style={{
                            ...styles.activityType,
                            backgroundColor: `${typeInfo.color}20`,
                            color: typeInfo.color
                          }}>
                            <span style={styles.typeIcon}>{typeInfo.icon}</span>
                            {typeInfo.label}
                          </div>
                          <div style={styles.activityDate}>
                            {formatDate(activity.date)} • {formatTime(activity.time)}
                          </div>
                        </div>

                        <h3 style={styles.activityTitle}>{activity.title}</h3>
                        <p style={styles.activityDescription}>{activity.description}</p>

                        {activity.type === 'diagram_generated' && activity.image_url && (
                          <div style={styles.diagramPreview}>
                            <img 
                              src={activity.image_url} 
                              alt="Diagram Preview"
                              style={styles.diagramPreviewImage}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        <div style={styles.metrics}>
                          {activity.type === 'paper_checked' ? (
                            <>
                              <div style={styles.metric}>
                                <span style={styles.metricValue}>{activity.metrics.marks_obtained}</span>
                                <span style={styles.metricLabel}>Marks</span>
                              </div>
                              <div style={styles.metric}>
                                <span style={styles.metricValue}>{activity.metrics.grade}</span>
                                <span style={styles.metricLabel}>Grade</span>
                              </div>
                              <div style={styles.metric}>
                                <span style={styles.metricValue}>{activity.metrics.student_name}</span>
                                <span style={styles.metricLabel}>Student</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={styles.metric}>
                                <span style={styles.metricValue}>#{activity.id}</span>
                                <span style={styles.metricLabel}>Diagram ID</span>
                              </div>
                              <div style={styles.metric}>
                                <span style={styles.metricValue}>{activity.uploaded_by}</span>
                                <span style={styles.metricLabel}>Created By</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Detailed Information */}
                        <div style={styles.detailsSection}>
                          <h4 style={styles.detailsTitle}>
                            {activity.type === 'paper_checked' ? 'Paper Details' : 'Diagram Details'}
                          </h4>
                          <div style={styles.detailsGrid}>
                            {activity.type === 'paper_checked' ? (
                              <>
                                <div style={styles.detailItem}>
                                  <span style={styles.detailLabel}>Paper Title:</span>
                                  <span style={styles.detailValue}>{activity.metrics.paper_title}</span>
                                </div>
                                <div style={styles.detailItem}>
                                  <span style={styles.detailLabel}>Uploaded By:</span>
                                  <span style={styles.detailValue}>{activity.details.uploaded_by}</span>
                                </div>
                                <div style={styles.detailItem}>
                                  <span style={styles.detailLabel}>Checked At:</span>
                                  <span style={styles.detailValue}>{activity.details.checked_at}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={styles.detailItem}>
                                  <span style={styles.detailLabel}>Diagram ID:</span>
                                  <span style={styles.detailValue}>{activity.id}</span>
                                </div>
                                <div style={styles.detailItem}>
                                  <span style={styles.detailLabel}>Created By:</span>
                                  <span style={styles.detailValue}>{activity.uploaded_by}</span>
                                </div>
                                <div style={styles.detailItem}>
                                  <span style={styles.detailLabel}>Image URL:</span>
                                  <span style={styles.detailValue}>
                                    <a 
                                      href={activity.image_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      style={styles.link}
                                    >
                                      View Diagram
                                    </a>
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div style={styles.activityFooter}>
                          <span style={{
                            ...styles.status,
                            ...(activity.status === 'completed' ? styles.statusCompleted : {})
                          }}>
                            {activity.status === 'completed' ? '✅ Completed' : '🔄 In Progress'}
                          </span>
                          {(activity.type === 'paper_checked' || activity.type === 'diagram_generated') && (
                            <div style={styles.clickHint}>
                              Click to view details →
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Main dashboard view
  const activityTypeStats = getActivityTypeStats();

  return (
    <div style={styles.container}>
      <a
        href="/teacher"
        style={styles.homeButton}
      >
        Home
      </a>
      
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>My Activities Dashboard</h1>
          <p style={styles.subtitle}>Overview of your teaching activities and evaluated answer sheets</p>
        </div>
      </div>

      <div style={styles.mainContent}>
        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner}></div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div key={index} style={styles.statCard}>
                  <div style={{ ...styles.statIcon, backgroundColor: `${stat.color}20` }}>
                    <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                  </div>
                  <div style={styles.statContent}>
                    <h3 style={styles.statValue}>{stat.value}</h3>
                    <p style={styles.statLabel}>{stat.label}</p>
                    <span style={{ ...styles.statChange, color: stat.change.startsWith('+') ? '#10B981' : '#EF4444' }}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Type Cards */}
            <div style={styles.activityTypesSection}>
              <h2 style={styles.sectionTitle}>Your Activities</h2>
              <p style={styles.sectionSubtitle}>Click on any card to view all activities of that type</p>
              
              <div style={styles.activityTypesGrid}>
                {activityTypeStats.map((typeStat, index) => (
                  <div 
                    key={typeStat.type}
                    style={{
                      ...styles.activityTypeCard,
                      borderColor: typeStat.color,
                      cursor: typeStat.type === 'paper_checked' || typeStat.type === 'diagram_generated' ? 'pointer' : 'default',
                      opacity: typeStat.type !== 'paper_checked' && typeStat.type !== 'diagram_generated' ? 0.6 : 1
                    }}
                    onClick={() => (typeStat.type === 'paper_checked' || typeStat.type === 'diagram_generated') && handleActivityTypeClick(typeStat.type)}
                  >
                    <div style={styles.activityTypeHeader}>
                      <div style={{
                        ...styles.activityTypeIcon,
                        backgroundColor: `${typeStat.color}20`
                      }}>
                        <span style={{ fontSize: '32px', color: typeStat.color }}>
                          {typeStat.icon}
                        </span>
                      </div>
                      <div style={styles.activityTypeCount}>
                        <span style={styles.countNumber}>{typeStat.count}</span>
                        <span style={styles.countLabel}>Activities</span>
                      </div>
                    </div>

                    <h3 style={styles.activityTypeTitle}>{typeStat.label}</h3>
                    <p style={styles.activityTypeDescription}>{typeStat.description}</p>

                    {typeStat.recentActivity && (
                      <div style={styles.recentActivity}>
                        <span style={styles.recentLabel}>Recent:</span>
                        <span style={styles.recentTitle}>{typeStat.recentActivity.title}</span>
                        <span style={styles.recentDate}>
                          {formatDate(typeStat.recentActivity.date)}
                        </span>
                      </div>
                    )}

                    <div style={{
                      ...styles.viewAllButton,
                      display: typeStat.type === 'paper_checked' || typeStat.type === 'diagram_generated' ? 'block' : 'none'
                    }}>
                      View All {typeStat.label} →
                    </div>

                    {typeStat.type !== 'paper_checked' && typeStat.type !== 'diagram_generated' && (
                      <div style={styles.comingSoonBadge}>
                        Coming Soon
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Styles (with additions for diagrams)
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative'
  },
  homeButton: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  header: {
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    padding: '60px 0 40px 0',
    color: 'white'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    left: '20px',
    top: '-20px',
    padding: '10px 20px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: '0 0 8px 0',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: '0.9',
    margin: '0',
    textAlign: 'center'
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  loadingState: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  loadingSpinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px auto'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '60px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid #e2e8f0'
  },
  statIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statContent: {
    flex: '1'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 0 4px 0',
    color: '#1e293b'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: '0 0 8px 0'
  },
  statChange: {
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  activityTypesSection: {
    marginBottom: '40px'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
    textAlign: 'center'
  },
  sectionSubtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: '0 0 40px 0',
    textAlign: 'center'
  },
  activityTypesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px'
  },
  activityTypeCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '20px',
    boxShadow: '0 4px 25px rgba(0, 0, 0, 0.1)',
    border: '2px solid',
    transition: 'all 0.3s ease',
    position: 'relative'
  },
  activityTypeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  activityTypeIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activityTypeCount: {
    textAlign: 'right'
  },
  countNumber: {
    display: 'block',
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: '1'
  },
  countLabel: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '500'
  },
  activityTypeTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 12px 0'
  },
  activityTypeDescription: {
    fontSize: '1rem',
    color: '#64748b',
    margin: '0 0 20px 0',
    lineHeight: '1.5'
  },
  recentActivity: {
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '20px'
  },
  recentLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '4px'
  },
  recentTitle: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#1e293b',
    display: 'block',
    marginBottom: '4px'
  },
  recentDate: {
    fontSize: '0.8rem',
    color: '#94a3b8'
  },
  viewAllButton: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: '0.9rem',
    textAlign: 'center',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    transition: 'all 0.2s ease'
  },
  comingSoonBadge: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: '#6b7280',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  typeSummary: {
    marginBottom: '40px'
  },
  typeSummaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '32px',
    borderRadius: '20px',
    border: '2px solid',
    backgroundColor: 'white'
  },
  typeSummaryIcon: {
    flexShrink: 0
  },
  typeSummaryContent: {
    flex: '1'
  },
  typeSummaryTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  typeSummaryDescription: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: '0'
  },
  activitiesSection: {
    marginBottom: '40px'
  },
  activitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '24px'
  },
  activityCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 2px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0'
  },
  activityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  activityType: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  typeIcon: {
    fontSize: '14px'
  },
  activityDate: {
    fontSize: '12px',
    color: '#64748b'
  },
  activityTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  activityDescription: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 20px 0',
    lineHeight: '1.5'
  },
  diagramPreview: {
    marginBottom: '16px',
    textAlign: 'center'
  },
  diagramPreviewImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  metrics: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px'
  },
  metric: {
    textAlign: 'center'
  },
  metricValue: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b'
  },
  metricLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  detailsSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #f1f5f9'
  },
  detailsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 12px 0'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  detailLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  detailValue: {
    fontSize: '13px',
    color: '#1e293b',
    fontWeight: '500'
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none'
  },
  activityFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px'
  },
  status: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9'
  },
  statusCompleted: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  clickHint: {
    fontSize: '12px',
    color: '#3b82f6',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    border: '2px dashed #e2e8f0'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
    opacity: '0.5'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 12px 0'
  },
  emptyText: {
    fontSize: '16px',
    color: '#64748b',
    margin: '0'
  },
  // Diagram specific styles
  diagramSummary: {
    marginBottom: '40px'
  },
  diagramSummaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '32px',
    borderRadius: '20px',
    border: '2px solid #8B5CF6',
    backgroundColor: 'white'
  },
  diagramSummaryIcon: {
    flexShrink: 0
  },
  diagramSummaryContent: {
    flex: '1'
  },
  diagramSummaryTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  diagramSummaryDescription: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: '0 0 20px 0'
  },
  diagramStats: {
    display: 'flex',
    gap: '32px'
  },
  diagramStat: {
    textAlign: 'center'
  },
  diagramStatValue: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#8B5CF6'
  },
  diagramStatLabel: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '500'
  },
  diagramSection: {
    marginBottom: '40px'
  },
  diagramContent: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px'
  },
  diagramCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 2px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0'
  },
  diagramHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  diagramTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0'
  },
  diagramBadge: {
    textAlign: 'center',
    padding: '8px 16px',
    backgroundColor: '#f3e8ff',
    borderRadius: '12px',
    border: '2px solid #8B5CF6'
  },
  diagramType: {
    fontSize: '12px',
    color: '#8B5CF6',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  diagramDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  diagramImageSection: {
    marginTop: '20px'
  },
  diagramImage: {
    width: '100%',
    maxWidth: '600px',
    height: 'auto',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  // ... (rest of the existing styles remain the same)
  paperSummary: {
    marginBottom: '40px'
  },
  paperSummaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '32px',
    borderRadius: '20px',
    border: '2px solid #3b82f6',
    backgroundColor: 'white'
  },
  paperSummaryIcon: {
    flexShrink: 0
  },
  paperSummaryContent: {
    flex: '1'
  },
  paperSummaryTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  paperSummaryDescription: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: '0 0 20px 0'
  },
  paperStats: {
    display: 'flex',
    gap: '32px'
  },
  paperStat: {
    textAlign: 'center'
  },
  paperStatValue: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#3b82f6'
  },
  paperStatLabel: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '500'
  },
  submissionsSection: {
    marginBottom: '40px'
  },
  answerSheetContent: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px'
  },
  answerSheetCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 2px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0'
  },
  answerSheetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  answerSheetTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0'
  },
  marksBadge: {
    textAlign: 'center',
    padding: '12px 20px',
    backgroundColor: '#dbeafe',
    borderRadius: '12px',
    border: '2px solid #3b82f6'
  },
  marksValue: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#3b82f6'
  },
  marksLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#3b82f6',
    fontWeight: '500',
    textTransform: 'uppercase'
  },
  answerSheetDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  answerSheetImageSection: {
    marginTop: '20px'
  },
  imageContainer: {
    position: 'relative',
    marginTop: '12px'
  },
  answerSheetImage: {
    width: '100%',
    maxWidth: '600px',
    height: 'auto',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  imageFallback: {
    display: 'none',
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '2px dashed #e2e8f0'
  },
  fallbackIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: '0.5'
  },
  fallbackText: {
    margin: '0'
  },
  downloadLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '16px'
  },
  noImage: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '2px dashed #e2e8f0'
  },
  noImageIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: '0.5'
  },
  noImageText: {
    margin: '0',
    color: '#64748b'
  },
  extractedTextSection: {
    marginTop: '20px'
  },
  textPreviewContainer: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginTop: '12px'
  },
  extractedText: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
    margin: '0',
    whiteSpace: 'pre-wrap'
  }
};

// Add CSS animation for loading spinner
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default ActivitiesDashboard;