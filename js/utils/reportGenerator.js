// ============================================
// REPORT GENERATOR
// ============================================
// Generates beautiful reports with statistics and action items

import { state } from '../core/state.js';
import { showToast } from '../ui/toast.js';
import { parseDateLocal } from './helpers.js';

/**
 * Calculate statistics for the report
 */
function calculateStatistics() {
    const items = state.actionItems;
    const total = items.length;
    const completed = items.filter(item => item.status === 'Done').length;
    const inProgress = items.filter(item => item.status === 'In Progress').length;
    const notStarted = items.filter(item => item.status === 'Not Started').length;
    const blocked = items.filter(item => item.status === 'Blocked').length;

    // Calculate overdue items
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = items.filter(item => {
        if (item.status === 'Done') return false;
        const itemDate = parseDateLocal(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate < today;
    }).length;

    // Calculate completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
        total,
        completed,
        inProgress,
        notStarted,
        blocked,
        overdue,
        completionRate
    };
}

/**
 * Generate a formatted date string
 */
function formatDate(dateString) {
    const date = parseDateLocal(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Strip HTML tags from rich text content
 */
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

/**
 * Generate status badge HTML
 */
function getStatusBadgeClass(status) {
    const statusMap = {
        'Not Started': 'status-not-started',
        'Discussing': 'status-discussing',
        'In Progress': 'status-in-progress',
        'Under Review': 'status-under-review',
        'Blocked': 'status-blocked',
        'Done': 'status-done'
    };
    return statusMap[status] || 'status-not-started';
}

/**
 * Generate the report HTML
 */
function generateReportHTML(stats) {
    const reportDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Sort items by due date (overdue first, then by date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedItems = [...state.actionItems].sort((a, b) => {
        const dateA = parseDateLocal(a.date);
        const dateB = parseDateLocal(b.date);
        dateA.setHours(0, 0, 0, 0);
        dateB.setHours(0, 0, 0, 0);

        const isOverdueA = dateA < today && a.status !== 'Done';
        const isOverdueB = dateB < today && b.status !== 'Done';

        if (isOverdueA && !isOverdueB) return -1;
        if (!isOverdueA && isOverdueB) return 1;

        return dateA - dateB;
    });

    // Generate action items HTML
    const actionItemsHTML = sortedItems.map(item => {
        const itemDate = parseDateLocal(item.date);
        itemDate.setHours(0, 0, 0, 0);
        const isOverdue = itemDate < today && item.status !== 'Done';
        const notes = item.notes || 'No notes';

        return `
            <div class="report-action-item ${isOverdue ? 'overdue' : ''}">
                <div class="report-item-header">
                    <h3 class="report-item-title">${item.description}</h3>
                    <span class="report-status-badge ${getStatusBadgeClass(item.status)}">
                        ${item.status}
                    </span>
                </div>
                <div class="report-item-details">
                    <div class="report-detail-row">
                        <span class="report-label"><i class="fas fa-users"></i> Owners:</span>
                        <span class="report-value">${Array.isArray(item.owners) ? item.owners.join(', ') : ''}</span>
                    </div>
                    <div class="report-detail-row">
                        <span class="report-label"><i class="fas fa-calendar"></i> Due Date:</span>
                        <span class="report-value ${isOverdue ? 'overdue-text' : ''}">${formatDate(item.date)} ${isOverdue ? '(Overdue)' : ''}</span>
                    </div>
                    ${item.latestUpdate ? `
                    <div class="report-detail-row">
                        <span class="report-label"><i class="fas fa-info-circle"></i> Latest Update:</span>
                        <span class="report-value">${item.latestUpdate}</span>
                    </div>
                    ` : ''}
                    ${item.nextSteps ? `
                    <div class="report-detail-row">
                        <span class="report-label"><i class="fas fa-arrow-right"></i> Next Steps:</span>
                        <span class="report-value">${item.nextSteps}</span>
                    </div>
                    ` : ''}
                    ${notes !== 'No notes' ? `
                    <div class="report-detail-row">
                        <span class="report-label"><i class="fas fa-sticky-note"></i> Notes:</span>
                        <span class="report-value">${notes}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>EY AI Taskforce Report - ${reportDate}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    padding: 2rem;
                    line-height: 1.6;
                    color: #2D3748;
                }

                .report-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                    overflow: hidden;
                }

                .report-header {
                    background: linear-gradient(135deg, #2D3748 0%, #1A202C 100%);
                    color: white;
                    padding: 3rem 2rem;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .report-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 8px;
                    background: #FFE600;
                }

                .report-header h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.5px;
                }

                .report-header .ey-accent {
                    color: #FFE600;
                }

                .report-header p {
                    font-size: 1.1rem;
                    opacity: 0.9;
                    font-weight: 400;
                }

                .report-meta {
                    background: #F7FAFC;
                    padding: 1.5rem 2rem;
                    border-bottom: 3px solid #FFE600;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .report-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.95rem;
                    color: #4A5568;
                }

                .report-meta-item i {
                    color: #FFE600;
                    font-size: 1.1rem;
                }

                .report-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    padding: 2rem;
                    background: #F7FAFC;
                    border-bottom: 1px solid #E2E8F0;
                }

                .stat-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border-left: 4px solid;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                }

                .stat-card.total {
                    border-color: #4299E1;
                }

                .stat-card.completed {
                    border-color: #48BB78;
                }

                .stat-card.in-progress {
                    border-color: #4299E1;
                }

                .stat-card.not-started {
                    border-color: #A0AEC0;
                }

                .stat-card.blocked {
                    border-color: #F56565;
                }

                .stat-card.overdue {
                    border-color: #ED8936;
                }

                .stat-card.completion-rate {
                    border-color: #FFE600;
                }

                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 800;
                    line-height: 1;
                    margin-bottom: 0.5rem;
                }

                .stat-card.total .stat-value { color: #4299E1; }
                .stat-card.completed .stat-value { color: #48BB78; }
                .stat-card.in-progress .stat-value { color: #4299E1; }
                .stat-card.not-started .stat-value { color: #A0AEC0; }
                .stat-card.blocked .stat-value { color: #F56565; }
                .stat-card.overdue .stat-value { color: #ED8936; }
                .stat-card.completion-rate .stat-value { color: #2D3748; }

                .stat-label {
                    font-size: 0.9rem;
                    color: #718096;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .report-content {
                    padding: 2rem;
                }

                .report-section {
                    margin-bottom: 2rem;
                }

                .report-section-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #2D3748;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 3px solid #FFE600;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .report-section-title i {
                    color: #FFE600;
                }

                .report-action-item {
                    background: #F7FAFC;
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    border-left: 4px solid #E2E8F0;
                    transition: all 0.2s;
                }

                .report-action-item:hover {
                    border-left-color: #FFE600;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }

                .report-action-item.overdue {
                    border-left-color: #F56565;
                    background: #FFF5F5;
                }

                .report-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: 1rem;
                    gap: 1rem;
                }

                .report-item-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #2D3748;
                    flex: 1;
                }

                .report-status-badge {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                }

                .status-not-started {
                    background: #EDF2F7;
                    color: #4A5568;
                }

                .status-in-progress {
                    background: #BEE3F8;
                    color: #2C5282;
                }

                .status-blocked {
                    background: #FED7D7;
                    color: #9B2C2C;
                }

                .status-done {
                    background: #C6F6D5;
                    color: #22543D;
                }

                .report-item-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .report-detail-row {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                }

                .report-label {
                    font-weight: 600;
                    color: #4A5568;
                    min-width: 120px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .report-label i {
                    color: #A0AEC0;
                    width: 16px;
                }

                .report-value {
                    color: #2D3748;
                    flex: 1;
                }

                .overdue-text {
                    color: #F56565;
                    font-weight: 600;
                }

                .report-footer {
                    background: #F7FAFC;
                    padding: 2rem;
                    text-align: center;
                    border-top: 1px solid #E2E8F0;
                    color: #718096;
                }

                .report-footer p {
                    margin-bottom: 0.5rem;
                }

                .report-footer strong {
                    color: #2D3748;
                }

                @media print {
                    body {
                        padding: 0;
                        background: white;
                    }

                    .report-container {
                        box-shadow: none;
                        max-width: 100%;
                    }

                    .report-action-item {
                        page-break-inside: avoid;
                    }
                }

                @media (max-width: 768px) {
                    .report-header h1 {
                        font-size: 2rem;
                    }

                    .report-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .report-meta {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .report-item-header {
                        flex-direction: column;
                    }
                }
            </style>
        </head>
        <body>
            <div class="report-container">
                <div class="report-header">
                    <h1><span class="ey-accent">EY</span> AI Taskforce Report</h1>
                    <p>Action Items & Initiative Tracker</p>
                </div>

                <div class="report-meta">
                    <div class="report-meta-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span><strong>Report Generated:</strong> ${reportDate}</span>
                    </div>
                    <div class="report-meta-item">
                        <i class="fas fa-tasks"></i>
                        <span><strong>Total Items:</strong> ${stats.total}</span>
                    </div>
                    <div class="report-meta-item">
                        <i class="fas fa-chart-line"></i>
                        <span><strong>Completion Rate:</strong> ${stats.completionRate}%</span>
                    </div>
                </div>

                <div class="report-stats">
                    <div class="stat-card total">
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">Total Items</div>
                    </div>
                    <div class="stat-card completed">
                        <div class="stat-value">${stats.completed}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                    <div class="stat-card in-progress">
                        <div class="stat-value">${stats.inProgress}</div>
                        <div class="stat-label">In Progress</div>
                    </div>
                    <div class="stat-card not-started">
                        <div class="stat-value">${stats.notStarted}</div>
                        <div class="stat-label">Not Started</div>
                    </div>
                    <div class="stat-card blocked">
                        <div class="stat-value">${stats.blocked}</div>
                        <div class="stat-label">Blocked</div>
                    </div>
                    <div class="stat-card overdue">
                        <div class="stat-value">${stats.overdue}</div>
                        <div class="stat-label">Overdue</div>
                    </div>
                    <div class="stat-card completion-rate">
                        <div class="stat-value">${stats.completionRate}%</div>
                        <div class="stat-label">Completion</div>
                    </div>
                </div>

                <div class="report-content">
                    <div class="report-section">
                        <h2 class="report-section-title">
                            <i class="fas fa-list-check"></i>
                            Action Items
                        </h2>
                        ${actionItemsHTML || '<p style="color: #718096; text-align: center; padding: 2rem;">No action items found.</p>'}
                    </div>
                </div>

                <div class="report-footer">
                    <p><strong>EY AI Taskforce</strong></p>
                    <p>This report was automatically generated by the EY Action Items & Initiative Tracker</p>
                    <p style="font-size: 0.85rem; margin-top: 1rem;">© ${new Date().getFullYear()} EY. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return html;
}

/**
 * Generate and download the report
 */
export function generateReport() {
    try {
        const stats = calculateStatistics();
        const html = generateReportHTML(stats);

        // Create a blob and download
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `EY_AI_Taskforce_Report_${timestamp}.html`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Report generated successfully!', 'success');
    } catch (error) {
        console.error('Error generating report:', error);
        showToast('Failed to generate report', 'error');
    }
}

/**
 * Open report in new window for preview
 */
export function previewReport() {
    try {
        const stats = calculateStatistics();
        const html = generateReportHTML(stats);

        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(html);
            newWindow.document.close();
        } else {
            showToast('Please allow pop-ups to preview the report', 'error');
        }
    } catch (error) {
        console.error('Error previewing report:', error);
        showToast('Failed to preview report', 'error');
    }
}

/**
 * Export report to Excel
 */
export function exportReportToExcel() {
    try {
        const stats = calculateStatistics();

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Summary sheet data
        const summaryData = [
            ['EY AI Taskforce Report'],
            ['Generated:', new Date().toLocaleString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })],
            [],
            ['Statistics Summary'],
            ['Metric', 'Value'],
            ['Total Items', stats.total],
            ['Completed', stats.completed],
            ['In Progress', stats.inProgress],
            ['Not Started', stats.notStarted],
            ['Blocked', stats.blocked],
            ['Overdue', stats.overdue],
            ['Completion Rate', `${stats.completionRate}%`]
        ];

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

        // Style summary sheet
        summarySheet['!cols'] = [{ wch: 25 }, { wch: 40 }];

        // Add summary sheet
        XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

        // Action items sheet data
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sortedItems = [...state.actionItems].sort((a, b) => {
            const dateA = parseDateLocal(a.date);
            const dateB = parseDateLocal(b.date);
            dateA.setHours(0, 0, 0, 0);
            dateB.setHours(0, 0, 0, 0);

            const isOverdueA = dateA < today && a.status !== 'Done';
            const isOverdueB = dateB < today && b.status !== 'Done';

            if (isOverdueA && !isOverdueB) return -1;
            if (!isOverdueA && isOverdueB) return 1;

            return dateA - dateB;
        });

        const itemsData = [
            ['Task Name / Description', 'Owners', 'Due Date', 'Status', 'Latest Update', 'Next Steps', 'Notes', 'Overdue']
        ];

        sortedItems.forEach(item => {
            const itemDate = parseDateLocal(item.date);
            itemDate.setHours(0, 0, 0, 0);
            const isOverdue = itemDate < today && item.status !== 'Done';
            const notes = item.notes ? stripHtml(item.notes) : 'No notes';
            const ownersText = Array.isArray(item.owners) ? item.owners.join(', ') : '';

            itemsData.push([
                item.description,
                ownersText,
                formatDate(item.date),
                item.status,
                item.latestUpdate || '',
                item.nextSteps || '',
                notes,
                isOverdue ? 'YES' : 'NO'
            ]);
        });

        const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);

        // Set column widths
        itemsSheet['!cols'] = [
            { wch: 45 },  // Task Name
            { wch: 25 },  // Owners
            { wch: 15 },  // Date
            { wch: 15 },  // Status
            { wch: 40 },  // Latest Update
            { wch: 40 },  // Next Steps
            { wch: 50 },  // Notes
            { wch: 10 }   // Overdue
        ];

        // Style header row
        const range = XLSX.utils.decode_range(itemsSheet['!ref']);
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!itemsSheet[cellAddress]) continue;

            itemsSheet[cellAddress].s = {
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

        // Add items sheet
        XLSX.utils.book_append_sheet(wb, itemsSheet, 'Action Items');

        // Add metadata
        wb.Props = {
            Title: 'EY AI Taskforce Report',
            Subject: 'Action Items & Initiative Tracker Report',
            Author: 'EY AI Taskforce',
            CreatedDate: new Date()
        };

        // Generate filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `EY_AI_Taskforce_Report_${timestamp}.xlsx`;

        // Download
        XLSX.writeFile(wb, filename);

        showToast('Report exported to Excel successfully!', 'success');
    } catch (error) {
        console.error('Error exporting report to Excel:', error);
        showToast('Failed to export report to Excel', 'error');
    }
}

/**
 * Export report to image (PNG)
 */
export function exportReportToImage() {
    try {
        showToast('Generating image... Please wait', 'info');

        const stats = calculateStatistics();
        const html = generateReportHTML(stats);

        // Create a temporary container
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '1200px';
        tempContainer.innerHTML = html;
        document.body.appendChild(tempContainer);

        // Wait for fonts and styles to load
        setTimeout(() => {
            const reportContainer = tempContainer.querySelector('.report-container');

            if (!reportContainer) {
                throw new Error('Report container not found');
            }

            // Use html2canvas to convert to image
            html2canvas(reportContainer, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            }).then(canvas => {
                // Convert canvas to blob
                canvas.toBlob(blob => {
                    // Create download link
                    const url = URL.createObjectURL(blob);
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                    const filename = `EY_AI_Taskforce_Report_${timestamp}.png`;

                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    // Clean up
                    document.body.removeChild(tempContainer);

                    showToast('Report exported as image successfully!', 'success');
                }, 'image/png');
            }).catch(error => {
                console.error('Error capturing report:', error);
                document.body.removeChild(tempContainer);
                showToast('Failed to export report as image', 'error');
            });
        }, 1000);
    } catch (error) {
        console.error('Error exporting report to image:', error);
        showToast('Failed to export report to image', 'error');
    }
}

// Export globally for onclick handlers
window.reportGenerator = {
    generateReport,
    previewReport,
    exportReportToExcel,
    exportReportToImage
};

export function initReportGeneratorGlobal() {
    window.generateReport = generateReport;
    window.previewReport = previewReport;
    window.exportReportToExcel = exportReportToExcel;
    window.exportReportToImage = exportReportToImage;
}
