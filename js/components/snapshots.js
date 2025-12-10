// ============================================
// SNAPSHOTS & VISUALIZATION COMPONENT
// ============================================

import { state } from '../core/state.js';
import { saveToStorage } from '../services/storage.js';
import { escapeHtml, formatDate, formatDateTime } from '../utils/helpers.js';
import { showToast } from '../ui/toast.js';
import { switchTab } from '../ui/tabs.js';

// ============================================
// SNAPSHOT SAVE
// ============================================

export function saveSnapshot() {
    const timestamp = new Date();
    const snapshot = {
        id: `snapshot-${Date.now()}`,
        name: `Snapshot – ${timestamp.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })}`,
        timestamp: timestamp.toISOString(),
        itemsCount: state.actionItems.length,
        eventsCount: state.calendarEvents.length,
        actionItems: JSON.parse(JSON.stringify(state.actionItems)),
        calendarEvents: JSON.parse(JSON.stringify(state.calendarEvents))
    };

    state.snapshots.unshift(snapshot);
    saveToStorage('ey-snapshots', state.snapshots);
    showToast('Snapshot saved successfully');
}

// ============================================
// SNAPSHOT VISUALIZATION
// ============================================

export function renderSnapshotVisualization() {
    // Calculate statistics
    const totalItems = state.actionItems.length;
    const statusCounts = {
        'Not Started': 0,
        'In Progress': 0,
        'Blocked': 0,
        'Done': 0
    };

    state.actionItems.forEach(item => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });

    const completionRate = totalItems > 0 ? Math.round((statusCounts['Done'] / totalItems) * 100) : 0;
    const overdueCount = state.actionItems.filter(item => {
        const dueDate = new Date(item.date);
        const today = new Date();
        return item.status !== 'Done' && dueDate < today;
    }).length;

    const container = document.getElementById('snapshotVizContainer');

    container.innerHTML = `
        <div class="snapshot-viz-header">
            <h2 class="snapshot-viz-title">Project Snapshot</h2>
            <div style="font-size: 0.9rem; color: #718096;">
                <i class="fas fa-clock"></i> ${formatDateTime(new Date().toISOString())}
            </div>
        </div>

        <div class="snapshot-stats">
            <div class="stat-card">
                <div class="stat-label">Total Items</div>
                <div class="stat-value">${totalItems}</div>
                <div class="stat-subtext">Action items tracked</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Completion Rate</div>
                <div class="stat-value">${completionRate}%</div>
                <div class="stat-subtext">${statusCounts['Done']} of ${totalItems} completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">In Progress</div>
                <div class="stat-value">${statusCounts['In Progress']}</div>
                <div class="stat-subtext">Currently active</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Overdue Items</div>
                <div class="stat-value">${overdueCount}</div>
                <div class="stat-subtext">Require attention</div>
            </div>
        </div>

        <div class="snapshot-charts-grid">
            <div class="snapshot-chart">
                <h3 class="chart-title">Status Distribution (Bar)</h3>
                <canvas id="statusBarChart"></canvas>
            </div>
            <div class="snapshot-chart">
                <h3 class="chart-title">Status Distribution (Pie)</h3>
                <canvas id="statusPieChart"></canvas>
            </div>
        </div>

        <div class="snapshot-tasks-table">
            <h3>All Tasks in Snapshot</h3>
            <div class="snapshot-tasks-list">
                ${state.actionItems.length === 0 ?
                    '<p style="text-align: center; color: #A0AEC0; padding: 2rem;">No tasks to display</p>' :
                    state.actionItems.map(item => `
                        <div class="snapshot-task-card">
                            <div class="snapshot-task-header">
                                <div class="snapshot-task-title">${escapeHtml(item.description)}</div>
                                <span class="status-pill status-${item.status.toLowerCase().replace(' ', '-')}">
                                    ${item.status}
                                </span>
                            </div>
                            <div class="snapshot-task-meta">
                                <div class="snapshot-task-meta-item">
                                    <div class="snapshot-task-meta-label">Owner</div>
                                    <div class="snapshot-task-meta-value">${escapeHtml(item.owner)}</div>
                                </div>
                                <div class="snapshot-task-meta-item">
                                    <div class="snapshot-task-meta-label">Taskforce</div>
                                    <div class="snapshot-task-meta-value">${escapeHtml(item.taskforce)}</div>
                                </div>
                                <div class="snapshot-task-meta-item">
                                    <div class="snapshot-task-meta-label">Due Date</div>
                                    <div class="snapshot-task-meta-value">${formatDate(item.date)}</div>
                                </div>
                                <div class="snapshot-task-meta-item">
                                    <div class="snapshot-task-meta-label">Last Updated</div>
                                    <div class="snapshot-task-meta-value">${formatDateTime(item.lastUpdated)}</div>
                                </div>
                            </div>
                            ${item.notes ? `
                                <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #E2E8F0;">
                                    <div class="snapshot-task-meta-label" style="margin-bottom: 0.5rem;">Notes</div>
                                    <div style="font-size: 0.875rem; color: #4A5568; line-height: 1.6;">${item.notes}</div>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;

    // Destroy existing charts if they exist
    if (state.statusBarChart) state.statusBarChart.destroy();
    if (state.statusPieChart) state.statusPieChart.destroy();

    // Create charts after DOM is updated
    setTimeout(() => {
        createSnapshotCharts(statusCounts, totalItems);
    }, 100);
}

function createSnapshotCharts(statusCounts, totalItems) {
    const statusLabels = Object.keys(statusCounts);
    const statusData = Object.values(statusCounts);
    const statusColors = {
        'Not Started': '#E2E8F0',
        'In Progress': '#FED7AA',
        'Blocked': '#FED7D7',
        'Done': '#C6F6D5'
    };
    const statusBorderColors = {
        'Not Started': '#CBD5E0',
        'In Progress': '#ED8936',
        'Blocked': '#E53E3E',
        'Done': '#48BB78'
    };

    const backgroundColors = statusLabels.map(label => statusColors[label]);
    const borderColors = statusLabels.map(label => statusBorderColors[label]);

    // Bar Chart
    const barCtx = document.getElementById('statusBarChart');
    if (barCtx) {
        state.statusBarChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: statusLabels,
                datasets: [{
                    label: 'Number of Tasks',
                    data: statusData,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = totalItems > 0 ? ((context.parsed.y / totalItems) * 100).toFixed(1) : 0;
                                return `${context.parsed.y} tasks (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // Pie Chart
    const pieCtx = document.getElementById('statusPieChart');
    if (pieCtx) {
        state.statusPieChart = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: statusLabels,
                datasets: [{
                    data: statusData,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = totalItems > 0 ? ((context.parsed / totalItems) * 100).toFixed(1) : 0;
                                return `${context.label}: ${context.parsed} tasks (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// ============================================
// EXCEL EXPORT
// ============================================

export function exportToExcel() {
    // Prepare header with styling
    const headers = ['Task Name / Description', 'Owner', 'Taskforce', 'Due Date', 'Status', 'Notes'];

    // Prepare data
    const data = [headers];

    state.actionItems.forEach(item => {
        data.push([
            item.description,
            item.owner,
            item.taskforce,
            formatDate(item.date),
            item.status,
            item.notes || ''
        ]);
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths for better readability
    ws['!cols'] = [
        { wch: 45 },  // Task Name
        { wch: 20 },  // Owner
        { wch: 30 },  // Taskforce
        { wch: 15 },  // Date
        { wch: 15 },  // Status
        { wch: 50 }   // Notes
    ];

    // Apply professional styling to header row
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
            fill: { fgColor: { rgb: 'FFE600' } },
            font: { bold: true, name: 'Aptos', sz: 12, color: { rgb: '000000' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };
    }

    // Apply styling to data rows
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            if (!ws[cellAddress]) continue;

            ws[cellAddress].s = {
                font: { name: 'Aptos', sz: 11 },
                alignment: { vertical: 'top', wrapText: true },
                border: {
                    top: { style: 'thin', color: { rgb: 'E2E8F0' } },
                    bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
                    left: { style: 'thin', color: { rgb: 'E2E8F0' } },
                    right: { style: 'thin', color: { rgb: 'E2E8F0' } }
                }
            };
        }
    }

    // Set row heights
    ws['!rows'] = [{ hpt: 25 }]; // Header row height

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Action Items');

    // Add metadata
    wb.Props = {
        Title: 'EY AI Taskforce Action Items',
        Subject: 'Action Items Tracker',
        Author: 'EY AI Taskforce',
        CreatedDate: new Date()
    };

    // Generate filename with current date
    const today = new Date();
    const filename = `EY-AI-Taskforce-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);

    showToast('Excel exported successfully');
}

// ============================================
// EXPORTS FOR WINDOW (onclick handlers)
// ============================================

export function initSnapshotsGlobal() {
    window.snapshots = {
        saveSnapshot,
        exportToExcel,
        viewSnapshot: () => {
            renderSnapshotVisualization();
            switchTab('snapshot-view');
        }
    };
}
