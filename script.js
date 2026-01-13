// Calculator State
let currentInput = '';
let expression = '';
let memory = 0;
let isNewCalculation = false;

// DOM Elements - will be initialized after page loads
let resultDisplay;
let expressionDisplay;
let memoryDisplay;
let tradingTools;
let basicCalculator;

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing calculator...');
    
    resultDisplay = document.getElementById('result');
    expressionDisplay = document.getElementById('expression');
    memoryDisplay = document.getElementById('memoryDisplay');
    tradingTools = document.getElementById('tradingTools');
    basicCalculator = document.getElementById('basicCalculator');
    
    console.log('Elements found:', {
        resultDisplay: !!resultDisplay,
        expressionDisplay: !!expressionDisplay,
        memoryDisplay: !!memoryDisplay,
        tradingTools: !!tradingTools,
        basicCalculator: !!basicCalculator
    });
    
    updateDisplay();
    setupModeToggle();
    setupToolTabs();
    setupKeyboardSupport();
    
    console.log('Calculator initialized successfully');
});

// Mode Toggle
function setupModeToggle() {
    const basicMode = document.getElementById('basicMode');
    const tradingMode = document.getElementById('tradingMode');

    if (!basicMode || !tradingMode) {
        console.error('Mode buttons not found');
        return;
    }

    basicMode.addEventListener('click', () => {
        basicMode.classList.add('active');
        tradingMode.classList.remove('active');
        tradingTools.style.display = 'none';
        basicCalculator.style.display = 'grid';
    });

    tradingMode.addEventListener('click', () => {
        tradingMode.classList.add('active');
        basicMode.classList.remove('active');
        tradingTools.style.display = 'block';
        basicCalculator.style.display = 'grid';
    });
}

// Tool Tabs
function setupToolTabs() {
    const tabs = document.querySelectorAll('.tool-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const toolName = tab.dataset.tool;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding tool
            document.querySelectorAll('.tool-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${toolName}-tool`).classList.add('active');
        });
    });
}

// Keyboard Support
function setupKeyboardSupport() {
    document.addEventListener('keydown', (e) => {
        // Initialize tradingTools if needed
        if (!tradingTools) {
            tradingTools = document.getElementById('tradingTools');
        }
        
        // Only enable keyboard in basic mode (when trading tools are hidden)
        if (!tradingTools || tradingTools.style.display !== 'none') return;
        
        if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
            appendNumber(e.key);
        } else if (['+', '-', '*', '/'].includes(e.key)) {
            appendOperator(e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            calculate();
        } else if (e.key === 'Escape') {
            clearAll();
        } else if (e.key === 'Backspace') {
            deleteLast();
        } else if (e.key === '%') {
            appendOperator('%');
        }
    });
}

// Basic Calculator Functions
function appendNumber(num) {
    console.log('appendNumber called with:', num);
    console.log('Before - currentInput:', currentInput, 'expression:', expression);
    
    if (isNewCalculation) {
        currentInput = '';
        expression = '';
        isNewCalculation = false;
    }
    
    if (num === '.' && currentInput.includes('.')) {
        console.log('Decimal point already exists, returning');
        return;
    }
    
    currentInput += num;
    console.log('After - currentInput:', currentInput);
    updateDisplay();
}

function appendOperator(op) {
    if (currentInput === '' && expression === '' && op !== '-') return;
    
    if (currentInput !== '') {
        expression += currentInput + ' ' + op + ' ';
        currentInput = '';
    } else if (expression !== '') {
        expression = expression.slice(0, -3) + op + ' ';
    }
    
    isNewCalculation = false;
    updateDisplay();
}

function appendFunction(func) {
    if (currentInput === '') return;
    
    const num = parseFloat(currentInput);
    let result;
    
    switch(func) {
        case 'sqrt':
            result = Math.sqrt(num);
            break;
        case 'square':
            result = num * num;
            break;
    }
    
    currentInput = result.toString();
    updateDisplay();
}

function toggleSign() {
    if (currentInput === '') return;
    
    if (currentInput.startsWith('-')) {
        currentInput = currentInput.slice(1);
    } else {
        currentInput = '-' + currentInput;
    }
    
    updateDisplay();
}

