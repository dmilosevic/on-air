/**
 * UI Module
 * Handles DOM updates and user interface
 */

import { formatTimeAgo, formatTimestamp } from './analytics.js';

/**
 * Update the "Now Playing" section
 * @param {Object} latestEntry - Latest song entry
 */
export function updateNowPlaying(latestEntry) {
    if (!latestEntry) {
        document.getElementById('now-playing-artist').textContent = 'No data available';
        document.getElementById('now-playing-song').textContent = '-';
        document.getElementById('now-playing-time').textContent = '-';
        return;
    }

    document.getElementById('now-playing-artist').textContent = latestEntry.artist;
    document.getElementById('now-playing-song').textContent = latestEntry.song;
    document.getElementById('now-playing-time').textContent = formatTimeAgo(latestEntry.ts);
}

/**
 * Update stats cards
 * @param {Object} stats - Statistics object
 */
export function updateStatsCards(stats) {
    document.getElementById('stat-total-songs').textContent = stats.totalSongs.toLocaleString();
    document.getElementById('stat-unique-songs').textContent = stats.uniqueSongs.toLocaleString();
    document.getElementById('stat-unique-artists').textContent = stats.uniqueArtists.toLocaleString();
    document.getElementById('stat-this-week').textContent = stats.thisWeek.toLocaleString();
}

/**
 * Update recent history table
 * @param {Array} entries - All entries (will show last 50)
 */
export function updateHistoryTable(entries) {
    const tbody = document.getElementById('history-table');
    if (!tbody) return;

    if (!entries || entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500">No data available</td></tr>';
        return;
    }

    // Get last 50 entries (reversed to show most recent first)
    const recentEntries = entries.slice(-50).reverse();

    tbody.innerHTML = recentEntries.map(entry => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${formatTimestamp(entry.ts)}
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">
                ${escapeHtml(entry.artist)}
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">
                ${escapeHtml(entry.song)}
            </td>
        </tr>
    `).join('');
}

/**
 * Show loading state
 */
export function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('content').classList.add('hidden');
}

/**
 * Hide loading state and show content
 */
export function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('content').classList.remove('hidden');
}

/**
 * Show error message
 * @param {string} message - Error message
 */
export function showError(message) {
    const loading = document.getElementById('loading');
    loading.innerHTML = `
        <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Error Loading Data</h3>
            <p class="mt-2 text-gray-600">${escapeHtml(message)}</p>
        </div>
    `;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Update the entire UI with stats
 * @param {Object} stats - Statistics object
 * @param {Array} entries - All entries
 */
export function updateUI(stats, entries) {
    updateNowPlaying(stats.latestEntry);
    updateStatsCards(stats);
    updateHistoryTable(entries);
}
