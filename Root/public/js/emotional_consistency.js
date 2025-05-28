const db = require('../../db/connection');

document.addEventListener('DOMContentLoaded', function() {
    // Sample data for 7 days (Monday to Sunday)
    const days = ['2025-04-01', '2025-04-02', '2025-04-03', '2025-04-04', '2025-04-05', '2025-04-06', '2025-04-07' ]
    // Exercise consistency data (minutes exercised each day)
    const exerciseData = [30, 45, 0, 60, 20, 90, 75];
    
    // Emotional well-being data (scale 1-10)
    const emotionalData = [6, 7, 5, 8, 6, 9, 8];
    
    // Calculate exercise consistency percentage
    const maxExerciseMinutes = 60; // Target exercise minutes per day
    const exercisePercentages = exerciseData.map(minutes => Math.min(100, (minutes / maxExerciseMinutes) * 100));
    
    // Chart configuration
    const ctx = document.getElementById('emotionalconsistencyChart').getContext('2d');
    const emotionalChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Emotional Well-being (1-10)',
            data: emotionalData,
            backgroundColor: 'rgba(99, 143, 255, 0.2)',
            borderColor: 'rgba(99, 143, 255, 1)',
            borderWidth: 2,
            tension: 0.3,
            yAxisID: 'y',
          },
          {
            label: 'Exercise Consistency (%)',
            data: exercisePercentages,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            tension: 0.3,
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          tooltip: {
            callbacks: {
              afterBody: function(tooltipItems) {
                const index = tooltipItems[0].dataIndex;
                return `Exercise Minutes: ${exerciseData[index]} min`;
              }
            }
          },
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Emotional Well-being vs Exercise Consistency'
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Emotional Well-being (1-10)',
              color: '#333',
              font: {
                size: 16,
                weight: 'bold'
                }
            },
            min: 0,
            max: 10,
            ticks: {
              stepSize: 1
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Exercise Consistency (%)',
              color: '#333',
              font: {
                size: 16,
                weight: 'bold'
                }
            },
            min: 0,
            max: 100,
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    });
    
    // Add correlation analysis if needed
    function calculateCorrelation() {
      const n = days.length;
      let sum_x = 0, sum_y = 0, sum_xy = 0, sum_x2 = 0, sum_y2 = 0;
      
      for (let i = 0; i < n; i++) {
        sum_x += exercisePercentages[i];
        sum_y += emotionalData[i];
        sum_xy += exercisePercentages[i] * emotionalData[i];
        sum_x2 += exercisePercentages[i] * exercisePercentages[i];
        sum_y2 += emotionalData[i] * emotionalData[i];
      }
      
      const correlation = (n * sum_xy - sum_x * sum_y) / 
                         (Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y)));
      
      // Add correlation to the chart title
      emotionalChart.options.plugins.title.text = 
        `Emotional Well-being vs Exercise Consistency (Correlation: ${correlation.toFixed(2)})`;
      emotionalChart.update();
    }
    
    // Calculate correlation after chart is created
    calculateCorrelation();
  });
