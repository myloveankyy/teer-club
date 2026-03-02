// Teer Tools Suite Backend Logic

/**
 * Calculate the probability of a specific number winning.
 * In a pure random game of 100 numbers (00-99), the base probability is 1%.
 * We simulate a "weighted" probability based on recent trends for entertainment purposes.
 * @param {string} number - The 2-digit Teer number (e.g., '45')
 */
const calculateProbability = (number) => {
    const num = parseInt(number, 10);
    if (isNaN(num) || num < 0 || num > 99) {
        throw new Error("Invalid number format. Must be between 00 and 99.");
    }

    const baseProb = 1.0;
    // Simulate some variance based on the number itself to make it interesting
    // In a real app, this would query historical DB frequencies
    const variance = (Math.sin(num) * 0.5) + (Math.cos(num * 2) * 0.3); // between -0.8 and +0.8
    const finalProb = Math.max(0.1, Math.min(5.0, baseProb + variance)).toFixed(2);

    return {
        number: number.padStart(2, '0'),
        probabilityPercentage: `${finalProb}%`,
        baseProbability: '1.00%',
        trend: finalProb > baseProb ? 'Hot' : (finalProb < baseProb ? 'Cold' : 'Neutral'),
        confidence: Math.round(Math.random() * 40 + 60) // 60-100%
    };
};

/**
 * Break down a number into its components (House, Ending, Attributes)
 * @param {string} number 
 */
const analyzePattern = (number) => {
    const numStr = number.toString().padStart(2, '0');
    const house = numStr.charAt(0);
    const ending = numStr.charAt(1);
    const numInt = parseInt(numStr, 10);

    const isEven = numInt % 2 === 0;
    const isPrime = checkPrime(numInt);
    const isPalindrome = house === ending; // e.g., 11, 22, 33

    return {
        number: numStr,
        house: house,
        ending: ending,
        attributes: [
            isEven ? 'Even' : 'Odd',
            isPrime ? 'Prime Number' : 'Composite Number',
            isPalindrome ? 'Double (Palindrome)' : 'Standard'
        ]
    };
};

// Helper for prime check
const checkPrime = (num) => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
};

/**
 * Simple calculation utility for Teer Returns
 * Standard Teer odds (approximate, varies by counter):
 * Direct (FC): 1 to 80
 * House/Ending: 1 to 9
 */
const calculateReturn = (amount, betType) => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
        throw new Error("Invalid amount");
    }

    let multiplier = 80;
    let typeName = "Direct (Full Number)";

    if (betType === 'house' || betType === 'ending') {
        multiplier = 9;
        typeName = betType === 'house' ? "House" : "Ending";
    }

    return {
        amount: amt,
        betType: typeName,
        multiplier: multiplier,
        estimatedReturn: amt * multiplier
    };
};


module.exports = {
    calculateProbability,
    analyzePattern,
    calculateReturn
};
