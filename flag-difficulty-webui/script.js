let allFlags = {};
let countryTranslations = {};
let currentGroups = [];
let currentEditingGroup = null;

// Load translations first
async function loadTranslations() {
    const response = await fetch('en.json');
    countryTranslations = await response.json();
}

// Load all flag data
async function loadFlagData() {
    const regions = ['africa', 'asia', 'europe', 'north_america', 'oceania', 'south_america'];
    for (const region of regions) {
        const response = await fetch(`flags/${region}.json`);
        const data = await response.json();
        data.forEach(flag => {
            allFlags[flag.country] = flag.url;
        });
    }
}

function moveGroupUp(index) {
    if (index > 0) {
        const temp = currentGroups[index];
        currentGroups[index] = currentGroups[index - 1];
        currentGroups[index - 1] = temp;
        renderGroups();
    }
}

function moveGroupDown(index) {
    if (index < currentGroups.length - 1) {
        const temp = currentGroups[index];
        currentGroups[index] = currentGroups[index + 1];
        currentGroups[index + 1] = temp;
        renderGroups();
    }
}

function renderGroups() {
    const container = document.getElementById('groupsContainer');
    container.innerHTML = '';

    currentGroups.forEach((group, index) => {
        const section = document.createElement('div');
        section.className = 'group-section';

        const groupHeader = document.createElement('div');
        groupHeader.className = 'group-header';

        const groupHeaderLeft = document.createElement('div');
        groupHeaderLeft.className = 'group-header-left';

        const groupHeaderRight = document.createElement('div');
        groupHeaderRight.className = 'group-header-right';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = group.name;
        nameInput.className = 'group-name';
        nameInput.addEventListener('change', (e) => {
            currentGroups[index].name = e.target.value;
        });

        const weightContainer = document.createElement('div');
        weightContainer.className = 'weight-container';

        const weightSlider = document.createElement('input');
        weightSlider.type = 'range';
        weightSlider.min = '1';
        weightSlider.max = '9';
        weightSlider.value = group.weight;
        weightSlider.className = 'weight-slider';

        const weightLabel = document.createElement('span');
        weightLabel.className = 'weight-label';
        weightLabel.textContent = group.weight;

        weightContainer.appendChild(weightLabel);
        weightContainer.appendChild(weightSlider);

        weightSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            currentGroups[index].weight = value;
            weightLabel.textContent = value;
        });

        // Create all buttons first
        const editButton = document.createElement('button');
        editButton.innerHTML = '<span class="material-icons">edit</span>';
        editButton.className = 'edit-members icon-button';
        editButton.title = 'Edit Members';
        editButton.addEventListener('click', () => openFlagSelector(index));

        const removeButton = document.createElement('button');
        removeButton.innerHTML = '<span class="material-icons">delete</span>';
        removeButton.className = 'remove-group icon-button';
        removeButton.title = 'Remove Group';
        removeButton.addEventListener('click', () => {
            currentGroups.splice(index, 1);
            renderGroups();
        });

        const orderButtons = document.createElement('div');
        orderButtons.className = 'order-buttons';

        const upButton = document.createElement('button');
        upButton.textContent = '↑';
        upButton.className = 'order-button';
        upButton.disabled = index === 0;
        upButton.addEventListener('click', () => moveGroupUp(index));

        const downButton = document.createElement('button');
        downButton.textContent = '↓';
        downButton.className = 'order-button';
        downButton.disabled = index === currentGroups.length - 1;
        downButton.addEventListener('click', () => moveGroupDown(index));

        orderButtons.appendChild(upButton);
        orderButtons.appendChild(downButton);

        // Then append them in the desired order
        groupHeaderLeft.appendChild(nameInput);
        groupHeaderLeft.appendChild(weightContainer);

        groupHeaderRight.appendChild(orderButtons);
        groupHeaderRight.appendChild(editButton);
        groupHeaderRight.appendChild(removeButton);

        groupHeader.appendChild(groupHeaderLeft);
        groupHeader.appendChild(groupHeaderRight);

        const flagsGrid = document.createElement('div');
        flagsGrid.className = 'flags-grid';
        
        group.countries.forEach(countryCode => {
            renderFlagItem(countryCode, flagsGrid);
        });

        section.appendChild(groupHeader);
        section.appendChild(flagsGrid);
        container.appendChild(section);
    });
}

function renderFlagItem(countryCode, container) {
    // Skip if the country code doesn't exist in allFlags
    if (!allFlags[countryCode]) {
        console.warn(`Flag not found for country code: ${countryCode}`);
        return;
    }

    const flagItem = document.createElement('div');
    flagItem.className = 'flag-item';
    
    const img = document.createElement('img');
    img.src = allFlags[countryCode];
    
    const span = document.createElement('span');
    span.textContent = countryTranslations[countryCode] || countryCode;
    
    flagItem.appendChild(img);
    flagItem.appendChild(span);
    container.appendChild(flagItem);
}

function openFlagSelector(groupIndex) {
    currentEditingGroup = groupIndex;
    const modal = document.getElementById('flagSelectorModal');
    const flagGrid = document.getElementById('flagGrid');
    flagGrid.innerHTML = '';

    // Update modal header text
    const modalHeader = modal.querySelector('h2');
    modalHeader.textContent = `Modify flags for ${currentGroups[groupIndex].name}`;

    Object.entries(allFlags).forEach(([countryCode, url]) => {
        createFlagSelectorItem(countryCode, url, flagGrid, currentGroups[groupIndex].countries.includes(countryCode));
    });

    modal.style.display = 'block';
}

