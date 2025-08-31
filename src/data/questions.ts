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
  // ServiceNow GlideRecord Questions
  {
    id: 'sn-gliderecord-1',
    title: 'Query High Priority Incidents',
    description: `Write a function that queries all high priority incidents created in the last 7 days.

Scenario:
You need to create a report showing all Priority 1 and 2 incidents that were created within the past week for escalation review.

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
    ],
    examples: [
      {
        title: 'GlideRecord Query',
        input: 'No input parameters needed',
        output: 'Array of incident objects with number, description, and priority',
        explanation: 'Queries ServiceNow incident table and filters by priority and date'
      }
    ],
    estimatedTime: '20 min'
  },
  
  {
    id: 'sn-business-rule-1',
    title: 'Auto-assign by Category',
    description: `Create a business rule logic that automatically assigns incidents to appropriate teams based on their category.

Business Process:
When an incident is created or updated, it should be automatically assigned to the correct team based on the incident category to ensure proper routing and faster resolution.

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
    ],
    examples: [
      {
        title: 'Business Rule Logic',
        input: 'Current incident record context',
        output: 'Updated assignment_group field and audit logs',
        explanation: 'Automatically routes incidents to appropriate teams based on category'
      }
    ],
    estimatedTime: '15 min'
  },

  {
    id: 'sn-client-script-1',
    title: 'Field Validation',
    description: `Create a client script that validates the description field and provides user feedback.

User Experience:
When users are creating incidents, they should receive immediate feedback about field validation to ensure quality data entry before submission.

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
    ],
    examples: [
      {
        title: 'Client-side Validation',
        input: 'Form field values from user input',
        output: 'Validation result and user feedback messages',
        explanation: 'Provides immediate validation feedback to improve data quality'
      }
    ],
    estimatedTime: '18 min'
  },

  // Arrays (JS) - All Categories
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
    ],
    examples: [
      {
        title: 'Filter and Sort',
        input: 'Array of user objects with active status',
        output: 'Sorted array of active users only',
        explanation: 'Combines filtering and sorting operations on user data'
      }
    ],
    estimatedTime: '15 min'
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
    ],
    estimatedTime: '25 min'
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
    ],
    estimatedTime: '35 min'
  },

  // Character-based Array Questions - Easy Level
  {
    id: 'js-arrays-hamzah-monty-1',
    title: 'Find Team Members',
    description: `Hamzah and Monty are team leads who need to find their team members from a list of employees.



Scenario:
You're building a team management feature where team leads can quickly identify all employees reporting to them.



Requirements:
- Filter employees by team lead name (either "Hamzah" or "Monty")
- Return an array of employee names who report to either Hamzah or Monty
- Sort the results alphabetically
- Handle empty arrays gracefully



Expected Behavior:
The function should work with any employee data structure and return a clean, sorted list of names for easy display in the UI.`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['Arrays', 'JavaScript', 'Filtering', 'Team Management'],
    starterCode: `function findTeamMembers(employees) {
    // Your code here
    
    return [];
}`,
    solution: `function findTeamMembers(employees) {
    if (!employees || !Array.isArray(employees)) {
        return [];
    }
    
    return employees
        .filter(emp => emp.teamLead === 'Hamzah' || emp.teamLead === 'Monty')
        .map(emp => emp.name)
        .sort();
}`,
    testCases: [
      {
        input: { employees: [
          { name: 'Alice', teamLead: 'Hamzah' },
          { name: 'Bob', teamLead: 'John' },
          { name: 'Charlie', teamLead: 'Monty' },
          { name: 'Diana', teamLead: 'Hamzah' },
          { name: 'Eve', teamLead: 'Sarah' }
        ]},
        expected: ['Alice', 'Charlie', 'Diana'],
        description: 'Should find team members for Hamzah and Monty'
      },
      {
        input: { employees: [] },
        expected: [],
        description: 'Should handle empty array'
      }
    ],
    hints: [
      'Use filter() to find employees with specific team leads',
      'Use map() to extract just the names',
      'Use sort() to arrange names alphabetically'
    ],
    examples: [
      {
        title: 'Team Member Lookup',
        input: 'Array of employee objects with teamLead property',
        output: 'Sorted array of names reporting to Hamzah or Monty',
        explanation: 'Filters by team lead and extracts sorted employee names'
      }
    ],
    estimatedTime: '10 min'
  },
  {
    id: 'js-arrays-hamzah-monty-2',
    title: 'Combine Task Lists',
    description: `Hamzah and Monty each have their own task lists. Combine their tasks and remove duplicates.



Business Context:
When teams collaborate, they often work on overlapping tasks. This function helps merge their work items while avoiding duplication.



Requirements:
- Merge Hamzah's and Monty's task arrays
- Remove duplicate tasks (case-sensitive)
- Sort the final list alphabetically
- Return the combined unique task list



Data Processing:
- Handle cases where one or both arrays might be empty
- Preserve the original task names exactly as provided
- Ensure consistent output formatting for UI display`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['Arrays', 'JavaScript', 'Merging', 'Deduplication'],
    starterCode: `function combineTaskLists(hamzahTasks, montyTasks) {
    // Your code here
    
    return [];
}`,
    solution: `function combineTaskLists(hamzahTasks, montyTasks) {
    if (!Array.isArray(hamzahTasks)) hamzahTasks = [];
    if (!Array.isArray(montyTasks)) montyTasks = [];
    
    // Combine arrays and create a Set to remove duplicates
    const combinedTasks = [...hamzahTasks, ...montyTasks];
    const uniqueTasks = [...new Set(combinedTasks)];
    
    return uniqueTasks.sort();
}`,
    testCases: [
      {
        input: { 
          hamzahTasks: ['Review code', 'Write documentation', 'Test features'],
          montyTasks: ['Test features', 'Deploy app', 'Review code', 'Update database']
        },
        expected: ['Deploy app', 'Review code', 'Test features', 'Update database', 'Write documentation'],
        description: 'Should combine and deduplicate task lists'
      },
      {
        input: { 
          hamzahTasks: ['Task A'],
          montyTasks: []
        },
        expected: ['Task A'],
        description: 'Should handle empty arrays'
      }
    ],
    hints: [
      'Use spread operator (...) to combine arrays',
      'Use Set to remove duplicates',
      'Convert Set back to array and sort'
    ],
    examples: [
      {
        title: 'Task List Merger',
        input: 'Two arrays of task strings',
        output: 'Sorted array of unique tasks',
        explanation: 'Combines both lists, removes duplicates, and sorts alphabetically'
      }
    ],
    estimatedTime: '12 min'
  },
  {
    id: 'js-arrays-hamzah-monty-3',
    title: 'Find Common Projects',
    description: `Hamzah and Monty work on different projects. Find which projects they both work on.



Collaboration Scenario:
Understanding shared projects helps identify opportunities for collaboration and knowledge sharing between team members.



Requirements:
- Compare Hamzah's project list with Monty's project list
- Return an array of projects that appear in both lists
- Sort the common projects alphabetically
- Handle case where there are no common projects



Array Intersection:
This is a classic array intersection problem - finding elements that exist in both arrays.



Edge Cases:
- Empty arrays should return empty results
- No common projects should return empty array
- Duplicate entries in either list should not affect the result`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['Arrays', 'JavaScript', 'Intersection', 'Comparison'],
    starterCode: `function findCommonProjects(hamzahProjects, montyProjects) {
    // Your code here
    
    return [];
}`,
    solution: `function findCommonProjects(hamzahProjects, montyProjects) {
    if (!Array.isArray(hamzahProjects) || !Array.isArray(montyProjects)) {
        return [];
    }
    
    const commonProjects = hamzahProjects.filter(project => 
        montyProjects.includes(project)
    );
    
    // Remove duplicates and sort
    return [...new Set(commonProjects)].sort();
}`,
    testCases: [
      {
        input: { 
          hamzahProjects: ['ServiceNow Portal', 'Mobile App', 'API Gateway', 'Dashboard'],
          montyProjects: ['Mobile App', 'Data Migration', 'API Gateway', 'Reporting']
        },
        expected: ['API Gateway', 'Mobile App'],
        description: 'Should find common projects between both lists'
      },
      {
        input: { 
          hamzahProjects: ['Project A', 'Project B'],
          montyProjects: ['Project C', 'Project D']
        },
        expected: [],
        description: 'Should return empty array when no common projects'
      }
    ],
    hints: [
      'Use filter() to find matching elements',
      'Use includes() to check if element exists in other array',
      'Use Set to remove any potential duplicates'
    ],
    examples: [
      {
        title: 'Project Intersection',
        input: 'Two arrays of project names',
        output: 'Sorted array of projects that appear in both lists',
        explanation: 'Finds the intersection of two project lists'
      }
    ],
    estimatedTime: '15 min'
  },
  {
    id: 'js-arrays-hamzah-monty-4',
    title: 'Calculate Total Hours',
    description: `Hamzah and Monty track their work hours in arrays. Calculate their total hours for the week.



Time Tracking Scenario:
This function helps calculate weekly totals for timesheet management and payroll processing.



Requirements:
- Sum up all hours from both Hamzah's and Monty's daily hour arrays
- Return an object with individual totals and combined total
- Handle invalid hours (negative numbers should be treated as 0)
- Round totals to 2 decimal places



Data Validation:
- Negative hours are invalid and should be converted to 0
- Handle missing or invalid input arrays gracefully
- Ensure decimal precision for accurate payroll calculations



Output Format:
Return an object with 'hamzah', 'monty', and 'total' properties containing the calculated hours.`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['Arrays', 'JavaScript', 'Calculation', 'Validation'],
    starterCode: `function calculateTotalHours(hamzahHours, montyHours) {
    // Your code here
    
    return {
        hamzah: 0,
        monty: 0,
        total: 0
    };
}`,
    solution: `function calculateTotalHours(hamzahHours, montyHours) {
    if (!Array.isArray(hamzahHours)) hamzahHours = [];
    if (!Array.isArray(montyHours)) montyHours = [];
    
    // Calculate Hamzah's total, treating negative numbers as 0
    const hamzahTotal = hamzahHours
        .map(hours => hours < 0 ? 0 : hours)
        .reduce((sum, hours) => sum + hours, 0);
    
    // Calculate Monty's total, treating negative numbers as 0
    const montyTotal = montyHours
        .map(hours => hours < 0 ? 0 : hours)
        .reduce((sum, hours) => sum + hours, 0);
    
    return {
        hamzah: Math.round(hamzahTotal * 100) / 100,
        monty: Math.round(montyTotal * 100) / 100,
        total: Math.round((hamzahTotal + montyTotal) * 100) / 100
    };
}`,
    testCases: [
      {
        input: { 
          hamzahHours: [8, 7.5, 8, 6, 8],
          montyHours: [7, 8, 9, 7.5, 6.5]
        },
        expected: { hamzah: 37.5, monty: 38, total: 75.5 },
        description: 'Should calculate total hours for both team members'
      },
      {
        input: { 
          hamzahHours: [8, -2, 7],
          montyHours: [6, 8.5]
        },
        expected: { hamzah: 15, monty: 14.5, total: 29.5 },
        description: 'Should handle negative hours by treating them as 0'
      }
    ],
    hints: [
      'Use map() to handle negative values',
      'Use reduce() to sum array elements',
      'Use Math.round() for decimal precision'
    ],
    examples: [
      {
        title: 'Hours Calculation',
        input: 'Two arrays of daily work hours',
        output: 'Object with individual and combined totals',
        explanation: 'Sums hours while handling negative values and rounding'
      }
    ],
    estimatedTime: '15 min'
  },
  {
    id: 'js-arrays-hamzah-monty-5',
    title: 'Organize Meeting Schedules',
    description: `Hamzah and Monty need to organize their meeting schedules. Find available time slots when both are free.



Meeting Coordination:
This function helps identify mutually available time slots for scheduling meetings between team members.



Requirements:
- Compare busy time slots for both team members
- Find time slots (9-17) that don't appear in either busy schedule
- Return available slots as an array of numbers
- Sort the available slots in ascending order



Business Hours Context:
- Standard work hours are 9 AM to 5 PM (9-17 in 24-hour format)
- Time slots are represented as integers (9, 10, 11, etc.)
- A slot is available only if both team members are free



Scheduling Logic:
The function should identify gaps in both calendars where meetings could be scheduled.`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['Arrays', 'JavaScript', 'Scheduling', 'Logic'],
    starterCode: `function findAvailableSlots(hamzahBusy, montyBusy) {
    // Your code here
    
    return [];
}`,
    solution: `function findAvailableSlots(hamzahBusy, montyBusy) {
    if (!Array.isArray(hamzahBusy)) hamzahBusy = [];
    if (!Array.isArray(montyBusy)) montyBusy = [];
    
    // All possible work hours (9 AM to 5 PM)
    const allSlots = [9, 10, 11, 12, 13, 14, 15, 16, 17];
    
    // Combine both busy schedules
    const allBusySlots = [...hamzahBusy, ...montyBusy];
    
    // Find slots that are not in the busy list
    const availableSlots = allSlots.filter(slot => 
        !allBusySlots.includes(slot)
    );
    
    return availableSlots.sort((a, b) => a - b);
}`,
    testCases: [
      {
        input: { 
          hamzahBusy: [9, 11, 15],
          montyBusy: [10, 12, 16]
        },
        expected: [13, 14, 17],
        description: 'Should find available time slots for both team members'
      },
      {
        input: { 
          hamzahBusy: [9, 10, 11, 12, 13, 14, 15, 16, 17],
          montyBusy: []
        },
        expected: [],
        description: 'Should return empty array when one person is completely busy'
      }
    ],
    hints: [
      'Create an array of all possible time slots',
      'Use filter() with includes() to find non-busy slots',
      'Combine both busy arrays before filtering'
    ],
    examples: [
      {
        title: 'Schedule Coordination',
        input: 'Two arrays of busy time slots (hours)',
        output: 'Sorted array of available time slots',
        explanation: 'Finds time slots when both team members are available'
      }
    ],
    estimatedTime: '12 min'
  },

  // Objects (JS) - All Categories  
  {
    id: 'js-objects-1',
    title: 'Safe Property Navigation',
    description: `Implement safe object property access to avoid null/undefined errors.



Problem Context:
In JavaScript applications, accessing nested object properties can cause runtime errors if any intermediate property is null or undefined.



Requirements:
- Access nested object properties safely
- Return default values for missing properties
- Handle arrays within objects
- Support dot notation path strings



Safety Features:
- Prevent TypeError exceptions when accessing undefined properties
- Provide graceful fallbacks for missing data
- Support deep property access with string paths



Common Use Case:
This pattern is essential when working with API responses or user data where the structure might vary.`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['Objects', 'JavaScript', 'Safe Navigation', 'Property Access'],
    starterCode: `function safeGet(obj, path, defaultValue) {
    // Your code here
    
    return defaultValue;
}`,
    solution: `function safeGet(obj, path, defaultValue = null) {
    if (!obj || typeof obj !== 'object') {
        return defaultValue;
    }
    
    const keys = path.split('.');
    let current = obj;
    
    for (let key of keys) {
        if (current === null || current === undefined || !(key in current)) {
            return defaultValue;
        }
        current = current[key];
    }
    
    return current !== undefined ? current : defaultValue;
}`,
    testCases: [
      {
        input: { obj: { user: { profile: { name: 'John' } } }, path: 'user.profile.name', defaultValue: 'Unknown' },
        expected: 'John',
        description: 'Should access nested property safely'
      },
      {
        input: { obj: { user: {} }, path: 'user.profile.name', defaultValue: 'Unknown' },
        expected: 'Unknown',
        description: 'Should return default for missing property'
      }
    ],
    hints: [
      'Split path by dots to get property chain',
      'Check for null/undefined at each level',
      'Use in operator to check property existence'
    ],
    examples: [
      {
        title: 'Safe Navigation',
        input: 'Object with nested properties and path string',
        output: 'Property value or default value',
        explanation: 'Safely accesses nested object properties without errors'
      }
    ],
    estimatedTime: '15 min'
  },
  {
    id: 'js-objects-2',
    title: 'Data Mapping Transformation',
    description: `Transform objects between different data structures for ServiceNow integration.



Integration Challenge:
When integrating with external systems, data often needs to be transformed between different object structures and naming conventions.



Requirements:
- Map object properties to new structure
- Handle nested transformations
- Support custom field mappings
- Preserve data types correctly



Transformation Types:
- Simple field renaming (source.oldName → target.newName)
- Custom transformation functions
- Nested property mapping with dot notation
- Default value handling for missing properties



ServiceNow Context:
This pattern is commonly used when importing data from external systems or preparing data for API responses.`,
    difficulty: 'Medium',
    category: 'Server Side Scripts',
    tags: ['Objects', 'JavaScript', 'Transformation', 'Data Mapping'],
    starterCode: `function transformObject(source, mapping) {
    // Your code here
    
    return {};
}`,
    solution: `function transformObject(source, mapping) {
    if (!source || typeof source !== 'object' || !mapping) {
        return {};
    }
    
    const result = {};
    
    Object.keys(mapping).forEach(targetKey => {
        const sourceKey = mapping[targetKey];
        
        if (typeof sourceKey === 'string') {
            // Simple mapping
            result[targetKey] = source[sourceKey];
        } else if (typeof sourceKey === 'function') {
            // Custom transformation function
            result[targetKey] = sourceKey(source);
        } else if (typeof sourceKey === 'object' && sourceKey.path) {
            // Nested path mapping
            result[targetKey] = safeGet(source, sourceKey.path, sourceKey.default);
        }
    });
    
    return result;
}

function safeGet(obj, path, defaultValue = null) {
    const keys = path.split('.');
    let current = obj;
    
    for (let key of keys) {
        if (current === null || current === undefined || !(key in current)) {
            return defaultValue;
        }
        current = current[key];
    }
    
    return current !== undefined ? current : defaultValue;
}`,
    testCases: [
      {
        input: { 
          source: { firstName: 'John', lastName: 'Doe', contact: { email: 'john@example.com' } },
          mapping: { 
            fullName: (src) => `${src.firstName} ${src.lastName}`,
            email: { path: 'contact.email', default: 'No email' }
          }
        },
        expected: { fullName: 'John Doe', email: 'john@example.com' },
        description: 'Should transform object using mapping rules'
      }
    ],
    hints: [
      'Handle different mapping types (string, function, object)',
      'Use helper functions for nested access',
      'Preserve original data types during transformation'
    ],
    examples: [
      {
        title: 'Object Transformation',
        input: 'Source object and mapping configuration',
        output: 'Transformed object with new structure',
        explanation: 'Maps object properties according to transformation rules'
      }
    ],
    estimatedTime: '25 min'
  },

  // Switch Case (JS) - All Categories
  {
    id: 'js-switch-1',
    title: 'Priority Handler',
    description: `Implement a priority handler using switch statements for ticket routing.



Ticket Management System:
Build a routing system that automatically assigns tickets to appropriate teams based on priority levels.



Requirements:
- Handle different priority levels (1-4)
- Route to appropriate teams
- Set default escalation rules
- Return routing information object



Priority Levels:
- Priority 1: Critical - Immediate response required
- Priority 2: High - Urgent attention needed
- Priority 3: Normal - Standard processing
- Priority 4: Low - Can be scheduled for later



Business Logic:
Higher priority tickets should be routed to specialized teams with shorter escalation times and immediate notifications.`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['Switch Case', 'JavaScript', 'Logic Control', 'Routing'],
    starterCode: `function routeByPriority(priority) {
    // Your code here
    
    return {};
}`,
    solution: `function routeByPriority(priority) {
    let team, escalationTime, notification;
    
    switch (parseInt(priority)) {
        case 1:
            team = 'Critical Response Team';
            escalationTime = 15; // minutes
            notification = 'immediate';
            break;
        case 2:
            team = 'High Priority Team';
            escalationTime = 60;
            notification = 'urgent';
            break;
        case 3:
            team = 'Standard Team';
            escalationTime = 240;
            notification = 'normal';
            break;
        case 4:
            team = 'Low Priority Team';
            escalationTime = 480;
            notification = 'low';
            break;
        default:
            team = 'Triage Team';
            escalationTime = 120;
            notification = 'review';
            break;
    }
    
    return {
        assignedTeam: team,
        escalationMinutes: escalationTime,
        notificationLevel: notification
    };
}`,
    testCases: [
      {
        input: { priority: 1 },
        expected: { assignedTeam: 'Critical Response Team', escalationMinutes: 15, notificationLevel: 'immediate' },
        description: 'Should handle critical priority correctly'
      },
      {
        input: { priority: 5 },
        expected: { assignedTeam: 'Triage Team', escalationMinutes: 120, notificationLevel: 'review' },
        description: 'Should handle invalid priority with default'
      }
    ],
    hints: [
      'Use parseInt() to ensure numeric comparison',
      'Include break statements to prevent fall-through',
      'Always include a default case'
    ]
  },
  {
    id: 'js-switch-2',
    title: 'State Machine Workflow',
    description: `Implement a state machine using switch statements for workflow management.



Workflow Management:
Create a robust state machine that manages complex workflow transitions with validation and history tracking.



Requirements:
- Handle multiple workflow states
- Validate state transitions
- Track transition history
- Support rollback functionality



State Machine Concepts:
- States represent the current status of a workflow item
- Actions trigger transitions between states
- Not all transitions are valid from every state
- Invalid transitions should be rejected with appropriate messages



Business Process:
This pattern is commonly used in approval workflows, incident management, and change management processes.



Validation Rules:
The system should prevent invalid state transitions and provide clear feedback about allowed actions.`,
    difficulty: 'Hard',
    category: 'Server Side Scripts',
    tags: ['Switch Case', 'JavaScript', 'State Machine', 'Workflow'],
    starterCode: `function workflowStateMachine(currentState, action, context) {
    // Your code here
    
    return {};
}`,
    solution: `function workflowStateMachine(currentState, action, context = {}) {
    const transitions = {
        'draft': ['submit', 'cancel'],
        'submitted': ['approve', 'reject', 'request_info'],
        'pending_info': ['provide_info', 'cancel'],
        'approved': ['implement', 'cancel'],
        'rejected': ['resubmit', 'cancel'],
        'implemented': ['verify', 'rollback'],
        'verified': ['close'],
        'cancelled': [],
        'closed': []
    };
    
    let newState, isValid, message;
    
    switch (currentState) {
        case 'draft':
            switch (action) {
                case 'submit':
                    newState = 'submitted';
                    isValid = true;
                    message = 'Request submitted for approval';
                    break;
                case 'cancel':
                    newState = 'cancelled';
                    isValid = true;
                    message = 'Request cancelled';
                    break;
                default:
                    isValid = false;
                    message = 'Invalid action for draft state';
                    break;
            }
            break;
            
        case 'submitted':
            switch (action) {
                case 'approve':
                    newState = 'approved';
                    isValid = true;
                    message = 'Request approved';
                    break;
                case 'reject':
                    newState = 'rejected';
                    isValid = true;
                    message = 'Request rejected';
                    break;
                case 'request_info':
                    newState = 'pending_info';
                    isValid = true;
                    message = 'Additional information requested';
                    break;
                default:
                    isValid = false;
                    message = 'Invalid action for submitted state';
                    break;
            }
            break;
            
        default:
            isValid = false;
            message = 'Unknown state: ' + currentState;
            break;
    }
    
    return {
        currentState: currentState,
        newState: newState || currentState,
        action: action,
        isValid: isValid,
        message: message,
        timestamp: new Date().toISOString()
    };
}`,
    testCases: [
      {
        input: { currentState: 'draft', action: 'submit' },
        expected: { newState: 'submitted', isValid: true },
        description: 'Should transition from draft to submitted'
      },
      {
        input: { currentState: 'draft', action: 'approve' },
        expected: { isValid: false },
        description: 'Should reject invalid state transition'
      }
    ],
    hints: [
      'Use nested switch statements for complex state handling',
      'Validate transitions before executing',
      'Return comprehensive state information'
    ]
  },

  // Higher Order Functions (JS) - All Categories
  {
    id: 'js-hof-1',
    title: 'Data Pipeline Builder',
    description: `Create a data processing pipeline using higher-order functions.



Functional Programming Approach:
Build a flexible data processing system that chains multiple transformation functions together.



Requirements:
- Chain multiple transformation functions
- Support filtering, mapping, and reducing
- Handle error cases gracefully
- Return processed results



Pipeline Concept:
- Each function in the pipeline receives the output of the previous function
- Functions should be pure and composable
- Error handling should not break the entire pipeline
- Support common data transformation patterns



Use Cases:
- Data cleansing and transformation
- API response processing
- Report generation with multiple steps
- Complex business logic decomposition`,
    difficulty: 'Medium',
    category: 'Client Side Scripts',
    tags: ['Higher Order Functions', 'JavaScript', 'Functional Programming', 'Data Processing'],
    starterCode: `function createPipeline(...functions) {
    // Your code here
    
    return function(data) {
        return data;
    };
}`,
    solution: `function createPipeline(...functions) {
    return function(data) {
        return functions.reduce((result, fn) => {
            try {
                if (typeof fn !== 'function') {
                    throw new Error('Pipeline step must be a function');
                }
                return fn(result);
            } catch (error) {
                console.error('Pipeline error:', error);
                return result; // Return previous result on error
            }
        }, data);
    };
}

// Helper functions for common operations
const filter = (predicate) => (array) => array.filter(predicate);
const map = (transformer) => (array) => array.map(transformer);
const reduce = (reducer, initial) => (array) => array.reduce(reducer, initial);`,
    testCases: [
      {
        input: { 
          data: [1, 2, 3, 4, 5],
          pipeline: [
            (arr) => arr.filter(x => x % 2 === 0),
            (arr) => arr.map(x => x * 2)
          ]
        },
        expected: [4, 8],
        description: 'Should process data through pipeline'
      }
    ],
    hints: [
      'Use reduce to chain function calls',
      'Handle errors without breaking the pipeline',
      'Return functions that accept data as input'
    ]
  },
  {
    id: 'js-hof-2',
    title: 'Curried API Caller',
    description: `Implement currying for ServiceNow API calls with partial application.



Currying Concept:
Transform a function that takes multiple arguments into a sequence of functions that each take a single argument.



Requirements:
- Create curried functions for API calls
- Support partial application of parameters
- Handle asynchronous operations
- Provide reusable API wrappers



API Architecture:
- Base configuration (authentication, base URL, headers)
- Table-specific operations (which ServiceNow table to target)
- Action-specific methods (get, insert, update, delete)
- Parameter-specific calls (query parameters, data payload)



Benefits of Currying:
- Reusable, partially configured functions
- Cleaner code with specialized API callers
- Better composition and testing
- Type safety and parameter validation



ServiceNow Integration:
This pattern is ideal for creating reusable ServiceNow REST API clients with different configurations.`,
    difficulty: 'Hard',
    category: 'Server Side Scripts',
    tags: ['Higher Order Functions', 'JavaScript', 'Currying', 'API'],
    starterCode: `function createApiCaller(baseConfig) {
    // Your code here
    
    return function() {
        return {};
    };
}`,
    solution: `function createApiCaller(baseConfig) {
    return function curry(table) {
        return function(action) {
            return function(params = {}) {
                return function(callback) {
                    const config = {
                        ...baseConfig,
                        table: table,
                        action: action,
                        params: params
                    };
                    
                    try {
                        // Simulate ServiceNow API call
                        let result;
                        switch (action) {
                            case 'get':
                                result = { sys_id: '123', ...params };
                                break;
                            case 'insert':
                                result = { sys_id: 'new_id', ...params };
                                break;
                            case 'update':
                                result = { sys_id: params.sys_id, ...params, updated: true };
                                break;
                            default:
                                throw new Error('Unknown action: ' + action);
                        }
                        
                        if (callback && typeof callback === 'function') {
                            callback(null, result);
                        }
                        return result;
                    } catch (error) {
                        if (callback && typeof callback === 'function') {
                            callback(error, null);
                        }
                        throw error;
                    }
                };
            };
        };
    };
}

// Usage example:
// const api = createApiCaller({ baseUrl: '/api', auth: 'token' });
// const incidentApi = api('incident');
// const getIncident = incidentApi('get');
// const getById = getIncident({ sys_id: '123' });`,
    testCases: [
      {
        input: { 
          baseConfig: { auth: 'token' },
          calls: [
            { table: 'incident', action: 'get', params: { sys_id: '123' } }
          ]
        },
        expected: { sys_id: '123' },
        description: 'Should create curried API caller'
      }
    ],
    hints: [
      'Return functions that return functions (currying)',
      'Merge configurations at each level',
      'Support both callback and return patterns'
    ]
  },

  // JSON (JS) - All Categories
  {
    id: 'js-json-1',
    title: 'Safe Data Extraction',
    description: `Parse and validate JSON data safely in ServiceNow environment.



Data Safety Challenge:
JSON parsing can fail catastrophically if the input is malformed, and parsed data might not match expected schema.



Requirements:
- Parse JSON with error handling
- Validate required fields
- Transform data types as needed
- Return structured results



Validation Features:
- Schema validation for required fields
- Type checking for critical properties
- Graceful error handling with descriptive messages
- Consistent return format for both success and failure cases



ServiceNow Context:
Essential for processing data from external integrations, web service responses, and user input forms.



Error Scenarios:
- Invalid JSON syntax
- Missing required fields
- Incorrect data types
- Malformed data structures`,
    difficulty: 'Easy',
    category: 'Client Side Scripts',
    tags: ['JSON', 'JavaScript', 'Parsing', 'Validation'],
    starterCode: `function safeJsonParse(jsonString, schema) {
    // Your code here
    
    return { success: false, data: null, error: null };
}`,
    solution: `function safeJsonParse(jsonString, schema = {}) {
    try {
        if (!jsonString || typeof jsonString !== 'string') {
            return { success: false, data: null, error: 'Invalid JSON string' };
        }
        
        const data = JSON.parse(jsonString);
        
        // Validate against schema if provided
        if (Object.keys(schema).length > 0) {
            const validation = validateSchema(data, schema);
            if (!validation.isValid) {
                return { success: false, data: null, error: validation.errors };
            }
        }
        
        return { success: true, data: data, error: null };
    } catch (error) {
        return { success: false, data: null, error: error.message };
    }
}

function validateSchema(data, schema) {
    const errors = [];
    
    Object.keys(schema).forEach(key => {
        const requirement = schema[key];
        const value = data[key];
        
        if (requirement.required && (value === undefined || value === null)) {
            errors.push(\`Required field '\${key}' is missing\`);
        }
        
        if (value !== undefined && requirement.type && typeof value !== requirement.type) {
            errors.push(\`Field '\${key}' should be of type \${requirement.type}\`);
        }
    });
    
    return { isValid: errors.length === 0, errors: errors };
}`,
    testCases: [
      {
        input: { 
          jsonString: '{"name": "John", "age": 30}',
          schema: { name: { required: true, type: 'string' }, age: { type: 'number' } }
        },
        expected: { success: true, data: { name: 'John', age: 30 } },
        description: 'Should parse valid JSON with schema validation'
      },
      {
        input: { jsonString: 'invalid json' },
        expected: { success: false, error: 'Unexpected token i in JSON at position 0' },
        description: 'Should handle invalid JSON gracefully'
      }
    ],
    hints: [
      'Use try-catch for JSON.parse()',
      'Validate data structure after parsing',
      'Return consistent result objects'
    ]
  },
  {
    id: 'js-json-2',
    title: 'ServiceNow Data Mapping',
    description: `Transform JSON data between ServiceNow and external systems.



Integration Requirements:
ServiceNow often needs to exchange data with external systems that use different field names, data structures, and formats.



Requirements:
- Map field names between systems
- Handle nested JSON structures
- Convert data types appropriately
- Support bidirectional transformation



Mapping Scenarios:
- Inbound: External system → ServiceNow format
- Outbound: ServiceNow format → External system
- Field renaming and restructuring
- Data type conversions and formatting



Complex Transformations:
- Nested object property mapping
- Array transformations
- Conditional field mapping
- Default value assignment for missing fields



Real-World Applications:
- REST API integrations
- Data imports/exports
- Third-party service connections
- Legacy system migrations`,
    difficulty: 'Medium',
    category: 'Server Side Scripts',
    tags: ['JSON', 'JavaScript', 'Data Mapping', 'Transformation'],
    starterCode: `function transformJsonData(jsonData, mapping, direction) {
    // Your code here
    
    return {};
}`,
    solution: `function transformJsonData(jsonData, mapping, direction = 'inbound') {
    if (!jsonData || !mapping) {
        return {};
    }
    
    const isOutbound = direction === 'outbound';
    const result = {};
    
    Object.keys(mapping).forEach(key => {
        const rule = mapping[key];
        const sourceKey = isOutbound ? key : rule.external || key;
        const targetKey = isOutbound ? rule.external || key : key;
        
        let value = getNestedValue(jsonData, sourceKey);
        
        if (value !== undefined) {
            // Apply transformation if specified
            if (rule.transform) {
                value = rule.transform(value, direction);
            }
            
            // Apply type conversion
            if (rule.type) {
                value = convertType(value, rule.type);
            }
            
            setNestedValue(result, targetKey, value);
        } else if (rule.default !== undefined) {
            setNestedValue(result, targetKey, rule.default);
        }
    });
    
    return result;
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
        if (!current[key]) current[key] = {};
        return current[key];
    }, obj);
    target[lastKey] = value;
}

function convertType(value, type) {
    switch (type) {
        case 'string': return String(value);
        case 'number': return Number(value);
        case 'boolean': return Boolean(value);
        case 'date': return new Date(value).toISOString();
        default: return value;
    }
}`,
    testCases: [
      {
        input: { 
          jsonData: { user_name: 'jdoe', full_name: 'John Doe' },
          mapping: { 
            userName: { external: 'user_name' },
            displayName: { external: 'full_name' }
          },
          direction: 'inbound'
        },
        expected: { userName: 'jdoe', displayName: 'John Doe' },
        description: 'Should transform JSON using mapping rules'
      }
    ],
    hints: [
      'Handle bidirectional mapping logic',
      'Support nested property access',
      'Apply type conversions as needed'
    ]
  },

  // GlideAjax Questions
  {
    id: 'sn-glideajax-1',
    title: 'User Validation Service',
    description: `Create a GlideAjax service to validate user credentials and return user information.



AJAX Communication:
Build a secure client-server communication system using ServiceNow's GlideAjax framework.



Requirements:
- Create Script Include with user validation logic
- Handle authentication securely
- Return appropriate user data
- Include error handling



Architecture Components:
- Server-side Script Include extending AbstractAjaxProcessor
- Client-side GlideAjax calls with proper parameter handling
- JSON-based data exchange between client and server
- Security considerations for credential handling



Security Notes:
- Never expose actual password validation logic
- Use proper session management
- Validate all input parameters on the server side
- Return minimal necessary user information



Error Handling:
- Graceful handling of invalid credentials
- Network error recovery
- Proper user feedback for all scenarios`,
    difficulty: 'Easy',
    category: 'Server Side Scripts',
    tags: ['GlideAjax', 'ServiceNow', 'Authentication', 'User Management'],
    starterCode: `// Script Include
var UserValidationAjax = Class.create();
UserValidationAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    validateUser: function() {
        // Your code here
        
        return '';
    },
    
    type: 'UserValidationAjax'
});

// Client Script
function validateUserCredentials(username, password) {
    // Your code here
    
}`,
    solution: `// Script Include
var UserValidationAjax = Class.create();
UserValidationAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    validateUser: function() {
        var username = this.getParameter('username');
        var password = this.getParameter('password');
        
        if (!username || !password) {
            return JSON.stringify({
                success: false,
                error: 'Username and password are required'
            });
        }
        
        // Query user table for validation
        var userGr = new GlideRecord('sys_user');
        userGr.addQuery('user_name', username);
        userGr.addQuery('active', true);
        userGr.query();
        
        if (userGr.next()) {
            // In real implementation, use proper password validation
            // This is simplified for the example
            return JSON.stringify({
                success: true,
                user: {
                    sys_id: userGr.getUniqueValue(),
                    name: userGr.getDisplayValue('name'),
                    email: userGr.getValue('email'),
                    department: userGr.getDisplayValue('department')
                }
            });
        } else {
            return JSON.stringify({
                success: false,
                error: 'Invalid credentials'
            });
        }
    },
    
    type: 'UserValidationAjax'
});

// Client Script
function validateUserCredentials(username, password) {
    var ga = new GlideAjax('UserValidationAjax');
    ga.addParam('sysparm_name', 'validateUser');
    ga.addParam('username', username);
    ga.addParam('password', password);
    
    ga.getXMLAnswer(function(response) {
        var result = JSON.parse(response);
        if (result.success) {
            console.log('User validated:', result.user);
            // Handle successful validation
        } else {
            console.error('Validation failed:', result.error);
            // Handle validation error
        }
    });
}`,
    testCases: [
      {
        input: { username: 'admin', password: 'admin123' },
        expected: { success: true, user: { name: 'Administrator' } },
        description: 'Should validate correct credentials'
      },
      {
        input: { username: 'invalid', password: 'wrong' },
        expected: { success: false, error: 'Invalid credentials' },
        description: 'Should reject invalid credentials'
      }
    ],
    hints: [
      'Extend AbstractAjaxProcessor in Script Include',
      'Use getParameter() to retrieve client data',
      'Return JSON string for complex data',
      'Use GlideAjax on client side with getXMLAnswer()'
    ]
  },
  {
    id: 'sn-glideajax-2',
    title: 'Dynamic Options Loader',
    description: `Build a GlideAjax service that dynamically loads dropdown options based on user selections.



Dynamic UI Components:
Create responsive form controls that update their options based on other field selections (cascading dropdowns).



Requirements:
- Create cascading dropdown functionality
- Filter options based on parent selection
- Handle multiple dependency levels
- Return formatted option arrays



Cascading Logic:
- Parent field selection triggers child field option refresh
- Child options are filtered based on parent value
- Support multiple levels of dependency (grandparent → parent → child)
- Maintain performance with large option sets



User Experience:
- Smooth transitions between option sets
- Loading states during AJAX calls
- Graceful handling of empty option sets
- Clear user feedback for all interactions



Common Applications:
- Country → State → City selection
- Category → Subcategory → Item selection
- Department → Team → Member selection`,
    difficulty: 'Medium',
    category: 'Client Side Scripts',
    tags: ['GlideAjax', 'ServiceNow', 'UI Controls', 'Dynamic Loading'],
    starterCode: `// Script Include
var DynamicOptionsAjax = Class.create();
DynamicOptionsAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    getOptions: function() {
        // Your code here
        
        return '';
    },
    
    type: 'DynamicOptionsAjax'
});

// Client Script
function loadDynamicOptions(table, field, parentValue) {
    // Your code here
    
}`,
    solution: `// Script Include
var DynamicOptionsAjax = Class.create();
DynamicOptionsAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    getOptions: function() {
        var table = this.getParameter('table');
        var field = this.getParameter('field');
        var parentField = this.getParameter('parent_field');
        var parentValue = this.getParameter('parent_value');
        
        if (!table || !field) {
            return JSON.stringify({
                success: false,
                error: 'Table and field parameters are required'
            });
        }
        
        var options = [];
        var gr = new GlideRecord(table);
        
        // Add parent filter if provided
        if (parentField && parentValue) {
            gr.addQuery(parentField, parentValue);
        }
        
        gr.addQuery('active', true);
        gr.orderBy(field);
        gr.query();
        
        while (gr.next()) {
            options.push({
                value: gr.getUniqueValue(),
                label: gr.getDisplayValue(field),
                text: gr.getValue(field)
            });
        }
        
        return JSON.stringify({
            success: true,
            options: options,
            count: options.length
        });
    },
    
    getCascadingOptions: function() {
        var config = JSON.parse(this.getParameter('config'));
        var result = {};
        
        for (var key in config) {
            var tableConfig = config[key];
            var gr = new GlideRecord(tableConfig.table);
            
            // Apply filters
            if (tableConfig.filters) {
                for (var i = 0; i < tableConfig.filters.length; i++) {
                    var filter = tableConfig.filters[i];
                    gr.addQuery(filter.field, filter.operator, filter.value);
                }
            }
            
            gr.orderBy(tableConfig.orderBy || 'name');
            gr.query();
            
            var options = [];
            while (gr.next()) {
                options.push({
                    value: gr.getUniqueValue(),
                    label: gr.getDisplayValue(tableConfig.displayField || 'name')
                });
            }
            
            result[key] = options;
        }
        
        return JSON.stringify({
            success: true,
            data: result
        });
    },
    
    type: 'DynamicOptionsAjax'
});

// Client Script
function loadDynamicOptions(table, field, parentValue, callback) {
    var ga = new GlideAjax('DynamicOptionsAjax');
    ga.addParam('sysparm_name', 'getOptions');
    ga.addParam('table', table);
    ga.addParam('field', field);
    if (parentValue) {
        ga.addParam('parent_field', 'parent');
        ga.addParam('parent_value', parentValue);
    }
    
    ga.getXMLAnswer(function(response) {
        var result = JSON.parse(response);
        if (result.success) {
            if (callback && typeof callback === 'function') {
                callback(result.options);
            }
        } else {
            console.error('Failed to load options:', result.error);
        }
    });
}

function setupCascadingDropdowns(parentField, childField, config) {
    // Listen for parent field changes
    g_form.getReference(parentField, function(parentRecord) {
        if (parentRecord) {
            loadDynamicOptions(
                config.childTable, 
                config.childField, 
                parentRecord.sys_id,
                function(options) {
                    // Clear and populate child field
                    g_form.clearOptions(childField);
                    g_form.addOption(childField, '', '-- Select --');
                    
                    options.forEach(function(option) {
                        g_form.addOption(childField, option.value, option.label);
                    });
                }
            );
        } else {
            // Clear child field if parent is cleared
            g_form.clearOptions(childField);
            g_form.addOption(childField, '', '-- Select --');
        }
    });
}`,
    testCases: [
      {
        input: { table: 'cmdb_ci', field: 'name', parentValue: null },
        expected: { success: true, options: [{ value: '123', label: 'Server 1' }] },
        description: 'Should load base options'
      },
      {
        input: { table: 'cmdb_ci', field: 'name', parentValue: 'datacenter1' },
        expected: { success: true, options: [{ value: '456', label: 'Server 2' }] },
        description: 'Should filter options by parent value'
      }
    ],
    hints: [
      'Use dynamic queries based on parameters',
      'Support both simple and cascading scenarios',
      'Return consistent JSON structure',
      'Handle client-side dropdown population'
    ]
  }
];