function calculate() {
    if (currentInput === '' && expression === '') return;
    
    // Initialize DOM elements if needed
    if (!resultDisplay) {
        resultDisplay = document.getElementById('result');
    }
    if (!expressionDisplay) {
        expressionDisplay = document.getElementById('expression');
    }
    
    if (!resultDisplay || !expressionDisplay) return;
    
    try {
        const fullExpression = expression + currentInput;
        let result = eval(fullExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-'));
        
        // Round to avoid floating point errors
        result = Math.round(result * 100000000) / 100000000;
        
        expressionDisplay.textContent = fullExpression;
        currentInput = result.toString();
        expression = '';
        isNewCalculation = true;
        
        resultDisplay.classList.add('calculating');
        setTimeout(() => resultDisplay.classList.remove('calculating'), 300);
        
        updateDisplay();
    } catch (error) {
        resultDisplay.textContent = 'Error';
        setTimeout(() => {
            clearAll();
        }, 1500);
    }
}

function clearAll() {
    currentInput = '';
    expression = '';
    isNewCalculation = false;
    updateDisplay();
}

function deleteLast() {
    if (currentInput !== '') {
        currentInput = currentInput.slice(0, -1);
    } else if (expression !== '') {
        expression = expression.slice(0, -3);
    }
    updateDisplay();
}

function updateDisplay() {
    // Initialize DOM elements if not already done (fixes race condition)
    if (!resultDisplay) {
        resultDisplay = document.getElementById('result');
    }
    if (!expressionDisplay) {
        expressionDisplay = document.getElementById('expression');
    }
    
    if (!resultDisplay || !expressionDisplay) {
        console.error('Display elements not found!');
        return;
    }
    resultDisplay.textContent = currentInput || '0';
    expressionDisplay.textContent = expression;
    console.log('Display updated - Result:', currentInput || '0', 'Expression:', expression);
}

// Memory Functions
function addMemory() {
    if (currentInput !== '') {
        memory += parseFloat(currentInput);
        updateMemoryDisplay();
    }
}

function recallMemory() {
    currentInput = memory.toString();
    updateDisplay();
}

function updateMemoryDisplay() {
    // Initialize memoryDisplay if not already done
    if (!memoryDisplay) {
        memoryDisplay = document.getElementById('memoryDisplay');
    }
    
    if (!memoryDisplay) return;
    
    if (memory !== 0) {
        memoryDisplay.textContent = `Memory: ${memory}`;
        memoryDisplay.classList.add('active');
    } else {
        memoryDisplay.classList.remove('active');
    }
}

// Trading Calculator Functions

// Position Size Calculator
function calculatePositionSize() {
    const accountSize = parseFloat(document.getElementById('accountSize').value);
    const riskPercent = parseFloat(document.getElementById('riskPercent').value);
    const stopLoss = parseFloat(document.getElementById('stopLoss').value);
    const resultDiv = document.getElementById('positionResult');
    
    if (!accountSize || !riskPercent || !stopLoss) {
        resultDiv.innerHTML = '<p style="color: var(--accent-red);">Please fill all fields</p>';
        resultDiv.classList.add('error');
        return;
    }
    
    const riskAmount = (accountSize * riskPercent) / 100;
    const positionSize = riskAmount / stopLoss;
    const leverageNeeded = (positionSize * 100) / accountSize;
    
    resultDiv.classList.remove('error');
    resultDiv.innerHTML = `
        <h4>Position Size Results</h4>
        <div class="highlight">${positionSize.toFixed(2)} units</div>
        <p><strong>Risk Amount:</strong> $${riskAmount.toFixed(2)}</p>
        <p><strong>Leverage Needed:</strong> ${leverageNeeded.toFixed(2)}x</p>
        <p><strong>Per Unit Risk:</strong> $${stopLoss.toFixed(2)}</p>
    `;
}

// P&L Calculator
function calculateProfitLoss() {
    const entryPrice = parseFloat(document.getElementById('entryPrice').value);
    const exitPrice = parseFloat(document.getElementById('exitPrice').value);
    const positionSize = parseFloat(document.getElementById('positionSize').value);
    const resultDiv = document.getElementById('plResult');
    
    if (!entryPrice || !exitPrice || !positionSize) {
        resultDiv.innerHTML = '<p style="color: var(--accent-red);">Please fill all fields</p>';
        resultDiv.classList.add('error');
        return;
    }
    
    const priceDiff = exitPrice - entryPrice;
    const profitLoss = priceDiff * positionSize;
    const percentageReturn = (priceDiff / entryPrice) * 100;
    const isProfit = profitLoss >= 0;
    
    resultDiv.classList.remove('error');
    resultDiv.innerHTML = `
        <h4>Profit & Loss Results</h4>
        <div class="highlight ${!isProfit ? 'negative' : ''}">${isProfit ? '+' : ''}$${profitLoss.toFixed(2)}</div>
        <p><strong>Percentage Return:</strong> <span style="color: ${isProfit ? 'var(--accent-green)' : 'var(--accent-red)'};">${isProfit ? '+' : ''}${percentageReturn.toFixed(2)}%</span></p>
        <p><strong>Price Movement:</strong> ${isProfit ? '+' : ''}${priceDiff.toFixed(2)}</p>
        <p><strong>Position Size:</strong> ${positionSize} units</p>
    `;
}

// Risk/Reward Calculator
function calculateRiskReward() {
    const entry = parseFloat(document.getElementById('rrEntry').value);
    const stopLoss = parseFloat(document.getElementById('rrStopLoss').value);
    const takeProfit = parseFloat(document.getElementById('rrTakeProfit').value);
    const resultDiv = document.getElementById('rrResult');
    
    if (!entry || !stopLoss || !takeProfit) {
        resultDiv.innerHTML = '<p style="color: var(--accent-red);">Please fill all fields</p>';
        resultDiv.classList.add('error');
        return;
    }
    
    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(takeProfit - entry);
    const rrRatio = reward / risk;
    const riskPercent = (risk / entry) * 100;
    const rewardPercent = (reward / entry) * 100;
    
    const isGoodRatio = rrRatio >= 2;
    
    resultDiv.classList.remove('error');
    resultDiv.innerHTML = `
        <h4>Risk/Reward Analysis</h4>
        <div class="highlight ${isGoodRatio ? '' : 'negative'}">1:${rrRatio.toFixed(2)}</div>
        <p><strong>Risk Amount:</strong> $${risk.toFixed(2)} (${riskPercent.toFixed(2)}%)</p>
        <p><strong>Reward Amount:</strong> $${reward.toFixed(2)} (${rewardPercent.toFixed(2)}%)</p>
        <p style="color: ${isGoodRatio ? 'var(--accent-green)' : 'var(--accent-red)'};">
            ${isGoodRatio ? '✓ Good risk/reward ratio' : '⚠ Consider better ratio (aim for 1:2+)'}
        </p>
    `;
}

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
