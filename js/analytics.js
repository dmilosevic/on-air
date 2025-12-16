/**
 * Analytics Module
 * Handles data aggregation and analysis
 */

/**
 * Filter entries by time period
 * @param {Array} entries - All entries
 * @param {string} period - Time period: 'all', 'thisweek', 'week', 'month', '3months', 'year'
 * @returns {Array} Filtered entries
 */
export function filterByTimePeriod(entries, period) {
    if (period === 'all' || !period) {
        return entries;
    }

    // Special case for "This Week" - use ISO week boundaries
    if (period === 'thisweek') {
        return getCurrentWeekData(entries);
    }

    const now = new Date();
    let startDate;

    switch (period) {
        case 'week':
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case '3months':
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 3);
            break;
        case 'year':
            startDate = new Date(now);
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        default:
            return entries;
    }

    return entries.filter(entry => {
        const entryDate = new Date(entry.ts);
        return entryDate >= startDate;
    });
}

/**
 * Get top songs from entries
 * @param {Array} entries - Array of song entries
 * @param {number} limit - Number of top songs to return
 * @returns {Array} Top songs with counts
 */
export function getTopSongs(entries, limit = 10) {
    const counts = new Map();

    for (const { artist, song } of entries) {
        const key = `${artist}|||${song}`;
        counts.set(key, (counts.get(key) || 0) + 1);
    }

    return Array.from(counts.entries())
        .map(([key, count]) => {
            const [artist, song] = key.split('|||');
            return { artist, song, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

/**
 * Get top artists from entries
 * @param {Array} entries - Array of song entries
 * @param {number} limit - Number of top artists to return
 * @returns {Array} Top artists with counts
 */
export function getTopArtists(entries, limit = 10) {
    const counts = new Map();

    for (const { artist } of entries) {
        counts.set(artist, (counts.get(artist) || 0) + 1);
    }

    return Array.from(counts.entries())
        .map(([artist, count]) => ({ artist, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

/**
 * Get unique song count
 * @param {Array} entries - Array of song entries
 * @returns {number} Number of unique songs
 */
export function getUniqueSongCount(entries) {
    const uniqueSongs = new Set();

    for (const { artist, song } of entries) {
        uniqueSongs.add(`${artist}|||${song}`);
    }

    return uniqueSongs.size;
}

/**
 * Get unique artist count
 * @param {Array} entries - Array of song entries
 * @returns {number} Number of unique artists
 */
export function getUniqueArtistCount(entries) {
    const uniqueArtists = new Set();

    for (const { artist } of entries) {
        uniqueArtists.add(artist);
    }

    return uniqueArtists.size;
}

/**
 * Filter entries by date range
 * @param {Array} entries - Array of song entries
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered entries
 */
export function filterByDateRange(entries, startDate, endDate) {
    return entries.filter(entry => {
        const ts = new Date(entry.ts);
        return ts >= startDate && ts <= endDate;
    });
}

/**
 * Get start of ISO week (Monday)
 * @param {Date} date
 * @returns {Date} Start of week
 */
function getStartOfISOWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Get end of ISO week (Sunday)
 * @param {Date} date
 * @returns {Date} End of week
 */
function getEndOfISOWeek(date) {
    const start = getStartOfISOWeek(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
}

/**
 * Get current week's data
 * @param {Array} entries - All entries
 * @returns {Array} Current week's entries
 */
export function getCurrentWeekData(entries) {
    const now = new Date();
    const startOfWeek = getStartOfISOWeek(now);
    const endOfWeek = getEndOfISOWeek(now);
    return filterByDateRange(entries, startOfWeek, endOfWeek);
}

/**
 * Get data for last N days
 * @param {Array} entries - All entries
 * @param {number} days - Number of days
 * @returns {Array} Filtered entries
 */
export function getLastNDays(entries, days = 7) {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return filterByDateRange(entries, startDate, now);
}

/**
 * Generate hourly play counts for timeline
 * @param {Array} entries - Array of song entries
 * @param {number} days - Number of days to include
 * @returns {Array} Array of {hour, count} objects
 */
export function getHourlyPlayCounts(entries, days = 7) {
    const lastWeek = getLastNDays(entries, days);
    const hourlyBuckets = new Map();

    for (const entry of lastWeek) {
        const ts = new Date(entry.ts);
        const hourKey = ts.toISOString().slice(0, 13); // YYYY-MM-DDTHH
        hourlyBuckets.set(hourKey, (hourlyBuckets.get(hourKey) || 0) + 1);
    }

    // Create array sorted by time
    return Array.from(hourlyBuckets.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour.localeCompare(b.hour));
}

/**
 * Generate time-of-day heatmap data
 * @param {Array} entries - Array of song entries
 * @returns {Array} 7x24 matrix (day of week x hour)
 */
export function generateHeatmapData(entries) {
    // Initialize 7x24 matrix (Monday=0 to Sunday=6, hours 0-23)
    const matrix = Array(7).fill(0).map(() => Array(24).fill(0));

    for (const entry of entries) {
        const date = new Date(entry.ts);
        const dayOfWeek = (date.getDay() + 6) % 7; // Convert to Monday=0
        const hour = date.getHours();
        matrix[dayOfWeek][hour]++;
    }

    return matrix;
}

/**
 * Get the latest (most recent) entry
 * @param {Array} entries - Array of song entries
 * @returns {Object|null} Latest entry or null
 */
export function getLatestEntry(entries) {
    if (!entries || entries.length === 0) {
        return null;
    }

    return entries.reduce((latest, current) => {
        const latestTime = new Date(latest.ts);
        const currentTime = new Date(current.ts);
        return currentTime > latestTime ? current : latest;
    });
}

/**
 * Format timestamp as "time ago" string
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Human-readable time ago
 */
export function formatTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
        return 'Just now';
    } else if (diffMins === 1) {
        return '1 minute ago';
    } else if (diffMins < 60) {
        return `${diffMins} minutes ago`;
    } else if (diffHours === 1) {
        return '1 hour ago';
    } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
        return '1 day ago';
    } else {
        return `${diffDays} days ago`;
    }
}

/**
 * Format timestamp for display
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted time
 */
export function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get day name from day index
 * @param {number} dayIndex - 0=Monday, 6=Sunday
 * @returns {string} Day name
 */
export function getDayName(dayIndex) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[dayIndex];
}

/**
 * Calculate statistics for all data
 * @param {Array} entries - All entries
 * @returns {Object} Statistics object
 */
export function calculateStats(entries) {
    const currentWeekEntries = getCurrentWeekData(entries);

    return {
        totalSongs: entries.length,
        uniqueSongs: getUniqueSongCount(entries),
        uniqueArtists: getUniqueArtistCount(entries),
        thisWeek: currentWeekEntries.length,
        topSongs: getTopSongs(entries, 10),
        topArtists: getTopArtists(entries, 10),
        topWeekSongs: getTopSongs(currentWeekEntries, 10),
        latestEntry: getLatestEntry(entries)
    };
}
