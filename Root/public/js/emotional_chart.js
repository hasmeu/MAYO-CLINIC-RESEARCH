

document.addEventListener('DOMContentLoaded', function() {
  const emotionalCtx = document.getElementById('emotionalChart').getContext('2d');
  
  // Sample data for emotional well-being over a week
  const weekdays = ['2025-04-01', '2025-04-02', '2025-04-03', '2025-04-04', '2025-04-05', '2025-04-06', '2025-04-07' ];
  const emotionalData = [6, 8, 5, 7, 9, 8, 7];
  const notesData = [
    'Started the week feeling okay',
    'Had a productive day at work',
    'Felt stressed about deadline',
    'Exercised in the morning',
    'Looking forward to weekend',
    'Relaxed with friends',
    'Prepared for next week'
  ];

  // Function to get emoji for a score
  function getEmoji(score) {
    if (score >= 8) return '😄';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '🙁';
    return '😢';
  }

  // Function to get mood description
  function getMoodText(score) {
    if (score >= 8) return 'Excellent mood';
    if (score >= 6) return 'Good mood';
    if (score >= 4) return 'Neutral mood';
    if (score >= 2) return 'Low mood';
    return 'Very low mood';
  }

  // Create point images with emojis
  const pointImages = emotionalData.map(score => {
    // Create a canvas for each point
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    // Draw emoji on the canvas
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(getEmoji(score), 20, 20);
    
    // Convert to image
    const image = new Image();
    image.src = canvas.toDataURL();
    return image;
  });

  // Add download button to the emotional chart container
  const emotionalChartContainer = document.getElementById('emotionalChart').parentNode;
  const downloadButton = document.createElement('button');
  downloadButton.textContent = 'Download Chart';
  downloadButton.className = 'download-btn';
  downloadButton.style.margin = '10px 0';
  downloadButton.style.padding = '5px 10px';
  downloadButton.style.backgroundColor = '#4A90E2';
  downloadButton.style.color = 'white';
  downloadButton.style.border = 'none';
  downloadButton.style.borderRadius = '4px';
  downloadButton.style.cursor = 'pointer';
  downloadButton.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  downloadButton.style.fontSize = '14px';
  
  // Add hover effect
  downloadButton.onmouseover = function() {
      this.style.backgroundColor = '#3A80D2';
  };
  downloadButton.onmouseout = function() {
      this.style.backgroundColor = '#4A90E2';
  };
  
  emotionalChartContainer.appendChild(downloadButton);

  // Create the emotional well-being chart
  const emotionalChart = new Chart(emotionalCtx, {
    type: 'line',
    data: {
      labels: weekdays,
      datasets: [{
        label: 'Emotional Well-being (0-10)',
        data: emotionalData,
        fill: false,
        borderColor: '#8884d8',
        tension: 0.1,
        borderWidth: 3,
        pointStyle: pointImages,
        pointRadius: 20,
        pointHoverRadius: 25
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          title: {
            display: true,
            text: 'Well-being Score',
            color: '#333',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          ticks: {
            stepSize: 1
          }
        },
        x: {
          title: {
            display: true, 
            text: 'Day of Week'
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function(context) {
              const index = context[0].dataIndex;
              return weekdays[index] + ' - Score: ' + emotionalData[index];
            },
            label: function(context) {
              return notesData[context.dataIndex];
            },
            afterLabel: function(context) {
              const value = context.parsed.y;
              return getEmoji(value) + ' ' + getMoodText(value);
            }
          }
        },
        legend: {
          display: true,
          position: 'top'
        }
      }
    }
  });
  
  // Add click event to download button
  downloadButton.addEventListener('click', function() {
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = 'emotional-wellbeing-chart.png';
    
    // Convert canvas to data URL
    link.href = document.getElementById('emotionalChart').toDataURL('image/png');
    
    // Append to body and trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  });
  
  // Add method to update the chart
  window.updateEmotionalChart = function(newData, newLabels, newNotes) {
    // Update data values
    emotionalChart.data.datasets[0].data = newData || emotionalData;
    if (newLabels) emotionalChart.data.labels = newLabels;
    if (newNotes) notesData = newNotes;
    
    // Regenerate point images if data changes
    if (newData) {
      const newPointImages = newData.map(score => {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getEmoji(score), 20, 20);
        const image = new Image();
        image.src = canvas.toDataURL();
        return image;
      });
      emotionalChart.data.datasets[0].pointStyle = newPointImages;
    }
    
    emotionalChart.update();
  };
});