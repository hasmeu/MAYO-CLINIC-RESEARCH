

document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('consistencyChart').getContext('2d');
    
    // Sample data for exercise consistency over a week
    const data = {
        labels: ['2025-04-01', '2025-04-02', '2025-04-03', '2025-04-04', '2025-04-05', '2025-04-06', '2025-04-07' ],
        datasets: [
            {
                label: 'Exercise Minutes',
                data: [45, 30, 60, 20, 45, 75, 50],
                borderColor: '#4A90E2',
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#4A90E2',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            },
            {
                label: 'Goal (minutes)',
                data: [30, 30, 30, 30, 30, 45, 45],
                type: 'line',
                borderColor: '#FF6384',
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#FF6384',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                fill: false
            }
        ]
    };
    
    // Create gradient fill for exercise data
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(74, 144, 226, 0.2)');
    gradient.addColorStop(1, 'rgba(74, 144, 226, 0)');
    
    data.datasets[0].fill = true;
    data.datasets[0].backgroundColor = gradient;
    
    // Chart configuration
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                    titleFont: { weight: 'bold' },
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            const value = context.dataset.data[index];
                            
                            if (context.datasetIndex === 0) {
                                const goal = data.datasets[1].data[index];
                                if (value >= goal) {
                                    return `Goal achieved! (${value}/${goal} minutes)`;
                                } else {
                                    return `Goal not reached (${value}/${goal} minutes)`;
                                }
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: false,
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
                        text: 'Exercise Minutes',
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
                    },
                    beginAtZero: true
                }
            }
        }
    };

    // Create and render the chart
    const consistencyChart = new Chart(ctx, config);

    // Add download button
    const consistencyChartContainer = document.getElementById('consistencyChart').parentNode;
    
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
        const link = document.createElement('a');
        link.download = 'exercise-consistency-chart.png';
        link.href = document.getElementById('consistencyChart').toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    // Add button to container
    consistencyChartContainer.appendChild(downloadButton);
});