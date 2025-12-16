/**
 * Main Application Module
 * Coordinates data loading, analytics, and UI updates
 */

import { loadAllData } from './data-loader.js';
import { calculateStats, filterByTimePeriod } from './analytics.js';
import { updateCharts } from './charts.js';
import { updateUI, showLoading, hideLoading, showError } from './ui.js';

// Global state
let appData = {
    allEntries: [],      // All entries (unfiltered)
    entries: [],         // Filtered entries based on time period
    stats: null,
    currentPeriod: 'all' // Current time period filter
};

/**
 * Initialize the application
 */
async function init() {
    console.log('Initializing On Air Analytics...');
    showLoading();

    try {
        // Load all data
        console.log('Loading all data...');
        const { entries } = await loadAllData();

        if (!entries || entries.length === 0) {
            throw new Error('No data available. Please check back later.');
        }

        console.log(`Loaded ${entries.length} entries`);

        // Store in global state
        appData.allEntries = entries;
        appData.entries = entries; // Initially show all data

        // Calculate statistics
        console.log('Calculating statistics...');
        appData.stats = calculateStats(entries);

        // Update UI
        console.log('Updating UI...');
        updateUI(appData.stats, entries);

        // Update charts
        console.log('Rendering charts...');
        updateCharts(appData.stats);

        // Hide loading and show content
        hideLoading();

        console.log('Initialization complete!');

        // Set up event listeners
        setupFilterListeners();

        // Set up auto-refresh
        setupAutoRefresh();

    } catch (error) {
        console.error('Error initializing app:', error);
        showError(error.message || 'Failed to load data. Please try again later.');
    }
}

/**
 * Refresh the data and update UI
 */
async function refreshData() {
    try {
        console.log('Refreshing data...');

        // Load all data
        const { entries } = await loadAllData();

        if (!entries || entries.length === 0) {
            console.warn('No data available during refresh');
            return;
        }

        // Update global state
        appData.allEntries = entries;

        // Apply current filter
        appData.entries = filterByTimePeriod(entries, appData.currentPeriod);
        appData.stats = calculateStats(appData.entries);

        // Update UI
        updateUI(appData.stats, appData.entries);
        updateCharts(appData.stats);

        console.log('Refresh complete');

    } catch (error) {
        console.error('Error refreshing data:', error);
        // Don't show error on refresh failures, just log it
    }
}

/**
 * Handle time period filter change
 */
function handleFilterChange(period) {
    console.log(`Filter changed to: ${period}`);

    appData.currentPeriod = period;

    // Filter entries based on selected period
    appData.entries = filterByTimePeriod(appData.allEntries, period);

    // Recalculate stats with filtered data
    appData.stats = calculateStats(appData.entries);

    // Update UI
    updateUI(appData.stats, appData.entries);
    updateCharts(appData.stats);

    // Sync both dropdowns
    const desktopFilter = document.getElementById('time-period-filter');
    const mobileFilter = document.getElementById('time-period-filter-mobile');
    if (desktopFilter) desktopFilter.value = period;
    if (mobileFilter) mobileFilter.value = period;
}

/**
 * Set up filter event listeners
 */
function setupFilterListeners() {
    const desktopFilter = document.getElementById('time-period-filter');
    const mobileFilter = document.getElementById('time-period-filter-mobile');

    if (desktopFilter) {
        desktopFilter.addEventListener('change', (e) => {
            handleFilterChange(e.target.value);
        });
    }

    if (mobileFilter) {
        mobileFilter.addEventListener('change', (e) => {
            handleFilterChange(e.target.value);
        });
    }

    console.log('Filter listeners set up');
}

/**
 * Set up auto-refresh timer
 */
function setupAutoRefresh() {
    // Refresh every 60 seconds
    setInterval(refreshData, 60000);
    console.log('Auto-refresh enabled (every 60 seconds)');
}

/**
 * Export state for debugging
 */
window.onAirApp = {
    getData: () => appData,
    refresh: refreshData,
    setFilter: handleFilterChange,
    version: '1.1.0'
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
