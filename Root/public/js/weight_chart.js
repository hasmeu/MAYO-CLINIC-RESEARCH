

// weight_chart.js with download functionality
const ctx = document.getElementById('weightChart').getContext('2d');

const weightData = {
    labels: ['2025-04-01', '2025-04-02', '2025-04-03', '2025-04-04', '2025-04-05', '2025-04-06', '2025-04-07' ],
    datasets: [{
        label: 'Weight (lb)',
        data: [400, 401, 405, 402, 401, 404, 400, 400],
        fill: false,
        borderColor: '#4A90E2',
        backgroundColor: '#4A90E2',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#4A90E2',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
    }]
};
const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgba(74, 144, 226, 0.2)');
gradient.addColorStop(1, 'rgba(74, 144, 226, 0)');

weightData.datasets[0].fill = true;
weightData.datasets[0].backgroundColor = gradient;

const config = {
    type: 'line',
    data: weightData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    font: {
                        size: 14,
                        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    },
                    color: '#333'
                }
            },
            tooltip: {
                backgroundColor: '#fff',
                borderColor: '#4A90E2',
                borderWidth: 1,
                titleColor: '#4A90E2',
                bodyColor: '#000',
                titleFont: { weight: 'bold' }
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
                    text: 'Weight (lb)',
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

const weightChart = new Chart(ctx, config);

// Add download button
document.addEventListener('DOMContentLoaded', function() {
    // Get the chart's container
    const weightChartContainer = document.getElementById('weightChart').parentNode;
    
    // Create download button
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
    
    // Add download functionality
    downloadButton.addEventListener('click', function() {
        // Create a temporary link element
        const link = document.createElement('a');
        link.download = 'weight-progress-chart.png';
        
        // Convert canvas to data URL
        link.href = document.getElementById('weightChart').toDataURL('image/png');
        
        // Append to body and trigger download
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
    });
    
    // Add button to container
    weightChartContainer.appendChild(downloadButton);
});