/**
 * Charts Module
 * Handles Chart.js visualizations
 */

// Store chart instances
const chartInstances = {};

/**
 * Create top songs chart
 * @param {Array} topSongs - Array of {artist, song, count}
 */
export function createTopSongsChart(topSongs) {
    const ctx = document.getElementById('top-songs-chart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (chartInstances.topSongs) {
        chartInstances.topSongs.destroy();
    }

    const labels = topSongs.map(item => `${item.song} - ${item.artist}`);
    const data = topSongs.map(item => item.count);

    chartInstances.topSongs = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Play Count',
                data: data,
                backgroundColor: 'rgba(124, 58, 237, 0.8)',
                borderColor: 'rgba(124, 58, 237, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.x} plays`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

/**
 * Create top artists chart
 * @param {Array} topArtists - Array of {artist, count}
 */
export function createTopArtistsChart(topArtists) {
    const ctx = document.getElementById('top-artists-chart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (chartInstances.topArtists) {
        chartInstances.topArtists.destroy();
    }

    const labels = topArtists.map(item => item.artist);
    const data = topArtists.map(item => item.count);

    chartInstances.topArtists = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Play Count',
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.x} plays`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

/**
 * Update all charts with new data
 * @param {Object} stats - Statistics object with all data
 */
export function updateCharts(stats) {
    createTopSongsChart(stats.topSongs);
    createTopArtistsChart(stats.topArtists);
}

/**
 * Destroy all chart instances
 */
export function destroyAllCharts() {
    for (const key in chartInstances) {
        if (chartInstances[key]) {
            chartInstances[key].destroy();
        }
    }
}
