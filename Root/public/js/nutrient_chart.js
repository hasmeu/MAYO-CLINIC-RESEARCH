// nutrient_chart_with_fixed_thresholds.js
const db = require('../../db/connection');

// Chart with toggle functionality, download button, and red highlighting for values under threshold
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('nutrientChart').getContext('2d');
    
    // Sample data for each nutrient
    const dates = ['2025-04-27', '2025-04-28', '2025-04-29', '2025-04-30', '2025-05-01', '2025-05-02', '2025-05-03'];
    
    // Define nutrients with colors and fixed thresholds
    const nutrients = {
      protein: {
        label: 'Protein (g)',
        data: [120, 145, 135, 160, 150, 140, 155],
        color: '#FF6384',
        visible: true,
        threshold: 130 // Minimum recommended daily protein intake
      },
      carbs: {
        label: 'Carbs (g)',
        data: [250, 220, 235, 215, 240, 225, 230],
        color: '#36A2EB',
        visible: true,
        threshold: 225 // Minimum recommended daily carb intake
      },
      fat: {
        label: 'Fat (g)',
        data: [85, 70, 95, 80, 75, 90, 85],
        color: '#FFCE56',
        visible: true,
        threshold: 80 // Minimum recommended daily fat intake
      },
      fiber: {
        label: 'Fiber (g)',
        data: [25, 30, 22, 28, 35, 30, 27],
        color: '#4BC0C0',
        visible: true,
        threshold: 25 // Minimum recommended daily fiber intake
      }
    };
    
    // Create gradient function for fill
    function createGradient(ctx, color) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      // Convert hex to rgba
      const rgbaColor = hexToRgba(color, 0.2);
      gradient.addColorStop(0, rgbaColor);
      gradient.addColorStop(1, hexToRgba(color, 0));
      return gradient;
    }
    
    // Helper function to convert hex to rgba
    function hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // Function to generate point background colors based on thresholds
    function generatePointBackgroundColors(nutrient) {
      return nutrient.data.map(value => 
        value < nutrient.threshold ? '#E74C3C' : nutrient.color
      );
    }
    
    // Create datasets from nutrients
    function createDatasets() {
      return Object.keys(nutrients).map(key => {
        const nutrient = nutrients[key];
        const pointBackgroundColors = generatePointBackgroundColors(nutrient);
        
        return {
          label: nutrient.label,
          data: nutrient.data,
          fill: true,
          borderColor: nutrient.color,
          backgroundColor: createGradient(ctx, nutrient.color),
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: pointBackgroundColors,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          hidden: !nutrient.visible,
          // Include threshold information for tooltip display
          threshold: nutrient.threshold
        };
      });
    }
  
    // Extended tooltip callback to show threshold warnings
    const tooltipCallback = {
      afterLabel: function(context) {
        const dataset = context.dataset;
        const value = dataset.data[context.dataIndex];
        const threshold = dataset.threshold;
        
        if (value < threshold) {
          return `Below target (${threshold})`;
        }
        return '';
      }
    };
    
    // Create chart configuration
    const config = {
      type: 'line',
      data: {
        labels: dates,
        datasets: createDatasets()
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // We'll use our custom toggles instead
          },
          tooltip: {
            backgroundColor: '#fff',
            borderColor: '#4A90E2',
            borderWidth: 1,
            titleColor: '#4A90E2',
            bodyColor: '#000',
            titleFont: { weight: 'bold' },
            callbacks: tooltipCallback
          }
        },
        scales: {
          x: {
            title: {
              display: false,
              text: 'Date',
              color: '#333',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            ticks: {
              color: '#555'
            },
            grid: {
              display: false
            }
          },
          y: {
            title: {
              display: true,
              text: 'Amount',
              color: '#333',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            ticks: {
              color: '#555'
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.2)'
            }
          }
        }
      }
    };
    
    // Initialize the chart
    const nutrientChart = new Chart(ctx, config);
    
    // Create toggle buttons
    function createToggleButtons() {
      const container = document.createElement('div');
      container.className = 'toggle-container';
      container.style.display = 'flex';
      container.style.flexWrap = 'wrap';
      container.style.gap = '10px';
      container.style.marginBottom = '20px';
      
      Object.keys(nutrients).forEach(key => {
        const nutrient = nutrients[key];
        const button = document.createElement('button');
        button.textContent = nutrient.label;
        button.className = `toggle-btn ${key}${nutrient.visible ? ' active' : ''}`;
        button.style.padding = '8px 16px';
        button.style.borderRadius = '20px';
        button.style.border = `2px solid ${nutrient.color}`;
        button.style.backgroundColor = nutrient.visible ? nutrient.color : 'white';
        button.style.color = nutrient.visible ? 'white' : nutrient.color;
        button.style.cursor = 'pointer';
        button.style.fontWeight = '600';
        button.style.transition = 'all 0.2s ease';
        button.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        
        // Toggle functionality
        button.addEventListener('click', function() {
          nutrient.visible = !nutrient.visible;
          button.style.backgroundColor = nutrient.visible ? nutrient.color : 'white';
          button.style.color = nutrient.visible ? 'white' : nutrient.color;
          button.classList.toggle('active');
          
          // Update chart visibility
          const datasetIndex = Object.keys(nutrients).indexOf(key);
          nutrientChart.data.datasets[datasetIndex].hidden = !nutrient.visible;
          nutrientChart.update();
        });
        
        container.appendChild(button);
      });
      
      // Add info about red dots
      const infoText = document.createElement('div');
      infoText.style.width = '100%';
      infoText.style.fontSize = '12px';
      infoText.style.color = '#666';
      infoText.style.marginTop = '5px';
      infoText.innerHTML = '• <span style="color:#E74C3C">Red dots</span> indicate values below the recommended threshold';
      container.appendChild(infoText);
      
      // Add toggle container before chart
      const chartCanvas = document.getElementById('nutrientChart');
      chartCanvas.parentNode.insertBefore(container, chartCanvas);
    }
    
    // Create download button
    function createDownloadButton() {
      const chartContainer = document.getElementById('nutrientChart').parentNode;
      
      const downloadButton = document.createElement('button');
      downloadButton.textContent = 'Download Chart';
      downloadButton.className = 'download-btn';
      downloadButton.style.margin = '10px 0';
      downloadButton.style.padding = '8px 16px';
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
      
      // Add download functionality
      downloadButton.addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = 'nutrient-tracking-chart.png';
        
        // Convert canvas to data URL
        link.href = document.getElementById('nutrientChart').toDataURL('image/png');
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
      });
      
      chartContainer.appendChild(downloadButton);
    }
    
    // Initialize UI elements
    createToggleButtons();
    createDownloadButton();
  });