function createFlagSelectorItem(countryCode, url, container, isSelected) {
    const flagItem = document.createElement('div');
    flagItem.className = 'flag-selector-item';
    if (isSelected) {
        flagItem.classList.add('selected');
    }

    const img = document.createElement('img');
    img.src = url;
    img.style.width = '100%';

    const span = document.createElement('span');
    span.textContent = countryTranslations[countryCode] || countryCode;

    flagItem.appendChild(img);
    flagItem.appendChild(span);

    flagItem.addEventListener('click', () => {
        flagItem.classList.toggle('selected');
    });

    container.appendChild(flagItem);
}

document.getElementById('saveFlagSelection').addEventListener('click', () => {
    const selectedFlags = Array.from(document.querySelectorAll('.flag-selector-item.selected'))
        .map(item => {
            // Find the country code by matching the country name
            for (const [code, name] of Object.entries(countryTranslations)) {
                if (name === item.querySelector('span').textContent) {
                    return code;
                }
            }
            return item.querySelector('span').textContent; // fallback to the text content
        });
    
    currentGroups[currentEditingGroup].countries = selectedFlags;
    document.getElementById('flagSelectorModal').style.display = 'none';
    renderGroups();
});

document.getElementById('cancelFlagSelection').addEventListener('click', () => {
    document.getElementById('flagSelectorModal').style.display = 'none';
});

document.getElementById('loadJson').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const text = await file.text();
    const data = JSON.parse(text);
    currentGroups = data.groups;
    renderGroups();
});

document.getElementById('exportJson').addEventListener('click', () => {
    const data = { groups: currentGroups };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'difficulty_groups.json';
    a.click();
    URL.revokeObjectURL(url);
});

// Add this function to create a new empty group
function createNewGroup() {
    const newGroup = {
        name: "New Group",
        weight: 5,
        countries: []
    };
    currentGroups.push(newGroup);
    renderGroups();
    
    // Scroll to the new group
    const container = document.getElementById('groupsContainer');
    const newGroupElement = container.lastElementChild;
    newGroupElement.scrollIntoView({ behavior: 'smooth' });
}

// Initialize the application
async function init() {
    await loadTranslations();
    await loadFlagData();
    // You can load a default JSON here if needed
}

// Add this event listener at the bottom with your other initializations
document.getElementById('addGroup').addEventListener('click', createNewGroup);

function getUnusedFlags() {
    // Get all used flags from current groups
    const usedFlags = new Set();
    currentGroups.forEach(group => {
        group.countries.forEach(country => {
            usedFlags.add(country);
        });
    });

    // Return flags that aren't in any group
    return Object.keys(allFlags).filter(countryCode => !usedFlags.has(countryCode));
}

function getFlagUsageStats() {
    // Count flag occurrences across all groups
    const flagCounts = {};
    
    // Initialize all flags with 0 count
    Object.keys(allFlags).forEach(countryCode => {
        flagCounts[countryCode] = 0;
    });
    
    // Count occurrences
    currentGroups.forEach(group => {
        group.countries.forEach(country => {
            flagCounts[country] = (flagCounts[country] || 0) + 1;
        });
    });
    
    // Convert to array and sort by count (ascending)
    return Object.entries(flagCounts)
        .sort((a, b) => a[1] - b[1])
        .map(([countryCode, count]) => ({
            countryCode,
            count
        }));
}

function showUnusedFlags() {
    const modal = document.getElementById('unusedFlagsModal');
    const flagGrid = document.getElementById('unusedFlagsGrid');
    flagGrid.innerHTML = '';

    const usageStats = getFlagUsageStats();
    
    // Group flags by usage count
    const groupedByUsage = {};
    usageStats.forEach(stat => {
        if (!groupedByUsage[stat.count]) {
            groupedByUsage[stat.count] = [];
        }
        groupedByUsage[stat.count].push(stat.countryCode);
    });

    // Sort usage counts
    const usageCounts = Object.keys(groupedByUsage).sort((a, b) => parseInt(a) - parseInt(b));

    // Create sections for each usage count
    usageCounts.forEach(count => {
        const header = document.createElement('div');
        header.className = 'usage-header';
        header.textContent = `Used in ${count} ${parseInt(count) === 1 ? 'group' : 'groups'}`;
        flagGrid.appendChild(header);

        // Add flags for this usage count
        groupedByUsage[count].forEach(countryCode => {
            const flagItem = document.createElement('div');
            flagItem.className = 'flag-item';
            
            const img = document.createElement('img');
            img.src = allFlags[countryCode];
            
            const span = document.createElement('span');
            span.textContent = countryTranslations[countryCode] || countryCode;
            
            flagItem.appendChild(img);
            flagItem.appendChild(span);
            flagGrid.appendChild(flagItem);
        });
    });

    modal.style.display = 'block';
}

// Add event listeners
document.getElementById('showUnusedFlags').addEventListener('click', showUnusedFlags);
document.getElementById('closeUnusedFlags').addEventListener('click', () => {
    document.getElementById('unusedFlagsModal').style.display = 'none';
});

init(); 