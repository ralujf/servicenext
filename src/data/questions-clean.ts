export interface TestCase {
  input: any;
  expected: any;
  description?: string;
}

export interface QuestionExample {
  title: string;
  input: any;
  output: any;
  explanation?: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  hints?: string[];
  examples?: QuestionExample[];
  constraints?: string[];
  estimatedTime?: string;
}

export const mockQuestions: Question[] = [
  // ServiceNow Core Questions
  {
    id: 'sn-gliderecord-1',
    title: 'Query High Priority Incidents',
    description: `Write a function that queries all high priority incidents created in the last 7 days.

Requirements:
- Query the incident table using GlideRecord
- Filter for Priority 1 (Critical) and Priority 2 (High) incidents
- Only include incidents created in the last 7 days
- Return array of incident numbers and short descriptions
- Handle the case when no incidents are found

ServiceNow Context:
- Use GlideRecord('incident') to access the incident table
- Priority field values: 1 = Critical, 2 = High, 3 = Moderate, 4 = Low
- Use addQuery() to filter records
- Use sys_created_on field for date filtering`,
    difficulty: 'Easy',
    category: 'Server Side Scripts',
    tags: ['GlideRecord', 'ServiceNow', 'Database Query', 'Date Filtering'],
    starterCode: `function getHighPriorityIncidents() {
    // Your code here
    const incidents = [];
    
    return incidents;
}`,
    solution: `function getHighPriorityIncidents() {
    const incidents = [];
    const gr = new GlideRecord('incident');
    
    // Filter for high priority incidents (1 and 2)
    gr.addQuery('priority', 'IN', '1,2');
    
    // Filter for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    gr.addQuery('sys_created_on', '>=', sevenDaysAgo.toISOString().split('T')[0]);
    
    gr.query();
    
    while (gr.next()) {
        incidents.push({
            number: gr.getValue('number'),
            short_description: gr.getValue('short_description'),
            priority: gr.getValue('priority')
        });
    }
    
    return incidents;
}`,
    testCases: [
      {
        input: {},
        expected: [
          {
            number: 'INC0000001',
            short_description: 'Server down',
            priority: '2'
          }
        ],
        description: 'Should return high priority incidents from the last week'
      }
    ],
    hints: [
      'Use new GlideRecord("incident") to create a query object',
      'Use addQuery() to filter by priority values 1 and 2',
      'Use addQuery() with sys_created_on field for date filtering',
      'Use while (gr.next()) to iterate through results'
    ]
  },

  {
    id: 'sn-business-rule-1',
    title: 'Auto-assign by Category',
    description: `Create a business rule logic that automatically assigns incidents to appropriate teams based on their category.

Requirements:
- Check the current incident's category
- Set the assignment_group field based on category mapping
- Handle Hardware → Network Team
- Handle Software → Application Team  
- Handle Network → Infrastructure Team
- Log the assignment change for audit purposes
- Handle unknown categories gracefully

ServiceNow Context:
- Use current.getValue() to read field values
- Use current.setValue() to update field values  
- Use gs.log() for logging
- Business rules run server-side during record operations`,
    difficulty: 'Easy',
    category: 'Server Side Scripts',
    tags: ['Business Rules', 'ServiceNow', 'Workflow', 'Assignment'],
    starterCode: `function autoAssignByCategory() {
    // Your code here
    
}`,
    solution: `function autoAssignByCategory() {
    const category = current.getValue('category');
    let assignmentGroup = '';
    
    switch (category) {
        case 'Hardware':
            assignmentGroup = 'Network Team';
            break;
        case 'Software':
            assignmentGroup = 'Application Team';
            break;
        case 'Network':
            assignmentGroup = 'Infrastructure Team';
            break;
        default:
            assignmentGroup = 'General Support';
            gs.log('Unknown category: ' + category + '. Assigned to General Support.', 'Auto-Assignment');
            break;
    }
    
    current.setValue('assignment_group', assignmentGroup);
    gs.log('Incident auto-assigned to: ' + assignmentGroup + ' based on category: ' + category, 'Auto-Assignment');
}`,
    testCases: [
      {
        input: {},
        expected: undefined,
        description: 'Should auto-assign incident based on category and log the change'
      }
    ],
    hints: [
      'Use current.getValue("category") to get the incident category',
      'Use switch statement to map categories to teams',
      'Use current.setValue("assignment_group", team) to assign',
      'Use gs.log() to record assignment changes'
    ]
  },

  {
    id: 'sn-client-script-1',
    title: 'Field Validation',
    description: `Create a client script that validates the description field and provides user feedback.

Requirements:
- Validate that description is at least 10 characters long
- Ensure description contains only valid characters (no profanity)
- Show error message if validation fails
- Clear error message when validation passes
- Provide helpful guidance to users

ServiceNow Context:
- Use g_form.getValue() to read field values
- Use g_form.showFieldMsg() to display error messages
- Use g_form.hideFieldMsg() to clear error messages
- Client scripts run in the browser for immediate feedback`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['Client Scripts', 'ServiceNow', 'Validation', 'User Experience'],
    starterCode: `function validateDescription() {
    // Your code here
    
}`,
    solution: `function validateDescription() {
    const description = g_form.getValue('short_description');
    let isValid = true;
    
    // Check minimum length
    if (!description || description.length < 10) {
        g_form.showFieldMsg('short_description', 'Description must be at least 10 characters long', 'error');
        isValid = false;
    }
    // Check for numbers only (invalid for description)
    else if (/^\\d+$/.test(description)) {
        g_form.showFieldMsg('short_description', 'Description cannot contain only numbers', 'error');
        isValid = false;
    }
    else {
        // Validation passed
        g_form.hideFieldMsg('short_description');
    }
    
    return isValid;
}`,
    testCases: [
      {
        input: {},
        expected: true,
        description: 'Should validate description field and show appropriate messages'
      }
    ],
    hints: [
      'Use g_form.getValue("short_description") to get field value',
      'Check string length with .length property',
      'Use regular expressions to validate content',
      'Use g_form.showFieldMsg() for errors and g_form.hideFieldMsg() to clear'
    ]
  },

  // JavaScript Array Questions - Essential ones only
  {
    id: 'js-arrays-1',
    title: 'Filter Active Users',
    description: `Given an array of user objects, return an array containing only active users sorted by name.

Requirements:
- Filter users where active is true
- Sort by firstName in alphabetical order
- Return array of user objects
- Handle empty arrays gracefully

Implementation Notes:
Use JavaScript array methods to efficiently process the user data and return the filtered, sorted results.`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['Arrays', 'JavaScript', 'Filtering', 'Sorting'],
    starterCode: `function getActiveUsers(users) {
    // Your code here
    
    return [];
}`,
    solution: `function getActiveUsers(users) {
    if (!users || !Array.isArray(users)) {
        return [];
    }
    
    return users
        .filter(user => user.active === true)
        .sort((a, b) => a.firstName.localeCompare(b.firstName));
}`,
    testCases: [
      {
        input: { users: [
          { firstName: 'John', active: true },
          { firstName: 'Alice', active: false },
          { firstName: 'Bob', active: true }
        ]},
        expected: [
          { firstName: 'Bob', active: true },
          { firstName: 'John', active: true }
        ],
        description: 'Should filter and sort active users'
      }
    ],
    hints: [
      'Use Array.filter() to get active users',
      'Use Array.sort() with localeCompare for string sorting',
      'Chain array methods for efficient processing'
    ]
  },

  {
    id: 'js-arrays-2',
    title: 'Department Statistics',
    description: `Process an array of employee records to generate comprehensive department statistics.

Requirements:
- Count employees per department
- Calculate average salary per department
- Find highest paid employee in each department
- Return object with department as key

Output Format:
The result should be an object where each department name is a key, and the value contains count, averageSalary, and highestPaid employee information.

Performance Considerations:
Use efficient iteration patterns to process the data in a single pass where possible.`,
    difficulty: 'Medium',
    category: 'Server Side Scripts',
    tags: ['Arrays', 'JavaScript', 'Aggregation', 'Statistics'],
    starterCode: `function getDepartmentStats(employees) {
    // Your code here
    
    return {};
}`,
    solution: `function getDepartmentStats(employees) {
    if (!employees || !Array.isArray(employees)) {
        return {};
    }
    
    const stats = {};
    
    employees.forEach(emp => {
        const dept = emp.department;
        if (!stats[dept]) {
            stats[dept] = {
                count: 0,
                totalSalary: 0,
                highestPaid: emp
            };
        }
        
        stats[dept].count++;
        stats[dept].totalSalary += emp.salary;
        
        if (emp.salary > stats[dept].highestPaid.salary) {
            stats[dept].highestPaid = emp;
        }
    });
    
    // Calculate averages
    Object.keys(stats).forEach(dept => {
        stats[dept].averageSalary = Math.round(stats[dept].totalSalary / stats[dept].count);
    });
    
    return stats;
}`,
    testCases: [
      {
        input: { employees: [
          { name: 'John', department: 'IT', salary: 80000 },
          { name: 'Alice', department: 'IT', salary: 90000 },
          { name: 'Bob', department: 'HR', salary: 70000 }
        ]},
        expected: {
          IT: { count: 2, averageSalary: 85000, highestPaid: { name: 'Alice', department: 'IT', salary: 90000 } },
          HR: { count: 1, averageSalary: 70000, highestPaid: { name: 'Bob', department: 'HR', salary: 70000 } }
        },
        description: 'Should calculate department statistics'
      }
    ],
    hints: [
      'Use forEach to iterate through employees',
      'Build statistics object incrementally',
      'Track highest paid employee during iteration'
    ]
  },

  {
    id: 'js-arrays-3',
    title: 'Large Dataset Processing',
    description: `Optimize processing of large arrays for performance in ServiceNow environments.

Challenge:
ServiceNow has script execution time limits that can be exceeded when processing large datasets. Your solution must handle this gracefully.

Requirements:
- Process arrays in chunks to avoid script timeouts
- Implement batch processing with callbacks
- Handle memory efficiently
- Return processed results

ServiceNow Context:
In production ServiceNow environments, scripts have execution time limits. This pattern is essential for processing large record sets without timing out.

Performance Goals:
- Minimize memory usage during processing
- Provide progress feedback for long-running operations
- Ensure consistent performance regardless of dataset size`,
    difficulty: 'Hard',
    category: 'Server Side Scripts',
    tags: ['Arrays', 'JavaScript', 'Performance', 'Optimization'],
    starterCode: `function processLargeArray(data, processor, batchSize) {
    // Your code here
    
    return [];
}`,
    solution: `function processLargeArray(data, processor, batchSize = 100) {
    if (!data || !Array.isArray(data)) {
        return [];
    }
    
    const results = [];
    const totalItems = data.length;
    
    for (let i = 0; i < totalItems; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const batchResults = batch.map(processor);
        results.push(...batchResults);
        
        // Yield control to prevent timeouts in ServiceNow
        if (i + batchSize < totalItems) {
            // In ServiceNow, this would be where we'd yield
            gs.debug('Processed batch: ' + (i + batchSize) + '/' + totalItems);
        }
    }
    
    return results;
}`,
    testCases: [
      {
        input: { data: [1, 2, 3, 4, 5], processor: x => x * 2, batchSize: 2 },
        expected: [2, 4, 6, 8, 10],
        description: 'Should process array in batches'
      }
    ],
    hints: [
      'Use Array.slice() for batch processing',
      'Consider memory usage with large datasets',
      'Implement progress logging for ServiceNow'
    ]
  },

  // Additional ServiceNow API Questions (16 Easy)
  {
    id: 'sn-glideform-1',
    title: 'Dynamic Field Management',
    description: `Create a function that dynamically shows/hides fields based on form values using GlideForm API.

Requirements:
- Hide assignment_group field when priority is 4 (Low)
- Show assignment_group field for all other priority values
- Set assignment_group as mandatory when priority is 1 (Critical)
- Clear assignment_group value when hiding the field
- Provide visual feedback to users

ServiceNow Context:
- Use g_form.setVisible() to show/hide fields
- Use g_form.setMandatory() to set field requirements
- Use g_form.clearValue() to clear field values
- Client-side form manipulation improves user experience`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['GlideForm', 'Client Scripts', 'Form Management', 'Dynamic UI'],
    starterCode: `function manageAssignmentField(priority) {
    // Your code here
    
}`,
    solution: `function manageAssignmentField(priority) {
    if (priority == '4') {
        // Hide and clear assignment group for low priority
        g_form.setVisible('assignment_group', false);
        g_form.setMandatory('assignment_group', false);
        g_form.clearValue('assignment_group');
    } else {
        // Show assignment group for other priorities
        g_form.setVisible('assignment_group', true);
        
        if (priority == '1') {
            // Make mandatory for critical incidents
            g_form.setMandatory('assignment_group', true);
        } else {
            g_form.setMandatory('assignment_group', false);
        }
    }
}`,
    testCases: [
      {
        input: { priority: '1' },
        expected: { visible: true, mandatory: true },
        description: 'Should show and make assignment_group mandatory for critical priority'
      },
      {
        input: { priority: '4' },
        expected: { visible: false, mandatory: false },
        description: 'Should hide assignment_group for low priority'
      }
    ],
    hints: [
      'Use g_form.setVisible() to control field visibility',
      'Use g_form.setMandatory() to control field requirements',
      'Use g_form.clearValue() to clear field when hiding',
      'Check priority values with == for string comparison'
    ]
  },

  {
    id: 'sn-glidemodal-1',
    title: 'Confirmation Dialog',
    description: `Implement a confirmation dialog using GlideModal for critical actions.

Requirements:
- Display a confirmation modal before deleting records
- Include record details in the confirmation message
- Handle user confirmation and cancellation
- Execute callback function on confirmation
- Style the modal appropriately for the action type

ServiceNow Context:
- Use GlideModal to create modal dialogs
- Provide clear user feedback for destructive actions
- Improve user experience with confirmations
- Modal dialogs are client-side UI components`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['GlideModal', 'User Interface', 'Confirmation', 'Client Scripts'],
    starterCode: `function showDeleteConfirmation(recordName, callback) {
    // Your code here
    
}`,
    solution: `function showDeleteConfirmation(recordName, callback) {
    var modal = new GlideModal('glide_confirm_standard', false, 400);
    modal.setTitle('Confirm Deletion');
    
    var message = 'Are you sure you want to delete "' + recordName + '"?\\n\\n';
    message += 'This action cannot be undone.';
    
    modal.setBody(message);
    
    modal.on('beforeclose', function(response) {
        if (response === 'ok') {
            if (typeof callback === 'function') {
                callback(true);
            }
        } else {
            if (typeof callback === 'function') {
                callback(false);
            }
        }
    });
    
    modal.render();
}`,
    testCases: [
      {
        input: { recordName: 'INC0000123', callback: 'function' },
        expected: { modalShown: true, titleSet: true },
        description: 'Should display confirmation modal with record name'
      }
    ],
    hints: [
      'Use new GlideModal() to create modal instance',
      'Use setTitle() and setBody() to set modal content',
      'Use on("beforeclose") to handle user response',
      'Execute callback function based on user choice'
    ]
  },

  {
    id: 'sn-glidelist-1',
    title: 'List Management',
    description: `Create a function to manage ServiceNow lists using GlideList API.

Requirements:
- Refresh a specific list by table name
- Add a filter to show only active records
- Set list to show 25 records per page
- Sort list by created date descending
- Handle list refresh completion

ServiceNow Context:
- Use GlideList to interact with list views
- Lists display multiple records in tabular format
- List operations improve user productivity
- Client-side list manipulation enhances user experience`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['GlideList', 'List Views', 'Filtering', 'Client Scripts'],
    starterCode: `function configureIncidentList() {
    // Your code here
    
}`,
    solution: `function configureIncidentList() {
    var list = new GlideList('incident');
    
    // Add filter for active records only
    list.addFilter('active', true);
    
    // Set records per page
    list.setRowsPerPage(25);
    
    // Sort by created date descending
    list.sort('sys_created_on', 'DESC');
    
    // Refresh the list
    list.refresh();
    
    return list;
}`,
    testCases: [
      {
        input: {},
        expected: { filtered: true, sorted: true, refreshed: true },
        description: 'Should configure and refresh incident list with filters and sorting'
      }
    ],
    hints: [
      'Use new GlideList() with table name',
      'Use addFilter() to add list filters',
      'Use setRowsPerPage() to control pagination',
      'Use sort() method for list ordering'
    ]
  },

  {
    id: 'sn-glidenavigation-1',
    title: 'Navigation Management',
    description: `Implement navigation functions using GlideNavigation API.

Requirements:
- Navigate to a specific form record
- Open a new record form in the same window
- Navigate to a list view with pre-applied filters
- Handle navigation with URL parameters
- Preserve user context during navigation

ServiceNow Context:
- Use GlideNavigation for programmatic navigation
- Navigation maintains application state
- Client-side navigation improves user flow
- Proper navigation enhances user experience`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['GlideNavigation', 'Navigation', 'Routing', 'Client Scripts'],
    starterCode: `function navigateToRecord(table, sysId, view) {
    // Your code here
    
}`,
    solution: `function navigateToRecord(table, sysId, view) {
    if (sysId && sysId !== 'new') {
        // Navigate to existing record
        var url = table + '.do?sys_id=' + sysId;
        if (view) {
            url += '&sysparm_view=' + view;
        }
        GlideNavigation.open(url);
    } else {
        // Navigate to new record form
        var newUrl = table + '.do?sys_id=-1';
        if (view) {
            newUrl += '&sysparm_view=' + view;
        }
        GlideNavigation.open(newUrl);
    }
}`,
    testCases: [
      {
        input: { table: 'incident', sysId: '12345', view: 'default' },
        expected: { navigated: true, urlCorrect: true },
        description: 'Should navigate to incident record with specified view'
      },
      {
        input: { table: 'incident', sysId: 'new', view: null },
        expected: { navigated: true, newRecord: true },
        description: 'Should navigate to new incident form'
      }
    ],
    hints: [
      'Use GlideNavigation.open() for navigation',
      'Build URLs with proper parameters',
      'Handle both existing and new records',
      'Include view parameter when specified'
    ]
  },

  {
    id: 'sn-gliderecord-2',
    title: 'Bulk Record Updates',
    description: `Implement bulk record updates using GlideRecord with proper error handling.

Requirements:
- Update multiple incident records based on criteria
- Set assignment group for unassigned high-priority incidents
- Add work notes to updated records
- Track number of successful updates
- Handle and log any update failures

ServiceNow Context:
- Use GlideRecord for database operations
- Bulk operations improve system performance
- Proper error handling prevents data corruption
- Work notes provide audit trail`,
    difficulty: 'Easy',
    category: 'Server Side Scripts',
    tags: ['GlideRecord', 'Bulk Operations', 'Error Handling', 'Database'],
    starterCode: `function bulkAssignIncidents() {
    // Your code here
    
    return 0;
}`,
    solution: `function bulkAssignIncidents() {
    var gr = new GlideRecord('incident');
    gr.addQuery('priority', 'IN', '1,2');
    gr.addQuery('assignment_group', '');
    gr.addQuery('state', '!=', '6'); // Not resolved
    gr.query();
    
    var updateCount = 0;
    
    while (gr.next()) {
        try {
            gr.assignment_group = 'Incident Management';
            gr.work_notes = 'Auto-assigned to Incident Management team due to high priority';
            gr.update();
            updateCount++;
        } catch (e) {
            gs.error('Failed to update incident ' + gr.number + ': ' + e.message);
        }
    }
    
    gs.info('Bulk assignment completed. Updated ' + updateCount + ' incidents.');
    return updateCount;
}`,
    testCases: [
      {
        input: {},
        expected: 1,
        description: 'Should update high priority unassigned incidents'
      }
    ],
    hints: [
      'Use addQuery() to filter for high priority and unassigned records',
      'Use try-catch for error handling in the update loop',
      'Use work_notes field to add audit information',
      'Track and return the number of successful updates'
    ]
  },

  {
    id: 'sn-glideaggregate-1',
    title: 'Incident Statistics',
    description: `Generate incident statistics using GlideAggregate API.

Requirements:
- Count incidents by priority level
- Calculate average resolution time by category
- Find the assignment group with most incidents
- Group results by month for trending
- Return formatted statistics object

ServiceNow Context:
- Use GlideAggregate for efficient data aggregation
- Aggregation reduces database load compared to individual queries
- Statistics help with reporting and analysis
- Proper grouping enables trend analysis`,
    difficulty: 'Easy',
    category: 'Server Side Scripts',
    tags: ['GlideAggregate', 'Statistics', 'Reporting', 'Database'],
    starterCode: `function getIncidentStatistics() {
    // Your code here
    
    return {};
}`,
    solution: `function getIncidentStatistics() {
    var stats = {};
    
    // Count by priority
    var ga = new GlideAggregate('incident');
    ga.addAggregate('COUNT');
    ga.groupBy('priority');
    ga.query();
    
    stats.byPriority = {};
    while (ga.next()) {
        var priority = ga.priority.toString();
        var count = parseInt(ga.getAggregate('COUNT'));
        stats.byPriority[priority] = count;
    }
    
    // Count by assignment group
    var ga2 = new GlideAggregate('incident');
    ga2.addAggregate('COUNT');
    ga2.groupBy('assignment_group');
    ga2.orderByAggregate('COUNT');
    ga2.query();
    
    stats.byAssignmentGroup = {};
    var topGroup = '';
    var maxCount = 0;
    
    while (ga2.next()) {
        var group = ga2.assignment_group.getDisplayValue();
        var count = parseInt(ga2.getAggregate('COUNT'));
        stats.byAssignmentGroup[group] = count;
        
        if (count > maxCount) {
            maxCount = count;
            topGroup = group;
        }
    }
    
    stats.topAssignmentGroup = { name: topGroup, count: maxCount };
    
    return stats;
}`,
    testCases: [
      {
        input: {},
        expected: {
          byPriority: { '2': 1 },
          byAssignmentGroup: { 'Network Team': 1 },
          topAssignmentGroup: { name: 'Network Team', count: 1 }
        },
        description: 'Should return incident statistics grouped by priority and assignment group'
      }
    ],
    hints: [
      'Use GlideAggregate with COUNT aggregate function',
      'Use groupBy() to group results by specific fields',
      'Use getAggregate() to retrieve calculated values',
      'Use orderByAggregate() to sort by aggregated values'
    ]
  },

  {
    id: 'sn-glidedate-1',
    title: 'Date Calculations',
    description: `Implement date calculations using GlideDate API for business logic.

Requirements:
- Calculate business days between two dates
- Add/subtract business days from a given date
- Check if a date falls on a weekend
- Format dates for different display purposes
- Handle date validation and edge cases

ServiceNow Context:
- Use GlideDate for date-only operations
- Business day calculations exclude weekends and holidays
- Date formatting ensures consistent display
- Proper date handling prevents calculation errors`,
    difficulty: 'Easy',
    category: 'Server Side Scripts',
    tags: ['GlideDate', 'Date Calculations', 'Business Logic', 'Utilities'],
    starterCode: `function calculateBusinessDays(startDate, endDate) {
    // Your code here
    
    return 0;
}`,
    solution: `function calculateBusinessDays(startDate, endDate) {
    if (!startDate || !endDate) {
        return 0;
    }
    
    var start = new GlideDate();
    start.setDisplayValue(startDate);
    
    var end = new GlideDate();
    end.setDisplayValue(endDate);
    
    if (start.after(end)) {
        // Swap dates if start is after end
        var temp = start;
        start = end;
        end = temp;
    }
    
    var businessDays = 0;
    var current = new GlideDate(start);
    
    while (current.before(end) || current.equals(end)) {
        var dayOfWeek = current.getDayOfWeekLocalTime();
        // Monday = 1, Sunday = 7, so weekdays are 1-5
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            businessDays++;
        }
        current.addDaysLocalTime(1);
    }
    
    return businessDays;
}`,
    testCases: [
      {
        input: { startDate: '2024-01-01', endDate: '2024-01-05' },
        expected: 5,
        description: 'Should calculate business days between two dates'
      },
      {
        input: { startDate: '2024-01-06', endDate: '2024-01-07' },
        expected: 0,
        description: 'Should return 0 for weekend-only period'
      }
    ],
    hints: [
      'Use GlideDate constructor and setDisplayValue()',
      'Use getDayOfWeekLocalTime() to check for weekdays (1-5)',
      'Use addDaysLocalTime() to increment dates',
      'Use before(), after(), and equals() for date comparisons'
    ]
  },

  {
    id: 'sn-glidedatetime-1',
    title: 'SLA Time Calculations',
    description: `Calculate SLA compliance using GlideDateTime for incident management.

Requirements:
- Calculate time elapsed between incident creation and resolution
- Check if incident was resolved within SLA timeframe
- Account for business hours (9 AM - 5 PM, Monday-Friday)
- Handle timezone conversions properly
- Return detailed SLA compliance information

ServiceNow Context:
- Use GlideDateTime for timestamp operations
- SLA calculations often require business hour considerations
- Timezone handling is crucial for global organizations
- Accurate time tracking enables SLA reporting`,
    difficulty: 'Easy',
    category: 'Server Side Scripts',
    tags: ['GlideDateTime', 'SLA', 'Time Calculations', 'Business Hours'],
    starterCode: `function calculateSLACompliance(createdTime, resolvedTime, slaHours) {
    // Your code here
    
    return {};
}`,
    solution: `function calculateSLACompliance(createdTime, resolvedTime, slaHours) {
    if (!createdTime || !resolvedTime || !slaHours) {
        return { compliant: false, error: 'Missing required parameters' };
    }
    
    var created = new GlideDateTime(createdTime);
    var resolved = new GlideDateTime(resolvedTime);
    
    // Calculate total elapsed time in hours
    var elapsedMs = resolved.getNumericValue() - created.getNumericValue();
    var elapsedHours = elapsedMs / (1000 * 60 * 60);
    
    var compliant = elapsedHours <= slaHours;
    var breachTime = elapsedHours - slaHours;
    
    return {
        compliant: compliant,
        elapsedHours: Math.round(elapsedHours * 100) / 100,
        slaHours: slaHours,
        breachHours: breachTime > 0 ? Math.round(breachTime * 100) / 100 : 0,
        createdTime: created.getDisplayValue(),
        resolvedTime: resolved.getDisplayValue()
    };
}`,
    testCases: [
      {
        input: { 
          createdTime: '2024-01-01 09:00:00', 
          resolvedTime: '2024-01-01 11:00:00', 
          slaHours: 4 
        },
        expected: { 
          compliant: true, 
          elapsedHours: 2, 
          breachHours: 0 
        },
        description: 'Should indicate SLA compliance when resolved within timeframe'
      }
    ],
    hints: [
      'Use GlideDateTime constructor with timestamp string',
      'Use getNumericValue() to get milliseconds for calculations',
      'Convert milliseconds to hours by dividing by (1000 * 60 * 60)',
      'Use Math.round() for precise decimal formatting'
    ]
  },

  {
    id: 'sn-glidegeopoint-1',
    title: 'Location Services',
    description: `Implement location-based services using GlideGeoPoint API.

Requirements:
- Calculate distance between two geographic points
- Find the nearest service location to an incident
- Validate geographic coordinates
- Convert between different coordinate formats
- Handle location-based routing logic

ServiceNow Context:
- Use GlideGeoPoint for geographic calculations
- Location services enable field service management
- Distance calculations help with resource allocation
- Geographic data enhances service delivery`,
    difficulty: 'Easy',
    category: 'Server Side Scripts',
    tags: ['GlideGeoPoint', 'Geographic', 'Location Services', 'Field Service'],
    starterCode: `function findNearestLocation(incidentLat, incidentLng, serviceLocations) {
    // Your code here
    
    return null;
}`,
    solution: `function findNearestLocation(incidentLat, incidentLng, serviceLocations) {
    if (!incidentLat || !incidentLng || !serviceLocations || !serviceLocations.length) {
        return null;
    }
    
    var incidentPoint = new GlideGeoPoint(incidentLat, incidentLng);
    var nearestLocation = null;
    var shortestDistance = Number.MAX_VALUE;
    
    for (var i = 0; i < serviceLocations.length; i++) {
        var location = serviceLocations[i];
        var locationPoint = new GlideGeoPoint(location.lat, location.lng);
        
        // Calculate distance in kilometers
        var distance = incidentPoint.distanceTo(locationPoint);
        
        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestLocation = {
                name: location.name,
                lat: location.lat,
                lng: location.lng,
                distance: Math.round(distance * 100) / 100
            };
        }
    }
    
    return nearestLocation;
}`,
    testCases: [
      {
        input: { 
          incidentLat: 40.7128, 
          incidentLng: -74.0060, 
          serviceLocations: [
            { name: 'NYC Office', lat: 40.7589, lng: -73.9851 },
            { name: 'Boston Office', lat: 42.3601, lng: -71.0589 }
          ]
        },
        expected: { 
          name: 'NYC Office', 
          distance: 5.24 
        },
        description: 'Should find the nearest service location to the incident'
      }
    ],
    hints: [
      'Use GlideGeoPoint constructor with latitude and longitude',
      'Use distanceTo() method to calculate distance between points',
      'Track the minimum distance while iterating through locations',
      'Return location details along with calculated distance'
    ]
  },

  {
    id: 'sn-glideelement-1',
    title: 'Field Manipulation',
    description: `Manipulate form fields using GlideElement API for advanced form logic.

Requirements:
- Get and set field values with proper data type handling
- Check field permissions (readable, writable)
- Validate field data and show appropriate messages
- Handle choice list fields and their options
- Manage field attributes dynamically

ServiceNow Context:
- Use GlideElement for individual field operations
- Field-level control enables complex form behavior
- Proper validation improves data quality
- Dynamic field management enhances user experience`,
    difficulty: 'Easy',
    category: 'Server Side Scripts',
    tags: ['GlideElement', 'Field Management', 'Validation', 'Form Logic'],
    starterCode: `function validateAndSetPriority(priorityField, categoryValue) {
    // Your code here
    
    return false;
}`,
    solution: `function validateAndSetPriority(priorityField, categoryValue) {
    if (!priorityField || !categoryValue) {
        return false;
    }
    
    // Check if field is writable
    if (!priorityField.canWrite()) {
        gs.warn('Priority field is not writable for current user');
        return false;
    }
    
    // Validate category and set appropriate priority
    var newPriority = '';
    switch (categoryValue.toLowerCase()) {
        case 'security':
        case 'network':
            newPriority = '1'; // Critical
            break;
        case 'hardware':
            newPriority = '2'; // High
            break;
        case 'software':
            newPriority = '3'; // Moderate
            break;
        default:
            newPriority = '4'; // Low
            break;
    }
    
    // Set the value
    priorityField.setValue(newPriority);
    
    // Add validation message
    if (newPriority === '1') {
        gs.addInfoMessage('Priority set to Critical based on category: ' + categoryValue);
    }
    
    return true;
}`,
    testCases: [
      {
        input: { 
          priorityField: { canWrite: true, setValue: 'function' }, 
          categoryValue: 'Security' 
        },
        expected: true,
        description: 'Should set priority to Critical for security category'
      }
    ],
    hints: [
      'Use canWrite() to check field permissions',
      'Use setValue() to set field values',
      'Implement business logic based on field relationships',
      'Use gs.addInfoMessage() for user feedback'
    ]
  },

  {
    id: 'sn-glidetimer-1',
    title: 'Performance Monitoring',
    description: `Implement performance monitoring using GlideTimer API for script optimization.

Requirements:
- Measure execution time of code blocks
- Track performance metrics for different operations
- Log performance data for analysis
- Identify bottlenecks in business logic
- Generate performance reports

ServiceNow Context:
- Use GlideTimer for precise time measurements
- Performance monitoring helps optimize scripts
- Timing data enables performance tuning
- Monitoring prevents performance degradation`,
    difficulty: 'Easy',
    category: 'Server Side Scripts',
    tags: ['GlideTimer', 'Performance', 'Monitoring', 'Optimization'],
    starterCode: `function measureDatabaseOperations() {
    // Your code here
    
    return {};
}`,
    solution: `function measureDatabaseOperations() {
    var timer = new GlideTimer();
    var metrics = {};
    
    // Measure query operation
    timer.start();
    var gr = new GlideRecord('incident');
    gr.addQuery('active', true);
    gr.query();
    
    var queryCount = 0;
    while (gr.next() && queryCount < 10) {
        // Process first 10 records
        queryCount++;
    }
    timer.stop();
    
    metrics.queryTime = timer.getTime();
    metrics.recordsProcessed = queryCount;
    
    // Measure aggregation operation
    timer.start();
    var ga = new GlideAggregate('incident');
    ga.addAggregate('COUNT');
    ga.groupBy('priority');
    ga.query();
    
    var aggregateCount = 0;
    while (ga.next()) {
        aggregateCount++;
    }
    timer.stop();
    
    metrics.aggregateTime = timer.getTime();
    metrics.aggregateGroups = aggregateCount;
    
    // Log performance data
    gs.info('Database operations performance: Query=' + metrics.queryTime + 'ms, Aggregate=' + metrics.aggregateTime + 'ms');
    
    return metrics;
}`,
    testCases: [
      {
        input: {},
        expected: { 
          queryTime: 50, 
          recordsProcessed: 1, 
          aggregateTime: 30, 
          aggregateGroups: 1 
        },
        description: 'Should measure and return performance metrics for database operations'
      }
    ],
    hints: [
      'Use new GlideTimer() to create timer instance',
      'Use start() and stop() to control timing measurements',
      'Use getTime() to retrieve elapsed milliseconds',
      'Log performance data using gs.info() for analysis'
    ]
  },

  {
    id: 'sn-midserver-1',
    title: 'MID Server Communication',
    description: `Implement MID Server communication for external system integration.

Requirements:
- Send probe to MID Server for external data collection
- Handle MID Server response processing
- Validate MID Server connectivity
- Process external system data through MID Server
- Handle MID Server error conditions

ServiceNow Context:
- MID Server enables secure external system access
- Probes execute on MID Server for data collection
- MID Server communication is asynchronous
- Proper error handling ensures reliable integration`,
    difficulty: 'Easy',
    category: 'Server Side Scripts',
    tags: ['MIDServer', 'Integration', 'External Systems', 'Probes'],
    starterCode: `function sendDiscoveryProbe(targetIP, midServerName) {
    // Your code here
    
    return false;
}`,
    solution: `function sendDiscoveryProbe(targetIP, midServerName) {
    if (!targetIP || !midServerName) {
        gs.error('Target IP and MID Server name are required');
        return false;
    }
    
    try {
        // Create probe record
        var probe = new GlideRecord('ecc_queue');
        probe.agent = 'mid.server.' + midServerName;
        probe.topic = 'Discovery';
        probe.name = 'DiscoveryProbe:' + targetIP;
        probe.source = 'ServiceNow';
        
        // Set probe parameters
        var probeParams = {
            target: targetIP,
            probe_type: 'ping',
            timeout: 30,
            created_by: gs.getUserName()
        };
        
        probe.payload = JSON.stringify(probeParams);
        probe.state = 'ready';
        
        var probeId = probe.insert();
        
        if (probeId) {
            gs.info('Discovery probe sent to MID Server ' + midServerName + ' for target ' + targetIP);
            return true;
        } else {
            gs.error('Failed to create probe record');
            return false;
        }
        
    } catch (e) {
        gs.error('Error sending probe to MID Server: ' + e.message);
        return false;
    }
}`,
    testCases: [
      {
        input: { targetIP: '192.168.1.1', midServerName: 'MID001' },
        expected: true,
        description: 'Should successfully send discovery probe to MID Server'
      },
      {
        input: { targetIP: '', midServerName: 'MID001' },
        expected: false,
        description: 'Should fail when target IP is empty'
      }
    ],
    hints: [
      'Use GlideRecord with "ecc_queue" table for MID Server communication',
      'Set agent field to identify target MID Server',
      'Use JSON.stringify() to format probe payload',
      'Implement proper error handling with try-catch'
    ]
  },

  {
    id: 'sn-gliderecord-3',
    title: 'Advanced Query Building',
    description: `Build complex queries using GlideRecord with multiple conditions and joins.

Requirements:
- Create queries with OR conditions
- Use encoded queries for complex logic
- Implement date range filtering
- Add null/not null conditions
- Use query optimization techniques

ServiceNow Context:
- Complex queries enable sophisticated data filtering
- Encoded queries provide flexibility for dynamic conditions
- Query optimization improves performance
- Advanced filtering supports complex business requirements`,
    difficulty: 'Easy',
    category: 'Server Side Scripts',
    tags: ['GlideRecord', 'Advanced Queries', 'Complex Logic', 'Optimization'],
    starterCode: `function findCriticalUnresolvedIncidents() {
    // Your code here
    
    return [];
}`,
    solution: `function findCriticalUnresolvedIncidents() {
    var incidents = [];
    var gr = new GlideRecord('incident');
    
    // Build complex query: (priority = 1 OR priority = 2) AND state != 6 AND assignment_group IS NOT NULL
    var qc = gr.addQuery('priority', 'IN', '1,2');
    gr.addQuery('state', '!=', '6'); // Not resolved
    gr.addQuery('assignment_group', '!=', ''); // Has assignment group
    
    // Add date condition - created in last 30 days
    var thirtyDaysAgo = new GlideDateTime();
    thirtyDaysAgo.addDaysLocalTime(-30);
    gr.addQuery('sys_created_on', '>=', thirtyDaysAgo);
    
    // Order by priority (ascending) then created date (descending)
    gr.orderBy('priority');
    gr.orderByDesc('sys_created_on');
    
    // Limit results for performance
    gr.setLimit(100);
    
    gr.query();
    
    while (gr.next()) {
        incidents.push({
            number: gr.getValue('number'),
            priority: gr.getValue('priority'),
            short_description: gr.getValue('short_description'),
            assignment_group: gr.getDisplayValue('assignment_group'),
            created: gr.getValue('sys_created_on'),
            state: gr.getDisplayValue('state')
        });
    }
    
    return incidents;
}`,
    testCases: [
      {
        input: {},
        expected: [{
          number: 'INC0000001',
          priority: '2',
          short_description: 'Server down',
          assignment_group: 'Network Team',
          state: 'In Progress'
        }],
        description: 'Should return critical unresolved incidents with assignment groups'
      }
    ],
    hints: [
      'Use addQuery() with IN operator for multiple values',
      'Use orderBy() and orderByDesc() for complex sorting',
      'Use setLimit() to optimize query performance',
      'Use GlideDateTime for date calculations'
    ]
  },

  {
    id: 'sn-glideform-2',
    title: 'Form Workflow Management',
    description: `Implement advanced form workflow using GlideForm API for state transitions.

Requirements:
- Control form submission based on field validation
- Implement approval workflow state management
- Show/hide sections based on workflow state
- Validate required fields for each workflow step
- Provide user guidance for workflow progression

ServiceNow Context:
- Form workflows guide users through complex processes
- State-based validation ensures data integrity
- Dynamic form behavior improves user experience
- Workflow controls prevent invalid transitions`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['GlideForm', 'Workflow', 'State Management', 'Validation'],
    starterCode: `function manageApprovalWorkflow(currentState) {
    // Your code here
    
}`,
    solution: `function manageApprovalWorkflow(currentState) {
    var state = currentState || g_form.getValue('state');
    
    switch (state) {
        case 'draft':
            // Draft state - allow editing, hide approval fields
            g_form.setReadOnly('short_description', false);
            g_form.setReadOnly('description', false);
            g_form.setVisible('approval', false);
            g_form.setVisible('approved_by', false);
            g_form.setMandatory('short_description', true);
            g_form.addInfoMessage('Complete the form details and submit for approval.');
            break;
            
        case 'pending_approval':
            // Pending approval - make fields read-only, show approval section
            g_form.setReadOnly('short_description', true);
            g_form.setReadOnly('description', true);
            g_form.setVisible('approval', true);
            g_form.setVisible('approved_by', true);
            g_form.setMandatory('approval', true);
            g_form.addInfoMessage('Request is pending approval. Contact approver if needed.');
            break;
            
        case 'approved':
            // Approved state - all fields read-only except work notes
            g_form.setReadOnly('short_description', true);
            g_form.setReadOnly('description', true);
            g_form.setReadOnly('approval', true);
            g_form.setVisible('work_notes', true);
            g_form.addInfoMessage('Request approved. You may add work notes as needed.');
            break;
            
        case 'rejected':
            // Rejected state - allow editing for resubmission
            g_form.setReadOnly('short_description', false);
            g_form.setReadOnly('description', false);
            g_form.setVisible('approval', true);
            g_form.setReadOnly('approval', true);
            g_form.addErrorMessage('Request was rejected. Please review and resubmit.');
            break;
    }
}`,
    testCases: [
      {
        input: { currentState: 'draft' },
        expected: { editable: true, approvalVisible: false },
        description: 'Should enable editing and hide approval fields in draft state'
      },
      {
        input: { currentState: 'approved' },
        expected: { editable: false, workNotesVisible: true },
        description: 'Should make fields read-only and show work notes when approved'
      }
    ],
    hints: [
      'Use switch statement to handle different workflow states',
      'Use setReadOnly() to control field editability',
      'Use setVisible() to show/hide relevant sections',
      'Use addInfoMessage() and addErrorMessage() for user guidance'
    ]
  },

  {
    id: 'sn-glidedate-2',
    title: 'Holiday Calendar Management',
    description: `Manage holiday calendars using GlideDate for accurate business day calculations.

Requirements:
- Check if a given date is a company holiday
- Calculate next business day excluding weekends and holidays
- Generate holiday calendar for a given year
- Handle different holiday calendars by region
- Validate and format holiday dates

ServiceNow Context:
- Holiday calendars affect SLA calculations
- Business day calculations must exclude holidays
- Regional differences require flexible holiday management
- Accurate calendar data ensures correct scheduling`,
    difficulty: 'Easy',
    category: 'Server Side Scripts',
    tags: ['GlideDate', 'Holidays', 'Business Calendar', 'Regional Settings'],
    starterCode: `function getNextBusinessDay(date, holidayList) {
    // Your code here
    
    return null;
}`,
    solution: `function getNextBusinessDay(date, holidayList) {
    if (!date) {
        return null;
    }
    
    var currentDate = new GlideDate();
    if (typeof date === 'string') {
        currentDate.setDisplayValue(date);
    } else {
        currentDate = new GlideDate(date);
    }
    
    // Convert holiday list to GlideDate objects for comparison
    var holidays = [];
    if (holidayList && Array.isArray(holidayList)) {
        for (var i = 0; i < holidayList.length; i++) {
            var holiday = new GlideDate();
            holiday.setDisplayValue(holidayList[i]);
            holidays.push(holiday);
        }
    }
    
    // Start from next day
    currentDate.addDaysLocalTime(1);
    
    while (true) {
        var dayOfWeek = currentDate.getDayOfWeekLocalTime();
        var isWeekend = (dayOfWeek === 6 || dayOfWeek === 7); // Saturday or Sunday
        var isHoliday = false;
        
        // Check if current date is a holiday
        for (var j = 0; j < holidays.length; j++) {
            if (currentDate.equals(holidays[j])) {
                isHoliday = true;
                break;
            }
        }
        
        if (!isWeekend && !isHoliday) {
            return currentDate.getDisplayValue();
        }
        
        currentDate.addDaysLocalTime(1);
    }
}`,
    testCases: [
      {
        input: { 
          date: '2024-12-24', 
          holidayList: ['2024-12-25', '2024-12-26'] 
        },
        expected: '2024-12-27',
        description: 'Should return next business day after Christmas holidays'
      },
      {
        input: { 
          date: '2024-01-05', 
          holidayList: [] 
        },
        expected: '2024-01-08',
        description: 'Should skip weekend and return Monday'
      }
    ],
    hints: [
      'Use addDaysLocalTime(1) to move to next day',
      'Use getDayOfWeekLocalTime() to check for weekends (6=Saturday, 7=Sunday)',
      'Use equals() method to compare GlideDate objects',
      'Continue loop until finding a non-weekend, non-holiday date'
    ]
  },

  // JavaScript Array and Currying Questions (5 Easy)
  {
    id: 'js-currying-1',
    title: 'Function Currying Basics',
    description: `Implement function currying for reusable ServiceNow utilities.

Requirements:
- Create a curried function for database queries
- Allow partial application of query parameters
- Support multiple argument configurations
- Return a new function for each partial application
- Maintain function context and scope

Currying Benefits:
- Enables function specialization and reuse
- Improves code modularity and composition
- Creates more flexible API interfaces
- Supports functional programming patterns`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['Currying', 'Functional Programming', 'JavaScript', 'Utilities'],
    starterCode: `function createQueryBuilder(table) {
    // Your code here
    
}`,
    solution: `function createQueryBuilder(table) {
    return function(field) {
        return function(operator) {
            return function(value) {
                // Simulate building a query object
                return {
                    table: table,
                    field: field,
                    operator: operator,
                    value: value,
                    toString: function() {
                        return table + '.' + field + ' ' + operator + ' ' + value;
                    }
                };
            };
        };
    };
}`,
    testCases: [
      {
        input: { table: 'incident' },
        expected: 'function',
        description: 'Should return a function for further currying'
      }
    ],
    hints: [
      'Return a function from each curried level',
      'Capture parameters in closure scope',
      'Build final result when all parameters are provided',
      'Use function composition for flexibility'
    ]
  },

  {
    id: 'js-arrays-4',
    title: 'Array Transformation Pipeline',
    description: `Create array transformation pipeline for ServiceNow data processing.

Requirements:
- Chain multiple array operations together
- Transform user data through multiple steps
- Filter, map, and reduce in sequence
- Handle empty arrays and edge cases
- Support method chaining pattern

Pipeline Benefits:
- Enables complex data transformations
- Improves code readability and maintainability
- Supports functional programming style
- Creates reusable data processing patterns`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['Arrays', 'Pipeline', 'Method Chaining', 'Data Processing'],
    starterCode: `function createUserPipeline(users) {
    // Your code here
    
    return [];
}`,
    solution: `function createUserPipeline(users) {
    if (!users || !Array.isArray(users)) {
        return [];
    }
    
    return users
        .filter(user => user.active && user.roles && user.roles.length > 0)
        .map(user => ({
            ...user,
            fullName: (user.firstName + ' ' + user.lastName).trim(),
            roleCount: user.roles.length,
            isAdmin: user.roles.includes('admin')
        }))
        .sort((a, b) => {
            // Sort by admin status first, then by role count
            if (a.isAdmin !== b.isAdmin) {
                return b.isAdmin - a.isAdmin;
            }
            return b.roleCount - a.roleCount;
        })
        .slice(0, 10); // Limit to top 10 users
}`,
    testCases: [
      {
        input: { users: [
          { firstName: 'John', lastName: 'Doe', active: true, roles: ['user', 'admin'] },
          { firstName: 'Jane', lastName: 'Smith', active: true, roles: ['user'] },
          { firstName: 'Bob', lastName: 'Wilson', active: false, roles: ['user'] }
        ]},
        expected: [
          { firstName: 'John', lastName: 'Doe', fullName: 'John Doe', roleCount: 2, isAdmin: true },
          { firstName: 'Jane', lastName: 'Smith', fullName: 'Jane Smith', roleCount: 1, isAdmin: false }
        ],
        description: 'Should filter, transform, and sort users in pipeline'
      }
    ],
    hints: [
      'Chain array methods using dot notation',
      'Use filter() to remove inactive users and users without roles',
      'Use map() to transform and add computed properties',
      'Use sort() with custom comparator for complex ordering'
    ]
  },

  {
    id: 'js-arrays-5',
    title: 'Dynamic Array Grouping',
    description: `Implement dynamic array grouping for flexible data organization.

Requirements:
- Group array elements by any specified property
- Support nested property paths for grouping
- Handle missing or undefined grouping values
- Return grouped data in organized structure
- Support multiple grouping criteria

Grouping Applications:
- Organize incidents by priority and category
- Group users by department and role
- Categorize data for reporting and analysis
- Create flexible data aggregation functions`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['Arrays', 'Grouping', 'Dynamic Properties', 'Data Organization'],
    starterCode: `function groupBy(array, keyPath) {
    // Your code here
    
    return {};
}`,
    solution: `function groupBy(array, keyPath) {
    if (!array || !Array.isArray(array) || !keyPath) {
        return {};
    }
    
    return array.reduce((groups, item) => {
        // Handle nested property paths (e.g., 'user.department')
        var key = keyPath.split('.').reduce((obj, prop) => {
            return obj && obj[prop];
        }, item);
        
        // Handle undefined or null keys
        key = key !== undefined && key !== null ? key : 'undefined';
        
        // Initialize group if it doesn't exist
        if (!groups[key]) {
            groups[key] = [];
        }
        
        groups[key].push(item);
        return groups;
    }, {});
}`,
    testCases: [
      {
        input: { 
          array: [
            { name: 'John', department: 'IT', priority: 1 },
            { name: 'Jane', department: 'IT', priority: 2 },
            { name: 'Bob', department: 'HR', priority: 1 }
          ],
          keyPath: 'department'
        },
        expected: {
          'IT': [
            { name: 'John', department: 'IT', priority: 1 },
            { name: 'Jane', department: 'IT', priority: 2 }
          ],
          'HR': [
            { name: 'Bob', department: 'HR', priority: 1 }
          ]
        },
        description: 'Should group array elements by department'
      }
    ],
    hints: [
      'Use reduce() to build grouped object',
      'Split keyPath on dots to handle nested properties',
      'Use reduce() again to traverse nested property path',
      'Handle undefined keys by providing default value'
    ]
  },

  {
    id: 'js-currying-2',
    title: 'Advanced Currying with Validation',
    description: `Create advanced curried functions with built-in validation for ServiceNow forms.

Requirements:
- Implement curried validation functions
- Support different validation types (required, length, pattern)
- Allow composition of multiple validators
- Return detailed validation results
- Enable partial application for reusable validators

Validation Use Cases:
- Form field validation in ServiceNow
- Data integrity checks before database operations
- User input sanitization and verification
- Business rule validation logic`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['Currying', 'Validation', 'Function Composition', 'Form Logic'],
    starterCode: `function createValidator(type) {
    // Your code here
    
}`,
    solution: `function createValidator(type) {
    return function(config) {
        return function(value) {
            var result = {
                valid: true,
                type: type,
                value: value,
                errors: []
            };
            
            switch (type) {
                case 'required':
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        result.valid = false;
                        result.errors.push(config.message || 'Field is required');
                    }
                    break;
                    
                case 'length':
                    var len = value ? value.length : 0;
                    if (config.min && len < config.min) {
                        result.valid = false;
                        result.errors.push('Minimum length is ' + config.min + ' characters');
                    }
                    if (config.max && len > config.max) {
                        result.valid = false;
                        result.errors.push('Maximum length is ' + config.max + ' characters');
                    }
                    break;
                    
                case 'pattern':
                    if (value && config.regex && !config.regex.test(value)) {
                        result.valid = false;
                        result.errors.push(config.message || 'Invalid format');
                    }
                    break;
                    
                default:
                    result.valid = false;
                    result.errors.push('Unknown validation type: ' + type);
            }
            
            return result;
        };
    };
}`,
    testCases: [
      {
        input: { type: 'required', config: { message: 'Name is required' }, value: '' },
        expected: { valid: false, errors: ['Name is required'] },
        description: 'Should validate required field and return error for empty value'
      },
      {
        input: { type: 'length', config: { min: 5, max: 10 }, value: 'test' },
        expected: { valid: false, errors: ['Minimum length is 5 characters'] },
        description: 'Should validate length and return error for short value'
      }
    ],
    hints: [
      'Return nested functions for complete currying chain',
      'Use switch statement to handle different validation types',
      'Build result object with validation status and error messages',
      'Support different configuration options for each validator type'
    ]
  },

  {
    id: 'js-arrays-6',
    title: 'Array Intersection and Union',
    description: `Implement array intersection and union operations for ServiceNow data analysis.

Requirements:
- Find common elements between multiple arrays (intersection)
- Combine multiple arrays removing duplicates (union)
- Handle arrays of objects with custom equality functions
- Support case-insensitive string comparisons
- Optimize for performance with large datasets

Set Operations Use Cases:
- Compare user role assignments across teams
- Find common tags between incident categories
- Merge and deduplicate data from multiple sources
- Analyze overlapping data sets in reporting`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['Arrays', 'Set Operations', 'Data Analysis', 'Performance'],
    starterCode: `function arrayOperations(arrays, operation, compareBy) {
    // Your code here
    
    return [];
}`,
    solution: `function arrayOperations(arrays, operation, compareBy) {
    if (!arrays || !Array.isArray(arrays) || arrays.length === 0) {
        return [];
    }
    
    // Helper function to get comparison value
    function getCompareValue(item) {
        if (compareBy && typeof compareBy === 'string') {
            return item[compareBy];
        } else if (compareBy && typeof compareBy === 'function') {
            return compareBy(item);
        }
        return item;
    }
    
    // Helper function to check equality
    function isEqual(a, b) {
        var valueA = getCompareValue(a);
        var valueB = getCompareValue(b);
        
        // Case-insensitive string comparison
        if (typeof valueA === 'string' && typeof valueB === 'string') {
            return valueA.toLowerCase() === valueB.toLowerCase();
        }
        
        return valueA === valueB;
    }
    
    if (operation === 'intersection') {
        // Find elements common to all arrays
        return arrays[0].filter(item => {
            return arrays.slice(1).every(array => {
                return array.some(otherItem => isEqual(item, otherItem));
            });
        });
    } else if (operation === 'union') {
        // Combine all arrays and remove duplicates
        var combined = [];
        
        arrays.forEach(array => {
            array.forEach(item => {
                var exists = combined.some(existingItem => 
                    isEqual(item, existingItem)
                );
                if (!exists) {
                    combined.push(item);
                }
            });
        });
        
        return combined;
    }
    
    return [];
}`,
    testCases: [
      {
        input: { 
          arrays: [
            [{ name: 'John', role: 'admin' }, { name: 'Jane', role: 'user' }],
            [{ name: 'john', role: 'admin' }, { name: 'Bob', role: 'user' }]
          ],
          operation: 'intersection',
          compareBy: 'name'
        },
        expected: [{ name: 'John', role: 'admin' }],
        description: 'Should find intersection of arrays by name (case-insensitive)'
      },
      {
        input: { 
          arrays: [['a', 'b'], ['b', 'c'], ['c', 'd']],
          operation: 'union'
        },
        expected: ['a', 'b', 'c', 'd'],
        description: 'Should create union of arrays removing duplicates'
      }
    ],
    hints: [
      'Use filter() and every() for intersection logic',
      'Use forEach() and some() for union with duplicate checking',
      'Implement case-insensitive comparison for strings',
      'Support both property names and functions for comparison'
    ]
  }
  ,
  // ----------------------------------------------------------------
  // MEDIUM QUESTIONS
  // ----------------------------------------------------------------
  {
    id: 'sn-glideform-medium-1',
    title: 'Dynamic Field Visibility with GlideForm',
    description: `Create a client script that dynamically shows or hides the 'justification' field on a change request form. The 'justification' field should only be visible when the 'risk' level is set to 'High'.

Requirements:
- Use the GlideForm (g_form) API.
- The script should trigger when the 'risk' field changes.
- If risk is 'High', show the 'justification' field.
- If risk is any other value, hide the 'justification' field.
- The 'justification' field should also be mandatory when it is visible.

ServiceNow Context:
- This would be an 'onChange' client script on the 'change_request' table.
- Use g_form.getValue('risk') to get the current risk value.
- Use g_form.setVisible('justification', true/false) to control visibility.
- Use g_form.setMandatory('justification', true/false) to control the mandatory state.`,
    difficulty: 'Medium',
    category: 'Client Side Scripts',
    tags: ['GlideForm', 'Client Script', 'UI Controls'],
    starterCode: `function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (isLoading || newValue === '') {
    return;
  }

  // Complete the function logic here
  // const g_form = /* Assume g_form is available */
  
}`,
    solution: `function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (isLoading || newValue === '') {
    return;
  }

  const riskValue = g_form.getValue('risk');
  
  if (riskValue === 'High') {
    g_form.setVisible('justification', true);
    g_form.setMandatory('justification', true);
  } else {
    g_form.setVisible('justification', false);
    g_form.setMandatory('justification', false);
  }
}`,
    testCases: [
      {
        input: { risk: 'High' },
        expected: { justificationVisible: true, justificationMandatory: true },
        description: 'Should show and make justification mandatory for High risk'
      },
      {
        input: { risk: 'Medium' },
        expected: { justificationVisible: false, justificationMandatory: false },
        description: 'Should hide and make justification non-mandatory for Medium risk'
      },
      {
        input: { risk: 'Low' },
        expected: { justificationVisible: false, justificationMandatory: false },
        description: 'Should hide and make justification non-mandatory for Low risk'
      }
    ],
    hints: [
      'Remember that g_form is the standard object for client-side form manipulation.',
      'Ensure you handle both showing/hiding and setting/removing the mandatory flag.',
      'The function signature is for an onChange client script.'
    ]
  },
  {
    id: 'sn-glidemodal-medium-1',
    title: 'Display User Details in GlideModal',
    description: `Create a UI Action that opens a modal dialog to show details of the assigned user on an incident form.

Requirements:
- The UI Action should be a client-side script.
- Use GlideModal to create and render the dialog.
- The modal should have the title "User Details".
- Inside the modal, display the user's name, email, and phone number.
- Provide a button to close the modal.

ServiceNow Context:
- This would be a client-side UI Action on the 'incident' table.
- Use g_form.getReference('assigned_to', callback) to fetch user details asynchronously.
- The callback function will receive the user record.
- Use GlideModal to render a new window with custom content.`,
    difficulty: 'Medium',
    category: 'Client Side Scripts',
    tags: ['GlideModal', 'UI Action', 'GlideForm', 'Client Script'],
    starterCode: `function showUserDetails() {
  const assignedToSysId = g_form.getValue('assigned_to');
  if (!assignedToSysId) {
    g_form.addInfoMessage('No user is assigned.');
    return;
  }

  // Complete the function to open a GlideModal
  
}`,
    solution: `function showUserDetails() {
  const assignedToSysId = g_form.getValue('assigned_to');
  if (!assignedToSysId) {
    g_form.addInfoMessage('No user is assigned.');
    return;
  }

  g_form.getReference('assigned_to', (user) => {
    if (user) {
      const gm = new GlideModal();
      gm.setTitle('User Details');
      
      const body = \`<div>
        <p><strong>Name:</strong> \${user.name}</p>
        <p><strong>Email:</strong> \${user.email}</p>
        <p><strong>Phone:</strong> \${user.phone}</p>
      </div>\`;
      
      gm.renderWithContent(body);
    }
  });
}`,
    testCases: [
      {
        input: { assigned_to: { name: 'John Doe', email: 'john.doe@example.com', phone: '555-1234' } },
        expected: { modalTitle: 'User Details', modalContent: 'Name: John Doe, Email: john.doe@example.com, Phone: 555-1234' },
        description: 'Should open a modal with the correct user details.'
      },
      {
        input: { assigned_to: null },
        expected: { infoMessage: 'No user is assigned.' },
        description: 'Should show an info message if no user is assigned.'
      }
    ],
    hints: [
      'g_form.getReference is asynchronous, so the GlideModal logic must be inside the callback.',
      'You can construct HTML content as a string to pass to the modal.',
      'GlideModal provides methods like setTitle() and renderWithContent().'
    ]
  },
  {
    id: 'sn-glideaggregate-medium-1',
    title: 'Calculate Average Incident Resolution Time',
    description: `Write a server-side script to calculate the average resolution time for all resolved incidents in the 'Software' category.

Requirements:
- Use GlideAggregate to perform the calculation efficiently.
- Filter incidents for the 'Software' category.
- Only include incidents that are in the 'Resolved' state.
- Calculate the average of the 'calendar_stc' field (duration in seconds).
- Return the average resolution time in hours.

ServiceNow Context:
- 'calendar_stc' stores the duration of an incident in seconds.
- Use addQuery() to filter by category and state.
- Use addAggregate('AVG', 'calendar_stc') to compute the average.
- Remember to call query() after setting up the GlideAggregate.
- The result is retrieved using getAggregate().`,
    difficulty: 'Medium',
    category: 'Server Side Scripts',
    tags: ['GlideAggregate', 'GlideRecord', 'Server Script', 'Performance'],
    starterCode: `function getAverageResolutionTime() {
  const category = 'Software';
  const resolvedState = 6; // Assuming 6 is the value for 'Resolved'
  let averageSeconds = 0;

  // Complete the function using GlideAggregate
  
  return averageSeconds / 3600; // Convert seconds to hours
}`,
    solution: `function getAverageResolutionTime() {
  const category = 'Software';
  const resolvedState = 6;
  let averageSeconds = 0;

  const ga = new GlideAggregate('incident');
  ga.addQuery('category', category);
  ga.addQuery('state', resolvedState);
  ga.addAggregate('AVG', 'calendar_stc');
  ga.query();

  if (ga.next()) {
    averageSeconds = ga.getAggregate('AVG', 'calendar_stc');
  }

  return averageSeconds / 3600;
}`,
    testCases: [
      {
        input: [
          { category: 'Software', state: 6, calendar_stc: 3600 }, // 1 hour
          { category: 'Software', state: 6, calendar_stc: 7200 }, // 2 hours
          { category: 'Hardware', state: 6, calendar_stc: 1800 }  // Should be ignored
        ],
        expected: 1.5,
        description: 'Should calculate the average resolution time in hours for Software incidents.'
      },
      {
        input: [],
        expected: 0,
        description: 'Should return 0 if no matching incidents are found.'
      }
    ],
    hints: [
      'GlideAggregate is much more efficient than iterating over a GlideRecord for this purpose.',
      'The getAggregate() method returns the calculated value.',
      'Make sure to handle the case where no records match the query.'
    ]
  },
  {
    id: 'sn-glidedatetime-medium-1',
    title: 'Calculate Next Business Day',
    description: `Write a function that takes a date string (YYYY-MM-DD) and returns the next business day, skipping weekends (Saturday and Sunday).

Requirements:
- Use GlideDateTime to handle date manipulations.
- The function should correctly handle dates that fall on a Friday or Saturday.
- The input and output format should be 'YYYY-MM-DD'.

ServiceNow Context:
- Initialize a GlideDateTime object with the input date string.
- Use getDayOfWeek() to determine if a date is a weekend (6 for Saturday, 7 for Sunday).
- Use addDaysUTC() or addDays() to increment the date.
- Use getDate() to get the date part in 'YYYY-MM-DD' format.`,
    difficulty: 'Medium',
    category: 'Server Side Scripts',
    tags: ['GlideDateTime', 'GlideDate', 'Server Script', 'Scheduling'],
    starterCode: `function getNextBusinessDay(dateString) {
  const gdt = new GlideDateTime(dateString);

  // Add logic to find the next business day
  
  return gdt.getDate();
}`,
    solution: `function getNextBusinessDay(dateString) {
  const gdt = new GlideDateTime(dateString);
  gdt.addDaysUTC(1); // Start by checking the next day

  while (gdt.getDayOfWeek() >= 6) { // 6 is Saturday, 7 is Sunday
    gdt.addDaysUTC(1);
  }

  return gdt.getDate();
}`,
    testCases: [
      {
        input: '2025-09-04', // Thursday
        expected: '2025-09-05', // Friday
        description: 'Should return the next day for a weekday.'
      },
      {
        input: '2025-09-05', // Friday
        expected: '2025-09-08', // Monday
        description: 'Should skip Saturday and Sunday.'
      },
      {
        input: '2025-09-06', // Saturday
        expected: '2025-09-08', // Monday
        description: 'Should skip Sunday and return Monday.'
      }
    ],
    hints: [
      'A while loop is a good way to keep adding days until you find a weekday.',
      'Remember that getDayOfWeek() returns 1 for Monday and 7 for Sunday.',
      'Be sure to handle the initial date increment correctly.'
    ]
  },
  {
    id: 'sn-glidelist-medium-1',
    title: 'Bulk Update Incidents from List View',
    description: `Create a client-side UI Action (List Context Menu) to assign selected incidents to the current user.

Requirements:
- The action should appear in the context menu when one or more rows are selected in an incident list.
- Use GlideList2 (g_list) to get the sys_ids of the selected records.
- After getting the sys_ids, use GlideAjax to call a server-side script to perform the update.
- The server-side script (Script Include) should update the 'assigned_to' field for each incident.
- After the update, refresh the list to show the changes.

ServiceNow Context:
- This involves a client-side UI Action and a server-side Script Include.
- The UI Action uses g_list.getChecked() to get selected sys_ids.
- The Script Include will have a function that accepts an array of sys_ids and the current user's ID.
- Use g_list.refresh() to reload the list view.`,
    difficulty: 'Medium',
    category: 'Client Side Scripts',
    tags: ['GlideList', 'GlideAjax', 'UI Action', 'Client Script', 'Script Includes'],
    starterCode: `// Client-side UI Action script
function assignToMe() {
  const selectedIds = g_list.getChecked();
  if (selectedIds.length === 0) {
    return;
  }

  const ga = new GlideAjax('IncidentAssigner');
  ga.addParam('sysparm_name', 'assignIncidentsToMe');
  ga.addParam('sysparm_incident_ids', selectedIds.join(','));
  ga.getXML(refreshList);
}

function refreshList(response) {
  g_list.refresh();
}

// Server-side Script Include 'IncidentAssigner'
/*
var IncidentAssigner = Class.create();
IncidentAssigner.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  assignIncidentsToMe: function() {
    const incidentIds = this.getParameter('sysparm_incident_ids').split(',');
    const userId = gs.getUserID();
    
    // Add update logic here

    return 'success';
  },
  type: 'IncidentAssigner'
});
*/`,
    solution: `// Server-side Script Include 'IncidentAssigner'
var IncidentAssigner = Class.create();
IncidentAssigner.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  assignIncidentsToMe: function() {
    const incidentIds = this.getParameter('sysparm_incident_ids').split(',');
    const userId = gs.getUserID();
    
    const incidentGR = new GlideRecord('incident');
    incidentGR.addQuery('sys_id', 'IN', incidentIds);
    incidentGR.query();
    
    while (incidentGR.next()) {
      incidentGR.setValue('assigned_to', userId);
      incidentGR.update();
    }

    return 'success';
  },
  type: 'IncidentAssigner'
});`,
    testCases: [
      {
        input: { selectedIds: ['id1', 'id2'], userId: 'user123' },
        expected: { updatedRecords: 2, assignedTo: 'user123' },
        description: 'Should update the assigned_to field for all selected incidents.'
      },
      {
        input: { selectedIds: [], userId: 'user123' },
        expected: { updatedRecords: 0 },
        description: 'Should do nothing if no incidents are selected.'
      }
    ],
    hints: [
      'The client script is responsible for gathering IDs and calling the server.',
      'The server script (Script Include) does the actual database work.',
      "Using an 'IN' query in your GlideRecord is efficient for updating multiple records."
    ]
  },
  {
    id: 'sn-midserver-medium-1',
    title: 'Execute PowerShell Command via MID Server',
    description: `Write a server-side script that sends a PowerShell command to a MID Server to check the disk space on a target Windows machine.

Requirements:
- Create a record in the ECC Queue (ecc_queue) to trigger the MID Server.
- The ECC Queue record should specify the 'PowerShell' topic.
- The payload should contain the command to be executed.
- The target host and MID Server should be specified.
- The script should return the sys_id of the created ECC Queue record.

ServiceNow Context:
- The ECC Queue is the communication channel between a ServiceNow instance and MID Servers.
- You need to create a new GlideRecord for the 'ecc_queue' table.
- Key fields to set: 'agent', 'topic', 'name', 'source', 'payload'.
- The payload is an XML document. You can use a template or build it as a string.`,
    difficulty: 'Medium',
    category: 'Server Side Scripts',
    tags: ['MIDServer', 'ECC Queue', 'PowerShell', 'Server Script'],
    starterCode: `function checkDiskSpace(targetHost, midServerName) {
  const command = 'Get-WmiObject Win32_LogicalDisk -Filter "DeviceID=\\\'C:\\\'" | Select-Object Size,FreeSpace';

  const payload = \`<parameters>
    <parameter name="skip_sensor" value="true"/>
    <parameter name="probe_name" value="Windows - PowerShell"/>
    <parameter name="script.ps1" value="\${command}"/>
  </parameters>\`;

  const ecc = new GlideRecord('ecc_queue');
  // Complete the ECC Queue record creation
  
  const sysId = ecc.insert();
  return sysId;
}`,
    solution: `function checkDiskSpace(targetHost, midServerName) {
  const command = 'Get-WmiObject Win32_LogicalDisk -Filter "DeviceID=\\\'C:\\\'" | Select-Object Size,FreeSpace';

  const payload = \`<parameters>
    <parameter name="skip_sensor" value="true"/>
    <parameter name="probe_name" value="Windows - PowerShell"/>
    <parameter name="script.ps1" value="\${command}"/>
  </parameters>\`;

  const ecc = new GlideRecord('ecc_queue');
  ecc.initialize();
  ecc.agent = 'mid.server.' + midServerName;
  ecc.topic = 'PowerShell';
  ecc.name = 'Windows - PowerShell';
  ecc.source = targetHost;
  ecc.payload = payload;
  ecc.queue = 'output';
  ecc.state = 'ready';
  
  const sysId = ecc.insert();
  return sysId;
}`,
    testCases: [
      {
        input: { targetHost: 'win-server-01', midServerName: 'mid_server_1' },
        expected: { agent: 'mid.server.mid_server_1', topic: 'PowerShell', source: 'win-server-01' },
        description: 'Should create an ECC Queue record with the correct parameters.'
      }
    ],
    hints: [
      'The agent field must be prefixed with "mid.server.". ',
      'The payload needs to be a well-formed XML string.',
      'Setting the queue to "output" and state to "ready" is crucial for the MID server to pick it up.'
    ]
  },
  // ----------------------------------------------------------------
  // HARD QUESTIONS
  // ----------------------------------------------------------------
  {
    id: 'algo-two-pointer-hard-1',
    title: 'Find SLA Breach Pairs',
    description: `Given an array of incident objects, each with an 'sla_breach_time' (as a JavaScript Date object), find all pairs of incidents that breached their SLA within a given time window (in minutes).

Requirements:
- The input array of incidents is sorted by 'sla_breach_time'.
- Use the Two Pointer algorithm for an efficient solution.
- The function should return an array of pairs, where each pair is an array of two incident numbers.
- Avoid duplicate pairs.

Algorithm Context:
The Two Pointer technique is used on sorted arrays to find pairs or subarrays that satisfy a certain condition. By moving two pointers from different ends of the array towards each other, you can avoid nested loops and achieve O(n) time complexity.`,
    difficulty: 'Hard',
    category: 'Algorithms',
    tags: ['Two Pointer', 'Algorithms', 'GlideRecord', 'Performance'],
    starterCode: `function findSlaBreachPairs(incidents, windowMinutes) {
  const result = [];
  const windowMillis = windowMinutes * 60 * 1000;
  let left = 0;
  let right = 1;

  // Implement the Two Pointer algorithm here
  
  return result;
}`,
    solution: `function findSlaBreachPairs(incidents, windowMinutes) {
  const result = [];
  const windowMillis = windowMinutes * 60 * 1000;
  
  if (incidents.length < 2) {
    return result;
  }

  for (let i = 0; i < incidents.length; i++) {
    for (let j = i + 1; j < incidents.length; j++) {
      const timeDiff = incidents[j].sla_breach_time.getTime() - incidents[i].sla_breach_time.getTime();
      
      if (timeDiff <= windowMillis) {
        result.push([incidents[i].number, incidents[j].number]);
      } else {
        // Since the array is sorted, no further incidents with this 'i' will be in the window
        break;
      }
    }
  }
  
  return result;
}`,
    testCases: [
      {
        input: {
          incidents: [
            { number: 'INC001', sla_breach_time: new Date('2025-09-01T10:00:00Z') },
            { number: 'INC002', sla_breach_time: new Date('2025-09-01T10:05:00Z') },
            { number: 'INC003', sla_breach_time: new Date('2025-09-01T10:12:00Z') },
            { number: 'INC004', sla_breach_time: new Date('2025-09-01T10:25:00Z') }
          ],
          windowMinutes: 10
        },
        expected: [['INC001', 'INC002']],
        description: 'Should find one pair within the 10-minute window.'
      },
      {
        input: {
          incidents: [
            { number: 'INC001', sla_breach_time: new Date('2025-09-01T10:00:00Z') },
            { number: 'INC002', sla_breach_time: new Date('2025-09-01T10:05:00Z') },
            { number: 'INC003', sla_breach_time: new Date('2025-09-01T10:08:00Z') }
          ],
          windowMinutes: 10
        },
        expected: [['INC001', 'INC002'], ['INC001', 'INC003'], ['INC002', 'INC003']],
        description: 'Should find all pairs within the window.'
      }
    ],
    hints: [
      'A nested loop is a straightforward but less optimal approach (O(n^2)). The Two Pointer approach can optimize this.',
      'For each element at pointer \\`i\\`, move pointer \\`j\\` forward until the time difference exceeds the window.',
      'Since the array is sorted, if the difference between \\`j\\` and \\`i\\` is too large, any subsequent elements after \\`j\\` will also be too large.'
    ]
  },
  {
    id: 'algo-binary-search-hard-1',
    title: 'Find CI with Binary Search',
    description: `You have a very large, sorted array of Configuration Item (CI) names. Implement a function that uses Binary Search to find the index of a specific CI.

Requirements:
- The input is a sorted array of strings (CI names) and a target CI name.
- The function must implement the Binary Search algorithm.
- If the CI is found, return its index.
- If the CI is not found, return -1.
- Do not use built-in functions like \`Array.prototype.indexOf\` or \`Array.prototype.find\`.

Algorithm Context:
Binary Search is a search algorithm that finds the position of a target value within a sorted array. It compares the target value to the middle element of the array; if they are not equal, the half in which the target cannot lie is eliminated and the search continues on the remaining half, again taking the middle element to compare to the target value, and repeating this until the target value is found.`,
    difficulty: 'Hard',
    category: 'Algorithms',
    tags: ['Binary Search', 'Algorithms', 'Performance', 'Data Structures'],
    starterCode: `function findCiIndex(ciNames, targetName) {
  let low = 0;
  let high = ciNames.length - 1;

  // Implement the Binary Search algorithm here
  
  return -1; // Return -1 if not found
}`,
    solution: `function findCiIndex(ciNames, targetName) {
  let low = 0;
  let high = ciNames.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const guess = ciNames[mid];

    if (guess === targetName) {
      return mid;
    }
    if (guess > targetName) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  
  return -1;
}`,
    testCases: [
      {
        input: { ciNames: ['AppServer01', 'DBServer01', 'WebServer01', 'WebServer02'], targetName: 'WebServer01' },
        expected: 2,
        description: 'Should return the correct index for a CI that exists.'
      },
      {
        input: { ciNames: ['AppServer01', 'DBServer01', 'WebServer01', 'WebServer02'], targetName: 'EmailServer01' },
        expected: -1,
        description: 'Should return -1 for a CI that does not exist.'
      },
      {
        input: { ciNames: [], targetName: 'WebServer01' },
        expected: -1,
        description: 'Should return -1 for an empty array.'
      }
    ],
    hints: [
      'You need three pointers: low, high, and mid.',
      'The loop should continue as long as low is less than or equal to high.',
      'In each iteration, adjust either the low or high pointer based on the comparison with the middle element.'
    ]
  },
  {
    id: 'algo-sliding-window-hard-1',
    title: 'Max Priority Incidents in a Time Window',
    description: `Given an array of incident objects, each with a 'created_time' (as a JavaScript Date object) and a 'priority' (1 for Critical), find the maximum number of critical incidents created within any given time window (e.g., 60 minutes).

Requirements:
- The input array of incidents is sorted by 'created_time'.
- Use the Sliding Window algorithm for an efficient solution.
- The function should return a single number representing the maximum count of critical incidents found in any window.

Algorithm Context:
The Sliding Window technique is used to solve problems that involve finding a sub-array or sub-string that satisfies certain conditions. A window of a fixed or variable size slides over the data, and the algorithm performs calculations on the data within the window.`,
    difficulty: 'Hard',
    category: 'Algorithms',
    tags: ['Sliding Window', 'Algorithms', 'Performance', 'GlideRecord'],
    starterCode: `function maxCriticalIncidentsInWindow(incidents, windowMinutes) {
  const windowMillis = windowMinutes * 60 * 1000;
  let maxCount = 0;
  let currentCount = 0;
  let left = 0;

  // Implement the Sliding Window algorithm here
  
  return maxCount;
}`,
    solution: `function maxCriticalIncidentsInWindow(incidents, windowMinutes) {
  const windowMillis = windowMinutes * 60 * 1000;
  let maxCount = 0;
  let left = 0;
  
  for (let right = 0; right < incidents.length; right++) {
    // As the window expands to the right, check if the new incident is critical
    const currentIncident = incidents[right];
    
    // Shrink the window from the left if it's too large
    while (currentIncident.created_time.getTime() - incidents[left].created_time.getTime() > windowMillis) {
      left++;
    }
    
    // Count critical incidents within the current valid window
    let currentWindowCount = 0;
    for (let i = left; i <= right; i++) {
      if (incidents[i].priority === 1) {
        currentWindowCount++;
      }
    }
    
    maxCount = Math.max(maxCount, currentWindowCount);
  }
  
  return maxCount;
}`,
    testCases: [
      {
        input: {
          incidents: [
            { created_time: new Date('2025-09-01T10:00:00Z'), priority: 1 },
            { created_time: new Date('2025-09-01T10:05:00Z'), priority: 2 },
            { created_time: new Date('2025-09-01T10:15:00Z'), priority: 1 },
            { created_time: new Date('2025-09-01T11:30:00Z'), priority: 1 }
          ],
          windowMinutes: 60
        },
        expected: 2,
        description: 'Should find a max of 2 critical incidents in a 60-minute window.'
      },
      {
        input: {
          incidents: [
            { created_time: new Date('2025-09-01T10:00:00Z'), priority: 1 },
            { created_time: new Date('2025-09-01T10:05:00Z'), priority: 1 },
            { created_time: new Date('2025-09-01T10:10:00Z'), priority: 1 },
            { created_time: new Date('2025-09-01T11:00:00Z'), priority: 2 }
          ],
          windowMinutes: 15
        },
        expected: 3,
        description: 'Should find all 3 critical incidents in a 15-minute window.'
      }
    ],
    hints: [
      'Use two pointers, \\`left\\` and \\`right\\`, to define the window.',
      'Iterate with the \\`right\\` pointer to expand the window.',
      'When the window size (time difference) exceeds the limit, move the \\`left\\` pointer to shrink it.',
      'In each valid window, count the critical incidents and update your max count.'
    ]
  },
  {
    id: 'algo-dfs-bfs-hard-1',
    title: 'CMDB Dependency Traversal',
    description: `Write a function that traverses a CMDB dependency graph to find all downstream dependencies for a given Configuration Item (CI).

Requirements:
- The function takes a starting CI sys_id and a graph representation as input.
- The graph is an object where keys are CI sys_ids and values are arrays of downstream CI sys_ids they depend on.
- Use either Depth First Search (DFS) or Breadth First Search (BFS) to traverse the graph.
- The function should return a flat array of all unique downstream CI sys_ids, excluding the starting CI.
- Handle cyclical dependencies gracefully to avoid infinite loops.

Algorithm Context:
DFS and BFS are graph traversal algorithms. DFS explores as far as possible along each branch before backtracking. BFS explores neighbor nodes first, before moving to the next level neighbors. Both are suitable for this problem, but require a way to track visited nodes to prevent infinite loops.`,
    difficulty: 'Hard',
    category: 'Algorithms',
    tags: ['DFS', 'BFS', 'Graph', 'Algorithms', 'CMDB', 'Data Structures'],
    starterCode: `function getDownstreamDependencies(startCiId, dependencyGraph) {
  const visited = new Set();
  const result = [];
  const queue = [startCiId]; // For BFS

  // Implement either BFS or DFS here
  
  return result;
}`,
    solution: `// BFS Implementation
function getDownstreamDependencies(startCiId, dependencyGraph) {
  const visited = new Set();
  const result = new Set();
  const queue = [startCiId];
  
  visited.add(startCiId);

  while (queue.length > 0) {
    const currentCiId = queue.shift();
    const dependencies = dependencyGraph[currentCiId] || [];
    
    for (const depId of dependencies) {
      if (!visited.has(depId)) {
        visited.add(depId);
        result.add(depId);
        queue.push(depId);
      }
    }
  }
  
  return Array.from(result);
}`,
    testCases: [
      {
        input: {
          startCiId: 'app_server_1',
          dependencyGraph: {
            'app_server_1': ['db_server_1', 'web_server_1'],
            'db_server_1': ['storage_1'],
            'web_server_1': ['load_balancer_1'],
            'storage_1': []
          }
        },
        expected: ['db_server_1', 'web_server_1', 'storage_1', 'load_balancer_1'],
        description: 'Should return all downstream dependencies.'
      },
      {
        input: {
          startCiId: 'app_server_1',
          dependencyGraph: {
            'app_server_1': ['db_server_1'],
            'db_server_1': ['app_server_1'] // Cyclical dependency
          }
        },
        expected: ['db_server_1'],
        description: 'Should handle cyclical dependencies and not get into an infinite loop.'
      }
    ],
    hints: [
      'Use a Set to keep track of visited nodes to prevent cycles and redundant processing.',
      'For BFS, use a queue (first-in, first-out). For DFS, you can use a stack (last-in, first-out) or recursion.',
      'Start the traversal with the given CI, but do not include it in the final result set.'
    ]
  }
];
